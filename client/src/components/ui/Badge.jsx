import React from 'react';

const Badge = ({ status }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (status === 'GENERATED' || status === 'Active' || status === true) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (status === 'PENDING' || status === 'Pending') {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'FAILED' || status === 'Inactive' || status === false) {
    style = 'bg-red-50 text-red-700 border-red-200';
  }

  const label = typeof status === 'boolean' ? (status ? 'Active' : 'Inactive') : status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {label}
    </span>
  );
};

export default Badge;
