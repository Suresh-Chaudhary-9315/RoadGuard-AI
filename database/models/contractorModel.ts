import { getDatabase } from '../connection';

export interface ContractorDoc {
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
  slaAdherenceRate: number;
}

export const ContractorModel = {
  async getAll(): Promise<ContractorDoc[]> {
    const { collection } = await getDatabase();
    const cursor = await collection('contractors').find({});
    return cursor.toArray();
  },

  async getById(id: string): Promise<ContractorDoc | null> {
    const { collection } = await getDatabase();
    return collection('contractors').findOne({ id });
  },

  async create(contractor: ContractorDoc): Promise<ContractorDoc> {
    const { collection } = await getDatabase();
    await collection('contractors').insertOne(contractor);
    return contractor;
  },

  async incrementActiveProjects(id: string): Promise<void> {
    const { collection } = await getDatabase();
    const contractor = await this.getById(id);
    if (contractor) {
      await collection('contractors').updateOne(
        { id },
        { $set: { activeProjectsCount: (contractor.activeProjectsCount || 0) + 1 } }
      );
    }
  },
};
