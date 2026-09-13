import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  HardHat,
  Clock,
  ShieldCheck,
  Building,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AiDetectionCard } from '../../components/common/AiDetectionCard';
import { MaintenanceTimeline } from '../../components/common/MaintenanceTimeline';
import { MiniMap } from '../../components/common/MiniMap';

export const ReportDetailsPage: React.FC = () => {
  const { selectedReport, setCurrentPage, reports } = useApp();

  const report = selectedReport || reports[0];

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-500">Report not found.</p>
        <button
          onClick={() => setCurrentPage('my-reports')}
          className="mt-3 text-xs font-bold text-blue-700 hover:underline"
        >
          Return to My Reports
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => setCurrentPage('my-reports')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to My Reports
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-slate-400">
              {report.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 line-clamp-1">
              {report.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge severity={report.severity} size="md" />
          <StatusBadge status={report.status} size="md" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Detection Card & GPS Location Map */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Vision Analysis & Defect Proof
            </h3>
            <AiDetectionCard
              imageUrl={report.imageUrl}
              aiAnalysis={report.aiAnalysis}
              location={report.location}
            />
          </div>

          {/* Road Location Map */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                GIS Road Location
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {report.location.lat.toFixed(4)}°N, {report.location.lng.toFixed(4)}°E
              </span>
            </div>

            <MiniMap
              reports={[report]}
              selectedReportId={report.id}
              heightClass="h-56"
              showAllMarkers={false}
            />

            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
              <div className="font-semibold text-slate-900">{report.location.roadName}</div>
              <p className="text-slate-500 text-[11px]">{report.location.address}</p>
              {report.location.landmark && (
                <p className="text-slate-400 text-[11px]">Landmark: {report.location.landmark}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Contractor Work Order info */}
        <div className="lg:col-span-6 space-y-6">
          {/* Visual Maintenance Timeline */}
          <MaintenanceTimeline
            currentStatus={report.status}
            timeline={report.timeline}
          />

          {/* Contractor & SLA Assignment Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HardHat className="h-3.5 w-3.5 text-blue-600" />
              Contractor Work Order Details
            </h4>

            {report.assignedContractorName ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Contractor Appointed:</span>
                  <span className="text-xs font-bold text-slate-900">
                    {report.assignedContractorName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Target Resolution SLA:</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {report.deadline || 'Standard 72h'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Maintenance Period Status:</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Defect Liability Period
                  </span>
                </div>

                {report.repairNotes && (
                  <div className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Completion Audit Note:</span>
                    <p className="mt-0.5">{report.repairNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500 space-y-1">
                <Clock className="mx-auto h-5 w-5 text-amber-500 mb-1" />
                <div className="font-semibold text-slate-800">Pending Contractor Allocation</div>
                <p className="text-[11px] text-slate-400">
                  Municipal road desk is verifying road jurisdiction and allocating nearby certified contractor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
