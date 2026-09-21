import React, { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Toast from '../../components/ui/Toast';
import api from '../../services/api';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [createMissingColleges, setCreateMissingColleges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

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
      // Fallback direct static download
      window.open('/sample_students.xlsx', '_blank');
      setToast({ message: 'Sample Excel downloaded', type: 'success' });
    } finally {
      setDownloadingSample(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        setToast({ message: 'Invalid file format. Please select an Excel file (.xlsx or .xls)', type: 'error' });
        setFile(null);
        return;
      }
      setFile(selected);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setToast({ message: 'Please select an Excel file to upload', type: 'error' });
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
    <AppLayout title="Student Excel Upload">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Format Instruction Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-850 text-sm">Required Excel Format Specifications</h3>
                <p className="text-[11px] text-slate-500">First row must contain exact column headers shown below</p>
              </div>
            </div>
            <button
              onClick={handleDownloadSample}
              disabled={downloadingSample}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{downloadingSample ? 'Preparing Download...' : 'Download Sample Excel Template (.xlsx)'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Upload student records in <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">.xlsx</code> or <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">.xls</code>. Columns must be:
          </p>

          <div className="bg-slate-50 p-3 rounded-lg overflow-x-auto border border-slate-200 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-blue-700 font-bold border-b border-slate-200">
                  <th className="pb-1.5">Name</th>
                  <th className="pb-1.5">College</th>
                  <th className="pb-1.5">Department</th>
                  <th className="pb-1.5">Year</th>
                  <th className="pb-1.5">Company</th>
                  <th className="pb-1.5">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600">
                <tr>
                  <td className="py-1.5 font-medium">Arun Kumar</td>
                  <td className="py-1.5">ABC Engineering College</td>
                  <td className="py-1.5">CSE</td>
                  <td className="py-1.5">III</td>
                  <td className="py-1.5">TechCorp Solutions</td>
                  <td className="py-1.5">Full Stack Development</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-8 text-center bg-slate-50/50 transition-colors">
              <Upload className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Click to select or drag your Excel file here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports .xlsx and .xls (Max 10MB)</p>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="excelUploadInput"
              />
              <label
                htmlFor="excelUploadInput"
                className="mt-3 inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg cursor-pointer text-xs transition-colors"
              >
                <span>Browse Local File</span>
              </label>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Auto-create Missing Colleges</span>
                <span className="text-[11px] text-slate-500">If checked, missing colleges encountered in Excel rows will be automatically added to the system.</span>
              </div>
              <input
                type="checkbox"
                checked={createMissingColleges}
                onChange={(e) => setCreateMissingColleges(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Excel Import Summary</h3>
              <Link
                to="/admin/credentials"
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
              >
                <span>Export Credentials</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Total Rows</span>
                <span className="text-xl font-black text-slate-800">{result.totalRows}</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-700 font-bold block">Successful</span>
                <span className="text-xl font-black text-emerald-700">{result.successful}</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <span className="text-xs text-amber-700 font-bold block">Duplicates</span>
                <span className="text-xl font-black text-amber-700">{result.duplicates}</span>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
                <span className="text-xs text-red-700 font-bold block">Failed</span>
                <span className="text-xl font-black text-red-700">{result.failed}</span>
              </div>
            </div>

            {/* Failed Rows Detail */}
            {result.failedRows && result.failedRows.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-red-700 text-xs flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Failed Rows Breakdown</span>
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {result.failedRows.map((f, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-1.5 font-mono text-slate-500">Row {f.rowNumber}</td>
                          <td className="px-3 py-1.5 font-bold">{f.studentName}</td>
                          <td className="px-3 py-1.5 text-red-600">{f.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
