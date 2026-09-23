import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
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
  ChevronRight,
  Trash2,
  UserX,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCachedData, setCachedData } from '../../utils/dataCache';

const AdminStudents = () => {
  const cachedStudents = getCachedData('admin_students_default');
  const cachedColleges = getCachedData('admin_colleges_all');

  const [students, setStudents] = useState(cachedStudents?.students || []);
  const [colleges, setColleges] = useState(cachedColleges || []);
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCertStatus, setSelectedCertStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(cachedStudents?.pagination || { total: 0, pages: 1 });
  const [loading, setLoading] = useState(!cachedStudents);

  // Selection & Delete States
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [deleteSingleModal, setDeleteSingleModal] = useState({ isOpen: false, student: null, loading: false });
  const [deleteCollegeModal, setDeleteCollegeModal] = useState({ isOpen: false, college: null, loading: false });
  const [deleteBulkModal, setDeleteBulkModal] = useState({ isOpen: false, loading: false });

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    const isDefault = !search.trim() && !selectedCollege && !selectedDept && !selectedYear && !selectedCertStatus && page === 1;
    if (isDefault && cachedStudents) {
      fetchStudents(true);
    } else {
      const timer = setTimeout(() => {
        fetchStudents(false);
      }, search.trim() ? 250 : 0);
      return () => clearTimeout(timer);
    }
  }, [page, search, selectedCollege, selectedDept, selectedYear, selectedCertStatus]);

  const fetchColleges = async () => {
    try {
      const res = await api.get('/admin/colleges?limit=100');
      if (res.data.success) {
        setColleges(res.data.colleges || []);
        setCachedData('admin_colleges_all', res.data.colleges || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
        setSelectedIds([]);
        if (!search.trim() && !selectedCollege && !selectedDept && !selectedYear && !selectedCertStatus && page === 1) {
          setCachedData('admin_students_default', { students: res.data.students, pagination: res.data.pagination });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteSingleModal.student) return;
    try {
      setDeleteSingleModal(prev => ({ ...prev, loading: true }));
      const res = await api.delete(`/admin/students/${deleteSingleModal.student._id}`);
      if (res.data.success) {
        setToast({ message: res.data.message || 'Student deleted successfully', type: 'success' });
        setDeleteSingleModal({ isOpen: false, student: null, loading: false });
        fetchStudents();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete student', type: 'error' });
      setDeleteSingleModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCollegeStudents = async () => {
    if (!deleteCollegeModal.college) return;
    try {
      setDeleteCollegeModal(prev => ({ ...prev, loading: true }));
      const res = await api.delete(`/admin/colleges/${deleteCollegeModal.college._id}/students`);
      if (res.data.success) {
        setToast({ message: res.data.message || 'All students deleted successfully', type: 'success' });
        setDeleteCollegeModal({ isOpen: false, college: null, loading: false });
        fetchStudents();
        fetchColleges();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete college students', type: 'error' });
      setDeleteCollegeModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setDeleteBulkModal(prev => ({ ...prev, loading: true }));
      const res = await api.post('/admin/students/bulk-delete', { studentIds: selectedIds });
      if (res.data.success) {
        setToast({ message: res.data.message || `Deleted ${selectedIds.length} students successfully`, type: 'success' });
        setDeleteBulkModal({ isOpen: false, loading: false });
        setSelectedIds([]);
        fetchStudents();
        fetchColleges();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to bulk delete students', type: 'error' });
      setDeleteBulkModal(prev => ({ ...prev, loading: false }));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
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

  const currentSelectedCollegeObj = colleges.find(c => c._id === selectedCollege);

  return (
    <AppLayout title="Students Directory">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
              to="/admin/upload-students"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Excel</span>
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

        {/* Selected College Clear Quick-Action Banner */}
        {currentSelectedCollegeObj && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  College Filter Active: {currentSelectedCollegeObj.name} ({currentSelectedCollegeObj.code})
                </h4>
                <p className="text-[11px] text-amber-800 font-medium">
                  Need to wipe out or re-upload this college's batch? You can delete all students of this college at once.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDeleteCollegeModal({ isOpen: true, college: currentSelectedCollegeObj, loading: false })}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex-shrink-0 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Clear All Students of this College</span>
            </button>
          </div>
        )}

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
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
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

        {/* Results Count & Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <p className="text-xs font-bold text-slate-600">
            Showing <span className="text-blue-700 font-extrabold">{students.length}</span> of{' '}
            <span className="text-slate-900 font-extrabold">{pagination.total || 0}</span> Students
          </p>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-3 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-red-800">
                {selectedIds.length} student{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={() => setDeleteBulkModal({ isOpen: true, loading: false })}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={students.length > 0 && selectedIds.length === students.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      title="Select all on this page"
                    />
                  </th>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">College</th>
                  <th className="px-5 py-3.5">Dept / Year</th>
                  <th className="px-5 py-3.5">Company / Course</th>
                  <th className="px-5 py-3.5">Certificate</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="inline-block w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-400 font-semibold mt-2">Loading students...</p>
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((st, idx) => {
                    const isSelected = selectedIds.includes(st._id);
                    return (
                      <tr
                        key={st._id}
                        className={`transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-blue-50/30'}`}
                      >
                        <td className="w-10 px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(st._id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          />
                        </td>
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
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to="/admin/generate-certificates"
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                              title="Generate Certificate"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Generate</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => setDeleteSingleModal({ isOpen: true, student: st, loading: false })}
                              title={`Delete ${st.name}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
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

      {/* Delete Single Student Modal */}
      <Modal
        isOpen={deleteSingleModal.isOpen}
        onClose={() => !deleteSingleModal.loading && setDeleteSingleModal({ isOpen: false, student: null, loading: false })}
        title="Delete Student Record"
      >
        {deleteSingleModal.student && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Confirm Student Deletion</span>
              </div>
              <p>
                Are you sure you want to permanently delete candidate <strong className="text-slate-900">{deleteSingleModal.student.name} ({deleteSingleModal.student.studentId})</strong>?
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 font-medium pt-1">
                <li>Student profile and academic data will be removed</li>
                <li>Associated portal login account will be deleted</li>
                <li>Issued PDF certificate and previews will be cleaned up</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={deleteSingleModal.loading}
                onClick={() => setDeleteSingleModal({ isOpen: false, student: null, loading: false })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSingleModal.loading}
                onClick={handleDeleteSingle}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleteSingleModal.loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Student</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete College Students Modal */}
      <Modal
        isOpen={deleteCollegeModal.isOpen}
        onClose={() => !deleteCollegeModal.loading && setDeleteCollegeModal({ isOpen: false, college: null, loading: false })}
        title="Clear All Students for College"
      >
        {deleteCollegeModal.college && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-red-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Delete All Candidates for {deleteCollegeModal.college.name}</span>
              </div>
              <p>
                Are you sure you want to permanently delete all enrolled students for <strong className="text-slate-900">{deleteCollegeModal.college.name} ({deleteCollegeModal.college.code})</strong>?
              </p>
              <p className="font-semibold text-red-800">
                This will delete student records, login credentials, and generated certificates.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={deleteCollegeModal.loading}
                onClick={() => setDeleteCollegeModal({ isOpen: false, college: null, loading: false })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCollegeModal.loading}
                onClick={handleDeleteCollegeStudents}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleteCollegeModal.loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Students...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete All College Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={deleteBulkModal.isOpen}
        onClose={() => !deleteBulkModal.loading && setDeleteBulkModal({ isOpen: false, loading: false })}
        title="Delete Selected Students"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-800 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Bulk Delete Confirmation</span>
            </div>
            <p>
              Are you sure you want to permanently delete <strong>{selectedIds.length}</strong> selected student record{selectedIds.length > 1 ? 's' : ''}?
            </p>
            <p className="font-semibold text-amber-800">
              Their user login accounts and generated certificates will be permanently deleted.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              disabled={deleteBulkModal.loading}
              onClick={() => setDeleteBulkModal({ isOpen: false, loading: false })}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteBulkModal.loading}
              onClick={handleBulkDelete}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {deleteBulkModal.loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Selected ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default AdminStudents;
