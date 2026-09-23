import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import { Award, Download, CheckCircle2, Clock, FileText, ExternalLink } from 'lucide-react';

import { downloadPdfFromImage } from '../../utils/pdfDownloader';

const StudentCertificate = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Certificate">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  const { hasCertificate, certificate, status } = data || {};

  return (
    <AppLayout title="My Certificate">
      <div className="max-w-4xl mx-auto space-y-6">
        {hasCertificate && certificate ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Credential</span>
                <h3 className="text-xl font-black text-slate-900">Certificate of Completion</h3>
                <p className="text-xs font-mono text-blue-700 font-bold mt-0.5">Certificate ID: {certificate.certificateId}</p>
              </div>

              <div className="flex items-center space-x-3">
                <Badge status="GENERATED" />
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all disabled:opacity-60"
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

            {/* Real Rendered Visual Preview (Section 84 & 85) */}
            {certificate.previewImagePath && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visual Certificate Preview</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <img
                    src={getAssetUrl(certificate.previewImagePath)}
                    alt="Official Certificate Preview"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Status: <strong className="text-emerald-700 font-bold">VERIFIED & GENERATED</strong></span>
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
    </AppLayout>
  );
};

export default StudentCertificate;
