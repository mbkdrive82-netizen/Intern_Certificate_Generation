import React, { useState, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  FileCheck,
  Sparkles,
  FileUp,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [createMissingColleges, setCreateMissingColleges] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  const handleDownloadSample = async () => {
    try {
      setDownloadingSample(true);
      const res = await api.get('/admin/students/sample-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_students.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ message: 'Sample Excel template downloaded!', type: 'success' });
    } catch (err) {
      window.open('/sample_students.xlsx', '_blank');
      setToast({ message: 'Sample Excel downloaded', type: 'success' });
    } finally {
      setDownloadingSample(false);
    }
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setToast({
        message: 'Invalid file format. Please upload an Excel file (.xlsx or .xls)',
        type: 'error'
      });
      setFile(null);
      return;
    }
    setFile(selected);
    setResult(null);
    setToast({
      message: `Selected: ${selected.name} (${(selected.size / 1024).toFixed(1)} KB)`,
      type: 'success'
    });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    validateAndSetFile(selected);
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setToast({ message: 'Please select or drop an Excel file to upload', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('createMissingColleges', createMissingColleges);

    try {
      setUploading(true);
      const res = await api.post('/admin/students/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setResult(res.data.result);
        setToast({ message: 'Excel import completed successfully!', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to process Excel file', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout title="Excel Upload">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto space-y-4 pb-16">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Batch Student Excel Import
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload candidate spreadsheets to automatically create student accounts and credentials.
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            disabled={downloadingSample}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>{downloadingSample ? 'Preparing...' : 'Download Sample (.xlsx)'}</span>
          </button>
        </div>

        {/* Required Format Specification Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Required Excel Format Specifications</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500">First row headers must match exactly as shown below</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl overflow-x-auto border border-slate-200 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-blue-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="pb-1.5">Name</th>
                  <th className="pb-1.5">College</th>
                  <th className="pb-1.5">Department</th>
                  <th className="pb-1.5">Year</th>
                  <th className="pb-1.5">Company</th>
                  <th className="pb-1.5">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600 font-medium text-xs">
                <tr>
                  <td className="py-1.5 font-bold text-slate-900">Arasu M</td>
                  <td className="py-1.5">Paavai Engineering College</td>
                  <td className="py-1.5">ECE</td>
                  <td className="py-1.5">IV</td>
                  <td className="py-1.5 text-purple-700 font-bold">MBK</td>
                  <td className="py-1.5">IoT Application (ESP32)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Form Card with Real Drag and Drop */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <form onSubmit={handleUpload} className="space-y-3.5">
            {/* Native Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/60 ring-4 ring-blue-500/20 scale-[1.01]'
                  : file
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>File Selected Successfully</span>
                    </span>
                    <p className="text-sm font-black text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB • Click "Process & Import Students" below to proceed
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-lg transition-colors shadow-2xs mt-1 cursor-pointer"
                  >
                    <span>Change File</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-transform ${
                      isDragging ? 'bg-blue-600 text-white scale-110 animate-bounce' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {isDragging ? 'Release to drop your Excel file here!' : 'Drag & Drop your Excel file here'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse from your computer</p>
                  </div>
                  <span className="inline-block text-[11px] text-slate-400 font-medium">
                    Supports Microsoft Excel (.xlsx, .xls) up to 10MB
                  </span>
                </div>
              )}
            </div>

            {/* Auto-create missing colleges toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Auto-create Missing Colleges</span>
                <span className="text-[11px] text-slate-500">
                  Automatically register new colleges and codes encountered in the Excel sheet.
                </span>
              </div>
              <input
                type="checkbox"
                checked={createMissingColleges}
                onChange={(e) => setCreateMissingColleges(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Upload CTA Button */}
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing & Importing Students...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Process & Import Students</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Upload Summary Result */}
        {result && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Excel Import Summary</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin/credentials"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <span>Export Credentials</span>
                </Link>
                <Link
                  to="/admin/generate-certificates"
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Certificates</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 font-bold block uppercase">Total Rows</span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">{result.totalRows}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-700 font-bold block uppercase">Successful</span>
                <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{result.successful}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] text-amber-700 font-bold block uppercase">Duplicates</span>
                <span className="text-2xl font-black text-amber-700 mt-0.5 block">{result.duplicates}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
                <span className="text-[11px] text-red-700 font-bold block uppercase">Failed</span>
                <span className="text-2xl font-black text-red-700 mt-0.5 block">{result.failed}</span>
              </div>
            </div>

            {/* Failed Rows Detail */}
            {result.failedRows && result.failedRows.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-red-700 mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Import Warnings / Issues ({result.failedRows.length})</span>
                </h4>
                <div className="max-h-48 overflow-y-auto border border-red-200 rounded-xl bg-red-50/50 p-2 text-xs space-y-1">
                  {result.failedRows.map((fr, idx) => (
                    <div key={idx} className="p-2 rounded bg-white border border-red-100 flex items-start space-x-2">
                      <span className="font-bold text-red-800 font-mono text-[11px]">Row {fr.rowNumber}:</span>
                      <span className="text-slate-800 font-medium">{fr.studentName} —</span>
                      <span className="text-red-700 text-[11px]">{fr.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminExcelUpload;
