import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  HardHat,
  ChevronRight,
  MapPin,
  TrendingUp,
  Building2,
  Activity,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Mail,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AuthorityDashboard: React.FC = () => {
  const {
    currentUser,
    authorityStats,
    reports,
    contractors,
    setCurrentPage,
    viewReportDetails,
    emailAlerts,
    setIsEmailInboxOpen,
  } = useApp();

  // Find contractors with contracts expiring soon
  const expiringContractors = contractors.filter((c) => c.contractStatus === 'expiring_soon');

  // Critical reports pending assignment
  const unassignedCritical = reports.filter(
    (r) =>
      (r.severity === 'severe' || r.priority === 'critical') &&
      r.status !== 'completed' &&
      r.status !== 'rejected' &&
      !r.assignedContractorId
  );

  // Recent complaints
  const recentReports = reports.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome & Agency Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-800">
              NHAI & PWD Control Command
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500 font-medium">Zone 1-4 Operations</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
            Road Authority Executive Console
          </h1>
          <p className="text-xs text-slate-500">
            Overseeing road asset health, citizen damage grievance triage, and contractor maintenance tenures
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="auth-dash-inbox-btn"
            onClick={() => setIsEmailInboxOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-100 transition"
          >
            <Mail className="h-4 w-4 text-blue-600" />
            <span>Email Dispatches ({emailAlerts.length})</span>
          </button>
          <button
            onClick={() => setCurrentPage('pothole-management')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition active:scale-98"
          >
            <ShieldAlert className="h-4 w-4" />
            Triage Potholes
          </button>
          <button
            onClick={() => setCurrentPage('contractor-management')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <HardHat className="h-4 w-4 text-blue-700" />
            Manage Contractors
          </button>
        </div>
      </div>

      {/* Overview Dashboard: 5 Requested Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. Total Potholes Reported */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Reported</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {authorityStats.totalReported}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Across all municipal sectors</p>
        </div>

        {/* 2. Critical Potholes */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            <span>Critical Potholes</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-600">
            {authorityStats.criticalPotholes}
          </div>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">Require 24h SLA response</p>
        </div>

        {/* 3. Pending Complaints */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Triage</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-600">
            {authorityStats.pendingComplaints}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Awaiting verification/dispatch</p>
        </div>

        {/* 4. Repairs in Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Repairs in Progress</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-indigo-700">
            {authorityStats.repairsInProgress}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Assigned contractors on-site</p>
        </div>

        {/* 5. Completed Repairs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Completed Repairs</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600">
            {authorityStats.completedRepairs}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Quality certified & closed</p>
        </div>
      </div>

      {/* Warning Indicator Bar if Contractors Expiring Soon (Prompt requirement) */}
      {expiringContractors.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Maintenance Contract Expiry Warning
                </h3>
                <p className="text-xs text-amber-800">
                  {expiringContractors.length} road maintenance contract(s) expiring within 30 days! Example: {expiringContractors[0].companyName} on {expiringContractors[0].assignedRoads[0]}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('contractor-management')}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              Review Contractor Tenures
            </button>
          </div>
        </div>
      )}

      {/* Analytical Breakdown Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Severity Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Damage Severity Breakdown</span>
            <span className="text-xs font-normal text-slate-400">{reports.length} Total Incidents</span>
          </h3>

          {/* Distribution Bars */}
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Severe (Hazardous)
                </span>
                <span className="font-bold text-slate-800">
                  {reports.filter((r) => r.severity === 'severe').length} ({reports.length > 0 ? Math.round((reports.filter((r) => r.severity === 'severe').length / reports.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${reports.length > 0 ? (reports.filter((r) => r.severity === 'severe').length / reports.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Moderate (Surface Rupture)
                </span>
                <span className="font-bold text-slate-800">
                  {reports.filter((r) => r.severity === 'moderate').length} ({reports.length > 0 ? Math.round((reports.filter((r) => r.severity === 'moderate').length / reports.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${reports.length > 0 ? (reports.filter((r) => r.severity === 'moderate').length / reports.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Minor (Surface Wear)
                </span>
                <span className="font-bold text-slate-800">
                  {reports.filter((r) => r.severity === 'minor').length} ({reports.length > 0 ? Math.round((reports.filter((r) => r.severity === 'minor').length / reports.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${reports.length > 0 ? (reports.filter((r) => r.severity === 'minor').length / reports.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Road Corridor Key Metrics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between mb-3">
              <span>Active High-Priority Corridors</span>
              <span className="text-xs font-normal text-slate-400">SLA Status</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">NH-48 Sector 21 (Gurugram)</div>
                  <div className="text-[11px] text-slate-500">Major commercial arterial road</div>
                </div>
                <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-[11px]">Critical SLA</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">Outer Ring Road (Bengaluru)</div>
                  <div className="text-[11px] text-slate-500">Tech corridor repair project</div>
                </div>
                <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg text-[11px]">Repair Underway</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">Ring Road (New Delhi)</div>
                  <div className="text-[11px] text-slate-500">Municipal arterial highway</div>
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[11px]">100% Repaired</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('pothole-management')}
            className="w-full text-center py-2 text-xs font-bold text-blue-700 bg-blue-50/70 hover:bg-blue-100 rounded-xl transition"
          >
            Manage All Corridors in Registry &rarr;
          </button>
        </div>
      </div>

      {/* Pothole Reports Queue Table Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Damage Reports Needing Attention
            </h2>
            <p className="text-xs text-slate-500">
              Click any report to verify, inspect AI vision tags, and dispatch contractors
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('pothole-management')}
            className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
          >
            View Full Management Table <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Road Location</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">AI Confidence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned Contractor</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => viewReportDetails(report.id)}
                >
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-700">
                    {report.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 max-w-xs truncate">
                      {report.location.roadName}
                    </div>
                    <div className="text-[11px] text-slate-400 max-w-xs truncate">
                      {report.location.address}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge severity={report.severity} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 font-bold text-blue-700">
                    {report.aiAnalysis.confidenceScore}%
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={report.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {report.assignedContractorName ? (
                      <span className="font-medium text-slate-900">
                        {report.assignedContractorName}
                      </span>
                    ) : (
                      <span className="text-amber-600 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewReportDetails(report.id);
                      }}
                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
