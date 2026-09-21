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
  Folder,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TNSkillsDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tnskills/dashboard');
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data?.colleges) return;
    const headers = ['College Code', 'College Name', 'Total Students', 'Departments Count', 'Certificates Issued'];
    const rows = data.colleges.map((c) => [
      `"${c.code}"`,
      `"${c.name}"`,
      c.studentCount || 0,
      c.departments?.length || 0,
      c.certCount || 0
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tnskills_colleges_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (error && !data) {
    return (
      <AppLayout title="State Monitoring Dashboard">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-3 max-w-sm text-center bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-sm font-bold text-red-600">{error}</p>
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats, colleges } = data || {};

  return (
    <AppLayout title="TNSKILLS State Monitoring Dashboard">
      <div className="space-y-6 pb-8">
        {/* 5 Professional Colorful Metric Cards with Curve / Sparkline Trend Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
          {/* 1. TOTAL COLLEGES - Sapphire Blue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-blue-600 p-4.5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-600 transition-colors">
                Total Colleges
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalColleges || 0}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>Active Institutions</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Trendline Curve (Marked by user) */}
              <div className="flex-shrink-0 -mb-1 -mr-1">
                <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="curve-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,32 Q 35,30 60,18 T 100,6 L 100,40 L 0,40 Z" fill="url(#curve-blue)" />
                  <path d="M 0,32 Q 35,30 60,18 T 100,6" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="6" r="3" fill="#2563EB" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. TOTAL STUDENTS - Emerald Green */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-emerald-600 p-4.5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">
                Total Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalStudents || 0}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>Enrolled Interns</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Trendline Curve */}
              <div className="flex-shrink-0 -mb-1 -mr-1">
                <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="curve-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,34 Q 30,28 60,15 T 100,5 L 100,40 L 0,40 Z" fill="url(#curve-emerald)" />
                  <path d="M 0,34 Q 30,28 60,15 T 100,5" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="5" r="3" fill="#059669" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. DEPARTMENTS - Indigo / Violet */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-indigo-600 p-4.5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
                Departments
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalDepartments || 5}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    <span>Academic Streams</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Trendline Curve */}
              <div className="flex-shrink-0 -mb-1 -mr-1">
                <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="curve-indigo" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,30 Q 30,35 60,20 T 100,8 L 100,40 L 0,40 Z" fill="url(#curve-indigo)" />
                  <path d="M 0,30 Q 30,35 60,20 T 100,8" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="8" r="3" fill="#4F46E5" />
                </svg>
              </div>
            </div>
          </div>

          {/* 4. ISSUED CERTS - Crimson Red */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-red-600 p-4.5 shadow-xs hover:shadow-md hover:border-red-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-red-600 transition-colors">
                Issued Certs
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalCertificates || 0}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    <span>100% Verified</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Trendline Curve */}
              <div className="flex-shrink-0 -mb-1 -mr-1">
                <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="curve-red" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#DC2626" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,35 Q 35,32 65,16 T 100,4 L 100,40 L 0,40 Z" fill="url(#curve-red)" />
                  <path d="M 0,35 Q 35,32 65,16 T 100,4" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="4" r="3" fill="#DC2626" />
                </svg>
              </div>
            </div>
          </div>

          {/* 5. PENDING CERTS - Warm Amber (Arch curve matching user mark) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-amber-500 p-4.5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-amber-600 transition-colors">
                Pending Certs
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.certificatesPending || 0}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>None Pending</span>
                  </span>
                </div>
              </div>

              {/* Arch curve matching user mark */}
              <div className="flex-shrink-0 -mb-1 -mr-1">
                <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="curve-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#D97706" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,25 Q 40,8 70,12 T 100,30 L 100,40 L 0,40 Z" fill="url(#curve-amber)" />
                  <path d="M 0,25 Q 40,8 70,12 T 100,30" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="100" cy="30" r="3" fill="#D97706" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Colleges & Departments Section */}
        <div className="space-y-4 pt-2">
          {/* Breadcrumbs / View Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              {selectedCollege ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                    <button
                      onClick={() => setSelectedCollege(null)}
                      className="text-red-600 hover:text-red-700 hover:underline cursor-pointer font-bold"
                    >
                      Colleges
                    </button>
                    <span>›</span>
                    <span className="text-slate-800 font-bold uppercase">{selectedCollege.name}</span>
                  </div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900">
                    Departments in {selectedCollege.name} ({selectedCollege.departments?.length || 0})
                  </h2>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Colleges
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    All Colleges ({colleges?.length || 0})
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2.5">
              {selectedCollege && (
                <button
                  onClick={() => setSelectedCollege(null)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Colleges</span>
                </button>
              )}

              <button
                onClick={exportCSV}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: All Colleges Grid */}
          {!selectedCollege && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {colleges && colleges.length > 0 ? (
                colleges.map((col) => {
                  const deptCount = col.departments?.length || 0;
                  const studentCount = col.studentCount || 0;

                  return (
                    <div
                      key={col._id}
                      onClick={() => setSelectedCollege(col)}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-red-400 hover:shadow-md transition-all duration-200 cursor-pointer p-4.5 flex items-center space-x-3.5 group select-none"
                    >
                      {/* Left Icon: Soft red squircle with Building icon */}
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all shadow-2xs">
                        <Building2 className="w-5 h-5" />
                      </div>

                      {/* Right Info: College Name & Dept / Student Subtitle */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-[13px] uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                          {col.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1">
                          {deptCount} {deptCount === 1 ? 'dept' : 'depts'} • {studentCount} {studentCount === 1 ? 'student' : 'students'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                  No colleges registered
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Departments in Selected College */}
          {selectedCollege && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCollege.departments && selectedCollege.departments.length > 0 ? (
                  selectedCollege.departments.map((dept) => {
                    const deptName = typeof dept === 'string' ? dept : dept.name;
                    const deptStudentCount = typeof dept === 'object' && dept.count !== undefined ? dept.count : Math.round((selectedCollege.studentCount || 0) / (selectedCollege.departments.length || 1));

                    return (
                      <div
                        key={deptName}
                        onClick={() => navigate(`/tnskills/colleges/${selectedCollege._id}?dept=${encodeURIComponent(deptName)}`)}
                        className="bg-white rounded-2xl border border-slate-200/90 hover:border-red-500 hover:shadow-md transition-all duration-200 cursor-pointer p-4.5 flex items-center space-x-3.5 group select-none"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 transition-all flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105">
                          <Folder className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-red-600 transition-colors truncate">
                            {deptName}
                          </h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            {deptStudentCount} {deptStudentCount === 1 ? 'student' : 'students'}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                    No departments registered for this college
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/tnskills/colleges/${selectedCollege._id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>View Full Student Registry ({selectedCollege.studentCount || 0})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TNSkillsDashboard;
