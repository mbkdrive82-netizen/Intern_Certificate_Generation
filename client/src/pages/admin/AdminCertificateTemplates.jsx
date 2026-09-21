import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { FileCheck, Plus, Image, Code } from 'lucide-react';

const AdminCertificateTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [smLogoFile, setSmLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/admin/certificate-templates');
      if (res.data.success) {
        setTemplates(res.data.templates);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!name) return;

    const formData = new FormData();
    formData.append('name', name);
    if (smLogoFile) formData.append('smLogoFile', smLogoFile);

    try {
      setSubmitting(true);
      const res = await api.post('/admin/certificate-templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setToast({ message: 'Certificate branding configuration saved', type: 'success' });
        setIsModalOpen(false);
        setName('');
        setSmLogoFile(null);
        fetchTemplates();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save configuration', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const placeholders = [
    '{{student_name}}',
    '{{student_id}}',
    '{{college_name}}',
    '{{department}}',
    '{{year}}',
    '{{company}}',
    '{{course}}',
    '{{sub_company_name}}',
    '{{certificate_id}}',
    '{{certificate_date}}'
  ];

  return (
    <AppLayout title="Programmatic Certificate Templates">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Code-Based HTML/CSS/SVG Certificate System</h3>
          <p className="text-xs text-slate-500">Rendered to print-ready A4 landscape PDF via Puppeteer Chromium with dynamic placeholders.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload SM GROUPS Logo</span>
        </button>
      </div>

      {/* Certificate Layout Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-2">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Certificate Layout Specification (No Date Overlay, Full Programmatic Vector Rendering)</span>
          </h4>
          <a
            href="/admin/companies"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 underline"
          >
            Manage SM GROUPS & Sub-Company Logos →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
            <strong className="text-amber-800 block mb-1">TOP-LEFT: Sub-Company Partner</strong>
            <p className="text-slate-600">Company Logo automatically resolved from the student's company assigned in Excel.</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-center">
            <strong className="text-blue-800 block mb-1">CENTER: Initiative Header</strong>
            <p className="text-slate-600">TN Skills Development Initiative in Collaboration with SM Groups</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-right">
            <strong className="text-emerald-800 block mb-1">TOP-RIGHT: SM GROUPS Master</strong>
            <p className="text-slate-600">Official SM GROUPS Logo configured via Organization Settings.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {placeholders.map((ph) => (
            <span key={ph} className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-blue-800">
              {ph}
            </span>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div key={tpl._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {tpl.isActive ? 'Active Engine' : 'Inactive'}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>Generation Engine: <strong className="text-slate-800 font-semibold">Puppeteer + Chromium (A4 Landscape)</strong></p>
              <p>Template Files: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-800 font-mono">certificateTemplate.html / .css</code></p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Logo Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload SM GROUPS Logo">
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Configuration Label *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2026 Executive Logo Configuration"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SM GROUPS Logo Image (.png / .jpg)</label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setSmLogoFile(e.target.files[0])}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
            >
              {submitting ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default AdminCertificateTemplates;
