export type UserRole = 'citizen' | 'authority';

export type PotholeSeverity = 'minor' | 'moderate' | 'severe';

export type ReportStatus = 'reported' | 'verified' | 'assigned' | 'in_progress' | 'completed' | 'rejected';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

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

export interface LocationData {
  address: string;
  roadName: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  landmark?: string;
}

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export interface AiDetectionAnalysis {
  detected: boolean;
  detectedCount: number;
  confidenceScore: number;
  severity: PotholeSeverity;
  boundingBoxes: BoundingBox[];
  estimatedDimensions: {
    widthCm: number;
    depthCm: number;
    areaSqM: number;
  };
  roadCondition: string;
  recommendedUrgency: string;
}

export interface TimelineEvent {
  status: ReportStatus;
  label: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface PotholeReport {
  id: string;
  title: string;
  description: string;
  severity: PotholeSeverity;
  confidenceScore: number;
  status: ReportStatus;
  priority: Priority;
  reportedAt: string;
  updatedAt: string;
  location: LocationData;
  imageUrl: string;
  aiAnalysis: AiDetectionAnalysis;
  reportedBy: {
    name: string;
    phone: string;
    citizenId: string;
  };
  assignedContractorId?: string;
  assignedContractorName?: string;
  deadline?: string;
  assignedAt?: string;
  repairedAt?: string;
  repairNotes?: string;
  verificationNotes?: string;
  timeline: TimelineEvent[];
}

export interface Contractor {
  id: string;
  contractorName: string;
  companyName: string;
  assignedRoads: string[];
  activeProjectsCount: number;
  completedRepairsCount: number;
  phone: string;
  email: string;
  maintenanceStartDate: string;
  maintenanceExpiryDate: string;
  contractStatus: 'active' | 'expiring_soon' | 'expired';
  zone: string;
  rating: number; // out of 5
  slaAdherenceRate: number; // percentage e.g. 96
}

export type NavigationPage =
  | 'landing'
  | 'login'
  | 'register'
  // Citizen pages
  | 'user-dashboard'
  | 'report-pothole'
  | 'camera-detection'
  | 'my-reports'
  | 'report-details'
  // Authority pages
  | 'authority-dashboard'
  | 'pothole-management'
  | 'contractor-management'
  | 'maintenance-tracking'
  | 'authority-report-details';
