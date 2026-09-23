import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-10 h-10 border-3'
  }[size] || 'w-8 h-8 border-3';

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 select-none">
      {/* Crisp Professional Circular Spinner */}
      <div 
        className={`${sizeClasses} border-slate-200 border-t-blue-600 rounded-full animate-spin`}
        style={{ animationDuration: '0.75s' }}
      />
      
      {/* Clean, Subtle Label */}
      {message && (
        <p className="text-xs font-medium text-slate-500 tracking-normal">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[35vh] w-full">
      {content}
    </div>
  );
};

export default LoadingSpinner;
