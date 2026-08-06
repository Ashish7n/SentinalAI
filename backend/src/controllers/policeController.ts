import { Request, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../database/dbStore';
import { calculatePatrolAllocation } from '../domain/decisionEngine';
import { generatePatrolBriefing } from '../services/aiService';

const patrolRequestSchema = z.object({
  sectorId: z.string().default('Sector 4 - HITEC Hub'),
  shift: z.enum(['morning', 'afternoon', 'night']).default('night'),
  availableOfficers: z.number().min(1).default(12)
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'verified', 'dismissed', 'resolved'])
});

const dispatchSchema = z.object({
  unitId: z.string(),
  incidentId: z.string()
});

const reassignSchema = z.object({
  sector: z.string()
});

export const getIncidents = async (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  let filtered = dbStore.incidents;

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(i => i.status === statusFilter);
  }

  return res.status(200).json({ incidents: filtered });
};

export const updateIncidentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const incident = dbStore.incidents.find(i => i.id === id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident record not found.' });
    }

    incident.status = status;

    return res.status(200).json({
      message: `Incident status updated to ${status}`,
      incident
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

export const getPatrolRecommendation = async (req: Request, res: Response) => {
  try {
    const { sectorId, shift, availableOfficers } = patrolRequestSchema.parse(req.body);

    // 1. Deterministic Allocation Math
    const allocationResult = calculatePatrolAllocation(sectorId, shift, availableOfficers, dbStore.incidents);

    // 2. Gemini AI Shift Briefing Synthesis
    const aiBriefing = await generatePatrolBriefing(allocationResult);
    allocationResult.justification = aiBriefing;

    dbStore.patrolAllocations.unshift(allocationResult);

    return res.status(200).json({
      allocation: allocationResult
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

export const getPatrolUnits = async (req: Request, res: Response) => {
  return res.status(200).json({ units: dbStore.patrolUnits });
};

export const dispatchPatrolUnit = async (req: Request, res: Response) => {
  try {
    const { unitId, incidentId } = dispatchSchema.parse(req.body);

    const unit = dbStore.patrolUnits.find(u => u.id === unitId);
    const incident = dbStore.incidents.find(i => i.id === incidentId);

    if (!unit) return res.status(404).json({ error: 'Patrol unit not found.' });
    if (!incident) return res.status(404).json({ error: 'Incident record not found.' });

    unit.status = 'DISPATCHED';
    unit.assignedIncidentId = incidentId;
    incident.status = 'verified';

    return res.status(200).json({
      message: `${unit.callsign} successfully dispatched to incident ${incident.categoryName}`,
      unit,
      incident
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

export const reassignUnitSector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sector } = reassignSchema.parse(req.body);

    const unit = dbStore.patrolUnits.find(u => u.id === id);
    if (!unit) return res.status(404).json({ error: 'Patrol unit not found.' });

    unit.sector = sector;
    if (unit.status === 'DISPATCHED') unit.status = 'ON PATROL';

    return res.status(200).json({
      message: `${unit.callsign} reassigned to ${sector}`,
      unit
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};
