import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Contractor,
  NavigationPage,
  PotholeReport,
  Priority,
  ReportStatus,
  UserRole,
} from '../types';
import {
  apiClient,
  AuthUser,
  DatabaseStatus,
  EmailAlertLog,
} from '../../frontend/apiClient';

export type UserProfile = AuthUser;

interface AppContextType {
  userRole: UserRole | null;
  currentUser: UserProfile | null;
  authLoading: boolean;
  isAuthenticated: boolean;
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
  login: (role: UserRole, email: string, password: string) => Promise<void>;
  registerCitizen: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
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
  addContractor: (contractorData: {
    contractorName: string;
    companyName: string;
    assignedRoads: string[];
    maintenanceStartDate: string;
    maintenanceExpiryDate: string;
    phone?: string;
    email?: string;
    zone?: string;
    contractStatus?: Contractor['contractStatus'];
  }) => Promise<Contractor>;
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
const STORAGE_PAGE_KEY = 'roadguard_page_v4';

function defaultPageForRole(role: UserRole): NavigationPage {
  if (role === 'authority') return 'authority-dashboard';
  if (role === 'admin') return 'admin-dashboard';
  return 'user-dashboard';
}

function pageAllowedForRole(page: NavigationPage, role: UserRole): boolean {
  const citizenPages: NavigationPage[] = [
    'user-dashboard',
    'report-pothole',
    'camera-detection',
    'my-reports',
    'report-details',
  ];
  const authorityPages: NavigationPage[] = [
    'authority-dashboard',
    'pothole-management',
    'contractor-management',
    'maintenance-tracking',
    'authority-report-details',
  ];

  if (role === 'citizen') return citizenPages.includes(page);
  if (role === 'authority') return authorityPages.includes(page);
  return page === 'admin-dashboard';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [emailAlerts, setEmailAlerts] = useState<EmailAlertLog[]>([]);
  const [lastEmailAlert, setLastEmailAlert] = useState<EmailAlertLog | null>(null);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    type: 'MongoDB',
    connected: false,
    database: 'roadguard_ai',
  });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [currentPage, setCurrentPageState] = useState<NavigationPage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PAGE_KEY);
      return (saved as NavigationPage) || 'landing';
    } catch {
      return 'landing';
    }
  });

  const setCurrentPage = (page: NavigationPage) => {
    setCurrentPageState(page);
  };

  // Remove the old demo-auth cache. Real authentication now lives in an
  // HttpOnly server session cookie, not localStorage.
  useEffect(() => {
    try {
      localStorage.removeItem('roadguard_user_v3');
    } catch {
      // no-op
    }
  }, []);

  // Restore a real server-side session after refresh.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const user = await apiClient.getCurrentUser();
      if (cancelled) return;

      setCurrentUser(user);
      if (!user) {
        const protectedPage = !['landing', 'login', 'register'].includes(currentPage);
        if (protectedPage) setCurrentPageState('landing');
      } else if (!pageAllowedForRole(currentPage, user.role)) {
        setCurrentPageState(defaultPageForRole(user.role));
      }
      setAuthLoading(false);
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
    // Run once: currentPage is intentionally read from initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAGE_KEY, currentPage);
    } catch {
      // no-op
    }
  }, [currentPage]);

  // Load only data that the authenticated role is allowed to access.
  useEffect(() => {
    let cancelled = false;

    const loadRoleData = async () => {
      if (!currentUser) {
        setReports([]);
        setContractors([]);
        setEmailAlerts([]);
        return;
      }

      try {
        const statusPromise = apiClient.getDatabaseStatus();

        if (currentUser.role === 'citizen') {
          const [fetchedReports, status] = await Promise.all([
            apiClient.getReports(),
            statusPromise,
          ]);
          if (cancelled) return;
          setReports(fetchedReports);
          setContractors([]);
          setEmailAlerts([]);
          setDatabaseStatus(status);
          return;
        }

        if (currentUser.role === 'authority') {
          const [fetchedReports, fetchedContractors, fetchedEmails, status] =
            await Promise.all([
              apiClient.getReports(),
              apiClient.getContractors(),
              apiClient.getEmailAlerts(),
              statusPromise,
            ]);
          if (cancelled) return;
          setReports(fetchedReports);
          setContractors(fetchedContractors);
          setEmailAlerts(fetchedEmails);
          setDatabaseStatus(status);
          return;
        }

        // Admin account management does not need road-report data preloaded.
        const status = await statusPromise;
        if (cancelled) return;
        setReports([]);
        setContractors([]);
        setEmailAlerts([]);
        setDatabaseStatus(status);
      } catch (error) {
        if (cancelled) return;
        console.error('Role data load failed:', error);
        setReports([]);
        setContractors([]);
        setEmailAlerts([]);
      }
    };

    loadRoleData();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role]);

  const userRole = currentUser?.role || null;
  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) || null,
    [reports, selectedReportId]
  );

  const login = async (role: UserRole, email: string, password: string) => {
    const user = await apiClient.login({ email, password, expectedRole: role });
    setCurrentUser(user);
    setReports([]);
    setContractors([]);
    setEmailAlerts([]);
    setSelectedReportId(null);
    setCurrentPageState(defaultPageForRole(user.role));
  };

  const registerCitizen = async (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const user = await apiClient.registerCitizen(input);
    setCurrentUser(user);
    setReports([]);
    setSelectedReportId(null);
    setCurrentPageState('user-dashboard');
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } finally {
      setCurrentUser(null);
      setReports([]);
      setContractors([]);
      setEmailAlerts([]);
      setLastEmailAlert(null);
      setSelectedReportId(null);
      setCurrentPageState('landing');
    }
  };

  const viewReportDetails = (id: string) => {
    setSelectedReportId(id);
    if (userRole === 'authority') {
      setCurrentPageState('authority-report-details');
    } else if (userRole === 'citizen') {
      setCurrentPageState('report-details');
    }
  };

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
    if (!currentUser || currentUser.role !== 'citizen') {
      throw new Error('Citizen login is required to submit a report.');
    }

    const response = await apiClient.createReport({
      title: reportData.title,
      description: reportData.description,
      severity: reportData.severity,
      confidenceScore: reportData.confidenceScore,
      location: reportData.location,
      imageUrl: reportData.imageUrl,
      aiAnalysis: reportData.aiAnalysis,
      // customAuthorityEmail is deliberately not used by the backend anymore.
      // Recipient routing is controlled by the server environment.
    });

    const newReport = response.report;
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    setSelectedReportId(newReport.id);

    if (response.emailAlert) {
      setEmailAlerts((prev) => [response.emailAlert!, ...prev]);
      setLastEmailAlert(response.emailAlert);
    }

    return newReport.id;
  };

  const requireAuthority = () => {
    if (!currentUser || currentUser.role !== 'authority') {
      throw new Error('Authority login is required for this action.');
    }
  };

  const verifyReport = async (reportId: string, notes?: string) => {
    requireAuthority();
    const updated = await apiClient.updateReportStatus(
      reportId,
      'verified',
      notes || 'Verified by road authority field desk.',
      currentUser?.name
    );
    setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
  };

  const addContractor = async (contractorData: {
    contractorName: string;
    companyName: string;
    assignedRoads: string[];
    maintenanceStartDate: string;
    maintenanceExpiryDate: string;
    phone?: string;
    email?: string;
    zone?: string;
    contractStatus?: Contractor['contractStatus'];
  }): Promise<Contractor> => {
    requireAuthority();
    const created = await apiClient.createContractor(contractorData);
    setContractors((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
    return created;
  };

  const assignContractor = async (
    reportId: string,
    contractorId: string,
    priority: Priority,
    deadline: string,
    notes?: string
  ) => {
    requireAuthority();
    const contractor = contractors.find((c) => c.id === contractorId);
    const contractorName = contractor?.companyName || contractor?.contractorName || 'Contractor';

    const updated = await apiClient.assignContractor(
      reportId,
      contractorId,
      contractorName,
      priority,
      deadline
    );
    setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
    setContractors((prev) =>
      prev.map((c) =>
        c.id === contractorId
          ? { ...c, activeProjectsCount: c.activeProjectsCount + 1 }
          : c
      )
    );
  };

  const updateReportStatus = async (
    reportId: string,
    status: ReportStatus,
    notes?: string
  ) => {
    requireAuthority();
    const updated = await apiClient.updateReportStatus(
      reportId,
      status,
      notes,
      currentUser?.name
    );
    setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
  };

  const authorityStats = {
    totalReported: reports.length,
    criticalPotholes: reports.filter(
      (r) => r.severity === 'severe' || r.priority === 'critical'
    ).length,
    pendingComplaints: reports.filter(
      (r) => r.status === 'reported' || r.status === 'verified'
    ).length,
    repairsInProgress: reports.filter(
      (r) => r.status === 'assigned' || r.status === 'in_progress'
    ).length,
    completedRepairs: reports.filter((r) => r.status === 'completed').length,
  };

  const citizenStats = {
    totalSubmitted: reports.length,
    pendingCount: reports.filter(
      (r) => r.status !== 'completed' && r.status !== 'rejected'
    ).length,
    resolvedCount: reports.filter((r) => r.status === 'completed').length,
    severeCount: reports.filter((r) => r.severity === 'severe').length,
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        currentUser,
        authLoading,
        isAuthenticated: Boolean(currentUser),
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
        login,
        registerCitizen,
        logout,
        addReport,
        verifyReport,
        assignContractor,
        updateReportStatus,
        addContractor,
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
