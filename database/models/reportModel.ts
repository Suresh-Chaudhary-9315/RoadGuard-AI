import { getDatabase } from '../connection';

export interface PotholeReportDoc {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  severity: 'minor' | 'moderate' | 'severe';
  priority: 'normal' | 'urgent' | 'critical';
  status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
  confidenceScore: number;
  location: {
    address: string;
    roadName: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    landmark?: string;
  };
  reportedBy: {
    name: string;
    phone: string;
    citizenId: string;
  };
  assignedContractorId?: string;
  assignedContractorName?: string;
  reportedAt: string;
  assignedAt?: string;
  deadline?: string;
  repairNotes?: string;
  aiAnalysis: {
    detected: boolean;
    detectedCount: number;
    confidenceScore: number;
    severity: 'minor' | 'moderate' | 'severe';
    boundingBoxes: Array<{ x: number; y: number; width: number; height: number }>;
    estimatedDimensions: {
      widthCm: number;
      depthCm: number;
      areaSqM: number;
    };
    roadCondition: string;
    recommendedUrgency: string;
  };
  timeline: Array<{
    status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'completed' | 'rejected';
    timestamp: string;
    title: string;
    description: string;
    actor: string;
    note?: string;
  }>;
  createdAt?: string;
  emailAlertSent?: boolean;
}

export const ReportModel = {
  async getAll(): Promise<PotholeReportDoc[]> {
    const { collection } = await getDatabase();
    const cursor = await collection('reports').find({});
    return cursor.toArray();
  },

  async getByCitizenId(citizenId: string): Promise<PotholeReportDoc[]> {
    const { collection } = await getDatabase();
    const cursor = await collection('reports').find({ 'reportedBy.citizenId': citizenId });
    return cursor.toArray();
  },

  async getById(id: string): Promise<PotholeReportDoc | null> {
    const { collection } = await getDatabase();
    return collection('reports').findOne({ id });
  },

  async create(report: PotholeReportDoc): Promise<PotholeReportDoc> {
    const { collection } = await getDatabase();
    const doc = {
      ...report,
      createdAt: new Date().toISOString(),
    };
    await collection('reports').insertOne(doc);
    return doc;
  },

  async setEmailAlertSent(id: string, sent: boolean): Promise<void> {
    const { collection } = await getDatabase();
    await collection('reports').updateOne(
      { id },
      { $set: { emailAlertSent: sent } }
    );
  },

  async updateStatus(
    id: string,
    status: PotholeReportDoc['status'],
    note?: string,
    actor: string = 'Authority Desk'
  ): Promise<PotholeReportDoc | null> {
    const { collection } = await getDatabase();
    const existing = await this.getById(id);
    if (!existing) return null;

    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const statusTitleMap: Record<string, string> = {
      verified: 'Verified by Road Authority',
      assigned: 'Contractor Assigned',
      in_progress: 'Repair Work Commenced',
      completed: 'Repair Completed & Quality Certified',
      rejected: 'Report Rejected / Duplicate',
    };

    const newTimelineItem = {
      status,
      timestamp,
      title: statusTitleMap[status] || `Status updated to ${status}`,
      description: note || `Report status updated to ${status}.`,
      actor,
      note,
    };

    const updateFields: any = { status };
    if (status === 'completed' && note) {
      updateFields.repairNotes = note;
    }

    await collection('reports').updateOne(
      { id },
      {
        $set: updateFields,
        $push: { timeline: newTimelineItem },
      }
    );

    return this.getById(id);
  },

  async assignContractor(
    id: string,
    contractorId: string,
    contractorName: string,
    priority: 'normal' | 'urgent' | 'critical',
    deadline: string
  ): Promise<PotholeReportDoc | null> {
    const { collection } = await getDatabase();
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const timelineItem = {
      status: 'assigned' as const,
      timestamp,
      title: 'Contractor Assigned for Maintenance',
      description: `Assigned to ${contractorName} with ${priority.toUpperCase()} priority. Deadline: ${deadline}.`,
      actor: 'Municipal Executive Engineer',
    };

    await collection('reports').updateOne(
      { id },
      {
        $set: {
          assignedContractorId: contractorId,
          assignedContractorName: contractorName,
          priority,
          deadline,
          assignedAt: timestamp,
          status: 'assigned',
        },
        $push: { timeline: timelineItem },
      }
    );

    return this.getById(id);
  },
};
