import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  NavigationPage,
  PotholeReport,
  Contractor,
  ReportStatus,
  Priority,
} from '../types';
import { INITIAL_CONTRACTORS, INITIAL_REPORTS } from '../data/mockData';
import { apiClient, EmailAlertLog, DatabaseStatus } from '../../frontend/apiClient';

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  agency?: string;
  id: string;
}

const DEFAULT_CITIZEN: UserProfile = {
  id: 'CIT-DEL-8821',
  name: 'Rohan Sharma',
  email: 'rohan.sharma@gmail.com',
  phone: '+91 98765 43210',
  role: 'citizen',
};

const DEFAULT_AUTHORITY: UserProfile = {
  id: 'AUTH-NHAI-04',
  name: 'Er. Rajesh Varma',
  email: 'r.varma@nhai.gov.in',
  phone: '+91 98112 00445',
  role: 'authority',
  agency: 'National Highways Authority of India (NHAI) / PWD',
};

interface AppContextType {
  userRole: UserRole | null;
  currentUser: UserProfile | null;
  currentPage: NavigationPage;
  reports: PotholeReport[];
  contractors: Contractor[];
  selectedReportId: string | null;
  selectedReport: PotholeReport | null;
  emailAlerts: EmailAlertLog[];
  lastEmailAlert: EmailAlertLog | null;
  isEmailInboxOpen: boolean;
  databaseStatus: DatabaseStatus;
  setIsEmailInboxOpen: (open: boolean) => void;
  clearLastEmailAlert: () => void;
  setCurrentPage: (page: NavigationPage) => void;
  setSelectedReportId: (id: string | null) => void;
  viewReportDetails: (id: string) => void;
  loginAs: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  addReport: (reportData: {
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    confidenceScore: number;
    location: PotholeReport['location'];
    imageUrl: string;
    aiAnalysis: PotholeReport['aiAnalysis'];
    priority?: Priority;
    customAuthorityEmail?: string;
  }) => Promise<string>;
  verifyReport: (reportId: string, notes?: string) => Promise<void>;
  assignContractor: (
    reportId: string,
    contractorId: string,
    priority: Priority,
    deadline: string,
    notes?: string
  ) => Promise<void>;
  updateReportStatus: (
    reportId: string,
    status: ReportStatus,
    notes?: string
  ) => Promise<void>;
  resetDemoData: () => void;
  // Stats
  authorityStats: {
    totalReported: number;
    criticalPotholes: number;
    pendingComplaints: number;
    repairsInProgress: number;
    completedRepairs: number;
  };
  citizenStats: {
    totalSubmitted: number;
    pendingCount: number;
    resolvedCount: number;
    severeCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_AUTH_USER_KEY = 'roadguard_user_v3';
const STORAGE_PAGE_KEY = 'roadguard_page_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<PotholeReport[]>(INITIAL_REPORTS);
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlertLog[]>([]);
  const [lastEmailAlert, setLastEmailAlert] = useState<EmailAlertLog | null>(null);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    type: 'MongoDB',
    connected: true,
    database: 'roadguard_ai',
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CITIZEN;
  });

  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PAGE_KEY);
      if (saved) return saved as NavigationPage;
    } catch {
      // fallback
    }
    return 'landing';
  });

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Initial fetch from MongoDB backend API
  useEffect(() => {
    const initData = async () => {
      try {
        const [fetchedReports, fetchedContractors, fetchedEmails, status] = await Promise.all([
          apiClient.getReports(),
          apiClient.getContractors(),
          apiClient.getEmailAlerts(),
          apiClient.getDatabaseStatus(),
        ]);

        if (fetchedReports && fetchedReports.length > 0) {
          setReports(fetchedReports);
        }
        if (fetchedContractors && fetchedContractors.length > 0) {
          setContractors(fetchedContractors);
        }
        if (fetchedEmails && fetchedEmails.length > 0) {
          setEmailAlerts(fetchedEmails);
        }
        if (status) {
          setDatabaseStatus(status);
        }
      } catch (err) {
        console.warn('Backend sync failed, using initial memory dataset:', err);
      }
    };
    initData();
  }, []);

  // Save user & page preference
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_AUTH_USER_KEY);
      }
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAGE_KEY, currentPage);
    } catch (e) {
      console.error('Storage error', e);
    }
  }, [currentPage]);

  const userRole = currentUser ? currentUser.role : null;
  const selectedReport = reports.find((r) => r.id === selectedReportId) || null;

  const viewReportDetails = (id: string) => {
    setSelectedReportId(id);
    if (userRole === 'authority') {
      setCurrentPage('authority-report-details');
    } else {
      setCurrentPage('report-details');
    }
  };

  const loginAs = (role: UserRole, customUser?: Partial<UserProfile>) => {
    if (role === 'authority') {
      setCurrentUser({
        ...DEFAULT_AUTHORITY,
        ...customUser,
      });
      setCurrentPage('authority-dashboard');
    } else {
      setCurrentUser({
        ...DEFAULT_CITIZEN,
        ...customUser,
      });
      setCurrentPage('user-dashboard');
    }
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  // 1. ADD REPORT -> SAVES TO MONGODB & DISPATCHES EMAIL TO ROAD AUTHORITY
  const addReport = async (reportData: {
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    confidenceScore: number;
    location: PotholeReport['location'];
    imageUrl: string;
    aiAnalysis: PotholeReport['aiAnalysis'];
    priority?: Priority;
    customAuthorityEmail?: string;
  }): Promise<string> => {
    try {
      const response = await apiClient.createReport({
        title: reportData.title,
        description: reportData.description,
        severity: reportData.severity,
        confidenceScore: reportData.confidenceScore,
        location: reportData.location,
        imageUrl: reportData.imageUrl,
        aiAnalysis: reportData.aiAnalysis,
        customAuthorityEmail: reportData.customAuthorityEmail,
      });

      const newReport = response.report;
      setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
      setSelectedReportId(newReport.id);

      // Trigger Email Notification Toast & update alerts list
      if (response.emailAlert) {
        setEmailAlerts((prev) => [response.emailAlert, ...prev]);
        setLastEmailAlert(response.emailAlert);
      }

      return newReport.id;
    } catch (error) {
      console.warn('API submission error, registering locally in memory:', error);
      const timestamp = new Date().toLocaleString('en-IN');
      const fallbackId = `RG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackReport: PotholeReport = {
        id: fallbackId,
        title: reportData.title,
        description: reportData.description,
        severity: reportData.severity,
        confidenceScore: reportData.confidenceScore,
        status: 'reported',
        priority: reportData.priority || (reportData.severity === 'severe' ? 'critical' : 'medium'),
        reportedAt: timestamp,
        updatedAt: timestamp,
        location: reportData.location,
        imageUrl: reportData.imageUrl,
        aiAnalysis: reportData.aiAnalysis,
        reportedBy: {
          name: currentUser ? currentUser.name : 'Rohan Sharma (Citizen)',
          phone: currentUser ? currentUser.phone : '+91 98765 43210',
          citizenId: currentUser ? currentUser.id : 'CIT-DEL-8821',
        },
        timeline: [
          {
            status: 'reported',
            timestamp,
            label: 'Citizen Report Lodged',
            note: 'Logged and transmitted to Authority triage desk.',
            actor: 'Citizen',
          },
        ],
      };

      setReports((prev) => [fallbackReport, ...prev]);
      setSelectedReportId(fallbackId);
      return fallbackId;
    }
  };

  const verifyReport = async (reportId: string, notes?: string) => {
    try {
      const updated = await apiClient.updateReportStatus(
        reportId,
        'verified',
        notes || 'Verified by municipal authority field desk.',
        currentUser?.name || 'Authority Desk'
      );
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
    } catch (e) {
      // client optimistic update
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'verified' } : r))
      );
    }
  };

  const assignContractor = async (
    reportId: string,
    contractorId: string,
    priority: Priority,
    deadline: string,
    notes?: string
  ) => {
    const contractor = contractors.find((c) => c.id === contractorId);
    const contractorName = contractor ? contractor.companyName : 'Contractor';

    try {
      const updated = await apiClient.assignContractor(
        reportId,
        contractorId,
        contractorName,
        priority,
        deadline
      );
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
    } catch (e) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: 'assigned',
                assignedContractorId: contractorId,
                assignedContractorName: contractorName,
                priority,
                deadline,
              }
            : r
        )
      );
    }

    setContractors((prev) =>
      prev.map((c) =>
        c.id === contractorId ? { ...c, activeProjectsCount: c.activeProjectsCount + 1 } : c
      )
    );
  };

  const updateReportStatus = async (
    reportId: string,
    status: ReportStatus,
    notes?: string
  ) => {
    try {
      const updated = await apiClient.updateReportStatus(
        reportId,
        status,
        notes,
        currentUser?.name || 'Authority Desk'
      );
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
    } catch (e) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    }
  };

  const resetDemoData = () => {
    setReports(INITIAL_REPORTS);
    setContractors(INITIAL_CONTRACTORS);
  };

  // Authority stats
  const authorityStats = {
    totalReported: reports.length,
    criticalPotholes: reports.filter((r) => r.severity === 'severe' || r.priority === 'critical').length,
    pendingComplaints: reports.filter((r) => r.status === 'reported' || r.status === 'verified').length,
    repairsInProgress: reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length,
    completedRepairs: reports.filter((r) => r.status === 'completed').length,
  };

  // Citizen stats
  const citizenStats = {
    totalSubmitted: reports.length,
    pendingCount: reports.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length,
    resolvedCount: reports.filter((r) => r.status === 'completed').length,
    severeCount: reports.filter((r) => r.severity === 'severe').length,
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        currentUser,
        currentPage,
        reports,
        contractors,
        selectedReportId,
        selectedReport,
        emailAlerts,
        lastEmailAlert,
        isEmailInboxOpen,
        databaseStatus,
        setIsEmailInboxOpen,
        clearLastEmailAlert: () => setLastEmailAlert(null),
        setCurrentPage,
        setSelectedReportId,
        viewReportDetails,
        loginAs,
        logout,
        switchRole,
        addReport,
        verifyReport,
        assignContractor,
        updateReportStatus,
        resetDemoData,
        authorityStats,
        citizenStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
