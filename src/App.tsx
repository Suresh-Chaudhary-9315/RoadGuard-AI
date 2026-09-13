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
import { AuthorityEmailInboxModal } from './components/common/AuthorityEmailInboxModal';
import { EmailSentToast } from './components/common/EmailSentToast';
import { ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentPage,
    userRole,
    switchRole,
    setCurrentPage,
    emailAlerts,
    lastEmailAlert,
    isEmailInboxOpen,
    setIsEmailInboxOpen,
    clearLastEmailAlert,
  } = useApp();

  const renderCurrentView = () => {
    switch (currentPage) {
      // Public / Auth Views
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;

      // Citizen Views
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

      // Authority Views
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

      default:
        return userRole === 'citizen' ? <UserDashboard /> : <AuthorityDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 pb-16">
        {renderCurrentView()}
      </main>

      {/* Global Email Dispatches Modal */}
      <AuthorityEmailInboxModal
        isOpen={isEmailInboxOpen}
        onClose={() => setIsEmailInboxOpen(false)}
        emailAlerts={emailAlerts}
      />

      {/* Real-time Email Dispatched Toast */}
      <EmailSentToast
        emailAlert={lastEmailAlert}
        onDismiss={clearLastEmailAlert}
        onViewInbox={() => setIsEmailInboxOpen(true)}
      />

      {/* Clean, Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-700 text-white font-black text-xs">
              RG
            </div>
            <span className="font-bold text-slate-900">RoadGuard AI</span>
            <span className="text-slate-300">|</span>
            <span>Intelligent Road Asset Management</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => {
                switchRole('citizen');
                setCurrentPage('user-dashboard');
              }}
              className={`hover:text-blue-700 font-semibold ${userRole === 'citizen' ? 'text-blue-700' : ''}`}
            >
              Citizen Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => {
                switchRole('authority');
                setCurrentPage('authority-dashboard');
              }}
              className={`hover:text-blue-700 font-semibold ${userRole === 'authority' ? 'text-blue-700' : ''}`}
            >
              Authority Console
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentPage('contractor-management')}
              className="hover:text-blue-700"
            >
              Contractor Tenures
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Municipal Road Maintenance & Citizen Grievance Portal
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
