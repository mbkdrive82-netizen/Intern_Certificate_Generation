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
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
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
      { label: 'Certificates', path: '/admin/generate-certificates', icon: Award }
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

  return (
    <aside className="w-68 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 shadow-xs select-none">
      {/* Top Brand Header (Matching exact screenshot) */}
      <div className="p-4 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Logo container with red-tinted border */}
          <div className="w-12 h-12 rounded-2xl border-2 border-red-200/80 bg-white p-2 flex items-center justify-center shadow-2xs flex-shrink-0">
            <img src="/favicon.png" alt="SM GROUPS" className="w-full h-full object-contain" />
          </div>

          <div className="min-w-0">
            <h1 className="font-black text-slate-900 text-base tracking-tight leading-tight truncate">
              {brand.title}
            </h1>
          </div>
        </div>

        {/* Header Icon / Collapse Button */}
        <button
          type="button"
          className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          title="Sidebar Menu"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-slate-100 mx-4 mb-2"></div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4">
        {/* WORKSPACE SECTION */}
        <div>
          <p className="text-[11px] font-extrabold text-slate-800 tracking-wider mb-2 px-3 uppercase">
            WORKSPACE
          </p>

          <nav className="space-y-1.5">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                      isActive
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/25'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-red-600 font-bold'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                      <span className="tracking-tight">{item.label}</span>
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
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
            <p className="text-[11px] text-slate-500 truncate font-semibold uppercase">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
