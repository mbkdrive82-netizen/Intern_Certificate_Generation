import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur transition-all duration-200 animate-slide-up ${
      isSuccess
        ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
        : 'bg-red-950/90 text-red-200 border-red-500/40'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:opacity-75">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
