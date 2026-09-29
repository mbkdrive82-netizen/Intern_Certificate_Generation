import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';
import {
  Building2,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  FileText,
  ExternalLink,
  Award
} from 'lucide-react';

const TNSkillsCollegeDetail = () => {
  const { id: collegeId } = useParams();
  const [searchParams] = useSearchParams();
  const [college, setCollege] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') || '');
  const [selectedYear, setSelectedYear] = useState('');
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  // Preview Modal
  const [previewStudent, setPreviewStudent] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchCollegeDetails();
  }, [collegeId]);

  useEffect(() => {
    fetchStudents();
  }, [collegeId, selectedDept, selectedYear, search, page]);

  const fetchCollegeDetails = async () => {
    try {
      const res = await api.get(`/tnskills/colleges/${collegeId}`);
      if (res.data.success) {
        setCollege(res.data.college);
        setDepartments(res.data.college.departments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = `/tnskills/colleges/${collegeId}/students?page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      if (selectedDept) query += `&department=${encodeURIComponent(selectedDept)}`;
      if (selectedYear) query += `&year=${encodeURIComponent(selectedYear)}`;

      const res = await api.get(query);
      if (res.data.success) {
        setStudents(res.data.students);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (st) => {
    if (!st.certificateId && st.certificateStatus !== 'GENERATED') return;
    setPreviewStudent(st);
    setPreviewHtml('');
    try {
      setPreviewLoading(true);
      const res = await api.get(`/admin/certificates/${st.certificateId}/preview-html`);
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

  const handleDownloadPdf = (st) => {
    if (!st.certificateId) return;
    const filename = `${st.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${st.certificateId}.pdf`;
    const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api$/, '') : 'https://intern-certificate-generation.onrender.com';
    const downloadUrl = `${backendUrl}/api/admin/certificates/${st.certificateId}/download-pdf`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout title={college ? `${college.name} (${college.code})` : 'College Department View'}>
      {/* College Info & Department Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">{college?.name}</h3>
              <p className="text-xs text-blue-700 font-bold">{college?.totalStudents || 0} Total Enrolled Interns</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/tnskills/certificates"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Award className="w-4 h-4" />
              <span>View All Certificates</span>
            </Link>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Select Department to Filter Students
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedDept(''); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedDept === ''
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Departments ({college?.totalStudents || 0})
            </button>
            {departments.map((d) => (
              <button
                key={d.department}
                onClick={() => { setSelectedDept(d.department); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedDept === d.department
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.department} – {d.count} Students
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search student name or student ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={selectedYear}
          onChange={(e) => { setSelectedYear(e.target.value); setPage(1); }}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold focus:outline-none focus:border-blue-600"
        >
          <option value="">All Years</option>
          <option value="I">I Year</option>
          <option value="II">II Year</option>
          <option value="III">III Year</option>
          <option value="IV">IV Year</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department / Year</th>
                <th className="px-4 py-3">Course (Training)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Certificate Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-medium mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">{st.studentId}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{st.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{st.department}</span>
                      <span className="text-slate-500 ml-1.5">({st.year} Year)</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div className="font-semibold text-slate-800">{st.course}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{st.company}</div>
                    </td>
                    <td className="px-4 py-3">
                      {st.certificateStatus === 'GENERATED' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Issued</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {st.certificateStatus === 'GENERATED' || st.certificateId ? (
                        <div className="inline-flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenPreview(st)}
                            title="Preview Certificate"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer border border-blue-200/60"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(st)}
                            title="Download Certificate PDF"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors cursor-pointer border border-red-200/60"
                          >
                            <Download className="w-3.5 h-3.5 text-red-600" />
                            <span>PDF</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Generated</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    No student records found for selected filter
                  </td>
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

      {/* Certificate Preview Modal */}
      {previewStudent && (
        <Modal
          isOpen={!!previewStudent}
          onClose={() => {
            setPreviewStudent(null);
            setPreviewHtml('');
          }}
          title={`Certificate Preview: ${previewStudent.name} (${previewStudent.certificateId || 'Generated'})`}
          maxWidth="max-w-5xl"
        >
          <div className="space-y-4">
            <div className="w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300 min-h-[500px] flex items-center justify-center p-2 relative">
              {previewLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-medium mt-2">Loading certificate preview...</p>
                </div>
              ) : previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Certificate Preview"
                  className="w-full h-[580px] border-0 rounded-lg shadow-sm"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="text-slate-400 text-sm">No preview available</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">
                ID: {previewStudent.certificateId} • {previewStudent.studentId}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPdf(previewStudent)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewStudent(null);
                    setPreviewHtml('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
};

export default TNSkillsCollegeDetail;
