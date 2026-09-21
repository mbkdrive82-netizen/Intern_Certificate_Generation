import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

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

  const fillQuickDemo = (demoUser, demoPass, roleLabel) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setSelectedRole(roleLabel);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden selection:bg-red-500 selection:text-white">
      {/* Modern Ambient Enterprise Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/sm_groups_logo.png"
            alt="THE SM GROUPS"
            className="h-8 object-contain"
          />
          <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 tracking-wide">
            Enterprise Workforce & Education Platform
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Operational</span>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-[440px] my-auto relative z-10">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/80 p-8 sm:p-10">
          {/* Brand Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold tracking-wider uppercase mb-3.5">
              <span>Secure Gateway</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Your Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Enter your official credentials to access your administrative dashboard or student portal
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2.5 text-red-700 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username or Employee ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="e.g. smadmin or student ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Encrypted
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* High-Contrast Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all text-sm disabled:opacity-50 cursor-pointer pt-3 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Quick Demo Access
              </span>
              <button
                type="button"
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {showDemoLogins ? 'Hide' : 'Show Accounts'}
              </button>
            </div>

            {showDemoLogins && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-left">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('smadmin', 'adminpass', 'SM Admin')}
                  className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedRole === 'SM Admin'
                      ? 'bg-red-50/70 border-red-300 text-red-900 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">SM GROUPS</span>
                    {selectedRole === 'SM Admin' && <CheckCircle2 className="w-3 h-3 text-red-600" />}
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono mt-0.5">smadmin</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('tnskillsadmin', 'tnskillspass', 'TNSkills Admin')}
                  className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedRole === 'TNSkills Admin'
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">TNSKILLS</span>
                    {selectedRole === 'TNSkills Admin' && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono mt-0.5">tnskillsadmin</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('abcadmin', 'collegepass', 'College Admin')}
                  className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedRole === 'College Admin'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">College Portal</span>
                    {selectedRole === 'College Admin' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono mt-0.5">abcadmin</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('aakash.r', 'TNS#bF!mC4', 'Student')}
                  className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    selectedRole === 'Student'
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px]">Student</span>
                    {selectedRole === 'Student' && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <span className="text-[9px] text-slate-500 block font-mono mt-0.5">aakash.r</span>
                </button>
              </div>
            )}
          </div>

          {/* Security Subtext */}
          <div className="mt-5 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>256-Bit SSL Encrypted Enterprise Auth</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 text-center text-xs text-slate-500 font-medium relative z-10 flex flex-col sm:flex-row items-center justify-between">
        <span>© 2026 THE SM GROUPS • Enterprise Workforce Platform</span>
        <span className="text-[11px] text-slate-400 mt-1 sm:mt-0">TN SKILLS Official Certificate Authority</span>
      </footer>
    </div>
  );
};

export default Login;

