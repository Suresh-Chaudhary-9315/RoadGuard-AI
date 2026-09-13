import React, { useState } from 'react';
import { Mail, X, CheckCircle2, AlertTriangle, Send, ExternalLink, Calendar, MapPin, Eye } from 'lucide-react';
import { EmailAlertLog } from '../../types';

interface AuthorityEmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailAlerts: EmailAlertLog[];
}

export const AuthorityEmailInboxModal: React.FC<AuthorityEmailInboxModalProps> = ({
  isOpen,
  onClose,
  emailAlerts,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<EmailAlertLog | null>(
    emailAlerts[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Authority Road Safety Dispatch Inbox</h2>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 border border-blue-400/30">
                  {emailAlerts.length} Automated Alerts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official email notifications dispatched to Road Authorities when potholes are detected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body: 2 Columns (Email List & Preview) */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-12">
          {/* Left Email List */}
          <div className="border-r border-slate-200 bg-slate-50/50 p-4 md:col-span-5 overflow-y-auto space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              Recent Dispatches ({emailAlerts.length})
            </div>

            {emailAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Mail className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                No email dispatches yet. Detect a pothole using the Camera or Report form to trigger an alert!
              </div>
            ) : (
              emailAlerts.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isSevere = email.severity === 'severe';

                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition ${
                      isSelected
                        ? 'border-blue-500 bg-white shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-slate-500">
                        {email.reportId}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isSevere
                            ? 'bg-rose-100 text-rose-700'
                            : email.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {email.severity}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-bold text-slate-900 line-clamp-1">
                      {email.subject}
                    </h4>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      {email.roadName}
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
                      <span>To: {email.to}</span>
                      <span>{email.sentAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Email Preview */}
          <div className="flex flex-col md:col-span-7 bg-white overflow-y-auto">
            {selectedEmail ? (
              <div className="p-6 space-y-4">
                {/* Meta details */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{selectedEmail.subject}</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Delivered
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400">From:</span> {selectedEmail.from}
                    </div>
                    <div>
                      <span className="text-slate-400">To:</span> <strong className="text-slate-900">{selectedEmail.to}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Sent:</span> {selectedEmail.sentAt}
                    </div>
                    <div>
                      <span className="text-slate-400">Coordinates:</span> {selectedEmail.coordinates.lat.toFixed(4)}°N, {selectedEmail.coordinates.lng.toFixed(4)}°E
                    </div>
                  </div>
                </div>

                {/* Rendered HTML Email Content Preview */}
                <div className="border border-slate-200 rounded-2xl p-4 overflow-x-auto bg-slate-50/40">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Official Dispatched Email Preview
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-xs text-slate-400">
                Select an email from the left pane to preview the dispatched authority notice.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
          <span>Terra Scan AI &bull; Official Dispatch Record</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-1.5 font-bold text-white hover:bg-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
