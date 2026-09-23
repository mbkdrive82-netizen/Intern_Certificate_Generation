import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { User, ShieldCheck, Mail, Building2, BookOpen, Briefcase } from 'lucide-react';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/profile');
      if (res.data.success) {
        setStudent(res.data.student);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Profile">
        <LoadingSpinner message="Loading Profile..." subtitle="Student Portal" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Student Profile">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 font-black text-xl flex items-center justify-center border border-blue-200">
            {student?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{student?.name}</h3>
            <p className="text-xs font-mono text-blue-700 font-bold">Student ID: {student?.studentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">College</span>
            <span className="font-bold text-slate-800">{student?.collegeId?.name}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Department</span>
            <span className="font-bold text-amber-700">{student?.department}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Academic Year</span>
            <span className="font-bold text-slate-800">{student?.year} Year</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Company Partner</span>
            <span className="font-bold text-blue-800">{student?.company}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Enrolled Technical Course</span>
            <span className="font-bold text-slate-900 text-sm">{student?.course}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentProfile;
