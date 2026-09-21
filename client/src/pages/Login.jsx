import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  const { login, getDefaultRoute } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(username, password);
      const targetRoute = getDefaultRoute(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen sm-enterprise-pattern flex flex-col justify-center items-center p-4 selection:bg-red-500 selection:text-white">
      {/* Floating Enterprise Card */}
      <div className="w-full max-w-[430px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 relative">
        {/* Top Vibrant Red Accent Strip (Matching ems.thesmgroups.com) */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 w-full"></div>

        <div className="p-8 sm:p-9">
          {/* Official SM GROUPS Logo Squircle */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl border border-slate-200/90 bg-white p-2.5 mx-auto flex items-center justify-center shadow-xs">
              <img
                src="/assets/sm_groups_logo.png"
                alt="THE SM GROUPS"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-3">THE SM GROUPS</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.22em] uppercase mt-0.5">
              ENTERPRISE PORTAL
            </p>
          </div>

          {/* Heading */}
          <div className="text-center mt-6 mb-6">
            <h2 className="text-base font-bold text-slate-900">Sign In to Your Workspace</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employee ID or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. smadmin or student ID"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Obsidian Dark Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all text-sm disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Enterprise Security Sub-footer */}
          <div className="text-center mt-6 pt-2">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Protected by Enterprise Security Standards
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setShowDemoLogins(!showDemoLogins)}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
            >
              {showDemoLogins ? '▲ Hide Quick Demo Credentials' : '▼ Quick Demo Logins'}
            </button>

            {showDemoLogins && (
              <div className="grid grid-cols-2 gap-2 text-xs mt-3 text-left">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('smadmin', 'adminpass')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span className="font-bold block text-slate-900 text-[11px]">SM GROUPS Admin</span>
                  <span className="text-[9px] text-slate-500 font-mono">smadmin / adminpass</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('tnskillsadmin', 'tnskillspass')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span className="font-bold block text-slate-900 text-[11px]">TNSKILLS Admin</span>
                  <span className="text-[9px] text-slate-500 font-mono">tnskillsadmin / tnskillspass</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('abcadmin', 'collegepass')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span className="font-bold block text-slate-900 text-[11px]">ABC College Admin</span>
                  <span className="text-[9px] text-slate-500 font-mono">abcadmin / collegepass</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('aakash.r', 'TNS#bF!mC4')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <span className="font-bold block text-slate-900 text-[11px]">Student (Aakash)</span>
                  <span className="text-[9px] text-slate-500 font-mono">aakash.r / TNS#bF!mC4</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Footer (Matching ems.thesmgroups.com) */}
      <footer className="mt-8 text-center text-xs text-slate-500 font-medium">
        © 2026 THE SM GROUPS • Enterprise Workforce Platform
      </footer>
    </div>
  );
};

export default Login;
