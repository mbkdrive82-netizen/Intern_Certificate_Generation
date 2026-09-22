import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Award,
  Upload,
  KeyRound,
  RotateCcw,
  Building2,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCertStatus, setSelectedCertStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search, selectedCollege, selectedDept, selectedYear, selectedCertStatus]);

  const fetchColleges = async () => {
    try {
      const res = await api.get('/admin/colleges?limit=100');
      if (res.data.success) {
        setColleges(res.data.colleges || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = `/admin/students?page=${page}&limit=15`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedCollege) query += `&collegeId=${selectedCollege}`;
      if (selectedDept) query += `&department=${encodeURIComponent(selectedDept)}`;
      if (selectedYear) query += `&year=${encodeURIComponent(selectedYear)}`;
      if (selectedCertStatus) query += `&certificateStatus=${encodeURIComponent(selectedCertStatus)}`;

      const res = await api.get(query);
      if (res.data.success) {
        setStudents(res.data.students || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCollege('');
    setSelectedDept('');
    setSelectedYear('');
    setSelectedCertStatus('');
    setPage(1);
  };

  const activeFilterCount = [
    search,
    selectedCollege,
    selectedDept,
    selectedYear,
    selectedCertStatus
  ].filter(Boolean).length;

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const avatarColors = [
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700'
  ];

  return (
    <AppLayout title="Students Directory">
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Enrolled Students Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse candidate records, filter by academic stream, and verify certification status.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/admin/upload"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Excel</span>
            </Link>
            <Link
              to="/admin/credentials"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Credentials</span>
            </Link>
            <Link
              to="/admin/generate-certificates"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate Certs</span>
            </Link>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Candidates</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name, ID, department, or course..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                College
              </label>
              <select
                value={selectedCollege}
                onChange={(e) => {
                  setSelectedCollege(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">All Colleges</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AI & DS">AI & DS</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">All Years</option>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Certificate Status
              </label>
              <select
                value={selectedCertStatus}
                onChange={(e) => {
                  setSelectedCertStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">All Statuses</option>
                <option value="GENERATED">GENERATED</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-600">
            Showing <span className="text-blue-700 font-extrabold">{students.length}</span> of{' '}
            <span className="text-slate-900 font-extrabold">{pagination.total || 0}</span> Students
          </p>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">College</th>
                  <th className="px-5 py-3.5">Dept / Year</th>
                  <th className="px-5 py-3.5">Company / Course</th>
                  <th className="px-5 py-3.5">Certificate</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="inline-block w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Loading students...</p>
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((st, idx) => (
                    <tr key={st._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              avatarColors[idx % avatarColors.length]
                            }`}
                          >
                            {getInitials(st.name)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block text-sm">{st.name}</span>
                            <span className="font-mono text-[11px] text-blue-700 font-semibold">
                              {st.studentId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {st.collegeId?.name || st.college || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-700">
                        <span className="font-bold text-amber-800">{st.department || 'N/A'}</span>
                        <span className="text-slate-400"> ({st.year || 'N/A'} Year)</span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className="font-bold text-purple-700 block">{st.company || 'MBK'}</span>
                        <span className="text-slate-500">{st.course || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge status={st.certificateStatus} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to="/admin/generate-certificates"
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Generate</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Student Records Found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeFilterCount > 0
                          ? 'Try adjusting your filters to see more results.'
                          : 'Import students from Excel to populate this directory.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminStudents;
