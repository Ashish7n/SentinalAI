import { Request, Response } from 'express';
import { dbStore } from '../database/dbStore';

export const getAnalyticsOverview = async (req: Request, res: Response) => {
  const totalIncidents = dbStore.incidents.length;
  const verifiedCount = dbStore.incidents.filter(i => i.status === 'verified').length;
  const pendingCount = dbStore.incidents.filter(i => i.status === 'pending').length;
  const criticalCount = dbStore.incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  dbStore.incidents.forEach(inc => {
    categoryCounts[inc.categoryName] = (categoryCounts[inc.categoryName] || 0) + 1;
  });

  const categoryBreakdown = Object.keys(categoryCounts).map(name => ({
    name,
    count: categoryCounts[name]
  }));

  // Time-series trend (Simulated 7-day trend)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const incidentTrend = days.map((day, idx) => ({
    day,
    incidents: Math.floor(2 + (idx * 1.5) % 5),
    safetyScoreAvg: Math.floor(75 - (idx * 3) % 15)
  }));

  return res.status(200).json({
    kpis: {
      totalIncidents,
      verifiedCount,
      pendingCount,
      criticalCount,
      activeStreetlights: dbStore.infrastructure.filter(i => i.telemetryType === 'streetlight' && i.statusScore > 0.5).length,
      darkZoneFaults: dbStore.infrastructure.filter(i => i.telemetryType === 'streetlight' && i.statusScore <= 0.5).length,
      avgCitySafetyScore: 78
    },
    categoryBreakdown,
    incidentTrend
  });
};
