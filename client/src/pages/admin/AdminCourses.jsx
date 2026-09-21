import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { BookOpen, Plus, Briefcase } from 'lucide-react';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchCompanies();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      const res = await api.post('/admin/courses', { name, companyId: companyId || null });
      if (res.data.success) {
        setToast({ message: 'Course created successfully', type: 'success' });
        setIsModalOpen(false);
        setName('');
        setCompanyId('');
        fetchCourses();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create course', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Course Management">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-6">
        <p className="text-xs font-semibold text-slate-500">Manage technical courses for student certificates.</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Course Name</th>
              <th className="px-5 py-3">Associated Company</th>
              <th className="px-5 py-3">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {courses.length > 0 ? (
              courses.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>{c.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {c.companyId?.name ? (
                      <span className="inline-flex items-center space-x-1 font-semibold text-slate-800">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span>{c.companyId.name}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">General / All</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-6 text-slate-400">No courses defined</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Course">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Full Stack Development"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Associated Company (Optional)</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="">-- All Companies --</option>
              {companies.map(comp => (
                <option key={comp._id} value={comp._id}>{comp.name}</option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default AdminCourses;
