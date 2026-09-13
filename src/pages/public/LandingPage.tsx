import React from 'react';
import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  Database,
  LockKeyhole,
  MapPin,
  ShieldAlert,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
              <Sparkles className="h-3.5 w-3.5" /> Smart India Hackathon 2026 Prototype
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Road damage reporting with <span className="text-blue-700">AI, GPS and accountable repair tracking.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Terra Scan AI connects citizens and verified road authorities through one controlled workflow: detect or report a pothole, geo-tag it, notify the authority, assign maintenance work, and track resolution.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentPage('login')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800"
              >
                Citizen Sign In <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-800 hover:bg-blue-100"
              >
                <UserPlus className="h-4 w-4" /> Create Citizen Account
              </button>
              <button
                onClick={() => setCurrentPage('login')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <Building2 className="h-4 w-4 text-emerald-700" /> Authority Sign In
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Authority registration is intentionally unavailable to the public. Authority accounts are provisioned by the Terra Scan AI administrator.
            </p>
          </div>

          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold">Terra Scan AI Secure Workflow</div>
                  <div className="text-xs text-slate-400">Role-based access • persistent MongoDB</div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <FlowItem icon={<Camera className="h-4 w-4" />} title="1. Detect or report" text="Citizen camera scan or manual road-damage report." />
                <FlowItem icon={<MapPin className="h-4 w-4" />} title="2. Geo-tag & store" text="Location and report ownership are stored in MongoDB." />
                <FlowItem icon={<Building2 className="h-4 w-4" />} title="3. Authority triage" text="Verified authority accounts review and assign work." />
                <FlowItem icon={<CheckCircle2 className="h-4 w-4" />} title="4. Track resolution" text="Citizen sees status updates only for their own reports." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Camera className="h-5 w-5" />}
            title="AI-assisted detection"
            text="Camera images can be analysed by the deployed pothole model before a report is submitted."
          />
          <FeatureCard
            icon={<Database className="h-5 w-5" />}
            title="Persistent report lifecycle"
            text="Reports, contractors, status history and notifications are persisted instead of relying on demo memory data."
          />
          <FeatureCard
            icon={<LockKeyhole className="h-5 w-5" />}
            title="Controlled role access"
            text="Citizen, authority and administrator privileges are separated at both the interface and API layers."
          />
        </div>
      </section>
    </div>
  );
};

const FlowItem: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300">{icon}</div>
    <div>
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="mt-0.5 text-xs leading-5 text-slate-400">{text}</div>
    </div>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>
    <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
  </div>
);
