import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User } from '../types';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  user: User | null;
  allowedRole: 'police' | 'citizen' | 'admin';
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedRole, children }) => {
  // If no user is logged in, redirect to login
  if (!user) {
    if (allowedRole === 'police') {
      return <Navigate to="/police-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Strict Role Enforcement Gate
  if (allowedRole === 'police' && user.role !== 'police') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-rose-600/20 border border-rose-500/40 text-rose-500 glow-rose">
          <ShieldAlert className="w-12 h-12 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">403 Access Denied</h1>
          <p className="text-sm text-rose-400 font-semibold">Police Tactical Command is restricted to verified law enforcement officers.</p>
          <p className="text-xs text-gray-400">Citizen accounts do not have permission to view or access police dispatch telemetry.</p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link
            to="/police-login"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-xs transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Login with Official Police Badge Credentials</span>
          </Link>

          <Link
            to="/"
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Return to Citizen Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
