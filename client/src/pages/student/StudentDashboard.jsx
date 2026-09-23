import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { User, Award, Download, Building2, BookOpen, Briefcase, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

import { downloadPdfFromImage } from '../../utils/pdfDownloader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    try {
      setDownloading(true);
      const cert = data?.certificate;
      const certId = cert?.certificateId || 'ID';
      const filename = `Certificate_${certId}.pdf`;
      const source = cert?.previewImagePath || getAssetUrl(cert?.filePath);
      downloadPdfFromImage(source, filename);
    } catch (err) {
      console.error('Direct download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Student Portal">
        <LoadingSpinner message="Loading Student Portal..." />
      </AppLayout>
    );
  }

  const { student, certificateStatus, certificate } = data || {};

  return (
    <AppLayout title="My Student Portal">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-blue-700">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Welcome Student</span>
            <h2 className="text-2xl font-black text-slate-900">{student?.name}</h2>
            <p className="text-xs font-mono text-slate-500 font-bold">Student ID: {student?.studentId}</p>
          </div>

          <div className="flex flex-col items-start md:items-end space-y-2">
            <Badge status={certificateStatus} />
            {certificateStatus === 'GENERATED' && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Print-Ready PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Academic & Training Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Academic Details</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">College</span>
                <span className="font-bold text-slate-800">{student?.collegeId?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Department</span>
                  <span className="font-bold text-amber-700">{student?.department}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Academic Year</span>
                  <span className="font-bold text-slate-800">{student?.year} Year</span>
                </div>
              </div>
            </div>
          </div>

          {/* Training & Certification Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Training & Internship Program</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Course Name</span>
                <span className="font-bold text-slate-900">{student?.course}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Partner Company</span>
                <span className="font-bold text-blue-800">{student?.company}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
