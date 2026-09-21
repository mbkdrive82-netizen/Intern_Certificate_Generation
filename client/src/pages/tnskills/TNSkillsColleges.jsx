import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import {
  Building2,
  ChevronRight,
  Folder,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TNSkillsColleges = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tnskills/colleges');
      if (res.data.success) {
        setColleges(res.data.colleges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!colleges || colleges.length === 0) return;
    const headers = ['College Code', 'College Name', 'Total Students', 'Departments Count', 'Certificates Issued'];
    const rows = colleges.map((c) => [
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
    link.setAttribute('download', 'tnskills_colleges.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout title={selectedCollege ? selectedCollege.name : 'Colleges'}>
      <div className="space-y-5 pb-8">
        {/* Header with Breadcrumb & Export CSV (Matching reference screenshot) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
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
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Departments in {selectedCollege.name} ({selectedCollege.departments?.length || 0})
                </h1>
              </div>
            ) : (
              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Colleges
                </h1>
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

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium mt-3">Loading Colleges Directory...</p>
          </div>
        ) : (
          <>
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
                        {/* Soft Red Squircle with Building icon */}
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all shadow-2xs">
                          <Building2 className="w-5 h-5" />
                        </div>

                        {/* College Info */}
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
                    No colleges found
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
                          {/* Folder Squircle */}
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
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TNSkillsColleges;
