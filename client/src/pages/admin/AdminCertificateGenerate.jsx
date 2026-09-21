import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { Award, Users, Building2, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCertificateGenerate = () => {
  const [colleges, setColleges] = useState([]);
  const [students, setStudents] = useState([]);
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
      const res = await api.get('/admin/students?limit=250');
      if (res.data.success) setStudents(res.data.students);
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
        // silent polling error
      }
    }, 350);
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
      currentStudent: 'Preparing generation engine...',
      successCount: 0,
      skippedCount: 0
    });

    // Start polling immediately
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

      if (res.data.success) {
        setBulkResult(res.data.result);
        setToast({
          message: `Bulk generation complete: ${res.data.result.successCount} generated, ${res.data.result.skippedCount} skipped!`,
          type: 'success'
        });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed bulk certificate generation', type: 'error' });
    } finally {
      // Fetch final progress snapshot
      try {
        const finalRes = await api.get('/admin/certificates/bulk-progress');
        if (finalRes.data?.progress && !finalRes.data.progress.inProgress) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setBulkSubmitting(false);
          setBulkProgress(finalRes.data.progress);
        }
      } catch (err) {}
    }
  };

  return (
    <AppLayout title="Certificate Center">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Simplified Top Tabs */}
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 pb-3">
        <span className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-xs">
          <Award className="w-4 h-4" />
          <span>1. Generate Certificates</span>
        </span>
        <Link
          to="/admin/certificates"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>2. View & Download Issued Certificates →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Student Certificate Generation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Single Student Certificate Generation</h3>
          </div>

          <form onSubmit={handleSingleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Student *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                required
              >
                <option value="">-- Select Enrolled Student --</option>
                {students.map(st => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.studentId}) — Company: {st.company} [{st.department}, {st.year} Year]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="singleRegen"
                checked={singleRegenerate}
                onChange={(e) => setSingleRegenerate(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <label htmlFor="singleRegen" className="text-xs text-slate-600 cursor-pointer">
                Regenerate if certificate already exists
              </label>
            </div>

            <button
              type="submit"
              disabled={!selectedStudentId || singleSubmitting}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50"
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

          {singleResult && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{singleResult.message}</span>
              </div>
              {singleResult.certificate && (
                <div className="text-slate-600">
                  <p>Certificate ID: <strong className="text-blue-700 font-mono">{singleResult.certificate.certificateId}</strong></p>
                  <a
                    href={`/${singleResult.certificate.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-bold mt-1 inline-block"
                  >
                    Open Generated PDF Certificate
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Certificate Generation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Bulk Certificate Generation</h3>
          </div>

          <form onSubmit={handleBulkGenerate} className="space-y-4">
            {/* SUB-COMPANY FILTER */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Filter by Sub-Company (MBK / SRITECH / VENTHULIR)
              </label>
              <select
                value={bulkCompany}
                onChange={(e) => setBulkCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-bold"
              >
                <option value="">-- All Sub-Companies (All 150 Students) --</option>
                {companies.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target College</label>
              <select
                value={bulkCollegeId}
                onChange={(e) => setBulkCollegeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
              >
                <option value="">All Colleges</option>
                {colleges.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                <select
                  value={bulkDepartment}
                  onChange={(e) => setBulkDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year</label>
                <select
                  value={bulkYear}
                  onChange={(e) => setBulkYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="">All Years</option>
                  <option value="I">I Year</option>
                  <option value="II">II Year</option>
                  <option value="III">III Year</option>
                  <option value="IV">IV Year</option>
                </select>
              </div>
            </div>

            {/* Estimated Speed Notice */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">⚡ Estimated Generation Speed:</span>
                <span className="text-[11px] text-blue-700">
                  {bulkCompany ? `~8 to 10 seconds for ${bulkCompany} (50 certificates)` : '~20 to 25 seconds for All Companies (150 certificates)'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                Fast Puppeteer Engine
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bulkRegen"
                checked={bulkRegenerate}
                onChange={(e) => setBulkRegenerate(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="bulkRegen" className="text-xs text-slate-600 cursor-pointer">
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
              disabled={bulkSubmitting}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50"
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
                  <span>Generate Batch Certificates (Puppeteer)</span>
                </>
              )}
            </button>
          </form>

          {bulkResult && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Bulk Generation Summary:</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-white border border-slate-200"><span className="text-slate-500 block">Total</span><strong className="text-slate-800">{bulkResult.totalTargeted}</strong></div>
                <div className="p-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="block">Generated</span><strong>{bulkResult.successCount}</strong></div>
                <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200"><span className="block">Skipped</span><strong>{bulkResult.skippedCount}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminCertificateGenerate;
