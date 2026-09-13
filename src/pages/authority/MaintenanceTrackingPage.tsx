import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Clock,
  HardHat,
  Wrench,
  ChevronLeft,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReportStatus, PotholeReport } from '../../types';

export const MaintenanceTrackingPage: React.FC = () => {
  const {
    reports,
    updateReportStatus,
    viewReportDetails,
    setCurrentPage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const filtered = reports.filter((r) => {
    if (activeTab === 'assigned' && r.status !== 'assigned') return false;
    if (activeTab === 'in_progress' && r.status !== 'in_progress') return false;
    if (activeTab === 'completed' && r.status !== 'completed') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.location.roadName.toLowerCase().includes(q) ||
        (r.assignedContractorName && r.assignedContractorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const steps: { key: ReportStatus; label: string }[] = [
    { key: 'reported', label: 'Reported' },
    { key: 'verified', label: 'Verified' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'Repair Started' },
    { key: 'completed', label: 'Completed' },
  ];

  const statusOrder: Record<ReportStatus, number> = {
    reported: 0,
    verified: 1,
    assigned: 2,
    in_progress: 3,
    completed: 4,
    rejected: -1,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => setCurrentPage('authority-dashboard')}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Authority Overview
        </button>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-blue-700" />
          Road Maintenance Progress & Visual Tracking
        </h1>
        <p className="text-xs text-slate-500">
          Track lifecycle progression from citizen report through verified asphalt repair
        </p>
      </div>

      {/* Visual Timeline Standard Guide Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Standard 5-Step Maintenance Pipeline
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] text-slate-700">
              1
            </span>
            <span>Reported (Citizen)</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 font-mono text-[11px] text-sky-700">
              2
            </span>
            <span>Verified (Authority)</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-mono text-[11px] text-indigo-700">
              3
            </span>
            <span>Assigned (Contractor)</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-mono text-[11px] text-amber-800">
              4
            </span>
            <span>Repair Started (Field Crew)</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-mono text-[11px] text-emerald-700">
              5
            </span>
            <span>Completed & Quality Certified</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            All Work Orders ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'assigned' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Assigned ({reports.filter((r) => r.status === 'assigned').length})
          </button>
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'in_progress' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Repairs Underway ({reports.filter((r) => r.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`rounded-lg px-3 py-1.5 transition ${
              activeTab === 'completed' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Completed ({reports.filter((r) => r.status === 'completed').length})
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work order or road..."
            className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Work Orders List with Visual Step Timeline */}
      <div className="space-y-4">
        {filtered.map((report) => {
          const currentIdx = statusOrder[report.status] ?? 0;

          return (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {report.id}
                  </span>
                  <StatusBadge severity={report.severity} size="sm" />
                  <StatusBadge status={report.status} size="sm" />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Reported: {report.reportedAt}</span>
                  {report.deadline && (
                    <span className="font-semibold text-slate-800">
                      SLA Target: {report.deadline}
                    </span>
                  )}
                </div>
              </div>

              {/* Road & Contractor info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{report.location.roadName}</h4>
                  <p className="text-slate-500">{report.location.address}</p>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-slate-400 text-[11px]">Assigned Contractor</div>
                  <div className="font-bold text-slate-800">
                    {report.assignedContractorName || 'Not Assigned Yet'}
                  </div>
                </div>
              </div>

              {/* Individual 5-Step Visual Timeline Progress */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="relative flex items-center justify-between">
                  {/* Background progress track */}
                  <div className="absolute top-3 left-4 right-4 h-1 -translate-y-1/2 bg-slate-200 z-0">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${Math.max(0, Math.min(100, (currentIdx / (steps.length - 1)) * 100))}%`,
                      }}
                    />
                  </div>

                  {steps.map((step, sIdx) => {
                    const isDone = sIdx <= currentIdx;
                    const isCurrent = sIdx === currentIdx;

                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold border-2 transition ${
                            isDone
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : sIdx + 1}
                        </div>
                        <span
                          className={`mt-1 text-[11px] font-medium whitespace-nowrap ${
                            isCurrent
                              ? 'text-blue-700 font-bold'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Authority Quick Progression Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-xs text-slate-500">
                  {report.timeline[report.timeline.length - 1]?.note}
                </div>

                <div className="flex items-center gap-2">
                  {report.status === 'assigned' && (
                    <button
                      onClick={() => updateReportStatus(report.id, 'in_progress', 'Road maintenance machinery mobilized to location.')}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
                    >
                      Start Repair Work
                    </button>
                  )}

                  {report.status === 'in_progress' && (
                    <button
                      onClick={() => updateReportStatus(report.id, 'completed', 'Hot mix asphalt surface repair certified by PWD quality engineer.')}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      Mark Completed & Certified
                    </button>
                  )}

                  <button
                    onClick={() => viewReportDetails(report.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Details & Audit Log
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
