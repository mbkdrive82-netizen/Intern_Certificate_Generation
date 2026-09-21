import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ title, children, onRefresh }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-red-500 selection:text-white">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={title}
          onRefresh={onRefresh}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />
        <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

