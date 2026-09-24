import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { getAssetUrl } from '../../utils/imageUrl';
import { Briefcase, Plus, Image, Upload, CheckCircle2, AlertCircle, ShieldCheck, Trash2, X } from 'lucide-react';
import { getCachedData, setCachedData } from '../../utils/dataCache';

const AdminCompanies = () => {
  const cachedCompanies = getCachedData('admin_companies_list');
  const cachedSmLogo = getCachedData('admin_sm_logo');

  const [companies, setCompanies] = useState(cachedCompanies || []);
  const [smLogoPath, setSmLogoPath] = useState(cachedSmLogo || '');
  const [smLogoFile, setSmLogoFile] = useState(null);
  const [savingSmLogo, setSavingSmLogo] = useState(false);
  const [loading, setLoading] = useState(!cachedCompanies || cachedCompanies.length === 0);


  // Edit Company Logo Modal
  const [editCompany, setEditCompany] = useState(null);
  const [updateLogoFile, setUpdateLogoFile] = useState(null);
  const [updatingLogo, setUpdatingLogo] = useState(false);

  // Edit Company Certificate Background Modal
  const [editCompanyBg, setEditCompanyBg] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [updatingBg, setUpdatingBg] = useState(false);
  const [deletingBg, setDeletingBg] = useState(false);

  // Add Company Modal fields
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [addBgFile, setAddBgFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchSmLogo();
  }, []);

  const fetchCompanies = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/admin/companies');
      if (res.data.success) {
        setCompanies(res.data.companies || []);
        setCachedData('admin_companies_list', res.data.companies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmLogo = async () => {
    try {
      const res = await api.get('/admin/sm-logo');
      if (res.data.success && res.data.smLogoPath) {
        setSmLogoPath(res.data.smLogoPath);
        setCachedData('admin_sm_logo', res.data.smLogoPath);
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
    if (addBgFile) {
      formData.append('bgImage', addBgFile);
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setToast({ message: res.data.message || 'Sub-Company saved successfully', type: 'success' });
        setIsAddModalOpen(false);
        setName('');
        setLogoFile(null);
        setAddBgFile(null);
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

  const handleUpdateCompanyBg = async (e) => {
    e.preventDefault();
    if (!editCompanyBg || !bgFile) {
      setToast({ message: 'Please select a certificate background image', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('bgImage', bgFile);

    try {
      setUpdatingBg(true);
      const res = await api.put(`/admin/companies/${editCompanyBg._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setToast({ message: `Certificate background updated for ${editCompanyBg.name}!`, type: 'success' });
        setEditCompanyBg(null);
        setBgFile(null);
        fetchCompanies();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update background image', type: 'error' });
    } finally {
      setUpdatingBg(false);
    }
  };

  const handleDeleteBgImage = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to remove the custom background for ${companyName}? It will revert to the default official template.`)) {
      return;
    }

    try {
      setDeletingBg(true);
      const res = await api.delete(`/admin/companies/${companyId}/bg-image`);
      if (res.data.success) {
        setToast({ message: `Custom background removed for ${companyName}!`, type: 'success' });
        if (editCompanyBg && editCompanyBg._id === companyId) {
          setEditCompanyBg(null);
        }
        fetchCompanies();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to remove background', type: 'error' });
    } finally {
      setDeletingBg(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/admin/companies/${deleteTarget._id}`);
      if (res.data.success) {
        setToast({ message: res.data.message || `Sub-Company deleted successfully`, type: 'success' });
        setDeleteTarget(null);
        fetchCompanies();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete sub-company', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteLogo = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to remove the logo for ${companyName}?`)) {
      return;
    }

    try {
      setDeletingLogo(true);
      const res = await api.delete(`/admin/companies/${companyId}/logo`);
      if (res.data.success) {
        setToast({ message: `Logo removed for ${companyName}!`, type: 'success' });
        if (editCompany && editCompany._id === companyId) {
          setEditCompany(null);
        }
        fetchCompanies();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to remove logo', type: 'error' });
    } finally {
      setDeletingLogo(false);
    }
  };

  return (
    <AppLayout title="Organization & Sub-Company Management" onRefresh={() => fetchCompanies(false)}>
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
                  <span>Official Certificate Framework</span>
                </p>
                <p className="text-blue-800">
                  SM GROUPS is the permanent master organization on Top-Right. TNSkill is on Top-Center.
                </p>
                <p className="text-blue-700 font-medium">
                  👉 For each sub-company partner below, you can configure their <strong>Logo</strong> (Top-Left) and optionally upload their own <strong>Custom Certificate Background Image</strong>!
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
              <p className="text-xs text-slate-500">Configure logo and custom certificate background for each partner company.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs text-xs self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sub-Company</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-slate-500 font-bold">Loading sub-companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm text-slate-600">No sub-companies registered yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Add sub-companies manually here, or upload students via Excel (companies are automatically created).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {companies.map((comp) => (
                <div key={comp._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {comp.logoPath ? (
                        <img src={getAssetUrl(comp.logoPath)} alt={comp.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={comp.name}>{comp.name}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.logoPath ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {comp.logoPath ? 'Logo Set' : 'No Logo'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.bgImagePath ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}>
                          {comp.bgImagePath ? 'Custom Background' : 'Default Background'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Background Full Preview (100% uncropped aspect ratio) */}
                  {comp.bgImagePath && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-[297/210] relative group flex items-center justify-center p-1 shadow-2xs">
                      <img src={getAssetUrl(comp.bgImagePath)} alt="Certificate Background" className="w-full h-full object-contain rounded-lg" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-xs">
                        <span className="text-white text-[11px] font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg">Full Certificate Background</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditCompany(comp);
                          setUpdateLogoFile(null);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Upload or Change Logo"
                      >
                        <Upload className="w-3 h-3 text-slate-500" />
                        <span>Logo</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditCompanyBg(comp);
                          setBgFile(null);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Upload Custom Certificate Background"
                      >
                        <Image className="w-3 h-3 text-blue-600" />
                        <span>Background</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(comp)}
                      title="Delete Sub-Company"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Custom Certificate Background Image (.png / .jpg) - Optional</label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setAddBgFile(e.target.files[0])}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
            />
            <p className="text-[11px] text-slate-400 mt-1">Leave empty to use the official corporate default certificate background.</p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add Sub-Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE COMPANY LOGO */}
      <Modal isOpen={!!editCompany} onClose={() => setEditCompany(null)} title={`Upload Logo - ${editCompany?.name}`}>
        <form onSubmit={handleUpdateCompanyLogo} className="space-y-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">
              Select the official logo for <strong className="text-slate-900">{editCompany?.name}</strong>. Appears on Top-Left of certificates.
            </p>

            {editCompany?.logoPath && (
              <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={getAssetUrl(editCompany.logoPath)} alt={editCompany.name} className="h-10 w-10 object-contain" />
                  <span className="text-xs text-slate-600 font-medium">Current Logo</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLogo(editCompany._id, editCompany.name)}
                  disabled={deletingLogo}
                  className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{deletingLogo ? 'Removing...' : 'Remove Logo'}</span>
                </button>
              </div>
            )}

            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select New Logo File (.png / .jpg) *</label>
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

      {/* MODAL: UPDATE COMPANY CERTIFICATE BACKGROUND IMAGE */}
      <Modal isOpen={!!editCompanyBg} onClose={() => setEditCompanyBg(null)} title={`Certificate Background - ${editCompanyBg?.name}`}>
        <form onSubmit={handleUpdateCompanyBg} className="space-y-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">
              Upload a custom certificate background image template for <strong className="text-slate-900">{editCompanyBg?.name}</strong>. Certificates generated for students under this company will use this background.
            </p>

            {editCompanyBg?.bgImagePath && (
              <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Active Custom Background</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBgImage(editCompanyBg._id, editCompanyBg.name)}
                    disabled={deletingBg}
                    className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-bold px-2 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{deletingBg ? 'Resetting...' : 'Reset to Official Default'}</span>
                  </button>
                </div>
                <div className="aspect-[297/210] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-1 flex items-center justify-center shadow-2xs">
                  <img src={getAssetUrl(editCompanyBg.bgImagePath)} alt="Background Preview" className="w-full h-full object-contain rounded-lg" />
                </div>
              </div>
            )}

            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Background Image File (.png / .jpg) *</label>
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              onChange={(e) => setBgFile(e.target.files[0])}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Recommended: A4 landscape (e.g. 1920x1080 or standard certificate proportions).</p>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditCompanyBg(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatingBg || !bgFile}
              className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {updatingBg ? 'Saving...' : 'Upload Background Image'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM DELETE COMPANY */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete Sub-Company">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            This will permanently remove this partner company from the system.
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteCompany}
              disabled={deleting}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete Company'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
export default AdminCompanies;
