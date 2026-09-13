import {
  PotholeReport,
  Contractor,
  LocationData,
  PotholeSeverity,
  ReportStatus,
  Priority,
  UserRole,
} from '../src/types';

export interface EmailAlertLog {
  id: string;
  reportId: string;
  to: string;
  from: string;
  subject: string;
  severity: 'minor' | 'moderate' | 'severe';
  roadName: string;
  locationDetails: string;
  coordinates: { lat: number; lng: number };
  confidenceScore: number;
  sentAt: string;
  status: 'sent' | 'delivered' | 'simulated';
  bodyHtml: string;
}

export interface DatabaseStatus {
  type: string;
  connected: boolean;
  database: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  agency?: string;
  active: boolean;
}

async function readJson(res: Response): Promise<any> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json;
}

function jsonFetch(url: string, init: RequestInit = {}) {
  return fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
}

export const apiClient = {
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const res = await jsonFetch('/api/database/status');
      const json = await readJson(res);
      return json.database || { type: 'MongoDB', connected: false, database: 'roadguard_ai' };
    } catch {
      return { type: 'MongoDB', connected: false, database: 'roadguard_ai' };
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const res = await jsonFetch('/api/auth/me');
      if (res.status === 401) return null;
      const json = await readJson(res);
      return json.data || null;
    } catch {
      return null;
    }
  },

  async login(input: {
    email: string;
    password: string;
    expectedRole: UserRole;
  }): Promise<AuthUser> {
    const res = await jsonFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const json = await readJson(res);
    return json.data;
  },

  async registerCitizen(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthUser> {
    const res = await jsonFetch('/api/auth/register/citizen', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const json = await readJson(res);
    return json.data;
  },

  async logout(): Promise<void> {
    const res = await jsonFetch('/api/auth/logout', { method: 'POST' });
    await readJson(res);
  },

  async getReports(): Promise<PotholeReport[]> {
    const res = await jsonFetch('/api/reports');
    const json = await readJson(res);
    return Array.isArray(json.data) ? json.data : [];
  },

  async createReport(reportData: {
    title: string;
    description: string;
    imageUrl: string;
    severity: PotholeSeverity;
    confidenceScore: number;
    location: LocationData;
    aiAnalysis: any;
    customAuthorityEmail?: string;
  }): Promise<{ report: PotholeReport; emailAlert?: EmailAlertLog | null }> {
    const res = await jsonFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
    const json = await readJson(res);
    return {
      report: json.data,
      emailAlert: json.emailAlert || null,
    };
  },

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    note?: string,
    actor?: string
  ): Promise<PotholeReport> {
    const res = await jsonFetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note, actor }),
    });
    const json = await readJson(res);
    return json.data;
  },

  async assignContractor(
    id: string,
    contractorId: string,
    contractorName: string,
    priority: Priority,
    deadline: string
  ): Promise<PotholeReport> {
    const res = await jsonFetch(`/api/reports/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ contractorId, contractorName, priority, deadline }),
    });
    const json = await readJson(res);
    return json.data;
  },

  async getContractors(): Promise<Contractor[]> {
    const res = await jsonFetch('/api/contractors');
    const json = await readJson(res);
    return Array.isArray(json.data) ? json.data : [];
  },

  async createContractor(contractorData: {
    contractorName: string;
    companyName: string;
    assignedRoads: string[];
    maintenanceStartDate: string;
    maintenanceExpiryDate: string;
    phone?: string;
    email?: string;
    zone?: string;
    contractStatus?: Contractor['contractStatus'];
  }): Promise<Contractor> {
    const res = await jsonFetch('/api/contractors', {
      method: 'POST',
      body: JSON.stringify(contractorData),
    });
    const json = await readJson(res);
    return json.data;
  },

  async getEmailAlerts(): Promise<EmailAlertLog[]> {
    const res = await jsonFetch('/api/notifications/emails');
    const json = await readJson(res);
    return Array.isArray(json.data) ? json.data : [];
  },

  async triggerTestEmail(email?: string): Promise<EmailAlertLog> {
    const res = await jsonFetch('/api/notifications/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const json = await readJson(res);
    return json.data;
  },

  async getAuthorities(): Promise<AuthUser[]> {
    const res = await jsonFetch('/api/admin/authorities');
    const json = await readJson(res);
    return Array.isArray(json.data) ? json.data : [];
  },

  async createAuthority(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    agency: string;
  }): Promise<AuthUser> {
    const res = await jsonFetch('/api/admin/authorities', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const json = await readJson(res);
    return json.data;
  },

  async setAuthorityActive(id: string, active: boolean): Promise<AuthUser> {
    const res = await jsonFetch(`/api/admin/authorities/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
    const json = await readJson(res);
    return json.data;
  },
};
