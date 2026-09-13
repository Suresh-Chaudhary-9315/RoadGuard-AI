import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PotholeReport, Priority } from '../../types';
import {
  X,
  HardHat,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface AssignModalProps {
  report: PotholeReport;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({ report, isOpen, onClose }) => {
  const { contractors, assignContractor } = useApp();

  const [selectedContractorId, setSelectedContractorId] = useState(
    report.assignedContractorId || contractors[0]?.id || ''
  );
  const [priority, setPriority] = useState<Priority>(
    report.priority || (report.severity === 'severe' ? 'critical' : 'high')
  );

  // Set default deadline to 3 days from today
  const defaultDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [deadline, setDeadline] = useState(report.deadline || defaultDeadline);
  const [notes, setNotes] = useState(
    `Immediate surface milling and mastic asphalt patch required at ${report.location.roadName}. Traffic cones to be deployed.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      assignContractor(report.id, selectedContractorId, priority, deadline, notes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const selectedContractor = contractors.find((c) => c.id === selectedContractorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assign Road Maintenance Contractor
              </h3>
              <p className="text-xs text-slate-500">
                Pothole Work Order: <span className="font-semibold text-slate-700">{report.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Issue Summary Pill */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span className="truncate">{report.location.roadName}</span>
              <StatusBadge severity={report.severity} size="sm" />
            </div>
            <p className="text-slate-500 text-[11px] truncate">{report.location.address}</p>
          </div>

          {/* Contractor Select with Status Indicators */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Certified Contractor
            </label>
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              required
            >
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} — ({c.contractorName}) | Status: {c.contractStatus.replace('_', ' ').toUpperCase()} | Active Projects: {c.activeProjectsCount}
                </option>
              ))}
            </select>

            {/* Selected Contractor Details Preview */}
            {selectedContractor && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-500" />
                    {selectedContractor.companyName}
                  </span>
                  <StatusBadge contractStatus={selectedContractor.contractStatus} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Maintenance: {selectedContractor.maintenanceStartDate} to {selectedContractor.maintenanceExpiryDate}</span>
                  <span>SLA: {selectedContractor.slaAdherenceRate}%</span>
                </div>
                {selectedContractor.contractStatus === 'expiring_soon' && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 p-1 rounded">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    Notice: Maintenance period expiring soon! Renewal in progress.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Priority & Deadline Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repair Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="critical">Critical (24h Emergency)</option>
                <option value="high">High (48h Resolution)</option>
                <option value="medium">Medium (72h Resolution)</option>
                <option value="low">Low (Routine Maintenance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SLA Completion Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                required
              />
            </div>
          </div>

          {/* Work Order Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authority Work Order Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="Provide technical specifications or safety guidelines..."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Issue Work Order & Assign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
