import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ title, children, onRefresh }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} onRefresh={onRefresh} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
