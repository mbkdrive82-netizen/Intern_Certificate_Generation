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
  ChevronUp,
  RefreshCw,
  User,
  CheckCircle2,
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
            <div className="w-9 h-9 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Loading Monitoring Dashboard...
            </p>
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
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              TNSKILLS State Monitoring Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Real-time institution monitoring and certificate verification portal
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* Logged in User Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-300 font-normal">Logged in:</span>
              <strong className="text-white font-bold">{user?.username || 'tnskillsadmin'}</strong>
            </div>
          </div>
        </div>

        {/* 5 Metric Cards (Responsive Grid that fits without horizontal overflow) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* 1. TOTAL COLLEGES */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Colleges
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalColleges || 0}
              </div>
              <div className="mt-2 flex items-center space-x-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-semibold text-slate-500 truncate">Active Institutions</span>
              </div>
            </div>
          </div>

          {/* 2. TOTAL STUDENTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Students
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalStudents || 0}
              </div>
              <div className="mt-2 flex items-center space-x-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[11px] font-semibold text-slate-500 truncate">Enrolled Interns</span>
              </div>
            </div>
          </div>

          {/* 3. DEPARTMENTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Departments
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalDepartments || 5}
              </div>
              <div className="mt-2 flex items-center space-x-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="text-[11px] font-semibold text-slate-500 truncate">Academic Streams</span>
              </div>
            </div>
          </div>

          {/* 4. ISSUED CERTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Issued Certs
              </span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalCertificates || 0}
              </div>
              <div className="mt-2 flex items-center space-x-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-semibold text-emerald-700 font-bold truncate">100% Verified</span>
              </div>
            </div>
          </div>

          {/* 5. PENDING CERTS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending Certs
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.certificatesPending || 0}
              </div>
              <div className="mt-2 flex items-center space-x-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="text-[11px] font-semibold text-slate-500 truncate">None Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Colleges Overview & Department Statistics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Colleges Overview & Department Statistics
                </h2>
                <p className="text-xs text-slate-500">
                  Click any college to view its affiliated academic departments
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/70">
              {colleges?.length || 0} Institutions
            </span>
          </div>

          {/* Colleges 3-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {colleges && colleges.length > 0 ? (
              colleges.map((col) => {
                const isExpanded = expandedCollegeId === col._id;
                const certRate = col.studentCount > 0 ? Math.round((col.certCount / col.studentCount) * 100) : 0;

                return (
                  <div
                    key={col._id}
                    className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      isExpanded
                        ? 'border-red-400 shadow-md ring-2 ring-red-500/10'
                        : 'border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300'
                    }`}
                  >
                    <div className="p-6 pb-4">
                      {/* Top Header Row: Code & Student Count */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-slate-900 text-white shadow-2xs">
                          {col.code}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                          {col.studentCount || 0} Students
                        </span>
                      </div>

                      {/* Clickable College Header */}
                      <div
                        onClick={() => toggleCollege(col._id)}
                        className="mt-4 cursor-pointer group/header select-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`text-base font-bold tracking-tight transition-colors line-clamp-1 ${
                              isExpanded ? 'text-red-600' : 'text-slate-900 group-hover/header:text-red-600'
                            }`}
                          >
                            {col.name}
                          </h3>
                          <span
                            className={`p-1 rounded-lg text-slate-400 group-hover/header:text-slate-700 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-red-600' : ''
                            }`}
                            title={isExpanded ? 'Collapse departments' : 'Click to show departments'}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </span>
                        </div>

                        {/* Status Line with Checkmark */}
                        <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>
                            <strong className="text-slate-800 font-semibold">{col.certCount || 0} Certificates Issued</strong> ({col.pendingCount || 0} Pending)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${certRate}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Department Trigger Button (Clear interaction hint) */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => toggleCollege(col._id)}
                          className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                            isExpanded
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <span className="flex items-center space-x-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            <span>Departments ({col.departments?.length || 0})</span>
                          </span>
                          <span className="text-[11px] font-semibold opacity-80 flex items-center space-x-1">
                            <span>{isExpanded ? 'Hide' : 'Click to show'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </button>
                      </div>

                      {/* DEPARTMENTS: ONLY SHOW AFTER CLICKING THE COLLEGE */}
                      {isExpanded && (
                        <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              Enrolled Departments
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {col.departments?.length || 0} Streams
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {col.departments && col.departments.length > 0 ? (
                              col.departments.map((dept) => (
                                <span
                                  key={dept}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:border-red-500 hover:text-red-600 transition-colors"
                                >
                                  {dept}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No departments registered</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Link Button */}
                    <div className="p-6 pt-0 mt-2">
                      <div className="pt-3 border-t border-slate-100">
                        <Link
                          to={`/tnskills/colleges/${col._id}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 shadow-xs hover:shadow-md group/btn"
                        >
                          <span>View Department Students</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
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
