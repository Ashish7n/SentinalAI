import axios from 'axios';
import { User, RiskScoreBreakdown, AIDecisionExplanation, RouteOption, Incident, InfrastructureTelemetry, PatrolAllocationResult, PatrolUnit } from '../types';

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  requestCitizenOTP: async (mobileNumber: string) => {
    const res = await API.post('/auth/citizen/request-otp', { mobileNumber });
    return res.data;
  },
  verifyCitizenOTP: async (data: { mobileNumber: string; otp: string; fullName: string; age: number; gender: string }) => {
    const res = await API.post('/auth/citizen/verify-otp', data);
    if (res.data.token) {
      localStorage.setItem('sentinel_token', res.data.token);
      localStorage.setItem('sentinel_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  policeLogin: async (userId: string, password: string) => {
    const res = await API.post('/auth/police/login', { userId, password });
    if (res.data.token) {
      localStorage.setItem('sentinel_token', res.data.token);
      localStorage.setItem('sentinel_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
  }
};

export const citizenAPI = {
  getSafetyScore: async (latitude: number, longitude: number): Promise<{ breakdown: RiskScoreBreakdown; aiExplanation: AIDecisionExplanation }> => {
    const res = await API.post('/citizen/safety-score', { latitude, longitude });
    return res.data;
  },
  getSafeRoute: async (originLat: number, originLng: number, destLat: number, destLng: number): Promise<{ routes: RouteOption[]; aiExplanation: string }> => {
    const res = await API.post('/citizen/safe-route', { originLat, originLng, destLat, destLng });
    return res.data;
  },
  submitReport: async (reportData: { categoryId: string; latitude: number; longitude: number; description: string; severity?: string }) => {
    const res = await API.post('/citizen/reports', reportData);
    return res.data;
  },
  getInfrastructure: async (): Promise<InfrastructureTelemetry[]> => {
    try {
      const res = await API.get('/citizen/infrastructure');
      return Array.isArray(res.data?.infrastructure) ? res.data.infrastructure : [];
    } catch (err) {
      console.error('getInfrastructure API error:', err);
      return [];
    }
  },
  getIncidents: async (): Promise<Incident[]> => {
    try {
      const res = await API.get('/citizen/incidents');
      return Array.isArray(res.data?.incidents) ? res.data.incidents : [];
    } catch (err) {
      console.error('getIncidents API error:', err);
      return [];
    }
  }
};

export const policeAPI = {
  getIncidents: async (status?: string): Promise<Incident[]> => {
    try {
      const res = await API.get('/police/incidents', { params: { status } });
      return Array.isArray(res.data?.incidents) ? res.data.incidents : [];
    } catch (err) {
      console.error('police getIncidents API error:', err);
      return [];
    }
  },
  updateIncidentStatus: async (id: string, status: string) => {
    const res = await API.patch(`/police/incidents/${id}/status`, { status });
    return res.data;
  },
  getPatrolAllocation: async (sectorId: string, shift: string, availableOfficers: number): Promise<{ allocation: PatrolAllocationResult }> => {
    const res = await API.post('/police/patrol-recommendation', { sectorId, shift, availableOfficers });
    return res.data;
  },
  getPatrolUnits: async (): Promise<PatrolUnit[]> => {
    try {
      const res = await API.get('/police/patrol-units');
      return Array.isArray(res.data?.units) ? res.data.units : [];
    } catch (err) {
      console.error('getPatrolUnits API error:', err);
      return [];
    }
  },
  dispatchUnit: async (unitId: string, incidentId: string) => {
    const res = await API.post('/police/dispatch', { unitId, incidentId });
    return res.data;
  },
  reassignUnitSector: async (unitId: string, sector: string) => {
    const res = await API.patch(`/police/patrol-units/${unitId}/sector`, { sector });
    return res.data;
  }
};

export const analyticsAPI = {
  getOverview: async () => {
    const res = await API.get('/analytics/overview');
    return res.data;
  }
};
