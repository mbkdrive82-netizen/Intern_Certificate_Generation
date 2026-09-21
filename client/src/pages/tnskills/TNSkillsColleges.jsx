import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../services/api';
import { Building2, ChevronRight, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const TNSkillsColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tnskills/colleges');
      if (res.data.success) {
        setColleges(res.data.colleges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="All Colleges Directory">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          colleges.map((col) => (
            <div key={col._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  {col.code}
                </span>
                <span className="text-xs text-slate-500 font-bold">{col.studentCount || 0} Students</span>
              </div>

              <h4 className="font-bold text-slate-900 text-base leading-tight">{col.name}</h4>

              <div className="flex items-center space-x-4 text-xs text-slate-600">
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{col.studentCount || 0} Enrolled</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{col.certCount || 0} Certificates</span>
                </span>
              </div>

              <Link
                to={`/tnskills/colleges/${col._id}`}
                className="w-full py-2 flex items-center justify-center space-x-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Select College & View Departments</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default TNSkillsColleges;
