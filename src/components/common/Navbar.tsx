import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Camera,
  PlusCircle,
  FileText,
  SlidersHorizontal,
  HardHat,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  ChevronDown,
  Activity,
  ArrowRightLeft,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
  currentUser,
  userRole,
  currentPage,
  setCurrentPage,
  loginAs,
  logout,
  reports,
} = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const pendingReportsCount = reports.filter(
    (r) => r.status === 'reported' || r.status === 'verified'
  ).length;

  const navigateTo = (page: any) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            id="nav-logo-btn"
            onClick={() => setCurrentPage(userRole === 'authority' ? 'authority-dashboard' : userRole === 'citizen' ? 'user-dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  RoadGuard <span className="text-blue-700">AI</span>
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-700 border border-blue-200">
                  SIH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Intelligent Road Damage & Maintenance
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Quick Role Switcher & Nav Items */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {userRole === 'citizen' && (
            <>
              <button
                id="nav-citizen-dash"
                onClick={() => navigateTo('user-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'user-dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Activity className="h-4 w-4" />
                Dashboard
              </button>
              <button
                id="nav-citizen-camera"
                onClick={() => navigateTo('camera-detection')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'camera-detection'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Camera className="h-4 w-4 text-blue-600" />
                Camera Scan
              </button>
              <button
                id="nav-citizen-report"
                onClick={() => navigateTo('report-pothole')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'report-pothole'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Report Pothole
              </button>
              <button
                id="nav-citizen-my-reports"
                onClick={() => navigateTo('my-reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'my-reports' || currentPage === 'report-details'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                My Reports
              </button>
            </>
          )}

          {userRole === 'authority' && (
            <>
              <button
                id="nav-auth-dash"
                onClick={() => navigateTo('authority-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'authority-dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Overview
              </button>
              <button
                id="nav-auth-potholes"
                onClick={() => navigateTo('pothole-management')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors relative ${
                  currentPage === 'pothole-management' || currentPage === 'authority-report-details'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Pothole Management
                {pendingReportsCount > 0 && (
                  <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {pendingReportsCount}
                  </span>
                )}
              </button>
              <button
                id="nav-auth-contractors"
                onClick={() => navigateTo('contractor-management')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'contractor-management'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <HardHat className="h-4 w-4" />
                Contractors
              </button>
              <button
                id="nav-auth-tracking"
                onClick={() => navigateTo('maintenance-tracking')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === 'maintenance-tracking'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Maintenance Tracking
              </button>
            </>
          )}

          {!userRole && (
            <>
              <button
                id="nav-home-btn"
                onClick={() => navigateTo('landing')}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
              >
                Home
              </button>
              <button
                id="nav-login-btn"
                onClick={() => navigateTo('login')}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
              >
                Login
              </button>
              <button
                id="nav-register-btn"
                onClick={() => navigateTo('register')}
                className="rounded-lg bg-blue-700 px-3.5 py-1.5 text-white font-medium hover:bg-blue-800 transition"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>

        {/* Right action group: Role switcher & User menu */}
        <div className="flex items-center gap-2.5">
          {/* Quick Switch Role */}
          <div className="relative">
            <button
              id="role-switch-btn"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition shadow-sm"
              title="Switch role"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-blue-700" />
              <span className="hidden sm:inline text-slate-500 font-normal">Role:</span>
              <span className="font-semibold text-slate-900 capitalize">
                {userRole ? (userRole === 'authority' ? 'Authority (PWD/NHAI)' : 'Citizen') : 'Guest'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Dashboard View
                </div>
                <button
                  id="switch-citizen-role"
                  onClick={() => {
                    loginAs('citizen');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition ${
                    userRole === 'citizen'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                    <div>
                      <div className="font-medium text-slate-900">Citizen / User</div>
                      <div className="text-[10px] text-slate-500">Report damage & live camera</div>
                    </div>
                  </div>
                  {userRole === 'citizen' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />}
                </button>

                <button
                  id="switch-authority-role"
                  onClick={() => {
                    loginAs('authority');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition mt-1 ${
                    userRole === 'authority'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                    <div>
                      <div className="font-medium text-slate-900">Government Authority</div>
                      <div className="text-[10px] text-slate-500">NHAI / PWD / Contractors</div>
                    </div>
                  </div>
                  {userRole === 'authority' && <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" />}
                </button>
              </div>
            )}
          </div>

          {/* User profile / Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 capitalize">
                  {currentUser.agency || currentUser.role}
                </div>
              </div>
              <button
                id="nav-logout-btn"
                onClick={logout}
                title="Logout"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="login-quick-btn"
              onClick={() => setCurrentPage('login')}
              className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 transition"
            >
              Login
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden space-y-1.5 animate-in slide-in-from-top-3">
          {userRole === 'citizen' && (
            <>
              <button
                onClick={() => navigateTo('user-dashboard')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <Activity className="h-4 w-4 text-blue-600" />
                Citizen Dashboard
              </button>
              <button
                onClick={() => navigateTo('camera-detection')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <Camera className="h-4 w-4 text-blue-600" />
                Camera Detection
              </button>
              <button
                onClick={() => navigateTo('report-pothole')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <PlusCircle className="h-4 w-4 text-blue-600" />
                Report Pothole
              </button>
              <button
                onClick={() => navigateTo('my-reports')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                My Reports
              </button>
            </>
          )}

          {userRole === 'authority' && (
            <>
              <button
                onClick={() => navigateTo('authority-dashboard')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                Authority Overview
              </button>
              <button
                onClick={() => navigateTo('pothole-management')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                Pothole Management
              </button>
              <button
                onClick={() => navigateTo('contractor-management')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <HardHat className="h-4 w-4 text-blue-600" />
                Road Contractors
              </button>
              <button
                onClick={() => navigateTo('maintenance-tracking')}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Maintenance Tracking
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                loginAs(userRole === 'authority' ? 'citizen' : 'authority');
                setMobileMenuOpen(false);
              }}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-center"
            >
              Switch to {userRole === 'authority' ? 'Citizen' : 'Authority'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
