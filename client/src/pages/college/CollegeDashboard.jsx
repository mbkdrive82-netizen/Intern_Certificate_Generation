import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/ui/StatCard';
import api from '../../services/api';
import { Building2, Users, Layers, Award, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CollegeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/college/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="College Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  const { college, stats } = data || {};

  return (
    <AppLayout title={college ? `${college.name} Admin Dashboard` : 'College Admin Dashboard'}>
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Students" value={stats?.totalStudents} icon={Users} color="blue" />
        <StatCard title="Departments" value={stats?.totalDepartments} icon={Layers} color="sky" />
        <StatCard title="Certificates Issued" value={stats?.generatedCertificates} icon={Award} color="emerald" />
        <StatCard title="Pending Certificates" value={stats?.pendingCertificates} icon={Clock} color="purple" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Department-Wise Student Management</h3>
          <p className="text-xs text-slate-500 mt-0.5">Filter and manage students across departments in {college?.name}.</p>
        </div>
        <Link
          to="/college/students"
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all"
        >
          <span>View College Students</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </AppLayout>
  );
};

export default CollegeDashboard;
