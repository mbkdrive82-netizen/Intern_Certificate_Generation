import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { Briefcase, Plus, Image, Upload, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [smLogoPath, setSmLogoPath] = useState('');
  const [smLogoFile, setSmLogoFile] = useState(null);
  const [savingSmLogo, setSavingSmLogo] = useState(false);

  // Add Company Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Company Logo Modal
  const [editCompany, setEditCompany] = useState(null);
  const [updateLogoFile, setUpdateLogoFile] = useState(null);
  const [updatingLogo, setUpdatingLogo] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchSmLogo();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSmLogo = async () => {
    try {
      const res = await api.get('/admin/sm-logo');
      if (res.data.success && res.data.smLogoPath) {
        setSmLogoPath(res.data.smLogoPath);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSmLogo = async (e) => {
    e.preventDefault();
    if (!smLogoFile) {
      setToast({ message: 'Please select an image file for SM GROUPS logo', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('smLogo', smLogoFile);

    try {
      setSavingSmLogo(true);
      const res = await api.post('/admin/sm-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSmLogoPath(res.data.smLogoPath);
        setSmLogoFile(null);
        setToast({ message: 'SM GROUPS Master Logo updated successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to upload SM GROUPS logo', type: 'error' });
    } finally {
      setSavingSmLogo(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!name) return;

    const formData = new FormData();
    formData.append('name', name);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setToast({ message: 'Sub-Company created successfully', type: 'success' });
        setIsAddModalOpen(false);
        setName('');
        setLogoFile(null);
        fetchCompanies();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create company', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCompanyLogo = async (e) => {
    e.preventDefault();
    if (!editCompany || !updateLogoFile) {
      setToast({ message: 'Please select a logo image', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('logo', updateLogoFile);

    try {
      setUpdatingLogo(true);
      const res = await api.put(`/admin/companies/${editCompany._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setToast({ message: `Logo updated for ${editCompany.name}!`, type: 'success' });
        setEditCompany(null);
        setUpdateLogoFile(null);
        fetchCompanies();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update company logo', type: 'error' });
    } finally {
      setUpdatingLogo(false);
    }
  };

  return (
    <AppLayout title="Organization & Sub-Company Management">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="space-y-6">
        {/* SECTION 1: MASTER COMPANY - SM GROUPS FIXED LOGO */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Main Company: THE SM GROUPS</h3>
                <p className="text-xs text-slate-500">Fixed Master Logo — Rendered automatically at the <strong className="text-blue-700 font-bold">TOP-RIGHT</strong> of all certificates.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Permanent Master Logo (Fixed)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Current Fixed Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center h-36">
              <img
                src="/assets/sm_groups_logo.png"
                alt="SM Groups Master Logo"
                className="max-h-24 max-w-full object-contain"
              />
            </div>

            {/* Information Notice */}
            <div className="md:col-span-2 space-y-2">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  <span>SM GROUPS Logo is Permanently Fixed</span>
                </p>
                <p className="text-blue-800">
                  This official logo is set as the permanent master logo for all certificates (Top-Right position). You do <strong>not</strong> need to upload it again.
                </p>
                <p className="text-blue-700 font-medium">
                  👉 You only need to register and upload the <strong>Sub-Company Logo</strong> for each partner organization below!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SUB COMPANIES */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Sub-Company Partners</h3>
              <p className="text-xs text-slate-500">Rendered at the <strong className="text-amber-700 font-bold">TOP-LEFT</strong> of certificates according to the student's assigned company in Excel.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sub-Company</span>
            </button>
          </div>

          {companies.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm text-slate-600">No sub-companies registered yet</p>
              <p className="text-xs text-slate-400 mt-1">
                You can add sub-companies manually here, or upload students via Excel (companies are automatically detected).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {companies.map((comp) => (
                <div key={comp._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {comp.logoPath ? (
                        <img src={`/${comp.logoPath}`} alt={comp.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={comp.name}>{comp.name}</h4>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        comp.logoPath ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {comp.logoPath ? 'Logo Configured' : 'No Logo Uploaded'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Position: Top-Left</span>
                    <button
                      onClick={() => {
                        setEditCompany(comp);
                        setUpdateLogoFile(null);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>{comp.logoPath ? 'Change Logo' : 'Upload Logo'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD SUB-COMPANY */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Sub-Company Partner">
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TechCorp Solutions"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Must match the company name specified in the Excel sheet.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Logo (.png / .jpg)</label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
            />
            <p className="text-[11px] text-slate-400 mt-1">Appears at TOP-LEFT on certificates.</p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
            >
              {submitting ? 'Saving...' : 'Add Sub-Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE EXISTING COMPANY LOGO */}
      <Modal isOpen={!!editCompany} onClose={() => setEditCompany(null)} title={`Upload Logo - ${editCompany?.name}`}>
        <form onSubmit={handleUpdateCompanyLogo} className="space-y-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">
              Select the official logo for <strong className="text-slate-900">{editCompany?.name}</strong>. This logo will automatically appear on the Top-Left of certificates for students enrolled under this company.
            </p>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Logo File (.png / .jpg) *</label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setUpdateLogoFile(e.target.files[0])}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditCompany(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingLogo || !updateLogoFile}
              className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {updatingLogo ? 'Uploading...' : 'Save Company Logo'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default AdminCompanies;
