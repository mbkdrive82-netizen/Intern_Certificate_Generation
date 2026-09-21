import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex flex-col justify-between items-center px-4 py-8 selection:bg-red-500 selection:text-white">
      {/* Top spacing */}
      <div></div>

      {/* Main Login Card */}
      <div className="w-full max-w-[430px]">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/70 overflow-hidden">
          {/* Top Brand Crimson Accent Strip */}
          <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 w-full"></div>

          <div className="p-7 sm:p-9">
            {/* Header with Logo */}
            <div className="text-center mb-7">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-sm p-2.5 mx-auto flex items-center justify-center mb-3.5">
                <img
                  src="/assets/sm_groups_logo.png"
                  alt="The SM Groups"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                TN SKILLS & SM GROUPS
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Certificate Management Portal
              </p>
            </div>

            {/* Sub-heading */}
            <div className="mb-5 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your credentials to access the system
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username or ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-3 focus:ring-red-500/15 transition-all shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-3 focus:ring-red-500/15 transition-all shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins Helper */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors cursor-pointer"
              >
                <span>Demo Accounts</span>
                {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemo && (
                <div className="grid grid-cols-2 gap-2 mt-3 text-left">
                  <button
                    type="button"
                    onClick={() => fillCredentials('smadmin', 'adminpass')}
                    className="p-2.5 bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-red-600 block">SM Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">smadmin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('tnskillsadmin', 'tnskillspass')}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-blue-600 block">TNSkills Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">tnskillsadmin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('abcadmin', 'collegepass')}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-emerald-600 block">College Admin</span>
                    <span className="text-[10px] text-slate-500 font-mono">abcadmin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('aakash.r', 'TNS#bF!mC4')}
                    className="p-2.5 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 border border-slate-200 rounded-xl text-xs transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-purple-600 block">Student</span>
                    <span className="text-[10px] text-slate-500 font-mono">aakash.r</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 font-medium">
        © 2026 THE SM GROUPS • Certificate Authority Platform
      </footer>
    </div>
  );
};

export default Login;



