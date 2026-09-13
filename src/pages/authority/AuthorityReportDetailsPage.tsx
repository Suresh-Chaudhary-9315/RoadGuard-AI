import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  MapPin,
  Calendar,
  Clock,
  Building,
  User,
  AlertTriangle,
  Wrench,
  XCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AiDetectionCard } from '../../components/common/AiDetectionCard';
import { MaintenanceTimeline } from '../../components/common/MaintenanceTimeline';
import { AssignModal } from '../../components/common/AssignModal';

export const AuthorityReportDetailsPage: React.FC = () => {
  const {
    selectedReport,
    reports,
    setCurrentPage,
    verifyReport,
    updateReportStatus,
  } = useApp();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [auditNote, setAuditNote] = useState('');

  const report = selectedReport || reports[0];

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-500">Report not found.</p>
        <button
          onClick={() => setCurrentPage('pothole-management')}
          className="mt-3 text-xs font-bold text-blue-700 hover:underline"
        >
          Return to Management
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => setCurrentPage('pothole-management')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Pothole Triage
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-slate-400">{report.id}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 line-clamp-1">
              {report.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons for Authority Workflow */}
        <div className="flex flex-wrap items-center gap-2">
          {report.status === 'reported' && (
            <button
              onClick={() => verifyReport(report.id, 'Verified by Municipal Authority Field Desk.')}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              Verify Report
            </button>
          )}

          {(!report.assignedContractorId || report.status === 'verified') && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
            >
              <HardHat className="h-4 w-4" />
              Assign Road Contractor
            </button>
          )}

          {report.status === 'assigned' && (
            <button
              onClick={() => updateReportStatus(report.id, 'in_progress', 'Contractor on-site; road repair started.')}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
            >
              <Wrench className="h-4 w-4" />
              Mark Repair Started
            </button>
          )}

          {report.status === 'in_progress' && (
            <button
              onClick={() => updateReportStatus(report.id, 'completed', 'Audit passed: Quality road resurfacing verified.')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              Certify Completion
            </button>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            <StatusBadge severity={report.severity} size="md" />
            <StatusBadge status={report.status} size="md" />
          </div>
        </div>
      </div>

      {/* Grid: AI Analysis, GIS Map & Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: AI Diagnostics & Location */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Vision Engine Diagnostics
            </h3>
            <AiDetectionCard
              imageUrl={report.imageUrl}
              aiAnalysis={report.aiAnalysis}
              location={report.location}
            />
          </div>

          {/* Citizen Reporter Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-600" />
              Citizen Grievance Details
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-500">Citizen Name:</span>
                <div className="font-bold text-slate-900">{report.reportedBy.name}</div>
              </div>
              <div>
                <span className="text-slate-500">Contact Number:</span>
                <div className="font-mono font-medium text-slate-800">{report.reportedBy.phone}</div>
              </div>
              <div>
                <span className="text-slate-500">Citizen Portal ID:</span>
                <div className="font-mono text-slate-600">{report.reportedBy.citizenId}</div>
              </div>
              <div>
                <span className="text-slate-500">Lodged Date/Time:</span>
                <div className="font-mono text-slate-600">{report.reportedAt}</div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <span className="text-slate-500">Citizen Description:</span>
              <p className="mt-0.5 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {report.description}
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                Location & Coordinates
              </h3>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                {report.location.lat.toFixed(4)}°N, {report.location.lng.toFixed(4)}°E
              </span>
            </div>

            <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
              <div className="font-bold text-slate-900 text-sm">{report.location.roadName}</div>
              <p className="text-slate-600">{report.location.address}</p>
              {report.location.landmark && (
                <p className="text-slate-500 text-[11px]">Landmark: {report.location.landmark}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Contractor Work Order Card */}
        <div className="lg:col-span-6 space-y-6">
          <MaintenanceTimeline
            currentStatus={report.status}
            timeline={report.timeline}
          />

          {/* Assigned Contractor Details or Assignment CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HardHat className="h-3.5 w-3.5 text-blue-600" />
                Contractor Allocation & Maintenance Terms
              </h4>
              {report.assignedContractorName && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Reassign / Modify
                </button>
              )}
            </div>

            {report.assignedContractorName ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                  <span>{report.assignedContractorName}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                    Assigned
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400">Assigned Date:</span>
                    <div className="font-mono text-slate-800">{report.assignedAt}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Target SLA Deadline:</span>
                    <div className="font-semibold text-slate-900">{report.deadline}</div>
                  </div>
                </div>

                {report.repairNotes && (
                  <div className="border-t border-slate-200 pt-2">
                    <span className="font-semibold text-slate-700">Completion Certification:</span>
                    <p className="text-slate-600 mt-0.5">{report.repairNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center space-y-2">
                <HardHat className="mx-auto h-8 w-8 text-slate-400" />
                <div className="text-sm font-bold text-slate-800">No Contractor Assigned</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Verify the road jurisdiction and assign one of the certified road contractors to start maintenance.
                </p>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="mt-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-800 transition"
                >
                  Assign Contractor Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <AssignModal
          report={report}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}
    </div>
  );
};
