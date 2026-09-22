import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtext, trend }) => {
  const colorStyles = {
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600 ring-4 ring-blue-50/50',
      accentGlow: 'hover:shadow-blue-500/5',
      badge: 'bg-blue-50 text-blue-700'
    },
    emerald: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50',
      accentGlow: 'hover:shadow-emerald-500/5',
      badge: 'bg-emerald-50 text-emerald-700'
    },
    amber: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600 ring-4 ring-amber-50/50',
      accentGlow: 'hover:shadow-amber-500/5',
      badge: 'bg-amber-50 text-amber-700'
    },
    purple: {
      border: 'border-purple-100 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600 ring-4 ring-purple-50/50',
      accentGlow: 'hover:shadow-purple-500/5',
      badge: 'bg-purple-50 text-purple-700'
    },
    sky: {
      border: 'border-sky-100 hover:border-sky-300',
      iconBg: 'bg-sky-50 text-sky-600 ring-4 ring-sky-50/50',
      accentGlow: 'hover:shadow-sky-500/5',
      badge: 'bg-sky-50 text-sky-700'
    },
    rose: {
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600 ring-4 ring-rose-50/50',
      accentGlow: 'hover:shadow-rose-500/5',
      badge: 'bg-rose-50 text-rose-700'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`relative bg-white border ${style.border} rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.accentGlow} flex flex-col justify-between overflow-hidden group`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
        </div>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${style.iconBg}`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="mt-1">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value !== undefined ? value : '0'}
        </h3>
        {subtext && (
          <p className="text-[11px] font-medium text-slate-400 mt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
