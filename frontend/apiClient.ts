import { PotholeReport, Contractor, LocationData, PotholeSeverity, ReportStatus, Priority } from '../src/types';

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

export const apiClient = {
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/database/status');
      const json = await res.json();
      return json.database || { type: 'MongoDB', connected: true, database: 'roadguard_ai' };
    } catch {
      return { type: 'MongoDB (Client Fallback)', connected: true, database: 'roadguard_ai' };
    }
  },

  async getReports(): Promise<PotholeReport[]> {
    try {
      const res = await fetch('/api/reports');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch reports from backend API, using client fallback', e);
    }
    return [];
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
  }): Promise<{ report: PotholeReport; emailAlert: EmailAlertLog }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (!res.ok) {
      throw new Error(`Failed to create report: ${res.statusText}`);
    }

    const json = await res.json();
    return {
      report: json.data,
      emailAlert: json.emailAlert,
    };
  },

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    note?: string,
    actor?: string
  ): Promise<PotholeReport> {
    const res = await fetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note, actor }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update status');
    return json.data;
  },

  async assignContractor(
    id: string,
    contractorId: string,
    contractorName: string,
    priority: Priority,
    deadline: string
  ): Promise<PotholeReport> {
    const res = await fetch(`/api/reports/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractorId, contractorName, priority, deadline }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to assign contractor');
    return json.data;
  },

  async getContractors(): Promise<Contractor[]> {
    try {
      const res = await fetch('/api/contractors');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch contractors from backend API', e);
    }
    return [];
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
    const res = await fetch('/api/contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractorData),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to create contractor: ${res.statusText}`);
    }

    return json.data;
  },

  async getEmailAlerts(): Promise<EmailAlertLog[]> {
    try {
      const res = await fetch('/api/notifications/emails');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch emails from backend API', e);
    }
    return [];
  },

  async triggerTestEmail(email?: string): Promise<EmailAlertLog> {
    const res = await fetch('/api/notifications/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    return json.data;
  },
};
