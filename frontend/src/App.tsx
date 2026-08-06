import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { PoliceDashboard } from './pages/PoliceDashboard';
import { CrimeReportPage } from './pages/CrimeReportPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CitizenLoginPage } from './pages/CitizenLoginPage';
import { PoliceLoginPage } from './pages/PoliceLoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { User } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Read persisted user session from localStorage
    const storedUser = localStorage.getItem('sentinel_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user session:', err);
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar user={user} onLogout={handleLogout} />
      
      <main className="flex-1">
        <Routes>
          {/* Public Citizen Portal Routes */}
          <Route path="/" element={<CitizenDashboard />} />
          <Route path="/report" element={<CrimeReportPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Authentication Routes */}
          <Route path="/citizen-login" element={<CitizenLoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/police-login" element={<PoliceLoginPage onLoginSuccess={handleLoginSuccess} />} />

          {/* Protected Police Command Tactical Dashboard (Gated behind Police Role) */}
          <Route
            path="/police"
            element={
              <ProtectedRoute user={user} allowedRole="police">
                <PoliceDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-medium text-slate-600">SentinelAI — Public Safety & Police Tactical Command Platform</div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>Mobile OTP Auth</span>
            <span>•</span>
            <span>Police Badge Verification</span>
            <span>•</span>
            <span>PII Masking Shield</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
