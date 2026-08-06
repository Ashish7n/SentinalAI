import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { BarChart3, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsAPI.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center text-slate-500">
        <div className="animate-pulse font-bold text-sm">Loading City-Wide Telemetry Analytics...</div>
      </div>
    );
  }

  const { kpis, categoryBreakdown, incidentTrend } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <span>Public Safety Intelligence & Infrastructure Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Aggregated, auditable city telemetry and temporal trend distribution.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Incident Telemetry</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{kpis.totalIncidents}</div>
          <div className="text-[11px] text-emerald-700 font-bold">{kpis.verifiedCount} Verified by Dispatch</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>High Severity Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{kpis.criticalCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Require sector priority patrol</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Streetlamp Arrays Operational</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{kpis.activeStreetlights}</div>
          <div className="text-[11px] text-amber-700 font-bold">{kpis.darkZoneFaults} Faults Flagged</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>City Avg Safety Index</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{kpis.avgCitySafetyScore} / 100</div>
          <div className="text-[11px] text-blue-700 font-bold">Stable Baseline</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Incident Breakdown by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Trend Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">7-Day Incident Frequency vs Safety Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A' }} />
                <Area type="monotone" dataKey="incidents" stroke="#E11D48" fill="#E11D48" fillOpacity={0.15} />
                <Area type="monotone" dataKey="safetyScoreAvg" stroke="#059669" fill="#059669" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
