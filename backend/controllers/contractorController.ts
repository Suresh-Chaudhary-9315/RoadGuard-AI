import { Request, Response } from 'express';
import { ContractorModel, ContractorDoc } from '../../database/models/contractorModel';

export const ContractorController = {
  async getAllContractors(req: Request, res: Response) {
    try {
      const contractors = await ContractorModel.getAll();
      return res.json({ success: true, count: contractors.length, data: contractors });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async getContractorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contractor = await ContractorModel.getById(id);
      if (!contractor) {
        return res.status(404).json({ success: false, error: 'Contractor not found' });
      }
      return res.json({ success: true, data: contractor });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async createContractor(req: Request, res: Response) {
    try {
      const body = req.body;
      const newContractor: ContractorDoc = {
        id: `CTR-NHAI-${Math.floor(100 + Math.random() * 900)}`,
        contractorName: body.contractorName || 'Registered Road Engineer',
        companyName: body.companyName || 'Civil Infra Solutions',
        assignedRoads: body.assignedRoads || ['National Corridor Segment'],
        activeProjectsCount: 0,
        completedRepairsCount: 0,
        phone: body.phone || '+91 98000 00000',
        email: body.email || 'contracts@infra.gov.in',
        maintenanceStartDate: body.maintenanceStartDate || '01 Jan 2026',
        maintenanceExpiryDate: body.maintenanceExpiryDate || '31 Dec 2027',
        contractStatus: body.contractStatus || 'active',
        zone: body.zone || 'Zone 1 (National Highway)',
        slaAdherenceRate: 95.0,
      };

      const created = await ContractorModel.create(newContractor);
      return res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
