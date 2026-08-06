export type UserRole = 'citizen' | 'police' | 'admin';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'verified' | 'dismissed' | 'resolved';
export type PatrolShift = 'morning' | 'afternoon' | 'night';

export interface UserProfile {
  id: string;
  email?: string;
  mobileNumber?: string;
  fullName: string;
  age?: number;
  gender?: string;
  role: UserRole;
  badgeNumber?: string;
  stationSector?: string;
  createdAt: string;
}

export interface IncidentCategory {
  id: string;
  name: string;
  code: string;
  baseSeverityWeight: number;
  description: string;
}

export interface Incident {
  id: string;
  categoryId: string;
  categoryName: string;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  occurredAt: string;
  reportedBy?: string;
  status: ReportStatus;
  description: string;
  piiScrubbed: boolean;
  createdAt: string;
}

export interface InfrastructureTelemetry {
  id: string;
  telemetryType: 'streetlight' | 'cctv' | 'shelter' | 'police_station' | 'hospital';
  name: string;
  latitude: number;
  longitude: number;
  statusScore: number; // 0.0 to 1.0
  metadata: Record<string, any>;
}

export interface RiskScoreBreakdown {
  score: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentCount30d: number;
  unlitStreetlightRatio: number;
  activeCctvCount: number;
  nearestStationDistanceKm: number;
  contributingFactors: string[];
}

export interface RouteOption {
  id: string;
  name: string;
  type: 'shortest' | 'safest';
  distanceKm: number;
  estimatedMinutes: number;
  safetyScore: number;
  coordinates: [number, number][]; // [lat, lng] array
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

export interface PatrolAllocationRequest {
  sectorId: string;
  shift: PatrolShift;
  availableOfficers: number;
}

export interface PatrolAllocationResult {
  sectorId: string;
  shift: PatrolShift;
  calculatedRiskIndex: number;
  recommendedOfficers: number;
  highPrioritySubSectors: string[];
  justification: string;
}

export interface AIDecisionExplanation {
  confidenceScore: number;
  reason: string;
  contributingFactors: string[];
  alternativesConsidered: string[];
  statedLimitations: string;
}
