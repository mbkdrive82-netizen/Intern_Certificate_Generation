import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading, please wait...', 
  subtitle = 'SM Groups Enterprise Portal', 
  fullScreen = false,
  size = 'md'
}) => {
  const isSmall = size === 'sm';

  const content = (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      {/* Outer Glow & Orbital Animation */}
      <div className={`relative flex items-center justify-center ${isSmall ? 'w-12 h-12' : 'w-20 h-20'} mb-4`}>
        {/* Ambient Blur Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 opacity-25 blur-xl animate-pulse" />
        
        {/* Outer Rotating Dashed/Gradient Ring */}
        <div 
          className={`absolute inset-0 rounded-2xl border-2 border-transparent border-t-indigo-600 border-r-blue-500 border-b-cyan-400 animate-spin`}
          style={{ animationDuration: '1.4s' }}
        />
        
        {/* Inner Counter-Rotating Subtle Ring */}
        <div 
          className="absolute inset-1.5 rounded-xl border border-dashed border-indigo-200/60 dark:border-indigo-800/40 animate-spin"
          style={{ animationDuration: '3s', animationDirection: 'reverse' }}
        />

        {/* Center Glass Card with Logo */}
        <div className={`relative ${isSmall ? 'w-8 h-8' : 'w-11 h-11'} rounded-xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-2 z-10 transition-transform`}>
          <img
            src="/favicon.png"
            alt="SM Groups"
            className="w-full h-full object-contain animate-pulse"
            onError={(e) => {
              // Fallback to stylized SVG icon if favicon fails
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector('.fallback-icon')) {
                const icon = document.createElement('div');
                icon.className = 'fallback-icon w-3 h-3 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500';
                parent.appendChild(icon);
              }
            }}
          />
        </div>
      </div>

      {/* Typography & Staggered Dots */}
      <div className="text-center space-y-1.5 flex flex-col items-center">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
            {message}
          </span>
          {/* 3 Animated Pulsing Dots */}
          <span className="inline-flex space-x-1 items-center ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>

        {subtitle && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {subtitle}
          </p>
        )}

        {/* Sleek Minimalist Progress Bar Indicator */}
        <div className="w-28 h-1 bg-slate-100 rounded-full overflow-hidden mt-2 relative">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 rounded-full animate-pulse w-2/3"
            style={{
              animation: 'shimmerSlide 1.5s infinite ease-in-out'
            }}
          />
        </div>
      </div>

      {/* Inline Keyframe Styles for Smooth Progress Bar */}
      <style>{`
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(30%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
        <div className="bg-white/95 rounded-2xl p-6 shadow-2xl border border-slate-100/80 backdrop-blur-md max-w-xs w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[40vh] w-full">
      {content}
    </div>
  );
};

export default LoadingSpinner;
