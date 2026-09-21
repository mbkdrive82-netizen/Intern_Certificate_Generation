import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtext }) => {
  const colorMap = {
    blue: 'border-l-4 border-l-blue-600 text-blue-600 bg-blue-50/50',
    indigo: 'border-l-4 border-l-indigo-600 text-indigo-600 bg-indigo-50/50',
    amber: 'border-l-4 border-l-amber-500 text-amber-600 bg-amber-50/50',
    emerald: 'border-l-4 border-l-emerald-600 text-emerald-600 bg-emerald-50/50',
    sky: 'border-l-4 border-l-sky-600 text-sky-600 bg-sky-50/50',
    purple: 'border-l-4 border-l-purple-600 text-purple-600 bg-purple-50/50',
    rose: 'border-l-4 border-l-rose-600 text-rose-600 bg-rose-50/50'
  };

  const iconBgMap = {
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    sky: 'bg-sky-100 text-sky-700',
    purple: 'bg-purple-100 text-purple-700',
    rose: 'bg-rose-100 text-rose-700'
  };

  return (
    <div className={`p-3.5 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between ${colorMap[color]}`}>
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{value !== undefined ? value : '0'}</h3>
        {subtext && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtext}</p>}
      </div>
      {Icon && (
        <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${iconBgMap[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
