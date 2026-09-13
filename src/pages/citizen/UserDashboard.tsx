import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  MapPin,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    reports,
    citizenStats,
    setCurrentPage,
    viewReportDetails,
  } = useApp();

  const recentReports = reports.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome & Primary Actions Banner */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-700 to-blue-900 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-200" />
              AI Automated Damage Triage Active
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Namaste, {currentUser?.name || 'Citizen'}!
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-blue-100 leading-relaxed">
              Help keep Indian roads safe. Spot a pothole, snap a photo or scan with camera — our AI system alerts municipal engineers and assigns road contractors immediately.
            </p>
          </div>

          {/* Large Action Buttons requested in prompt */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-camera-scan-btn"
              onClick={() => setCurrentPage('camera-detection')}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow hover:bg-blue-50 transition active:scale-98"
            >
              <Camera className="h-5 w-5 text-blue-700" />
              Camera Scan Road
            </button>

            <button
              id="dash-report-pothole-btn"
              onClick={() => setCurrentPage('report-pothole')}
              className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition active:scale-98"
            >
              <PlusCircle className="h-5 w-5" />
              Report Pothole
            </button>
          </div>
        </div>
      </div>

      {/* Clean Dashboard Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Submitted</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {citizenStats.totalSubmitted}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Reports filed by you</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Resolution</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {citizenStats.pendingCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Under authority triage</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Repairs Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {citizenStats.resolvedCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Verified & resurfaced</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Severe / High Risk</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {citizenStats.severeCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Priority 24h work order</p>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Reported Potholes</h2>
            <p className="text-xs text-slate-500">
              Track live municipal progress and contractor allocations
            </p>
          </div>
          <button
            id="view-all-my-reports-btn"
            onClick={() => setCurrentPage('my-reports')}
            className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition"
          >
            View All Reports <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recentReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
            <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No reports filed yet.</p>
            <button
              onClick={() => setCurrentPage('camera-detection')}
              className="mt-3 text-xs font-bold text-blue-700 hover:underline"
            >
              Scan road now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => viewReportDetails(report.id)}
                className="group flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between cursor-pointer rounded-xl px-2 hover:bg-slate-50/80 transition"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[9px] font-bold text-white">
                      {report.aiAnalysis.confidenceScore}%
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {report.id}
                      </span>
                      <StatusBadge severity={report.severity} size="sm" />
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-1">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="truncate max-w-md">{report.location.address}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Date & Action */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                  <span className="text-[11px] font-mono text-slate-400">
                    {report.reportedAt}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:translate-x-1 transition">
                    Details <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful SIH Info Card */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Camera className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Edge Device AI Vision</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Detects pothole cavities, calculates asphalt depth, and scores confidence in sub-seconds.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Direct Municipal Connect</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Reports route straight to PWD & NHAI zonal engineers without manual bureaucrat delay.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Contractor Accountability</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tracks road defect liability periods (DLP) and penalizes delayed maintenance.
          </p>
        </div>
      </div>
    </div>
  );
};
