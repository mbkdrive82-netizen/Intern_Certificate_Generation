import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import { Award, Users, Building2, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCertificateGenerate = () => {
  const [colleges, setColleges] = useState([]);
  const [students, setStudents] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Single Generation
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [singleTemplateId, setSingleTemplateId] = useState('');
  const [singleRegenerate, setSingleRegenerate] = useState(false);
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleResult, setSingleResult] = useState(null);

  // Bulk Generation
  const [bulkCompany, setBulkCompany] = useState('');
  const [bulkCollegeId, setBulkCollegeId] = useState('');
  const [bulkDepartment, setBulkDepartment] = useState('');
  const [bulkYear, setBulkYear] = useState('');
  const [bulkTemplateId, setBulkTemplateId] = useState('');
  const [bulkRegenerate, setBulkRegenerate] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);

  const [toast, setToast] = useState(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchColleges();
    fetchStudents();
    fetchCompanies();
    fetchTemplates();
    checkActiveGeneration();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await api.get('/admin/colleges?limit=100');
      if (res.data.success) setColleges(res.data.colleges);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) setCompanies(res.data.companies);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students?limit=500');
      if (res.data.success) {
        setStudents(res.data.students || []);
        setTotalStudentsCount(res.data.total || res.data.students?.length || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/admin/certificate-templates');
      if (res.data.success) setTemplates(res.data.templates);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSingleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setToast({ message: 'Please select a student', type: 'error' });
      return;
    }

    try {
      setSingleSubmitting(true);
      const res = await api.post('/admin/certificates/generate', {
        studentId: selectedStudentId,
        templateId: singleTemplateId || undefined,
        regenerate: singleRegenerate
      });

      if (res.data.success) {
        setSingleResult(res.data.result);
        setToast({ message: res.data.result.message, type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to generate certificate', type: 'error' });
    } finally {
      setSingleSubmitting(false);
    }
  };

  const checkActiveGeneration = async () => {
    try {
      const res = await api.get('/admin/certificates/bulk-progress');
      if (res.data?.success && res.data?.progress) {
        if (res.data.progress.inProgress) {
          setBulkSubmitting(true);
          setBulkProgress(res.data.progress);
          startPolling();
        } else if (res.data.progress.lastResult) {
          // If completed within last 5 minutes, restore the summary card
          const timeSince = new Date() - new Date(res.data.progress.finishedAt);
          if (timeSince < 300000) {
            setBulkResult(res.data.progress.lastResult);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await api.get('/admin/certificates/bulk-progress');
        if (res.data?.success && res.data?.progress) {
          setBulkProgress(res.data.progress);
          if (!res.data.progress.inProgress) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setBulkSubmitting(false);
            if (res.data.progress.lastResult) {
              setBulkResult(res.data.progress.lastResult);
              setToast({
                message: `Bulk generation complete: ${res.data.progress.lastResult.successCount} generated, ${res.data.progress.lastResult.skippedCount} skipped!`,
                type: 'success'
              });
            }
          }
        }
      } catch (err) {
        // silent network poll retry
      }
    }, 1000);
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setBulkResult(null);
    setBulkSubmitting(true);
    setBulkProgress({
      inProgress: true,
      current: 0,
      total: 0,
      percent: 0,
      currentStudent: 'Starting background generation engine...',
      successCount: 0,
      skippedCount: 0
    });

    // Start polling progress immediately
    startPolling();

    try {
      const res = await api.post('/admin/certificates/generate-bulk', {
        company: bulkCompany || undefined,
        collegeId: bulkCollegeId || undefined,
        department: bulkDepartment || undefined,
        year: bulkYear || undefined,
        templateId: bulkTemplateId || undefined,
        regenerate: bulkRegenerate
      });

      if (!res.data.success) {
        setToast({ message: res.data?.message || 'Failed to start generation', type: 'error' });
        setBulkSubmitting(false);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed bulk certificate generation request', type: 'error' });
      setBulkSubmitting(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  // Dynamic Target Calculation
  const filteredStudents = students.filter(st => {
    if (bulkCompany) {
      const normBulk = (bulkCompany || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const normStud = (st.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normBulk !== normStud && !normBulk.includes(normStud) && !normStud.includes(normBulk)) return false;
    }
    if (bulkCollegeId && String(st.collegeId?._id || st.collegeId) !== String(bulkCollegeId)) return false;
    if (bulkDepartment && st.department !== bulkDepartment) return false;
    if (bulkYear && st.year !== bulkYear) return false;
    return true;
  });
  const hasFilter = Boolean(bulkCompany || bulkCollegeId || bulkDepartment || bulkYear);
  const targetCount = hasFilter ? filteredStudents.length : (totalStudentsCount || students.length);

  return (
    <AppLayout title="Certificate Center">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modern Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Certificate Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate single or batch high-resolution Puppeteer PDF certificates</p>
        </div>
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold self-start sm:self-auto">
          <span className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-red-600" />
            <span>1. Generate Certificates</span>
          </span>
          <Link
            to="/admin/certificates"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>2. View & Download Issued →</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Student Certificate Generation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Single Student Certificate</h3>
                <p className="text-[11px] text-slate-500">Render certificate instantly for an individual student</p>
              </div>
            </div>

            <form onSubmit={handleSingleGenerate} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Enrolled Student *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-amber-600 focus:ring-3 focus:ring-amber-500/10 transition-all shadow-2xs"
                  required
                >
                  <option value="">-- Choose student ({students.length} available) --</option>
                  {students.map(st => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.studentId}) • {st.company || 'No Company'} • {st.department || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="singleRegen"
                  checked={singleRegenerate}
                  onChange={(e) => setSingleRegenerate(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="singleRegen" className="text-xs text-slate-600 cursor-pointer select-none">
                  Regenerate if certificate already exists
                </label>
              </div>

              <button
                type="submit"
                disabled={!selectedStudentId || singleSubmitting}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50 cursor-pointer pt-2.5"
              >
                {singleSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Rendering PDF (~1 to 2 sec)...</span>
                  </div>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Generate Single Certificate (Puppeteer)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {singleResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-4">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{singleResult.message}</span>
              </div>
              {singleResult.certificate && (
                <div className="text-slate-600 pt-1 border-t border-slate-200/60">
                  <p>Certificate ID: <strong className="text-slate-900 font-mono">{singleResult.certificate.certificateId}</strong></p>
                  <a
                    href={getAssetUrl(singleResult.certificate.filePath)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-bold mt-1.5 inline-flex items-center space-x-1"
                  >
                    <span>Open Generated PDF Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Certificate Generation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5 hover:border-slate-300 transition-colors">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bulk Certificate Generation</h3>
              <p className="text-[11px] text-slate-500">Generate certificates in batch filtered by company, college, or stream</p>
            </div>
          </div>

          <form onSubmit={handleBulkGenerate} className="space-y-4">
            {/* SUB-COMPANY FILTER (DYNAMIC COUNT) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Filter by Sub-Company
              </label>
              <select
                value={bulkCompany}
                onChange={(e) => setBulkCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 font-medium transition-all shadow-2xs"
              >
                <option value="">
                  {totalStudentsCount > 0
                    ? `-- All Sub-Companies (${totalStudentsCount} Enrolled Students) --`
                    : '-- All Sub-Companies --'}
                </option>
                {companies.map(c => {
                  const count = students.filter(s => s.company === c.name).length;
                  return (
                    <option key={c._id} value={c.name}>
                      {c.name} {count > 0 ? `(${count} students)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target College
              </label>
              <select
                value={bulkCollegeId}
                onChange={(e) => setBulkCollegeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all shadow-2xs"
              >
                <option value="">All Colleges ({colleges.length} registered)</option>
                {colleges.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                <select
                  value={bulkDepartment}
                  onChange={(e) => setBulkDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all shadow-2xs"
                >
                  <option value="">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Year</label>
                <select
                  value={bulkYear}
                  onChange={(e) => setBulkYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all shadow-2xs"
                >
                  <option value="">All Years</option>
                  <option value="I">I Year</option>
                  <option value="II">II Year</option>
                  <option value="III">III Year</option>
                  <option value="IV">IV Year</option>
                </select>
              </div>
            </div>

            {/* Dynamic Target Count & Engine Notice (No Hardcoded 150) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">⚡ Target Batch Scope:</span>
                <span className="text-[11px] text-slate-600">
                  Targeting <strong>{targetCount} {targetCount === 1 ? 'student' : 'students'}</strong> based on current filters
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 font-mono text-[10px] font-bold shadow-2xs">
                Fast Puppeteer Engine
              </span>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="bulkRegen"
                checked={bulkRegenerate}
                onChange={(e) => setBulkRegenerate(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="bulkRegen" className="text-xs text-slate-600 cursor-pointer select-none">
                Regenerate for students who already have certificates
              </label>
            </div>

            {bulkSubmitting && (
              <div className="p-4 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 space-y-2.5 shadow-xs transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <span className="font-bold text-slate-900">
                      {bulkProgress?.total
                        ? `Generating: ${bulkProgress.current} of ${bulkProgress.total}`
                        : 'Starting generation engine...'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-blue-800 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-xs">
                    {bulkProgress?.percent || 0}%
                  </span>
                </div>

                {/* Animated Dynamic Progress Bar */}
                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
                    style={{ width: `${Math.max(bulkProgress?.percent || 0, 3)}%` }}
                  ></div>
                </div>

                {/* Live student being generated */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                  <span className="truncate max-w-[250px]">
                    ⚡ Processing: <strong className="text-slate-800">{bulkProgress?.currentStudent || 'Preparing...'}</strong>
                  </span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-emerald-700 font-bold">✓ {bulkProgress?.successCount || 0}</span>
                    {bulkProgress?.skippedCount > 0 && (
                      <span className="text-amber-700 font-medium">↷ {bulkProgress.skippedCount}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={bulkSubmitting || targetCount === 0}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50 cursor-pointer"
            >
              {bulkSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {bulkProgress?.total
                      ? `Generating (${bulkProgress.current} of ${bulkProgress.total})...`
                      : `Starting Batch (${bulkCompany || 'All Companies'})...`}
                  </span>
                </div>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Generate Batch Certificates ({targetCount} Students)</span>
                </>
              )}
            </button>
          </form>

          {bulkResult && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Bulk Generation Summary:</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 block text-[11px]">Total</span>
                  <strong className="text-slate-800">{bulkResult.totalTargeted}</strong>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="block text-[11px]">Generated</span>
                  <strong>{bulkResult.successCount}</strong>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                  <span className="block text-[11px]">Skipped</span>
                  <strong>{bulkResult.skippedCount}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminCertificateGenerate;
