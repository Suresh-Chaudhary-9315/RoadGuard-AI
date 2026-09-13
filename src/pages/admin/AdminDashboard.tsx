import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Loader2,
  PlusCircle,
  ShieldCheck,
  ShieldOff,
  UserPlus,
} from 'lucide-react';
import { apiClient, AuthUser } from '../../../frontend/apiClient';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const [authorities, setAuthorities] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    agency: '',
    password: '',
  });

  const loadAuthorities = async () => {
    setLoading(true);
    setError('');
    try {
      setAuthorities(await apiClient.getAuthorities());
    } catch (err: any) {
      setError(err?.message || 'Could not load authority accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthorities();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const created = await apiClient.createAuthority(form);
      setAuthorities((prev) => [created, ...prev]);
      setForm({ name: '', email: '', phone: '', agency: '', password: '' });
      setSuccess(`Authority account created for ${created.name}.`);
    } catch (err: any) {
      setError(err?.message || 'Could not create authority account.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAuthority = async (authority: AuthUser) => {
    setError('');
    setSuccess('');
    try {
      const updated = await apiClient.setAuthorityActive(authority.id, !authority.active);
      setAuthorities((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSuccess(`${updated.name} is now ${updated.active ? 'active' : 'disabled'}.`);
    } catch (err: any) {
      setError(err?.message || 'Could not update authority account.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ShieldCheck className="h-4 w-4" /> Protected Administration
            </div>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Authority Account Administration</h1>
            <p className="mt-1 text-sm text-slate-500">
              Citizens can self-register. Government authority accounts can only be created here by an administrator.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-right text-xs text-slate-500 border border-slate-200">
            <div className="font-bold text-slate-900">{currentUser?.name}</div>
            <div>{currentUser?.email}</div>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-700" />
              <div>
                <h2 className="font-bold text-slate-900">Create Authority Account</h2>
                <p className="text-xs text-slate-500">There is no public authority signup page.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Officer / Authority Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Agency / Department</label>
                <input
                  value={form.agency}
                  onChange={(e) => setForm({ ...form, agency: e.target.value })}
                  placeholder="PWD Delhi / NHAI / Municipal Corporation"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Temporary Password</label>
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-400">Minimum 8 characters. Share it securely with the authority user.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Create Authority Account
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-700" />
                <div>
                  <h2 className="font-bold text-slate-900">Registered Authorities</h2>
                  <p className="text-xs text-slate-500">{authorities.length} authority account(s)</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-14 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading accounts...
              </div>
            ) : authorities.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                No authority accounts have been created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {authorities.map((authority) => (
                  <div key={authority.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{authority.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              authority.active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {authority.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{authority.agency}</div>
                        <div className="mt-1 text-xs text-slate-400">{authority.email} • {authority.phone}</div>
                      </div>
                      <button
                        onClick={() => toggleAuthority(authority)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold ${
                          authority.active
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {authority.active ? <ShieldOff className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {authority.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
