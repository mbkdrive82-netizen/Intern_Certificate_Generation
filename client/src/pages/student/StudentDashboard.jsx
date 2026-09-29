import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import { User, Award, Download, Building2, BookOpen, Briefcase, Calendar, Eye, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { downloadPdfFromImage } from '../../utils/pdfDownloader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleOpenPreview = async () => {
    setPreviewModalOpen(true);
    const cert = data?.certificate;
    if (!cert) return;

    if (cert.previewImagePath) {
      setPreviewLoading(false);
      return;
    }

    try {
      setPreviewLoading(true);
      const res = await api.get(`/admin/certificates/${cert._id || cert.certificateId}/preview-html`);
      let html = typeof res.data === 'string' ? res.data : '';
      const responsiveScript = `
<style id="client-preview-autofit-style">
  @media screen {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      overflow: hidden !important;
      background: #f1f5f9 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .cert-frame {
      transform-origin: center center !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
      flex-shrink: 0 !important;
      transition: transform 0.1s ease-out;
    }
  }
</style>
<script>
  function autoFitPreview() {
    var cert = document.querySelector('.cert-frame');
    if (!cert) return;
    var pad = 16;
    var availW = window.innerWidth - pad;
    var availH = window.innerHeight - pad;
    var certW = 1123;
    var certH = 794;
    var scale = Math.min(availW / certW, availH / certH);
    cert.style.transform = 'scale(' + scale + ')';
  }
  window.addEventListener('resize', autoFitPreview);
  window.addEventListener('DOMContentLoaded', autoFitPreview);
  window.addEventListener('load', autoFitPreview);
  autoFitPreview();
  setTimeout(autoFitPreview, 50);
  setTimeout(autoFitPreview, 250);
</script>
`;
      if (html && !html.includes('preview-autofit-style') && !html.includes('client-preview-autofit-style')) {
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${responsiveScript}</head>`);
        } else {
          html += responsiveScript;
        }
      }
      setPreviewHtml(html);
    } catch (err) {
      console.error('Failed to load preview html:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const cert = data?.certificate;
      const student = data?.student;
      const certId = cert?.certificateId || 'ID';
      const studentName = (student?.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${studentName}_Certificate_${certId}.pdf`;

      // 1. Instant local client-side PDF generation if preview image is available (0.05s)
      if (cert?.previewImagePath) {
        await downloadPdfFromImage(getAssetUrl(cert.previewImagePath), filename);
        return;
      }

      // 2. Direct backend PDF download via browser stream
      const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api$/, '') : 'https://intern-certificate-generation.onrender.com';
      const downloadUrl = `${backendUrl}/api/admin/certificates/${cert?._id || certId}/download-pdf`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to download certificate at this moment. Please try viewing it first.');
    } finally {
      setDownloading(false);
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

          <div className="flex flex-col items-start md:items-end space-y-3">
            <Badge status={certificateStatus} />
            {certificateStatus === 'GENERATED' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenPreview}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 text-xs transition-all cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all disabled:opacity-60 cursor-pointer"
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
              </div>
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

      {/* Full Certificate Preview Modal */}
      {previewModalOpen && certificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Certificate of Completion</h3>
                <p className="text-xs font-mono text-blue-700 font-bold">ID: {certificate.certificateId}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewModalOpen(false);
                    setPreviewHtml('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[400px]">
              {previewLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-medium mt-2">Loading certificate preview...</p>
                </div>
              ) : certificate.previewImagePath ? (
                <img
                  src={getAssetUrl(certificate.previewImagePath)}
                  alt="Certificate Full View"
                  className="w-full h-auto max-h-[75vh] object-contain rounded-lg shadow-md border border-slate-200 bg-white"
                />
              ) : previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Certificate Preview"
                  className="w-full h-[580px] border-0 rounded-lg shadow-sm"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <p className="font-bold text-sm">Visual preview is being prepared.</p>
                  <p className="text-xs mt-1">Please use the download button to get your print-ready PDF.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default StudentDashboard;
