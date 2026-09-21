import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { Building2, Users, Award, Clock, BookOpen, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="SM GROUPS Master Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  const { stats, recentColleges, recentStudents, recentCertificates } = data || {};

  return (
    <AppLayout title="SM GROUPS Master Dashboard">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Colleges" value={stats?.totalColleges} icon={Building2} color="blue" />
        <StatCard title="Total Students" value={stats?.totalStudents} icon={Users} color="emerald" />
        <StatCard title="Total Certs" value={stats?.totalCertificates} icon={Award} color="amber" />
        <StatCard title="Pending Certs" value={stats?.totalPendingCertificates} icon={Clock} color="purple" />
        <StatCard title="Total Courses" value={stats?.totalCourses} icon={BookOpen} color="sky" />
        <StatCard title="Companies" value={stats?.totalCompanies} icon={Briefcase} color="rose" />
      </div>

      {/* Main Grid Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Student Uploads */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Recent Enrolled Students</span>
            </h3>
            <Link to="/admin/students" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Student ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">College</th>
                  <th className="px-3 py-2">Dept</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentStudents && recentStudents.length > 0 ? (
                  recentStudents.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono text-blue-700 font-bold">{st.studentId}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{st.name}</td>
                      <td className="px-3 py-2.5 text-slate-500">{st.collegeId?.name || 'N/A'}</td>
                      <td className="px-3 py-2.5 font-medium">{st.department}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-400">No student records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Generated Certificates */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Recent Generated Certificates</span>
            </h3>
            <Link to="/admin/certificates" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">College</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Generated Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentCertificates && recentCertificates.length > 0 ? (
                  recentCertificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{cert.studentId?.name || 'Student'}</td>
                      <td className="px-3 py-2.5 text-slate-500">{cert.studentId?.collegeId?.name || 'N/A'}</td>
                      <td className="px-3 py-2.5"><Badge status={cert.status} /></td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {new Date(cert.generatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-slate-400">No generated certificates yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
