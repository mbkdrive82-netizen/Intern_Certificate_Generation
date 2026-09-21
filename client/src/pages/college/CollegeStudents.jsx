import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import api from '../../services/api';
import { Users, Search, Filter } from 'lucide-react';

const CollegeStudents = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedYear, search, page]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/college/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = `/college/students?page=${page}&limit=15&search=${search}`;
      if (selectedDept) query += `&department=${selectedDept}`;
      if (selectedYear) query += `&year=${selectedYear}`;

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
    <AppLayout title="College Student Directory">
      {/* Department Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Department-Wise Filtering
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedDept(''); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDept === ''
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d.department}
                onClick={() => { setSelectedDept(d.department); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedDept === d.department
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.department} ({d.count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student name or student ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="">All Academic Years</option>
            <option value="I">I Year</option>
            <option value="II">II Year</option>
            <option value="III">III Year</option>
            <option value="IV">IV Year</option>
          </select>
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
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Certificate</th>
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
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{st.studentId}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-700">{st.department}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{st.year}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{st.company}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{st.course}</td>
                    <td className="px-4 py-3"><Badge status={st.certificateStatus} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400">
                    No student records found in your college
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
    </AppLayout>
  );
};

export default CollegeStudents;
