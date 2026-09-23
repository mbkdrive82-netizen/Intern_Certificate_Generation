import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import {
  Award,
  Download,
  ExternalLink,
  Search,
  Eye,
  FileText,
  Filter,
  RotateCcw,
  Building2,
  Briefcase,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCachedData, setCachedData } from '../../utils/dataCache';
import { downloadPdfFromImage } from '../../utils/pdfDownloader';

const AdminCertificates = () => {
  const cachedCerts = getCachedData('admin_certificates_default');
  const cachedColleges = getCachedData('admin_colleges_all');
  const cachedCompanies = getCachedData('admin_companies_list');

  const [certificates, setCertificates] = useState(cachedCerts?.certificates || []);
  const [colleges, setColleges] = useState(cachedColleges || []);
  const [companies, setCompanies] = useState(cachedCompanies || []);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(cachedCerts?.pagination || { total: 0, pages: 1 });
  const [loading, setLoading] = useState(!cachedCerts);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Preview Modal
  const [previewCert, setPreviewCert] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null);

  useEffect(() => {
    fetchCollegesAndCompanies();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkProgress = async () => {
      try {
        const res = await api.get('/admin/certificates/bulk-progress');
        if (isMounted && res.data?.success && res.data?.progress) {
          if (res.data.progress.inProgress) {
            setBulkProgress(res.data.progress);
            fetchCertificates(true);
          } else if (bulkProgress?.inProgress && !res.data.progress.inProgress) {
            setBulkProgress(null);
            fetchCertificates(false);
          }
        }
      } catch (e) {}
    };

    checkProgress();
    const interval = setInterval(checkProgress, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [bulkProgress?.inProgress]);

  useEffect(() => {
    const isDefault = !search.trim() && !selectedCollege && !selectedDept && !selectedYear && !selectedCompany && !selectedStatus && page === 1;
    if (isDefault && cachedCerts) {
      fetchCertificates(true);
    } else {
      const timer = setTimeout(() => {
        fetchCertificates(false);
      }, search.trim() ? 250 : 0);
      return () => clearTimeout(timer);
    }
  }, [page, search, selectedCollege, selectedDept, selectedYear, selectedCompany, selectedStatus]);

  const fetchCollegesAndCompanies = async () => {
    try {
      const [colRes, compRes] = await Promise.all([
        api.get('/admin/colleges?limit=100'),
        api.get('/admin/companies')
      ]);
      if (colRes.data.success) {
        setColleges(colRes.data.colleges || []);
        setCachedData('admin_colleges_all', colRes.data.colleges || []);
      }
      if (compRes.data.success) {
        setCompanies(compRes.data.companies || []);
        setCachedData('admin_companies_list', compRes.data.companies || []);
      }
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchCertificates = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      let query = `/admin/certificates?page=${page}&limit=15`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedCollege) query += `&collegeId=${selectedCollege}`;
      if (selectedDept) query += `&department=${encodeURIComponent(selectedDept)}`;
      if (selectedYear) query += `&year=${encodeURIComponent(selectedYear)}`;
      if (selectedCompany) query += `&company=${encodeURIComponent(selectedCompany)}`;
      if (selectedStatus) query += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await api.get(query);
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
        if (!search.trim() && !selectedCollege && !selectedDept && !selectedYear && !selectedCompany && !selectedStatus && page === 1) {
          setCachedData('admin_certificates_default', { certificates: res.data.certificates, pagination: res.data.pagination });
        }
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCertificates();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCollege('');
    setSelectedDept('');
    setSelectedYear('');
    setSelectedCompany('');
    setSelectedStatus('');
    setPage(1);
  };

  const activeFilterCount = [
    search,
    selectedCollege,
    selectedDept,
    selectedYear,
    selectedCompany,
    selectedStatus
  ].filter(Boolean).length;

  return (
    <AppLayout title="Certificates Management">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/generate-certificates"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Generate Certificates</span>
          </Link>
          <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-xs">
            <FileText className="w-4 h-4" />
            <span>View Certificates</span>
          </span>
        </div>

        <Link
          to="/admin/generate-certificates"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-xs text-xs transition-all"
        >
          <Award className="w-4 h-4" />
          <span>+ Generate New Batch</span>
        </Link>
      </div>

      {/* Real-time Generation Progress Banner */}
      {bulkProgress && bulkProgress.inProgress && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md space-y-3 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="font-bold text-sm tracking-wide">
                ⚡ Generating Certificates in Background: {bulkProgress.currentStudent || 'Processing...'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
              {bulkProgress.current} / {bulkProgress.total} ({bulkProgress.percent}%)
            </span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="bg-white h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${bulkProgress.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-blue-100 font-medium pt-0.5">
            <span>Company: <strong className="text-white">{bulkProgress.company || 'All'}</strong></span>
            <span>Generated: <strong className="text-emerald-300">{bulkProgress.successCount || 0}</strong> | Skipped: <strong className="text-amber-200">{bulkProgress.skippedCount || 0}</strong></span>
          </div>
        </div>
      )}

      {/* Filter Control Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Certificates</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                {activeFilterCount} active
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Student Name, Student ID, or Certificate ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          {/* College Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              College
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="">All Colleges</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="AI & DS">AI & DS</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="">All Years</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
              <option value="IV">IV Year</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sub-Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="">All Companies</option>
              {companies.map((comp) => (
                <option key={comp._id} value={comp.name}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="GENERATED">GENERATED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <p className="text-xs font-bold text-slate-600">
          Showing <span className="text-blue-700 font-extrabold">{certificates.length}</span> of{' '}
          <span className="text-slate-900 font-extrabold">{pagination.total || 0}</span> Certificates
        </p>
      </div>

      {/* Certificates Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Certificate ID</th>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">College</th>
                <th className="px-5 py-3.5">Dept / Year</th>
                <th className="px-5 py-3.5">Company / Course</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date Issued</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="inline-block w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 font-semibold mt-2">Loading certificates...</p>
                  </td>
                </tr>
              ) : certificates.length > 0 ? (
                certificates.map((cert) => {
                  const student = cert.studentId || {};
                  return (
                    <tr key={cert._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                          {cert.certificateId || cert.certificateNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block text-sm">
                          {student.name || 'N/A'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {student.studentId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {student.collegeId?.name || student.college || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-700">
                        <span className="font-bold text-amber-800">{student.department || 'N/A'}</span>
                        <span className="text-slate-400 font-normal"> ({student.year || 'N/A'} Year)</span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className="font-bold text-purple-700 block">{student.company || 'MBK'}</span>
                        <span className="text-slate-500">{student.course || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge status={cert.status} />
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500">
                        {cert.generatedAt ? new Date(cert.generatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {cert.previewImagePath && (
                            <button
                              onClick={() => setPreviewCert(cert)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Preview Rendered Certificate"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>Preview</span>
                            </button>
                          )}
                          {cert.previewImagePath && (
                            <button
                              onClick={() => {
                                const filename = `${(cert.studentId?.name || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_')}_${cert.certificateId || 'SMG'}.pdf`;
                                downloadPdfFromImage(cert.previewImagePath, filename);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Download Print-Ready PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Certificates Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeFilterCount > 0
                        ? 'Try clearing some filters to see more results.'
                        : 'Go to Generate Certificates to issue certificates for your students.'}
                    </p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Visual Preview Modal */}
      <Modal
        isOpen={!!previewCert}
        onClose={() => setPreviewCert(null)}
        title={`Certificate Preview — ${previewCert?.studentId?.name || ''} (${previewCert?.certificateId || previewCert?.certificateNumber})`}
      >
        {previewCert && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <img
                src={getAssetUrl(previewCert.previewImagePath)}
                alt="Rendered Certificate Preview"
                className="w-full h-auto block"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-500">
                ID: {previewCert.certificateId || previewCert.certificateNumber}
              </span>
              <button
                onClick={() => {
                  const filename = `${(previewCert.studentId?.name || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_')}_${previewCert.certificateId || 'SMG'}.pdf`;
                  downloadPdfFromImage(previewCert.previewImagePath || getAssetUrl(previewCert.filePath), filename);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print-Ready PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

export default AdminCertificates;
