import React from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Settings, ShieldCheck, Database, Server } from 'lucide-react';

const AdminSettings = () => {
  return (
    <AppLayout title="System Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-slate-900 text-sm">System Environment & Specifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-sm flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Database Engine</span>
              </span>
              <p className="text-slate-600">Database Engine: <strong className="text-slate-900 font-bold">MongoDB + Mongoose ODM</strong></p>
              <p className="text-slate-600">Status: <strong className="text-emerald-700 font-bold">Connected & Operational</strong></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-sm flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-700" />
                <span>Certificate Generator</span>
              </span>
              <p className="text-slate-600">Renderer: <strong className="text-slate-900 font-bold">Puppeteer / Chromium Engine</strong></p>
              <p className="text-slate-600">Template Format: <strong className="text-blue-700 font-bold">HTML5 + CSS3 + SVG (A4 Landscape)</strong></p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
