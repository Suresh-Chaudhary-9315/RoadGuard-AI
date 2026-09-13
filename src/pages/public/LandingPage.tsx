import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Camera,
  PlusCircle,
  Building2,
  HardHat,
  ArrowRight,
  CheckCircle2,
  Activity,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  Smartphone,
  CheckCircle,
} from 'lucide-react';
import { AiDetectionCard } from '../../components/common/AiDetectionCard';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, loginAs, reports } = useApp();

  const totalReported = reports.length;
  const totalResolved = reports.filter((r) => r.status === 'completed').length;
  const criticalCount = reports.filter((r) => r.severity === 'severe').length;

  const demoSample = reports[0];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Computer Vision & GIS Telemetry Engine
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Safer Indian Roads Powered by{' '}
                <span className="text-blue-700">Intelligent AI</span>
              </h1>

              <p className="max-w-2xl text-base text-slate-600 sm:text-lg leading-relaxed">
                <strong className="text-slate-900">RoadGuard AI</strong> seamlessly bridges citizens, municipal road authorities (NHAI / PWD / Municipal Corporations), and certified road contractors to detect, prioritize, and repair potholes in record time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="landing-citizen-cta"
                  onClick={() => {
                    loginAs('citizen');
                    setCurrentPage('camera-detection');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition active:scale-98"
                >
                  <Camera className="h-4 w-4" />
                  Scan Pothole with Camera
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  id="landing-authority-cta"
                  onClick={() => {
                    loginAs('authority');
                    setCurrentPage('authority-dashboard');
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
                >
                  <Building2 className="h-4 w-4 text-blue-700" />
                  Authority Dashboard (PWD/NHAI)
                </button>
              </div>

              {/* Key Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <div className="text-2xl font-black text-slate-900">{totalReported}</div>
                  <div className="text-xs text-slate-500 font-medium">Reported Issues</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-700">{totalResolved}</div>
                  <div className="text-xs text-slate-500 font-medium">Repairs Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">96.4%</div>
                  <div className="text-xs text-slate-500 font-medium">AI Vision Accuracy</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive AI Detection Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 blur-xl opacity-70" />
                <div className="relative">
                  {demoSample ? (
                    <AiDetectionCard
                      imageUrl={demoSample.imageUrl}
                      aiAnalysis={demoSample.aiAnalysis}
                      location={demoSample.location}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Quick Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Choose Portal to Explore</h2>
          <p className="text-sm text-slate-500 mt-1">
            Built specifically for citizen crowdsourcing and government oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Citizen Card */}
          <div
            onClick={() => loginAs('citizen')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-blue-600 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-blue-700 transition">
              Citizen / User Dashboard
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Capture or upload road damage with your device camera. Automated GPS tagging, instant AI severity classification, and end-to-end report tracking.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Live Camera Pothole Scanning with instant feedback
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Automatic GPS location lock & landmark identification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Track progress through verified repair milestones
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-700 group-hover:translate-x-1 transition">
              Enter Citizen Portal <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          {/* Authority Card */}
          <div
            onClick={() => loginAs('authority')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-emerald-600 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition">
              Municipal & Road Authority Dashboard
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Enterprise management suite for NHAI, PWD, and municipal road engineers. Monitor critical road zones, triage complaints, and manage contractor maintenance tenures.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Real-time road damage triage and severity filtering
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Contractor maintenance period & SLA expiry warnings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Dispatch work orders with priority and SLA deadlines
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-700 group-hover:translate-x-1 transition">
              Enter Authority Console <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Product Workflow */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              End-to-End Governance Loop
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              How RoadGuard AI Works
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white text-xs font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Scan Road</h4>
              <p className="text-xs text-slate-500">
                Citizen uses device camera or uploads road footage with auto GPS capture.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white text-xs font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Classification</h4>
              <p className="text-xs text-slate-500">
                AI model flags pothole severity (Minor, Moderate, Severe) & confidence score.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white text-xs font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Authority Verification</h4>
              <p className="text-xs text-slate-500">
                Municipal road authority verifies issue on GIS map and validates urgency.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white text-xs font-bold">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900">Contractor Assigned</h4>
              <p className="text-xs text-slate-500">
                Work order dispatched to certified road contractor under active maintenance contract.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white text-xs font-bold">
                5
              </div>
              <h4 className="text-sm font-bold text-slate-900">Repair & Audit</h4>
              <p className="text-xs text-slate-500">
                Contractor completes repair; authority inspects and closes citizen grievance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
