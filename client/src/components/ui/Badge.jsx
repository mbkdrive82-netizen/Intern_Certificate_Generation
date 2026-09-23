import React from 'react';

const Badge = ({ status, text }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = text || status;

  if (status === 'GENERATED' || status === 'ISSUED' || status === 'Issued' || status === 'Active' || status === true) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (!text && (status === 'GENERATED' || status === 'ISSUED' || status === 'Issued')) {
      label = 'ISSUED';
    }
  } else if (status === 'PENDING' || status === 'Pending') {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (status === 'FAILED' || status === 'Inactive' || status === false) {
    style = 'bg-red-50 text-red-700 border-red-200';
  }

  if (typeof status === 'boolean') {
    label = status ? 'Active' : 'Inactive';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {label}
    </span>
  );
};

export default Badge;
