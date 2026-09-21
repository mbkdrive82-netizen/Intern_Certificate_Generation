import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import {
  Building2,
  Users,
  Layers,
  Award,
  Clock,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TNSkillsDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCollegeId, setExpandedCollegeId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/tnskills/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleCollege = (collegeId) => {
    setExpandedCollegeId((prev) => (prev === collegeId ? null : collegeId));
  };

  if (loading) {
    return (
      <AppLayout title="State Monitoring Dashboard">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">Loading Dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { stats, colleges } = data || {};

  return (
    <AppLayout title="TNSKILLS State Monitoring Dashboard">
      <div className="space-y-6 pb-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              TNSKILLS State Monitoring Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              State monitoring and certificate verification
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xs">
              <User className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-300">Logged in:</span>
              <strong className="text-white font-bold">{user?.username || 'tnskillsadmin'}</strong>
            </div>
          </div>
        </div>

        {/* 5 Simple Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Colleges
              </span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.totalColleges || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Students
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.totalStudents || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Departments
              </span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.totalDepartments || 5}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Issued Certs
              </span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.totalCertificates || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pending Certs
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {stats?.certificatesPending || 0}
            </div>
          </div>
        </div>

        {/* Colleges Section (Simple Box with College Name, click to show departments) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Colleges
            </h2>
            <span className="text-xs text-slate-500">
              Click a college to view departments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colleges && colleges.length > 0 ? (
              colleges.map((col) => {
                const isSelected = expandedCollegeId === col._id;

                return (
                  <div
                    key={col._id}
                    onClick={() => toggleCollege(col._id)}
                    className={`bg-white rounded-xl border p-5 transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-red-600 ring-1 ring-red-600'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {/* Simple College Name and Chevron */}
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-900 text-base">
                        {col.name}
                      </h3>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                          isSelected ? 'rotate-180 text-red-600' : ''
                        }`}
                      />
                    </div>

                    {/* Departments (Only visible after clicking the college) */}
                    {isSelected && (
                      <div
                        className="mt-4 pt-4 border-t border-slate-100 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Departments:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {col.departments && col.departments.length > 0 ? (
                            col.departments.map((dept) => (
                              <Link
                                key={dept}
                                to={`/tnskills/colleges/${col._id}`}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-800 text-xs font-medium transition-colors"
                              >
                                {dept}
                              </Link>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No departments</span>
                          )}
                        </div>

                        <div className="pt-2">
                          <Link
                            to={`/tnskills/colleges/${col._id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700"
                          >
                            <span>View All Students</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
                No colleges found
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TNSkillsDashboard;
