import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, RefreshCw, Menu } from 'lucide-react';
import api from '../../services/api';

const Navbar = ({ title, onRefresh, onToggleMobileMenu }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeBatch, setActiveBatch] = useState(null);

  useEffect(() => {
    if (user?.role !== 'SM_GROUPS_ADMIN') return;

    let isMounted = true;
    const checkBatch = async () => {
      try {
        const res = await api.get('/admin/certificates/bulk-progress');
        if (isMounted) {
          if (res.data?.success && res.data?.progress?.inProgress) {
            setActiveBatch(res.data.progress);
          } else {
            setActiveBatch(null);
          }
        }
      } catch (err) {}
    };

    checkBatch();
    const interval = setInterval(checkBatch, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (typeof onRefresh === 'function') {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Active Generation Global Banner */}
        {activeBatch && (
          <Link
            to="/admin/generate-certificates"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition-all shadow-xs"
            title="Generation in progress. Click to view details."
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>
              ⚡ Generating: {activeBatch.current} of {activeBatch.total} ({activeBatch.percent}%)
            </span>
          </Link>
        )}

        {/* Global Refresh Option */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh current page data"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-red-600 hover:border-red-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-500 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        {user && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Logged in: </span>
            <strong className="text-slate-900">{user.username}</strong>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
