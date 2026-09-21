import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Pagination from '../../components/ui/Pagination';
import api from '../../services/api';
import { KeyRound, Download, Search, Building2 } from 'lucide-react';

const AdminCredentials = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [page, search, selectedCollege]);

  const fetchColleges = async () => {
    try {
      const res = await api.get('/admin/colleges?limit=100');
      if (res.data.success) {
        setColleges(res.data.colleges);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      let query = `/admin/students?page=${page}&limit=15&search=${search}`;
      if (selectedCollege) query += `&collegeId=${selectedCollege}`;

      const res = await api.get(query);
      if (res.data.success) {
        setStudents(res.data.students);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      let queryUrl = '/admin/students/credentials/export';
      if (selectedCollege) queryUrl += `?collegeId=${selectedCollege}`;
      const res = await api.get(queryUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_credentials.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      const token = localStorage.getItem('token');
      window.open(`/api/admin/students/credentials/export?token=${token}`, '_blank');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout title="Student Credentials Management">
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search student name or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <select
            value={selectedCollege}
            onChange={(e) => { setSelectedCollege(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="">All Colleges</option>
            {colleges.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Credentials Excel</span>
        </button>
      </div>

      {/* Credentials Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Dept / Year</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Temporary Password</th>
                <th className="px-4 py-3">Course</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{st.studentId}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{st.collegeId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <span className="font-bold text-amber-700">{st.department}</span> ({st.year} Year)
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-emerald-700">{st.userId?.username || 'N/A'}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">
                      {st.tempPassword || '******'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                      {st.course}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">No credentials found</td>
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
    </AppLayout>
  );
};

export default AdminCredentials;
