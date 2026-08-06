import { Router } from 'express';
import { requestCitizenOTP, verifyCitizenOTP, policeLogin, getProfile } from '../controllers/authController';
import { getSafetyScore, getSafeRoute, submitIncidentReport, getInfrastructure, getPublicIncidents } from '../controllers/citizenController';
import { getIncidents, updateIncidentStatus, getPatrolRecommendation, getPatrolUnits, dispatchPatrolUnit, reassignUnitSector } from '../controllers/policeController';
import { getAnalyticsOverview } from '../controllers/analyticsController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// --- Auth Routes ---
router.post('/auth/citizen/request-otp', requestCitizenOTP);
router.post('/auth/citizen/verify-otp', verifyCitizenOTP);
router.post('/auth/police/login', policeLogin);
router.get('/auth/profile', authenticateToken, getProfile);

// --- Citizen Routes ---
router.post('/citizen/safety-score', getSafetyScore);
router.post('/citizen/safe-route', getSafeRoute);
router.post('/citizen/reports', submitIncidentReport);
router.get('/citizen/infrastructure', getInfrastructure);
router.get('/citizen/incidents', getPublicIncidents);

// --- Police Tactical Command Routes ---
router.get('/police/incidents', getIncidents);
router.patch('/police/incidents/:id/status', updateIncidentStatus);
router.post('/police/patrol-recommendation', getPatrolRecommendation);
router.get('/police/patrol-units', getPatrolUnits);
router.post('/police/dispatch', dispatchPatrolUnit);
router.patch('/police/patrol-units/:id/sector', reassignUnitSector);

// --- Analytics & Admin Routes ---
router.get('/analytics/overview', getAnalyticsOverview);

export default router;
