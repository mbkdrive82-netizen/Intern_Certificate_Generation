import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { Building2, Plus, Search, Users, Award, ShieldCheck, Copy, Eye, EyeOff, Key, CheckCircle, Download, Trash2, UserX, AlertTriangle } from 'lucide-react';
import { getCachedData, setCachedData } from '../../utils/dataCache';

// Auto-generate username from college code
const generateUsername = (code) => {
  if (!code) return '';
  return code.toLowerCase().trim() + '_admin';
};

// Auto-generate strong password
const generatePassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!';
  const all = upper + lower + digits + special;
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 6; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
};

const AdminColleges = () => {
  const cachedColleges = getCachedData('admin_colleges_list_default');

  const [colleges, setColleges] = useState(cachedColleges?.colleges || []);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(cachedColleges?.pagination || {});
  const [loading, setLoading] = useState(!cachedColleges);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delete Modals State
  const [deleteStudentsModal, setDeleteStudentsModal] = useState({ isOpen: false, college: null, loading: false });
  const [deleteCollegeModal, setDeleteCollegeModal] = useState({ isOpen: false, college: null, loading: false });

  // Success modal with credentials display
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Per-row download loading state
  const [downloadingId, setDownloadingId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const isDefault = !search.trim() && page === 1;
    fetchColleges(isDefault && Boolean(cachedColleges));
  }, [page, search]);

  // Auto-generate credentials when code changes
  useEffect(() => {
    if (code) {
      setAdminUsername(generateUsername(code));
      setAdminPassword(generatePassword());
    }
  }, [code]);

  const fetchColleges = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/admin/colleges?page=${page}&limit=10&search=${search}`);
      if (res.data.success) {
        setColleges(res.data.colleges);
        setPagination(res.data.pagination);
        if (!search.trim() && page === 1) {
          setCachedData('admin_colleges_list_default', { colleges: res.data.colleges, pagination: res.data.pagination });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/admin/colleges', {
        name,
        code,
        adminUsername,
        adminPassword
      });

      if (res.data.success) {
        // Show credentials popup
        setCreatedCredentials({ collegeName: name, username: adminUsername, password: adminPassword });
        setIsModalOpen(false);
        setName('');
        setCode('');
        setAdminUsername('');
        setAdminPassword('');
        fetchColleges();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create college', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const downloadCredentials = (collegeName, username, password) => {
    const rows = [
      ['College Name', 'Username', 'Password', 'Login URL'],
      [collegeName, username, password, window.location.origin + '/login']
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(collegeName || 'college').replace(/\s+/g, '_')}_credentials.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAndDownload = async (col) => {
    try {
      setDownloadingId(col._id);
      const res = await api.post(`/admin/colleges/${col._id}/reset-credentials`);
      if (res.data.success) {
        const { collegeName, username, password } = res.data.credentials;
        downloadCredentials(collegeName, username, password);
        setToast({ message: `Credentials reset & downloaded for ${collegeName}`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to reset credentials', type: 'error' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteCollegeStudents = async () => {
    if (!deleteStudentsModal.college) return;
    try {
      setDeleteStudentsModal(prev => ({ ...prev, loading: true }));
      const res = await api.delete(`/admin/colleges/${deleteStudentsModal.college._id}/students`);
      if (res.data.success) {
        setToast({ message: res.data.message || 'All students deleted successfully', type: 'success' });
        setDeleteStudentsModal({ isOpen: false, college: null, loading: false });
        fetchColleges();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete students', type: 'error' });
      setDeleteStudentsModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCollege = async () => {
    if (!deleteCollegeModal.college) return;
    try {
      setDeleteCollegeModal(prev => ({ ...prev, loading: true }));
      const res = await api.delete(`/admin/colleges/${deleteCollegeModal.college._id}`);
      if (res.data.success) {
        setToast({ message: res.data.message || 'College deleted successfully', type: 'success' });
        setDeleteCollegeModal({ isOpen: false, college: null, loading: false });
        fetchColleges();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete college', type: 'error' });
      setDeleteCollegeModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName('');
    setCode('');
    setAdminUsername('');
    setAdminPassword('');
  };

  return (
    <AppLayout title="College Management">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search college name or code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New College</span>
        </button>
      </div>

      {/* Colleges Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">College Code</th>
                <th className="px-5 py-3">College Name</th>
                <th className="px-5 py-3">College Admin</th>
                <th className="px-5 py-3">Enrolled Students</th>
                <th className="px-5 py-3">Departments</th>
                <th className="px-5 py-3">Certificates Status</th>
                <th className="px-5 py-3">Credentials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="inline-block w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 font-semibold mt-2">Loading colleges...</p>
                  </td>
                </tr>
              ) : colleges.length > 0 ? (
                colleges.map((col) => (
                  <tr key={col._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-700 text-xs">
                      <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                        {col.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">{col.name}</td>
                    <td className="px-5 py-4 text-xs">
                      {col.adminUserId?.username ? (
                        <span className="inline-flex items-center space-x-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{col.adminUserId.username}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No admin assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      <span className="inline-flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{col.studentCount || 0}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {col.departments && col.departments.length > 0 ? (
                          col.departments.map(d => (
                            <span key={d} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[10px]">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center space-x-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-bold">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{col.certCount || 0} Issued / {col.pendingCount || 0} Pending</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => resetAndDownload(col)}
                          disabled={downloadingId === col._id}
                          title="Reset password & download credentials"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          {downloadingId === col._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{downloadingId === col._id ? 'Resetting...' : 'CSV'}</span>
                        </button>

                        <button
                          onClick={() => setDeleteStudentsModal({ isOpen: true, college: col, loading: false })}
                          title={`Delete all ${col.studentCount || 0} students enrolled in ${col.name}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 hover:text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Clear Students</span>
                        </button>

                        <button
                          onClick={() => setDeleteCollegeModal({ isOpen: true, college: col, loading: false })}
                          title={`Delete ${col.name} college & all data`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                    No colleges found matching search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Add College Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New College">
        <form onSubmit={handleCreateCollege} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">College Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ABC Engineering College"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">College Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABCENG"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 uppercase font-mono text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Auto-generated credentials preview */}
          {adminUsername && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Auto-Generated Login Credentials
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono font-bold text-blue-800 bg-white border border-blue-200 rounded-lg px-3 py-1.5">
                      {adminUsername}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(adminUsername, 'username')}
                      className="p-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 text-blue-600 transition-all"
                    >
                      {copiedField === 'username' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono font-bold text-blue-800 bg-white border border-blue-200 rounded-lg px-3 py-1.5 tracking-wider">
                      {showPassword ? adminPassword : '••••••••••'}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 text-blue-600 transition-all"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(adminPassword, 'password')}
                      className="p-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 text-blue-600 transition-all"
                    >
                      {copiedField === 'password' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAdminPassword(generatePassword())}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  ↻ Regenerate Password
                </button>

                {/* Download credentials button (in form preview) */}
                <button
                  type="button"
                  onClick={() => downloadCredentials(name, adminUsername, adminPassword)}
                  className="flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 mt-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Credentials (.csv)
                </button>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                ⚠️ Note these credentials before creating — password cannot be recovered later.
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
            >
              {submitting ? 'Creating...' : 'Create College'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Credentials Success Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">College Created Successfully!</h3>
                <p className="text-xs text-slate-500">{createdCredentials.collegeName}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Login Credentials</p>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold">Username</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 font-mono font-bold text-blue-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
                    {createdCredentials.username}
                  </code>
                  <button
                    onClick={() => handleCopy(createdCredentials.username, 'su')}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    {copiedField === 'su' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 uppercase font-semibold">Password</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 font-mono font-bold text-blue-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm tracking-wider">
                    {createdCredentials.password}
                  </code>
                  <button
                    onClick={() => handleCopy(createdCredentials.password, 'sp')}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    {copiedField === 'sp' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              🔐 Save these credentials now! This password will not be shown again.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => downloadCredentials(createdCredentials.collegeName, createdCredentials.username, createdCredentials.password)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download Credentials
              </button>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Students of College Modal */}
      <Modal
        isOpen={deleteStudentsModal.isOpen}
        onClose={() => !deleteStudentsModal.loading && setDeleteStudentsModal({ isOpen: false, college: null, loading: false })}
        title="Clear All Students for College"
      >
        {deleteStudentsModal.college && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Permanent Student Deletion Warning</span>
              </div>
              <p>
                Are you sure you want to delete all <strong>{deleteStudentsModal.college.studentCount || 0}</strong> enrolled students for <strong className="text-slate-900">{deleteStudentsModal.college.name} ({deleteStudentsModal.college.code})</strong>?
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 font-medium pt-1">
                <li>All student records will be removed from database</li>
                <li>All student login accounts will be deleted</li>
                <li>All issued PDF certificates & visual previews will be cleaned up</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={deleteStudentsModal.loading}
                onClick={() => setDeleteStudentsModal({ isOpen: false, college: null, loading: false })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteStudentsModal.loading}
                onClick={handleDeleteCollegeStudents}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {deleteStudentsModal.loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting Students...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete All Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Entire College Modal */}
      <Modal
        isOpen={deleteCollegeModal.isOpen}
        onClose={() => !deleteCollegeModal.loading && setDeleteCollegeModal({ isOpen: false, college: null, loading: false })}
        title="Delete College"
      >
        {deleteCollegeModal.college && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-red-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Delete College & All Associated Data</span>
              </div>
              <p>
                Are you sure you want to permanently delete <strong className="text-slate-900">{deleteCollegeModal.college.name} ({deleteCollegeModal.college.code})</strong>?
              </p>
              <p className="font-semibold text-red-800">
                This will delete the college, its administrator login account, and all {deleteCollegeModal.college.studentCount || 0} students and their certificates. This action cannot be reversed.
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
                onClick={handleDeleteCollege}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {deleteCollegeModal.loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting College...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete College</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

export default AdminColleges;
