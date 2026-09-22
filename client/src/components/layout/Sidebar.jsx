import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Upload,
  Briefcase,
  Award,
  FileText,
  LogOut,
  User,
  ChevronRight,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  let workspaceItems = [];

  if (user.role === 'SM_GROUPS_ADMIN') {
    workspaceItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Colleges', path: '/admin/colleges', icon: Building2 },
      { label: 'Upload Students', path: '/admin/upload', icon: Upload },
      { label: 'Students List', path: '/admin/students', icon: Users },
      { label: 'Sub-Company Logos', path: '/admin/companies', icon: Briefcase },
      { label: 'Generate Certificate', path: '/admin/generate-certificates', icon: Award },
      { label: 'View Certificates', path: '/admin/certificates', icon: FileText }
    ];
  } else if (user.role === 'TNSKILLS_ADMIN') {
    workspaceItems = [
      { label: 'Dashboard', path: '/tnskills/dashboard', icon: LayoutDashboard },
      { label: 'Colleges', path: '/tnskills/colleges', icon: Building2 }
    ];
  } else if (user.role === 'COLLEGE_ADMIN') {
    workspaceItems = [
      { label: 'Dashboard', path: '/college/dashboard', icon: LayoutDashboard },
      { label: 'Students', path: '/college/students', icon: Users }
    ];
  } else if (user.role === 'STUDENT') {
    workspaceItems = [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', path: '/student/profile', icon: User },
      { label: 'My Certificate', path: '/student/certificate', icon: Award }
    ];
  }

  const getBrandInfo = () => {
    switch (user.role) {
      case 'SM_GROUPS_ADMIN':
        return {
          title: 'THE SM GROUPS',
          subtitle: 'Enterprise Suite'
        };
      case 'TNSKILLS_ADMIN':
        return {
          title: 'TN SKILLS',
          subtitle: 'State Monitoring'
        };
      case 'COLLEGE_ADMIN':
        return {
          title: user.college?.code || 'COLLEGE',
          subtitle: 'College Portal'
        };
      case 'STUDENT':
        return {
          title: 'STUDENT PORTAL',
          subtitle: 'Enterprise Suite'
        };
      default:
        return {
          title: 'THE SM GROUPS',
          subtitle: 'Enterprise Suite'
        };
    }
  };

  const brand = getBrandInfo();

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl border-2 border-red-200/80 bg-white p-1.5 flex items-center justify-center shadow-2xs flex-shrink-0">
            <img src="/favicon.png" alt="SM GROUPS" className="w-full h-full object-contain" />
          </div>

          <div className="min-w-0">
            <h1 className="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-tight truncate">
              {brand.title}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">
              {brand.subtitle}
            </p>
          </div>
        </div>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-2 px-3 uppercase">
            WORKSPACE
          </p>

          <nav className="space-y-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (isMobile && typeof onCloseMobile === 'function') {
                      onCloseMobile();
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/25'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-red-600 font-semibold'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="tracking-tight truncate">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white flex-shrink-0" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-500 truncate font-semibold uppercase">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/90 flex-col h-screen sticky top-0 shadow-xs select-none flex-shrink-0">
        {renderContent(false)}
      </aside>

      {/* Mobile Backdrop & Slide-out Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

