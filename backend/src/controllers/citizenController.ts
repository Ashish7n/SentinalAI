import { Request, Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../database/dbStore';
import { calculateSafetyScore, generateRoutes } from '../domain/decisionEngine';
import { explainSafetyScore, explainRouteChoice } from '../services/aiService';
import { scrubPII } from '../middleware/piiScrubber';
import { Incident } from '../types';

const safetyScoreSchema = z.object({
  latitude: z.number(),
  longitude: z.number()
});

const safeRouteSchema = z.object({
  originLat: z.number(),
  originLng: z.number(),
  destLat: z.number(),
  destLng: z.number()
});

const reportIncidentSchema = z.object({
  categoryId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(5),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

export const getSafetyScore = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = safetyScoreSchema.parse(req.body);

    // 1. Calculate deterministic math output
    const breakdown = calculateSafetyScore(latitude, longitude, dbStore.incidents, dbStore.infrastructure);

    // 2. Fetch Gemini AI explanation
    const aiExplanation = await explainSafetyScore(breakdown);

    return res.status(200).json({
      breakdown,
      aiExplanation
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

export const getSafeRoute = async (req: Request, res: Response) => {
  try {
    const { originLat, originLng, destLat, destLng } = safeRouteSchema.parse(req.body);

    // 1. Calculate routes using OSRM real road network engine
    const routes = await generateRoutes(originLat, originLng, destLat, destLng, dbStore.incidents, dbStore.infrastructure);
    const shortest = routes.find(r => r.type === 'shortest')!;
    const safest = routes.find(r => r.type === 'safest')!;

    // 2. Fetch Gemini route choice explanation
    const aiExplanation = await explainRouteChoice(shortest, safest);

    return res.status(200).json({
      routes,
      aiExplanation
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

export const submitIncidentReport = async (req: any, res: Response) => {
  try {
    const validated = reportIncidentSchema.parse(req.body);
    const category = dbStore.categories.find(c => c.id === validated.categoryId || c.code === validated.categoryId);

    // PII Scrubbing
    const { scrubbedText, scrubbed } = scrubPII(validated.description);

    const newReport: Incident = {
      id: `inc-${Date.now()}`,
      categoryId: category ? category.id : 'cat-1',
      categoryName: category ? category.name : 'General Incident',
      severity: validated.severity,
      latitude: validated.latitude,
      longitude: validated.longitude,
      occurredAt: new Date().toISOString(),
      reportedBy: req.user ? req.user.id : 'anonymous',
      status: 'pending',
      description: scrubbedText,
      piiScrubbed: scrubbed,
      createdAt: new Date().toISOString()
    };

    dbStore.incidents.unshift(newReport);

    return res.status(201).json({
      message: 'Incident report submitted successfully',
      incident: newReport,
      piiScrubbed: scrubbed
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
};

export const getInfrastructure = async (req: Request, res: Response) => {
  return res.status(200).json({ infrastructure: dbStore.infrastructure });
};

export const getPublicIncidents = async (req: Request, res: Response) => {
  return res.status(200).json({ incidents: dbStore.incidents });
};
