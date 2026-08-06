import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { ShieldAlert, KeyRound, User, Lock, Radio, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface PoliceLoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const PoliceLoginPage: React.FC<PoliceLoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('P-8842');
  const [password, setPassword] = useState('Sentinel123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePoliceLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authAPI.policeLogin(userId, password);
      onLoginSuccess(res.user);
      navigate('/police');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Access Denied: Invalid Badge Number or Security Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Official Security Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
          <ShieldAlert className="w-9 h-9 animate-pulse" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>Police Tactical Command</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">Restricted Access: Authorized Police Personnel & Dispatch Officers Only</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Official Login Form */}
      <form onSubmit={handlePoliceLogin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-center gap-2 font-medium">
          <Radio className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
          <span><strong>Police Identity Gate:</strong> Enter Official Badge ID & Password.</span>
        </div>

        <div>
          <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-rose-600" />
            <span>Official Police Badge ID / User ID</span>
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. P-8842"
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-rose-600"
          />
        </div>

        <div>
          <label className="text-slate-700 font-bold block mb-1.5 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-rose-600" />
            <span>Police Security Authorization Password</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-600 font-medium"
          />
        </div>

        {/* Demo Credentials Info Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1 font-medium">
          <div className="font-bold text-slate-900">Default Authorized Test Officer Credentials:</div>
          <div>Badge ID: <code className="text-rose-700 font-mono font-bold">P-8842</code> (Inspector Rajesh Kumar)</div>
          <div>Security Password: <code className="text-rose-700 font-mono font-bold">Sentinel123!</code></div>
        </div>

        <button
          type="submit"
          disabled={loading || !userId.trim() || !password.trim()}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{loading ? 'Verifying Official Credentials...' : 'Authenticate & Unlock Tactical Command'}</span>
        </button>

      </form>

      {/* Security Legal Warning */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 shadow-sm font-medium">
        <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Unauthorized access attempts are logged & reported to Law Enforcement Authorities.</span>
      </div>

    </div>
  );
};
