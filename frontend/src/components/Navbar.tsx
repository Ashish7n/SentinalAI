import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Map, ShieldAlert, BarChart3, AlertTriangle, LogOut, User, Lock, Smartphone, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPolice = user?.role === 'police';

  const navLinks = [
    { path: '/', label: 'Citizen Safety Map', icon: Map },
    { path: '/report', label: 'Report Hazard', icon: AlertTriangle, iconColor: 'text-amber-600' },
    { path: '/police', label: 'Police Command', icon: ShieldAlert, iconColor: 'text-rose-600' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-[9990] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 group-hover:bg-blue-100 transition-all shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Sentinel<span className="text-blue-600">AI</span></span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold tracking-wide">ONLINE</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Public Safety & Tactical Command Platform</p>
          </div>
        </Link>

        {/* Desktop Navigation Tabs with Generous Spacing */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : link.iconColor || 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Auth & Profile Controls */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            /* Logged in User Profile Badge */
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-2.5 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${isPolice ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className="font-extrabold text-slate-900">{user.fullName}</span>
                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-lg ${
                  isPolice ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {user.role}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Login Action Buttons */
            <div className="flex items-center gap-3">
              <Link
                to="/citizen-login"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Citizen Login (OTP)</span>
              </Link>

              <Link
                to="/police-login"
                className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Police Official Login</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Drawer Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Dynamic Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-lg animate-fade-in">
          
          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : link.iconColor || 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile or Auth Links for Mobile */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPolice ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{user.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase">{user.role} Account</div>
                  </div>
                </div>

                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Link
                  to="/citizen-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Citizen Login (OTP)</span>
                </Link>

                <Link
                  to="/police-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Police Official Login</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      )}

    </header>
  );
};
