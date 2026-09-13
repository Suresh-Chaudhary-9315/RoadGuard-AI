import React from 'react';
import { PotholeSeverity, ReportStatus, Priority } from '../../types';

interface StatusBadgeProps {
  status?: ReportStatus;
  severity?: PotholeSeverity;
  priority?: Priority;
  contractStatus?: 'active' | 'expiring_soon' | 'expired';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  severity,
  priority,
  contractStatus,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  if (severity) {
    const config = {
      minor: {
        label: 'Minor',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
        dot: 'bg-emerald-500',
      },
      moderate: {
        label: 'Moderate',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10',
        dot: 'bg-amber-500',
      },
      severe: {
        label: 'Severe',
        bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10',
        dot: 'bg-rose-500',
      },
    }[severity];

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${config.bg} ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  if (status) {
    const config: Record<ReportStatus, { label: string; bg: string; dot: string }> = {
      reported: {
        label: 'Reported',
        bg: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-400/20',
        dot: 'bg-slate-400',
      },
      verified: {
        label: 'Verified',
        bg: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/10',
        dot: 'bg-sky-500',
      },
      assigned: {
        label: 'Assigned',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10',
        dot: 'bg-indigo-500',
      },
      in_progress: {
        label: 'Repair Started',
        bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-600/10',
        dot: 'bg-amber-500 animate-pulse',
      },
      completed: {
        label: 'Completed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10',
        dot: 'bg-emerald-500',
      },
      rejected: {
        label: 'Closed / Rejected',
        bg: 'bg-zinc-100 text-zinc-600 border-zinc-200 ring-zinc-400/10',
        dot: 'bg-zinc-400',
      },
    };

    const current = config[status] || config.reported;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${current.bg} ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
        {current.label}
      </span>
    );
  }

  if (priority) {
    const config: Record<Priority, { label: string; bg: string }> = {
      low: { label: 'Low', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
      medium: { label: 'Medium', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
      high: { label: 'High', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
      critical: { label: 'Critical', bg: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
    };
    const current = config[priority];
    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${current.bg}`}>
        {current.label}
      </span>
    );
  }

  if (contractStatus) {
    const config = {
      active: {
        label: 'Active Contract',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      },
      expiring_soon: {
        label: 'Expiring Soon (Warning)',
        bg: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        dot: 'bg-amber-600 animate-ping',
      },
      expired: {
        label: 'Contract Expired',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      },
    }[contractStatus];

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${config.bg} ${sizeClasses}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  return null;
};
