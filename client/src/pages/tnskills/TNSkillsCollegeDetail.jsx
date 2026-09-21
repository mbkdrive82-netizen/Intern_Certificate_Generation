import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import api from '../../services/api';
import { Building2, Layers, Search, Filter, CheckCircle2, Clock } from 'lucide-react';

const TNSkillsCollegeDetail = () => {
  const { id: collegeId } = useParams();
  const [college, setCollege] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollegeDetails();
  }, [collegeId]);

  useEffect(() => {
    fetchStudents();
  }, [collegeId, selectedDept, selectedYear, search, page]);

  const fetchCollegeDetails = async () => {
    try {
      const res = await api.get(`/tnskills/colleges/${collegeId}`);
      if (res.data.success) {
        setCollege(res.data.college);
        setDepartments(res.data.college.departments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = `/tnskills/colleges/${collegeId}/students?page=${page}&limit=15&search=${search}`;
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
    <AppLayout title={college ? `${college.name} (${college.code})` : 'College Department View'}>
      {/* College Info & Department Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <Building2 className="w-6 h-6 text-blue-700" />
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{college?.name}</h3>
            <p className="text-xs text-blue-700 font-bold">{college?.totalStudents || 0} Total Enrolled Students</p>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Department to Filter Students
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
              All Departments ({college?.totalStudents || 0})
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
                {d.department} – {d.count} Students
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search student name or student ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={selectedYear}
          onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs focus:outline-none focus:border-blue-600"
        >
          <option value="">All Years</option>
          <option value="I">I Year</option>
          <option value="II">II Year</option>
          <option value="III">III Year</option>
          <option value="IV">IV Year</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department / Year</th>
                <th className="px-4 py-3">Course (Training)</th>
                <th className="px-4 py-3">Course Status</th>
                <th className="px-4 py-3">Certificate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{st.studentId}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <span className="font-bold text-amber-700">{st.department}</span> ({st.year} Year)
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div className="font-semibold text-slate-800">{st.course}</div>
                      <div className="text-[11px] text-slate-500">{st.company}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Course Completed</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {st.certificateStatus === 'GENERATED' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Issued</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    No student records found for selected department filter
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

export default TNSkillsCollegeDetail;
