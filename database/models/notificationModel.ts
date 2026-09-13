import { getDatabase } from '../connection';

export interface EmailNotificationDoc {
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

export const NotificationModel = {
  async getAll(): Promise<EmailNotificationDoc[]> {
    const { collection } = await getDatabase();
    const cursor = await collection('notifications').find({});
    const docs = await cursor.toArray();
    return docs;
  },

  async logEmail(notification: EmailNotificationDoc): Promise<EmailNotificationDoc> {
    const { collection } = await getDatabase();
    await collection('notifications').insertOne(notification);
    return notification;
  },
};
