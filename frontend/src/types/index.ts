export type UserRole = 'citizen' | 'police' | 'admin';

export interface User {
  id: string;
  email?: string;
  mobileNumber?: string;
  fullName: string;
  age?: number;
  gender?: string;
  role: UserRole;
  badgeNumber?: string;
  stationSector?: string;
}

export interface Incident {
  id: string;
  categoryId: string;
  categoryName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  occurredAt: string;
  status: 'pending' | 'verified' | 'dismissed' | 'resolved';
  description: string;
  piiScrubbed: boolean;
}

export interface InfrastructureTelemetry {
  id: string;
  telemetryType: 'streetlight' | 'cctv' | 'shelter' | 'police_station' | 'hospital';
  name: string;
  latitude: number;
  longitude: number;
  statusScore: number;
  metadata: Record<string, any>;
}

export interface RiskScoreBreakdown {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentCount30d: number;
  unlitStreetlightRatio: number;
  activeCctvCount: number;
  nearestStationDistanceKm: number;
  contributingFactors: string[];
}

export interface AIDecisionExplanation {
  confidenceScore: number;
  reason: string;
  contributingFactors: string[];
  alternativesConsidered: string[];
  statedLimitations: string;
}

export interface RouteOption {
  id: string;
  name: string;
  type: 'shortest' | 'safest';
  distanceKm: number;
  estimatedMinutes: number;
  safetyScore: number;
  coordinates: [number, number][];
  riskHighlights: string[];
}

export interface PatrolUnit {
  id: string;
  callsign: string;
  commander: string;
  sector: string;
  status: 'ON PATROL' | 'DISPATCHED' | 'STANDBY';
  officerCount: number;
  latitude: number;
  longitude: number;
  assignedIncidentId?: string;
}

export interface PatrolAllocationResult {
  sectorId: string;
  shift: 'morning' | 'afternoon' | 'night';
  calculatedRiskIndex: number;
  recommendedOfficers: number;
  highPrioritySubSectors: string[];
  justification: string;
}
