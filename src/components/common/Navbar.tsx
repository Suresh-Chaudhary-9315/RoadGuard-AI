import React, { useState } from 'react';
import {
  Activity,
  Bell,
  Camera,
  CheckCircle2,
  FileText,
  HardHat,
  LogOut,
  Menu,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationPage } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    userRole,
    currentPage,
    setCurrentPage,
    logout,
    reports,
    setIsEmailInboxOpen,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingReportsCount = reports.filter(
    (r) => r.status === 'reported' || r.status === 'verified'
  ).length;

  const navigateTo = (page: NavigationPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const homePage: NavigationPage =
    userRole === 'authority'
      ? 'authority-dashboard'
      : userRole === 'citizen'
      ? 'user-dashboard'
      : userRole === 'admin'
      ? 'admin-dashboard'
      : 'landing';

  const signOut = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigateTo(homePage)} className="flex items-center gap-2.5 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">Terra Scan<span className="text-blue-700">AI</span></span>
              <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700">SIH</span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-500 sm:block">Intelligent Road Damage & Maintenance</p>
          </div>
        </button>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {userRole === 'citizen' && (
            <>
              <NavButton active={currentPage === 'user-dashboard'} onClick={() => navigateTo('user-dashboard')} icon={<Activity className="h-4 w-4" />}>Dashboard</NavButton>
              <NavButton active={currentPage === 'camera-detection'} onClick={() => navigateTo('camera-detection')} icon={<Camera className="h-4 w-4" />}>Camera Scan</NavButton>
              <NavButton active={currentPage === 'report-pothole'} onClick={() => navigateTo('report-pothole')} icon={<PlusCircle className="h-4 w-4" />}>Report Pothole</NavButton>
              <NavButton active={currentPage === 'my-reports' || currentPage === 'report-details'} onClick={() => navigateTo('my-reports')} icon={<FileText className="h-4 w-4" />}>My Reports</NavButton>
            </>
          )}

          {userRole === 'authority' && (
            <>
              <NavButton active={currentPage === 'authority-dashboard'} onClick={() => navigateTo('authority-dashboard')} icon={<SlidersHorizontal className="h-4 w-4" />}>Overview</NavButton>
              <button
                onClick={() => navigateTo('pothole-management')}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${currentPage === 'pothole-management' || currentPage === 'authority-report-details' ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <ShieldAlert className="h-4 w-4" /> Potholes
                {pendingReportsCount > 0 && <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingReportsCount}</span>}
              </button>
              <NavButton active={currentPage === 'contractor-management'} onClick={() => navigateTo('contractor-management')} icon={<HardHat className="h-4 w-4" />}>Contractors</NavButton>
              <NavButton active={currentPage === 'maintenance-tracking'} onClick={() => navigateTo('maintenance-tracking')} icon={<CheckCircle2 className="h-4 w-4" />}>Tracking</NavButton>
              <button onClick={() => setIsEmailInboxOpen(true)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                <Bell className="h-4 w-4" /> Alerts
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <NavButton active={currentPage === 'admin-dashboard'} onClick={() => navigateTo('admin-dashboard')} icon={<ShieldCheck className="h-4 w-4" />}>Admin Console</NavButton>
          )}

          {!userRole && (
            <>
              <button onClick={() => navigateTo('landing')} className="px-3 py-1.5 text-slate-600 hover:text-slate-900">Home</button>
              <button onClick={() => navigateTo('login')} className="px-3 py-1.5 text-slate-600 hover:text-slate-900">Sign In</button>
              <button onClick={() => navigateTo('register')} className="rounded-lg bg-blue-700 px-3.5 py-1.5 font-medium text-white hover:bg-blue-800">Citizen Sign Up</button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
              <div className="hidden text-right lg:block">
                <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] capitalize text-slate-500">{currentUser.agency || currentUser.role}</div>
              </div>
              <button onClick={signOut} title="Logout" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => navigateTo('login')} className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 md:hidden">Sign In</button>
          )}

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 md:hidden">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="space-y-1.5 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          {userRole === 'citizen' && (
            <>
              <MobileButton onClick={() => navigateTo('user-dashboard')}>Dashboard</MobileButton>
              <MobileButton onClick={() => navigateTo('camera-detection')}>Camera Scan</MobileButton>
              <MobileButton onClick={() => navigateTo('report-pothole')}>Report Pothole</MobileButton>
              <MobileButton onClick={() => navigateTo('my-reports')}>My Reports</MobileButton>
            </>
          )}
          {userRole === 'authority' && (
            <>
              <MobileButton onClick={() => navigateTo('authority-dashboard')}>Authority Overview</MobileButton>
              <MobileButton onClick={() => navigateTo('pothole-management')}>Pothole Management</MobileButton>
              <MobileButton onClick={() => navigateTo('contractor-management')}>Contractors</MobileButton>
              <MobileButton onClick={() => navigateTo('maintenance-tracking')}>Maintenance Tracking</MobileButton>
              <MobileButton onClick={() => { setIsEmailInboxOpen(true); setMobileMenuOpen(false); }}>Email Alerts</MobileButton>
            </>
          )}
          {userRole === 'admin' && <MobileButton onClick={() => navigateTo('admin-dashboard')}>Admin Console</MobileButton>}
          {!userRole && (
            <>
              <MobileButton onClick={() => navigateTo('landing')}>Home</MobileButton>
              <MobileButton onClick={() => navigateTo('login')}>Sign In</MobileButton>
              <MobileButton onClick={() => navigateTo('register')}>Citizen Sign Up</MobileButton>
            </>
          )}
          {currentUser && (
            <button onClick={signOut} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">Log out</button>
          )}
        </div>
      )}
    </header>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${active ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
    {icon}{children}
  </button>
);

const MobileButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">{children}</button>
);
