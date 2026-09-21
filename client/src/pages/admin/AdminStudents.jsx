import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import api from '../../services/api';
import { Users, Search, Filter, Award, Upload, KeyRound } from 'lucide-react';
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
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedCollege, selectedDept, selectedYear, selectedCertStatus]);

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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = `/admin/students?page=${page}&limit=15&search=${search}`;
      if (selectedCollege) query += `&collegeId=${selectedCollege}`;
      if (selectedDept) query += `&department=${selectedDept}`;
      if (selectedYear) query += `&year=${selectedYear}`;
      if (selectedCertStatus) query += `&certificateStatus=${selectedCertStatus}`;

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

  return (
    <AppLayout title="Student Directory">
      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student name, ID, department, course..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/admin/upload"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Excel</span>
            </Link>
            <Link
              to="/admin/credentials"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl shadow-xs text-xs transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Credentials</span>
            </Link>
            <Link
              to="/admin/generate-certificates"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Generate Certs</span>
            </Link>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">College</label>
            <select
              value={selectedCollege}
              onChange={(e) => { setSelectedCollege(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="">All Colleges</option>
              {colleges.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="">All Years</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
              <option value="IV">IV Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Certificate Status</label>
            <select
              value={selectedCertStatus}
              onChange={(e) => { setSelectedCertStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="GENERATED">Generated</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Dept</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{st.studentId}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{st.collegeId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-700">{st.department}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{st.year}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{st.company}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{st.course}</td>
                    <td className="px-4 py-3"><Badge status={st.certificateStatus} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">No student records found</td>
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

export default AdminStudents;
