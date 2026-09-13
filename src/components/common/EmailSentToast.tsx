import React from 'react';
import { Mail, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { EmailAlertLog } from '../../types';

interface EmailSentToastProps {
  emailAlert: EmailAlertLog | null;
  onDismiss: () => void;
  onViewInbox: () => void;
}

export const EmailSentToast: React.FC<EmailSentToastProps> = ({
  emailAlert,
  onDismiss,
  onViewInbox,
}) => {
  if (!emailAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-2xl border-2 border-blue-600 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white flex-shrink-0 shadow-md">
          <Mail className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Email Alert Dispatched
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h4 className="text-xs font-bold text-slate-900">
            Road Authority Notified via Email
          </h4>
          <p className="text-[11px] text-slate-600 leading-tight">
            An official hazardous road defect notice for <strong>{emailAlert.roadName}</strong> was dispatched to <span className="font-mono font-medium text-blue-700">{emailAlert.to}</span> with GPS coordinates & image.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-[10px] text-slate-400 font-mono">Ref: {emailAlert.reportId}</span>
            <button
              onClick={() => {
                onDismiss();
                onViewInbox();
              }}
              className="flex items-center gap-1 font-bold text-blue-700 hover:text-blue-800 transition"
            >
              View Email Notice <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
