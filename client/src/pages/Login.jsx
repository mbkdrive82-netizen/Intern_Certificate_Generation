import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand & Form Box */}
      <div className="w-full max-w-md">
        {/* Company Header */}
        <div className="text-center mb-6">
          <img
            src="/assets/sm_groups_logo.png"
            alt="The SM Groups"
            className="h-12 mx-auto object-contain mb-3"
          />
          <h1 className="text-xl font-bold text-slate-800">
            TN SKILLS & SM GROUPS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Certificate Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-base font-semibold text-slate-800 mb-5">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              {showDemo ? 'Hide Demo Logins' : 'Demo Logins'}
            </button>

            {showDemo && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-left">
                <button
                  type="button"
                  onClick={() => fillCredentials('smadmin', 'adminpass')}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-800 block">SM Admin</span>
                  <span className="text-[11px] text-slate-500 font-mono">smadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('tnskillsadmin', 'tnskillspass')}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-800 block">TNSkills Admin</span>
                  <span className="text-[11px] text-slate-500 font-mono">tnskillsadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('abcadmin', 'collegepass')}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-800 block">College Admin</span>
                  <span className="text-[11px] text-slate-500 font-mono">abcadmin</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('aakash.r', 'TNS#bF!mC4')}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-800 block">Student</span>
                  <span className="text-[11px] text-slate-500 font-mono">aakash.r</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 The SM Groups. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;


