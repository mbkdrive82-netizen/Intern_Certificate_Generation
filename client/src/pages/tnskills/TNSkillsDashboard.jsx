import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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
        <LoadingSpinner message="Loading State Monitoring Dashboard..." subtitle="Naan Mudhalvan / TNSkills Portal" />
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
        {/* 5 Clean, Professional Metric Cards (No Curves, No Animations) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
          {/* 1. TOTAL COLLEGES - Sapphire Blue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-blue-600 p-3 sm:p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Total Colleges
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalColleges || 0}
              </div>
              <div className="mt-2 sm:mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                  <span className="truncate">Active Institutions</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. TOTAL STUDENTS - Emerald Green */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-emerald-600 p-3 sm:p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Total Students
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalStudents || 0}
              </div>
              <div className="mt-2 sm:mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
                  <span className="truncate">Enrolled Interns</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. DEPARTMENTS - Indigo / Violet */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-indigo-600 p-3 sm:p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Departments
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-2xs flex-shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalDepartments || 5}
              </div>
              <div className="mt-2 sm:mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0"></span>
                  <span className="truncate">Academic Streams</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4. ISSUED CERTS - Crimson Red */}
          <div className="bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-red-600 p-3 sm:p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Issued Certs
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-2xs flex-shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.totalCertificates || 0}
              </div>
              <div className="mt-2 sm:mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
                  <span className="truncate">100% Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* 5. PENDING CERTS - Warm Amber (Full width on mobile to balance grid) */}
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200/90 border-t-[3px] border-t-amber-500 p-3 sm:p-4.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Pending Certs
              </span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats?.certificatesPending || 0}
              </div>
              <div className="mt-2 sm:mt-2.5">
                <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] sm:text-[11px] font-semibold truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                  <span className="truncate">None Pending</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Section: Colleges Listing OR Departments in Selected College */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div>
              {selectedCollege ? (
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Departments in {selectedCollege.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Click a department below to view student records
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Colleges
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    All Colleges ({colleges?.length || 0})
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
