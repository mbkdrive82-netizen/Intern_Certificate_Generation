import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import {
  Building2,
  Users,
  Award,
  Clock,
  BookOpen,
  Briefcase,
  ChevronRight,
  Upload,
  ExternalLink,
  KeyRound,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCachedData, setCachedData } from '../../utils/dataCache';

import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const cached = getCachedData('admin_dashboard');
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    fetchDashboard(Boolean(cached));

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const progRes = await api.get('/admin/certificates/bulk-progress');
        if (isMounted && progRes.data?.success && progRes.data?.progress?.inProgress) {
          fetchDashboard(true);
        }
      } catch (e) {}
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent && !cached) setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
        setCachedData('admin_dashboard', res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <LoadingSpinner message="Loading Dashboard..." />
      </AppLayout>
    );
  }

  const { stats, recentCertificates } = data || {};
  const totalStudents = stats?.totalStudents || 0;
  const totalCerts = stats?.totalCertificates || 0;
  const certPercentage = totalStudents > 0 ? Math.round((totalCerts / totalStudents) * 100) : 0;

  const statItems = [
    {
      title: 'Total Colleges',
      value: stats?.totalColleges || 0,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/colleges'
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/admin/students'
    },
    {
      title: 'Issued Certificates',
      value: stats?.totalCertificates || 0,
      icon: Award,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/certificates'
    },
    {
      title: 'Pending Certificates',
      value: stats?.totalPendingCertificates || 0,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/admin/generate-certificates'
    },
    {
      title: 'Active Courses',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      link: '/admin/students'
    },
    {
      title: 'Partner Companies',
      value: stats?.totalCompanies || 0,
      icon: Briefcase,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      link: '/admin/companies'
    }
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Top Clean Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              SM GROUPS Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Internship Certificate Generation & Verification Management System
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              to="/admin/upload"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Students</span>
            </Link>
            <Link
              to="/admin/generate-certificates"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate Certificates</span>
            </Link>
          </div>
        </div>

        {/* 6 Clean Light Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.link}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {item.title}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-1">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.value}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Certificate Issuance Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                Certificate Generation Progress
              </h3>
              <span className="text-xs text-slate-400 font-normal">
                ({totalCerts} / {totalStudents} completed)
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                {certPercentage}% Issued
              </span>
              <Link
                to="/admin/certificates"
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(certPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Recent Generated Certificates (Full Width) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Award className="w-4.5 h-4.5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Recent Generated Certificates</h3>
              </div>
              <Link
                to="/admin/certificates"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
              >
                <span>View All Certificates</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Student Details</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Dept / Year</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentCertificates && recentCertificates.length > 0 ? (
                    recentCertificates.slice(0, 8).map((cert) => {
                      const student = cert.studentId || {};
                      return (
                        <tr key={cert._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-blue-700 text-xs">
                            <span className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                              {cert.certificateId || cert.certificateNumber || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-900 text-xs">
                              {student.name || 'Candidate'}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {student.studentId || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {student.collegeId?.name || student.college || 'N/A'}
                          </td>
                          <td className="px-4 py-3.5 text-slate-700">
                            <span className="font-bold text-amber-800">{student.department || 'N/A'}</span>
                            <span className="text-slate-400"> ({student.year || 'N/A'} Year)</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-purple-700">
                              {student.company || 'MBK'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge status={cert.status} />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {cert.filePath ? (
                              <a
                                href={getAssetUrl(cert.filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors border border-blue-200"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View PDF</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-400">
                        No generated certificates yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center mt-2">
            <Link
              to="/admin/generate-certificates"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1"
            >
              <span>⚡ Go to Certificate Generator</span>
            </Link>
          </div>
        </div>

        {/* Bottom Shortcut Management Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
          <Link
            to="/admin/colleges"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex items-center space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                Colleges
              </h4>
              <p className="text-[11px] text-slate-400 truncate">Manage & logins</p>
            </div>
          </Link>

          <Link
            to="/admin/credentials"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-sm transition-all flex items-center space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                Credentials
              </h4>
              <p className="text-[11px] text-slate-400 truncate">Export student logins</p>
            </div>
          </Link>

          <Link
            to="/admin/companies"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-sm transition-all flex items-center space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                Sub-Company
              </h4>
              <p className="text-[11px] text-slate-400 truncate">Logos & backgrounds</p>
            </div>
          </Link>

          <Link
            to="/admin/certificates"
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-sm transition-all flex items-center space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                Certificates
              </h4>
              <p className="text-[11px] text-slate-400 truncate">Filter & download</p>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
