import React from 'react';
import { ReportStatus, TimelineEvent } from '../../types';
import {
  FileText,
  CheckCircle,
  HardHat,
  Wrench,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';

interface MaintenanceTimelineProps {
  currentStatus: ReportStatus;
  timeline: TimelineEvent[];
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({
  currentStatus,
  timeline,
}) => {
  const steps: { key: ReportStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'reported', label: 'Reported', icon: <FileText className="h-4 w-4" /> },
    { key: 'verified', label: 'Verified', icon: <CheckCircle className="h-4 w-4" /> },
    { key: 'assigned', label: 'Assigned', icon: <HardHat className="h-4 w-4" /> },
    { key: 'in_progress', label: 'Repair Started', icon: <Wrench className="h-4 w-4" /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const statusOrder: Record<ReportStatus, number> = {
    reported: 0,
    verified: 1,
    assigned: 2,
    in_progress: 3,
    completed: 4,
    rejected: -1,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className="space-y-6">
      {/* 5-Step Visual Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">
          Road Maintenance Lifecycle
        </h4>

        {/* Desktop / Tablet Horizontal Stepper */}
        <div className="relative flex items-center justify-between">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-1 -translate-y-1/2 bg-slate-100 z-0">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`,
              }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-sm ${
                    isCompleted
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isCurrent
                      ? 'border-blue-600 bg-white text-blue-600 ring-4 ring-blue-100'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold whitespace-nowrap text-center ${
                    isCurrent
                      ? 'text-blue-700 font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-blue-600 font-medium">In Progress</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Audit & Event History
        </h4>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative group">
              {/* Event Marker */}
              <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-blue-50">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-slate-900">{event.label}</h5>
                  <span className="text-[11px] font-mono text-slate-400">{event.timestamp}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-700">{event.actor}</span>
                </div>
                {event.note && (
                  <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 mt-1">
                    {event.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
