import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HardHat,
  Building,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  PlusCircle,
  ChevronLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Contractor } from '../../types';

export const ContractorManagementPage: React.FC = () => {
  const { contractors, setCurrentPage, reports } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredContractors = contractors.filter((c) => {
    if (statusFilter !== 'all' && c.contractStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.contractorName.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.assignedRoads.some((r) => r.toLowerCase().includes(q)) ||
        c.zone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const expiringSoonCount = contractors.filter((c) => c.contractStatus === 'expiring_soon').length;

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
            <HardHat className="h-6 w-6 text-blue-700" />
            Road Contractor & Maintenance Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitor contractor performance, assigned road stretches, and Defect Liability Period (DLP) tenures
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
        >
          <PlusCircle className="h-4 w-4" />
          Enlist Contractor
        </button>
      </div>

      {/* Expiry Warning Callout Banner (Prompt Requirement) */}
      {expiringSoonCount > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-200 text-amber-900 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                <span>Contract Expiry Warning Triggered</span>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] text-amber-900 font-bold">
                  {expiringSoonCount} Contractor(s)
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Contractors with active maintenance tenure expiring within 30 days are highlighted with amber warning badges below. Authorities should schedule road quality re-audits or initiate contract renewals immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contractor name, company, road name (e.g. NH-48)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All Contracts</option>
            <option value="active">Active Only</option>
            <option value="expiring_soon">Expiring Soon (Warning)</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Contractor Cards Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredContractors.map((c) => {
          const isExpiringSoon = c.contractStatus === 'expiring_soon';
          const isExpired = c.contractStatus === 'expired';

          return (
            <div
              key={c.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md space-y-4 ${
                isExpiringSoon
                  ? 'border-amber-300 ring-2 ring-amber-200/50'
                  : isExpired
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Header: Company & Contract Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      isExpiringSoon
                        ? 'bg-amber-100 text-amber-800'
                        : isExpired
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.companyName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">Contractor: {c.contractorName}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">{c.id}</span>
                    </div>
                  </div>
                </div>

                <StatusBadge contractStatus={c.contractStatus} size="sm" />
              </div>

              {/* Explicit Example Display Card (as requested in prompt) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contract Maintenance Terms
                </div>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">Contractor:</span>{' '}
                    <strong className="text-slate-900">{c.companyName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>{' '}
                    <strong className={isExpiringSoon ? 'text-amber-700' : isExpired ? 'text-rose-700' : 'text-emerald-700'}>
                      {c.contractStatus === 'expiring_soon' ? 'Warning (Expiring Soon)' : c.contractStatus === 'expired' ? 'Expired' : 'Active'}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    Maintenance Period:
                  </span>
                  <span className="font-bold text-slate-900">
                    {c.maintenanceStartDate} — {c.maintenanceExpiryDate}
                  </span>
                </div>

                {isExpiringSoon && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-amber-100/70 p-2 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0" />
                    <span>Warning: Contract expires soon! Quality inspection audit required.</span>
                  </div>
                )}
              </div>

              {/* Assigned Roads List */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Road Stretches:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.assignedRoads.map((road, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs"
                    >
                      {road}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics & Performance */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
                <div className="rounded-xl bg-slate-50 p-2 text-xs">
                  <div className="text-slate-400 text-[10px]">Active Repairs</div>
                  <div className="text-sm font-bold text-blue-700 mt-0.5">
                    {c.activeProjectsCount}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-xs">
                  <div className="text-slate-400 text-[10px]">Completed</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">
                    {c.completedRepairsCount}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 text-xs">
                  <div className="text-slate-400 text-[10px]">SLA Adherence</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {c.slaAdherenceRate}%
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${c.phone}`}
                    className="flex items-center gap-1 hover:text-blue-700 font-medium"
                  >
                    <Phone className="h-3 w-3 text-slate-400" />
                    {c.phone}
                  </a>
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-1 hover:text-blue-700 font-medium"
                  >
                    <Mail className="h-3 w-3 text-slate-400" />
                    {c.email}
                  </a>
                </div>

                <span className="text-[11px] text-slate-400">{c.zone}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enlist Contractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Enlist Road Maintenance Contractor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Contractor onboarding is verified via NHAI & Ministry of Road Transport credentials.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. National Highways Roadtech Ltd"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Highway Stretch</label>
                <input
                  type="text"
                  placeholder="e.g. NH-48 Sector 21 to Rajiv Chowk"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contract Start Date</label>
                  <input
                    type="date"
                    defaultValue="2026-01-01"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    defaultValue="2027-12-31"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
                >
                  Register Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
