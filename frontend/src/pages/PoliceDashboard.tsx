import React, { useState, useEffect } from 'react';
import { policeAPI, citizenAPI } from '../services/api';
import { Incident, PatrolAllocationResult, PatrolUnit, InfrastructureTelemetry } from '../types';
import { SafetyMap } from '../components/SafetyMap';
import { ShieldAlert, Users, Sparkles, CheckCircle2, XCircle, Clock, AlertTriangle, Radio, Navigation, Send, ShieldCheck, MapPin } from 'lucide-react';

export const PoliceDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [patrolUnits, setPatrolUnits] = useState<PatrolUnit[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfrastructureTelemetry[]>([]);
  const [allocation, setAllocation] = useState<PatrolAllocationResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([
    'Unit PATROL-404 dispatched to Charminar Heritage incident.',
    'Command Center operational. 5 Patrol units active.'
  ]);

  // Dispatch Form State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-401');

  // Allocation Form State
  const [sectorId, setSectorId] = useState('Cyberabad Sector 4 - HITEC Hub');
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night'>('night');
  const [availableOfficers, setAvailableOfficers] = useState(18);

  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [loadingAllocation, setLoadingAllocation] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoadingIncidents(true);
    try {
      const [incData, unitsData, infraData] = await Promise.all([
        policeAPI.getIncidents(statusFilter),
        policeAPI.getPatrolUnits(),
        citizenAPI.getInfrastructure()
      ]);
      setIncidents(Array.isArray(incData) ? incData : []);
      setPatrolUnits(Array.isArray(unitsData) ? unitsData : []);
      setInfrastructure(Array.isArray(infraData) ? infraData : []);

      if (Array.isArray(incData) && incData.length > 0 && !selectedIncidentId) {
        setSelectedIncidentId(incData[0].id);
      }
    } catch (err) {
      console.error('Failed to load police command data:', err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await policeAPI.updateIncidentStatus(id, newStatus);
      fetchData();
    } catch (err) {
      console.error('Failed to update incident status:', err);
    }
  };

  const handleDispatchUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentId || !selectedUnitId) return;

    try {
      const res = await policeAPI.dispatchUnit(selectedUnitId, selectedIncidentId);
      const logMessage = `🚨 DISPATCH CONFIRMED: ${res.unit.callsign} assigned to ${res.incident.categoryName} (${res.incident.severity.toUpperCase()}).`;
      setDispatchLogs(prev => [logMessage, ...prev]);
      fetchData();
    } catch (err) {
      console.error('Failed to dispatch unit:', err);
    }
  };

  const handleReassignSector = async (unitId: string, newSector: string) => {
    try {
      const res = await policeAPI.reassignUnitSector(unitId, newSector);
      setDispatchLogs(prev => [`REASSIGNED: ${res.unit.callsign} redeployed to ${newSector}`, ...prev]);
      fetchData();
    } catch (err) {
      console.error('Failed to reassign unit:', err);
    }
  };

  const handleGenerateAllocation = async () => {
    setLoadingAllocation(true);
    try {
      const data = await policeAPI.getPatrolAllocation(sectorId, shift, availableOfficers);
      setAllocation(data.allocation);
    } catch (err) {
      console.error('Failed to generate patrol allocation:', err);
    } finally {
      setLoadingAllocation(false);
    }
  };

  const criticalIncidentsCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const activeUnitsCount = patrolUnits.filter(u => u.status === 'ON PATROL' || u.status === 'DISPATCHED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Tactical Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" /> LIVE TACTICAL COMMAND CENTER
              </span>
              <span className="text-xs text-slate-500 font-medium">Hyderabad Police Commissionerate Telemetry Grid</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-rose-600" />
              <span>Public Safety Operations & Dispatch Console</span>
            </h1>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center shadow-sm">
              <div className="text-slate-500 font-semibold">Active Units</div>
              <div className="font-extrabold text-lg text-emerald-600">{activeUnitsCount} / {patrolUnits.length}</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center shadow-sm">
              <div className="text-slate-500 font-semibold">High Risk Alerts</div>
              <div className="font-extrabold text-lg text-rose-600">{criticalIncidentsCount}</div>
            </div>
          </div>
        </div>

        {/* Dispatch Log Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0 text-blue-700 font-bold">
            <Clock className="w-4 h-4 text-blue-600" /> Live Dispatch Stream:
          </div>
          <div className="truncate font-mono text-emerald-700 font-bold text-[11px]">
            {dispatchLogs[0] || 'All sectors nominal. Telemetry actively monitored.'}
          </div>
        </div>
      </div>

      {/* Grid: Tactical Map & Dispatch Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Fleet Management & Emergency Dispatch */}
        <div className="space-y-6">
          
          {/* 1. Emergency Unit Dispatch Console */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-rose-600" />
              <span>Emergency Patrol Dispatch</span>
            </h3>

            <form onSubmit={handleDispatchUnit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Target Incident / Citizen Alert</label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-600 font-medium cursor-pointer"
                >
                  {incidents.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.severity.toUpperCase()}] {inc.categoryName} ({inc.description.substring(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Select Available Patrol Unit</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-600 font-medium cursor-pointer"
                >
                  {patrolUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.callsign} — {unit.commander} ({unit.sector}) [{unit.status}]
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Unit to Incident Coordinates</span>
              </button>
            </form>
          </div>

          {/* 2. Active Patrol Units Fleet Console */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Active Patrol Fleet</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{patrolUnits.length} Units On Duty</span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {patrolUnits.map((unit) => (
                <div key={unit.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      {unit.callsign}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      unit.status === 'DISPATCHED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      unit.status === 'ON PATROL' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="text-slate-700 font-medium">Commander: {unit.commander} ({unit.officerCount} Officers)</div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 text-[11px] font-medium">Sector: {unit.sector}</span>
                    <select
                      value={unit.sector}
                      onChange={(e) => handleReassignSector(unit.id, e.target.value)}
                      className="bg-white text-slate-800 text-[10px] p-1 rounded border border-slate-300 cursor-pointer font-semibold shadow-sm"
                    >
                      <option value="Sector 4 - HITEC Hub">Sector 4 - HITEC</option>
                      <option value="Sector 2 - Secunderabad">Sector 2 - Secunderabad</option>
                      <option value="Sector 3 - Jubilee Hills">Sector 3 - Jubilee Hills</option>
                      <option value="Sector 1 - Charminar">Sector 1 - Charminar</option>
                      <option value="Sector 5 - Kukatpally">Sector 5 - Kukatpally</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Shift Patrol Optimizer (Gemini AI) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Shift Patrol Deployment Optimizer</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Target Command Sector</label>
                <input
                  type="text"
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Shift Window</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                >
                  <option value="morning">Morning Shift (06:00 - 14:00)</option>
                  <option value="afternoon">Afternoon Shift (14:00 - 22:00)</option>
                  <option value="night">Night Shift (22:00 - 06:00)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Available Officers ({availableOfficers})</label>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={availableOfficers}
                  onChange={(e) => setAvailableOfficers(parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>

              <button
                onClick={handleGenerateAllocation}
                disabled={loadingAllocation}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loadingAllocation ? 'Calculating Risk Matrix...' : 'Run Gemini Shift Optimizer'}</span>
              </button>
            </div>

            {allocation && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1.5">
                <div className="font-extrabold text-blue-900">Operational Briefing ({allocation.recommendedOfficers} Officers Allocated):</div>
                <p className="text-slate-700 leading-relaxed font-medium">{allocation.justification}</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Tactical Map & Incident Triage Queue */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tactical Map */}
          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <SafetyMap
              center={[17.4399, 78.4983]}
              incidents={incidents}
              infrastructure={infrastructure}
            />
          </div>

          {/* Incident Triage & Verification Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Incident Triage & Verification Queue</span>
              </h3>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {['all', 'pending', 'verified', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                      statusFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Cards List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{inc.categoryName}</span>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                        inc.severity === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        inc.severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-bold shadow-sm">
                        Status: {inc.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{inc.description}</p>
                    
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-600" /> GPS: {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</span>
                      <span>Logged: {new Date(inc.occurredAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {inc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'verified')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(inc.id, 'dismissed')}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Dismiss
                        </button>
                      </>
                    )}

                    {inc.status === 'verified' && (
                      <button
                        onClick={() => handleUpdateStatus(inc.id, 'resolved')}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
