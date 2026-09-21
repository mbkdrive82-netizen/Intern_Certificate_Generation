import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import { Award, Download, ExternalLink, Search, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Preview Modal
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [page]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/certificates?page=${page}&limit=15`);
      if (res.data.success) {
        setCertificates(res.data.certificates);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Certificate Center">
      {/* Simplified Top Tabs */}
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 pb-3">
        <Link
          to="/admin/generate-certificates"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <Award className="w-4 h-4 text-slate-500" />
          <span>← 1. Generate Certificates</span>
        </Link>
        <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-xs">
          <FileText className="w-4 h-4" />
          <span>2. View & Download Issued Certificates</span>
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Certificate ID</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">College</th>
                <th className="px-5 py-3">Dept / Year</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Generated At</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : certificates.length > 0 ? (
                certificates.map((cert) => {
                  const student = cert.studentId || {};
                  return (
                    <tr key={cert._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-blue-700">
                        {cert.certificateId || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {student.name || 'N/A'}
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">{student.studentId}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{student.collegeId?.name || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-700">
                        <span className="font-bold text-amber-700">{student.department}</span> ({student.year} Year)
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{student.course}</td>
                      <td className="px-5 py-3.5"><Badge status={cert.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {new Date(cert.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-1.5">
                          {cert.previewImagePath && (
                            <button
                              onClick={() => setPreviewCert(cert)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                              title="Preview Rendered Certificate"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                          )}
                          {cert.filePath && (
                            <a
                              href={`/${cert.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">No generated certificates found</td>
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

      {/* Real Visual Preview Modal (Section 84 & 85) */}
      <Modal isOpen={!!previewCert} onClose={() => setPreviewCert(null)} title={`Certificate Preview - ${previewCert?.studentId?.name || ''} (${previewCert?.certificateId})`}>
        {previewCert && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <img
                src={`/${previewCert.previewImagePath}`}
                alt="Rendered Certificate Preview"
                className="w-full h-auto block"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-500">ID: {previewCert.certificateId}</span>
              <a
                href={`/${previewCert.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print-Ready PDF</span>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

export default AdminCertificates;
