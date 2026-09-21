import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Shield, Award, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

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

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 selection:bg-red-500 selection:text-white">
      {/* Left Column - Enterprise Brand Hero (Hidden on small mobile, prominent on desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1e0a0e] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle Brand Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 w-fit">
            <img
              src="/favicon.png"
              alt="SM Groups Bull Emblem"
              className="w-10 h-10 object-contain drop-shadow"
            />
            <div>
              <div className="text-sm font-black tracking-wider text-white">THE SM GROUPS</div>
              <div className="text-[10px] font-bold text-red-400 tracking-widest uppercase">TN SKILLS PARTNER</div>
            </div>
          </div>
        </div>

        {/* Center Pitch */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5 text-red-400" />
            <span>Official Credentialing Authority</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Automated Certificate Issuance & Verification Portal
          </h2>

          <p className="text-sm text-slate-300 mt-3.5 leading-relaxed max-w-md">
            Centralized platform for issuing cryptographically verified student internship certificates across affiliated colleges and partner organizations.
          </p>

          {/* Key Value Cards */}
          <div className="mt-8 space-y-3 max-w-md">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-white">Tamper-Proof Verification</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Every certificate includes an immutable QR code linked to live records.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-white">Multi-Institution Accreditation</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Seamless coordination across college departments and student batches.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise Workforce Platform</span>
          <span className="font-mono text-[11px] text-slate-500">v2.4 Production</span>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-between p-4 sm:p-8 xl:p-16 min-h-screen">
        {/* Top brand accent indicator on mobile */}
        <div className="flex items-center justify-between pt-2 lg:pt-0">
          <div className="lg:hidden flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Portal</span>
          </div>
          <div></div>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4 sm:py-6">
          {/* Logo prominently displayed in natural full aspect ratio */}
          <div className="text-center mb-6 sm:mb-8">
            <img
              src="/assets/sm_groups_logo.png"
              alt="THE SM GROUPS"
              className="h-12 sm:h-14 mx-auto object-contain mb-2.5 drop-shadow-xs"
            />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Enter your authorized credentials to access your portal
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-5 sm:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or Employee ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your ID or username"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-3 focus:ring-red-500/15 transition-all shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-base sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-3 focus:ring-red-500/15 transition-all shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins Helper */}
            <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors cursor-pointer"
              >
                <span>Quick Demo Credentials</span>
                {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-left">
                  <button
                    type="button"
                    onClick={() => fillCredentials('smadmin', 'adminpass')}
                    className="p-2 sm:p-2.5 bg-slate-50 hover:bg-red-50/60 hover:border-red-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-red-600 block">SM Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">smadmin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('tnskillsadmin', 'tnskillspass')}
                    className="p-2 sm:p-2.5 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 block">TNSkills Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">tnskillsadmin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('abcadmin', 'collegepass')}
                    className="p-2 sm:p-2.5 bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-emerald-600 block">College Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">abcadmin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('aakash.r', 'TNS#bF!mC4')}
                    className="p-2 sm:p-2.5 bg-slate-50 hover:bg-purple-50/60 hover:border-purple-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-purple-600 block">Student</span>
                    <span className="text-[10px] text-slate-500 font-mono">aakash.r</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 font-medium py-2">
          © 2026 THE SM GROUPS • Enterprise Workforce & Academic Credentialing Platform
        </footer>
      </div>
    </div>
  );
};

export default Login;




