import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import { Award, Download, CheckCircle2, Clock, FileText, ExternalLink, Eye, X } from 'lucide-react';

import { downloadPdfFromImage } from '../../utils/pdfDownloader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StudentCertificate = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/certificate');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const cert = data?.certificate;
      const certId = cert?.certificateId || 'ID';
      const filename = `Certificate_${certId}.pdf`;

      // 1. Instant local client-side PDF generation if preview image is available (0.05s)
      if (cert?.previewImagePath) {
        await downloadPdfFromImage(getAssetUrl(cert.previewImagePath), filename);
        return;
      }

      // 2. Direct backend PDF stream with 5s timeout
      try {
        const res = await api.get('/student/certificate/download', {
          responseType: 'blob',
          timeout: 5000
        });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        return;
      } catch (apiErr) {
        console.warn('API direct download failed or timed out:', apiErr);
      }

      // 3. Fallback to preview or asset URL
      const source = getAssetUrl(cert?.filePath);
      if (source) {
        window.open(source, '_blank');
      } else {
        alert('Certificate file is not ready yet. Please try again in a few moments.');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Unable to download certificate at this moment. Please check server connection.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Certificate">
        <LoadingSpinner message="Loading Certificate Details..." />
      </AppLayout>
    );
  }

  const { hasCertificate, certificate, status } = data || {};

  return (
    <AppLayout title="My Certificate">
      <div className="max-w-4xl mx-auto space-y-6">
        {hasCertificate && certificate ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Credential</span>
                <h3 className="text-xl font-black text-slate-900">Certificate of Completion</h3>
                <p className="text-xs font-mono text-blue-700 font-bold mt-0.5">Certificate ID: {certificate.certificateId}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Badge status="GENERATED" />
                
                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 text-xs transition-all cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Downloading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Print-Ready PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Real Rendered Visual Preview */}
            {certificate.previewImagePath && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Certificate Preview</p>
                  <button
                    onClick={() => setPreviewModalOpen(true)}
                    className="text-xs text-blue-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Fullscreen Preview</span>
                  </button>
                </div>
                <div
                  onClick={() => setPreviewModalOpen(true)}
                  className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white cursor-pointer hover:border-blue-300 transition-all group relative"
                >
                  <img
                    src={getAssetUrl(certificate.previewImagePath)}
                    alt="Official Certificate Preview"
                    className="w-full h-auto block group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Click to Enlarge</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Status: <strong className="text-emerald-700 font-bold">VERIFIED & ISSUED</strong></span>
              <span>Issued On: <strong className="text-slate-900">{new Date(certificate.generatedAt).toLocaleDateString()}</strong></span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-xs text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Certificate Generation Pending</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your official internship certificate is currently pending issuance by SM GROUPS Administration. Once generated, you can preview and download your high-quality PDF directly on this page.
            </p>
          </div>
        )}
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100">
              {certificate.previewImagePath ? (
                <img
                  src={getAssetUrl(certificate.previewImagePath)}
                  alt="Certificate Full View"
                  className="w-full h-auto max-h-[75vh] object-contain rounded-lg shadow-md border border-slate-200 bg-white"
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

export default StudentCertificate;
