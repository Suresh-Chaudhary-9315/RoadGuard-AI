import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { UserDashboard } from './pages/citizen/UserDashboard';
import { ReportPotholePage } from './pages/citizen/ReportPotholePage';
import { CameraDetectionPage } from './pages/citizen/CameraDetectionPage';
import { MyReportsPage } from './pages/citizen/MyReportsPage';
import { ReportDetailsPage } from './pages/citizen/ReportDetailsPage';
import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';
import { PotholeManagementPage } from './pages/authority/PotholeManagementPage';
import { ContractorManagementPage } from './pages/authority/ContractorManagementPage';
import { MaintenanceTrackingPage } from './pages/authority/MaintenanceTrackingPage';
import { AuthorityReportDetailsPage } from './pages/authority/AuthorityReportDetailsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AuthorityEmailInboxModal } from './components/common/AuthorityEmailInboxModal';
import { EmailSentToast } from './components/common/EmailSentToast';
import { Loader2, LockKeyhole } from 'lucide-react';
import { NavigationPage, UserRole } from './types';

const CITIZEN_PAGES: NavigationPage[] = [
  'user-dashboard',
  'report-pothole',
  'camera-detection',
  'my-reports',
  'report-details',
];

const AUTHORITY_PAGES: NavigationPage[] = [
  'authority-dashboard',
  'pothole-management',
  'contractor-management',
  'maintenance-tracking',
  'authority-report-details',
];

function requiredRole(page: NavigationPage): UserRole | null {
  if (CITIZEN_PAGES.includes(page)) return 'citizen';
  if (AUTHORITY_PAGES.includes(page)) return 'authority';
  if (page === 'admin-dashboard') return 'admin';
  return null;
}

const AppContent: React.FC = () => {
  const {
    currentPage,
    currentUser,
    authLoading,
    setCurrentPage,
    emailAlerts,
    lastEmailAlert,
    isEmailInboxOpen,
    setIsEmailInboxOpen,
    clearLastEmailAlert,
  } = useApp();

  const renderCurrentView = () => {
    if (authLoading) {
      return (
        <div className="flex min-h-[65vh] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-700" /> Restoring secure session...
        </div>
      );
    }

    const roleNeeded = requiredRole(currentPage);
    if (roleNeeded && !currentUser) {
      return <LoginPage />;
    }
    if (roleNeeded && currentUser?.role !== roleNeeded) {
      return (
        <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center px-4 text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <LockKeyhole className="mx-auto h-9 w-9 text-rose-600" />
            <h2 className="mt-4 text-xl font-black text-slate-900">Access restricted</h2>
            <p className="mt-2 text-sm text-slate-500">Your authenticated account does not have permission to open this dashboard.</p>
            <button
              onClick={() =>
                setCurrentPage(
                  currentUser?.role === 'authority'
                    ? 'authority-dashboard'
                    : currentUser?.role === 'admin'
                    ? 'admin-dashboard'
                    : 'user-dashboard'
                )
              }
              className="mt-5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              Return to my dashboard
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'user-dashboard':
        return <UserDashboard />;
      case 'report-pothole':
        return <ReportPotholePage />;
      case 'camera-detection':
        return <CameraDetectionPage />;
      case 'my-reports':
        return <MyReportsPage />;
      case 'report-details':
        return <ReportDetailsPage />;
      case 'authority-dashboard':
        return <AuthorityDashboard />;
      case 'pothole-management':
        return <PotholeManagementPage />;
      case 'contractor-management':
        return <ContractorManagementPage />;
      case 'maintenance-tracking':
        return <MaintenanceTrackingPage />;
      case 'authority-report-details':
        return <AuthorityReportDetailsPage />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1 pb-12">{renderCurrentView()}</main>

      {currentUser?.role === 'authority' && (
        <AuthorityEmailInboxModal
          isOpen={isEmailInboxOpen}
          onClose={() => setIsEmailInboxOpen(false)}
          emailAlerts={emailAlerts}
        />
      )}

      <EmailSentToast
        emailAlert={lastEmailAlert}
        onDismiss={clearLastEmailAlert}
        onViewInbox={() => setIsEmailInboxOpen(true)}
      />

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="font-semibold text-slate-700">Terra Scan AI • Intelligent Road Asset Management</div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('landing')} className="hover:text-blue-700">Prototype Overview</button>
            {!currentUser && <button onClick={() => setCurrentPage('login')} className="hover:text-blue-700">Sign In</button>}
            {!currentUser && <button onClick={() => setCurrentPage('register')} className="hover:text-blue-700">Citizen Sign Up</button>}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
