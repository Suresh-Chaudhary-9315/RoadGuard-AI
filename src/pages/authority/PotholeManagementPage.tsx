import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Filter,
  MapPin,
  Eye,
  CheckCircle2,
  HardHat,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssignModal } from '../../components/common/AssignModal';
import { PotholeReport, ReportStatus, PotholeSeverity } from '../../types';

export const PotholeManagementPage: React.FC = () => {
  const {
    reports,
    verifyReport,
    updateReportStatus,
    viewReportDetails,
    setCurrentPage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedReportForAssign, setSelectedReportForAssign] = useState<PotholeReport | null>(null);

  // Extract unique locations for filter
  const uniqueRoads = Array.from(new Set(reports.map((r) => r.location.roadName)));

  const filteredReports = reports.filter((report) => {
    if (severityFilter !== 'all' && report.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (locationFilter !== 'all' && report.location.roadName !== locationFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        report.id.toLowerCase().includes(q) ||
        report.title.toLowerCase().includes(q) ||
        report.location.address.toLowerCase().includes(q) ||
        report.location.roadName.toLowerCase().includes(q) ||
        (report.assignedContractorName && report.assignedContractorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentPage('authority-dashboard')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Authority Overview
          </button>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-blue-700" />
            Road Damage & Pothole Triage
          </h1>
          <p className="text-xs text-slate-500">
            Audit citizen reported defects, inspect AI bounding boxes, and issue contractor maintenance orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'table' ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, road name, contractor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Severity filter */}
          <div className="sm:col-span-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="severe">Severe (Critical)</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>

          {/* Location filter */}
          <div className="sm:col-span-3">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Road Corridors</option>
              {uniqueRoads.map((road) => (
                <option key={road} value={road}>
                  {road}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">Repair Started</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Results Display */}
      {filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <ShieldAlert className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No pothole complaints match filters</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting severity or corridor filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Pothole / Photo</th>
                  <th className="px-4 py-3.5">Road Location & GPS</th>
                  <th className="px-4 py-3.5">AI Classification</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Contractor</th>
                  <th className="px-4 py-3.5 text-right">Authority Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {/* Thumbnail & ID */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={report.imageUrl}
                          alt={report.title}
                          className="h-12 w-16 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-mono font-bold text-slate-900">{report.id}</div>
                          <div className="text-[10px] text-slate-400">{report.reportedAt}</div>
                        </div>
                      </div>
                    </td>

                    {/* Road Location */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">
                        {report.location.roadName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {report.location.address}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {report.location.lat.toFixed(4)}°N, {report.location.lng.toFixed(4)}°E
                      </div>
                    </td>

                    {/* AI Classification */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <StatusBadge severity={report.severity} size="sm" />
                        <div className="text-[11px] text-slate-600">
                          Confidence: <strong className="text-blue-700">{report.aiAnalysis.confidenceScore}%</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Est. Depth: {report.aiAnalysis.estimatedDimensions.depthCm} cm
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={report.status} size="sm" />
                    </td>

                    {/* Contractor */}
                    <td className="px-4 py-3.5">
                      {report.assignedContractorName ? (
                        <div>
                          <div className="font-semibold text-slate-900">
                            {report.assignedContractorName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Deadline: {report.deadline || 'Standard'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-600 italic">Not Assigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      {report.status === 'reported' && (
                        <button
                          onClick={() => verifyReport(report.id)}
                          className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                        >
                          Verify
                        </button>
                      )}

                      {(!report.assignedContractorId || report.status === 'verified') && (
                        <button
                          onClick={() => setSelectedReportForAssign(report)}
                          className="rounded-lg bg-blue-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-800 transition"
                        >
                          Assign Contractor
                        </button>
                      )}

                      {report.status === 'assigned' && (
                        <button
                          onClick={() => updateReportStatus(report.id, 'in_progress')}
                          className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                        >
                          Mark Started
                        </button>
                      )}

                      {report.status === 'in_progress' && (
                        <button
                          onClick={() => updateReportStatus(report.id, 'completed')}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          Certify Repair
                        </button>
                      )}

                      <button
                        onClick={() => viewReportDetails(report.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 hover:shadow-md transition"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <StatusBadge severity={report.severity} size="sm" />
                </div>
                <div className="absolute top-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  AI: {report.aiAnalysis.confidenceScore}%
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {report.id}
                  </span>
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {report.location.roadName}
                </h4>
                <p className="text-xs text-slate-500 truncate">{report.location.address}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Contractor:</span>
                <span className="font-semibold text-slate-900">
                  {report.assignedContractorName || 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedReportForAssign(report)}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Assign Contractor
                </button>
                <button
                  onClick={() => viewReportDetails(report.id)}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  Inspect Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal Trigger */}
      {selectedReportForAssign && (
        <AssignModal
          report={selectedReportForAssign}
          isOpen={!!selectedReportForAssign}
          onClose={() => setSelectedReportForAssign(null)}
        />
      )}
    </div>
  );
};
