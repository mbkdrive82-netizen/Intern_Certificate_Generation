import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { Building2, Plus, Search, Users, Award, ShieldCheck } from 'lucide-react';

const AdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, [page, search]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/colleges?page=${page}&limit=10&search=${search}`);
      if (res.data.success) {
        setColleges(res.data.colleges);
        setPagination(res.data.pagination);
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
        setToast({ message: 'College created successfully!', type: 'success' });
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : colleges.length > 0 ? (
                colleges.map((col) => (
                  <tr key={col._id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700 text-xs">{col.code}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{col.name}</td>
                    <td className="px-5 py-3.5 text-xs">
                      {col.adminUserId?.username ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{col.adminUserId.username}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No admin assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      <span className="inline-flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>{col.studentCount || 0}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {col.departments && col.departments.length > 0 ? (
                          col.departments.map(d => (
                            <span key={d} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Award className="w-3.5 h-3.5" />
                        <span>{col.certCount || 0} Issued / {col.pendingCount || 0} Pending</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">No colleges found</td>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New College">
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

          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Create College Admin Account (Optional)
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Admin Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. abcadmin"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Admin Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password for college admin"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
    </AppLayout>
  );
};

export default AdminColleges;
