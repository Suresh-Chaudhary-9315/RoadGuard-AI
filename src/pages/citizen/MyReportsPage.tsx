import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  ChevronRight,
  PlusCircle,
  Camera,
  ChevronLeft,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReportStatus, PotholeSeverity } from '../../types';

export const MyReportsPage: React.FC = () => {
  const { reports, citizenStats, viewReportDetails, setCurrentPage } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((report) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && report.status !== 'reported' && report.status !== 'verified') return false;
      if (statusFilter === 'in_progress' && report.status !== 'assigned' && report.status !== 'in_progress') return false;
      if (statusFilter === 'completed' && report.status !== 'completed') return false;
    }
    if (severityFilter !== 'all' && report.severity !== severityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        report.title.toLowerCase().includes(q) ||
        report.location.address.toLowerCase().includes(q) ||
        report.location.roadName.toLowerCase().includes(q) ||
        report.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentPage('user-dashboard')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-black text-slate-900">My Pothole Grievances</h1>
          <p className="text-xs text-slate-500">
            Real-time status tracking of all road maintenance requests lodged by you
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('camera-detection')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Camera className="h-4 w-4 text-blue-600" />
            Camera Scan
          </button>
          <button
            onClick={() => setCurrentPage('report-pothole')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
          >
            <PlusCircle className="h-4 w-4" />
            New Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Submitted</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {citizenStats.totalSubmitted}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Triage</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600">
            {citizenStats.pendingCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Repairs Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {citizenStats.resolvedCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Severe Hazards</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-600">
            {citizenStats.severeCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by road name, landmark, or report ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-lg bg-slate-100 p-0.5 font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-md px-2.5 py-1 transition ${
                statusFilter === 'all' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`rounded-md px-2.5 py-1 transition ${
                statusFilter === 'pending' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`rounded-md px-2.5 py-1 transition ${
                statusFilter === 'in_progress' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              In Repair
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`rounded-md px-2.5 py-1 transition ${
                statusFilter === 'completed' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              Completed
            </button>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="severe">Severe Only</option>
            <option value="moderate">Moderate Only</option>
            <option value="minor">Minor Only</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No matching reports found</p>
          <p className="text-xs text-slate-400 mt-1">Try changing search filters or lodge a new report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => viewReportDetails(report.id)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-500 hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[9px] font-bold text-white">
                    {report.aiAnalysis.confidenceScore}%
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {report.id}
                    </span>
                    <StatusBadge status={report.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-1">
                    {report.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{report.location.address}</span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <StatusBadge severity={report.severity} size="sm" />
                    {report.assignedContractorName && (
                      <span className="text-[11px] text-slate-500 truncate">
                        Assigned: <strong className="text-slate-700">{report.assignedContractorName}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                <span>Reported: {report.reportedAt}</span>
                <span className="flex items-center gap-1 font-semibold text-blue-700 group-hover:translate-x-1 transition">
                  Track Timeline <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
