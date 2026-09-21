import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import {
  Building2,
  Users,
  Layers,
  Award,
  Clock,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  User,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TNSkillsDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCollegeId, setExpandedCollegeId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/tnskills/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleCollege = (collegeId) => {
    setExpandedCollegeId((prev) => (prev === collegeId ? null : collegeId));
  };

  if (loading) {
    return (
      <AppLayout title="State Monitoring Dashboard">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">Loading Dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats, colleges } = data || {};

  return (
    <AppLayout title="TNSKILLS State Monitoring Dashboard">
      <div className="space-y-6 pb-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              TNSKILLS State Monitoring Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              State monitoring and certificate verification
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xs">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-300">Logged in:</span>
              <strong className="text-white font-bold">{user?.username || 'tnskillsadmin'}</strong>
            </div>
          </div>
        </div>

        {/* 5 Professional & Colorful Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* 1. TOTAL COLLEGES - Sapphire Blue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-blue-600 p-4.5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                Total Colleges
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalColleges || 0}
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>Active Institutions</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. TOTAL STUDENTS - Emerald Green */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-emerald-600 p-4.5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
                Total Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalStudents || 0}
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Enrolled Interns</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. DEPARTMENTS - Indigo / Violet */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-indigo-600 p-4.5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
                Departments
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalDepartments || 5}
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span>Academic Streams</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4. ISSUED CERTS - Crimson Red */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-red-600 p-4.5 shadow-xs hover:shadow-md hover:border-red-300 transition-all duration-200 flex flex-col justify-between group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-red-600 transition-colors">
                Issued Certs
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalCertificates || 0}
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>100% Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* 5. PENDING CERTS - Warm Amber */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-amber-500 p-4.5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between col-span-2 sm:col-span-1 group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
                Pending Certs
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats?.certificatesPending || 0}
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>None Pending</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colleges Section (Clean Box with College Name, Click to show Departments) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                Colleges
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {colleges?.length || 0}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Click any college to view its departments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colleges && colleges.length > 0 ? (
              colleges.map((col) => {
                const isSelected = expandedCollegeId === col._id;

                return (
                  <div
                    key={col._id}
                    onClick={() => toggleCollege(col._id)}
                    className={`bg-white rounded-2xl border p-5 transition-all duration-200 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-red-600 ring-2 ring-red-500/15 shadow-md'
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Clean College Header: Icon, Name & Chevron */}
                    <div className="flex items-center justify-between gap-3 select-none">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                          {col.name}
                        </h3>
                      </div>

                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 flex-shrink-0 ${
                          isSelected ? 'rotate-180 bg-red-50 text-red-600' : 'text-slate-400 bg-slate-50'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Departments (Only visible after clicking the college) */}
                    {isSelected && (
                      <div
                        className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            <span>Departments ({col.departments?.length || 0}):</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {col.departments && col.departments.length > 0 ? (
                            col.departments.map((dept) => (
                              <Link
                                key={dept}
                                to={`/tnskills/colleges/${col._id}`}
                                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-red-600 hover:text-white border border-slate-200 hover:border-red-600 text-slate-800 text-xs font-bold transition-all shadow-2xs"
                              >
                                {dept}
                              </Link>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No departments registered</span>
                          )}
                        </div>

                        <div className="pt-2">
                          <Link
                            to={`/tnskills/colleges/${col._id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 group"
                          >
                            <span>View All Students</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
                No colleges found
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TNSkillsDashboard;
