import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, setCurrentPage } = useApp();
  const [role, setRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(role, email, password);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const visibleRole = role === 'admin' ? 'Administrator' : role === 'authority' ? 'Road Authority' : 'Citizen';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <button
          onClick={() => setCurrentPage('landing')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Terra Scan AI
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
            {role === 'authority' ? <Building2 className="h-6 w-6" /> : role === 'admin' ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{visibleRole} Sign In</h2>
          <p className="mt-1 text-xs text-slate-500">Authentication is required before any dashboard can be opened.</p>
        </div>

        {role !== 'admin' && (
          <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => { setRole('citizen'); setError(''); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${role === 'citizen' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Smartphone className="h-4 w-4" /> Citizen
            </button>
            <button
              type="button"
              onClick={() => { setRole('authority'); setError(''); }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${role === 'authority' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Building2 className="h-4 w-4" /> Authority
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          {role === 'authority' && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
              Authority accounts cannot be created publicly. Your Terra Scan AI administrator must provision the account first.
            </div>
          )}
          {role === 'admin' && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
              Administrator credentials are configured securely on the server.
            </div>
          )}
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60 ${role === 'authority' ? 'bg-emerald-700 hover:bg-emerald-800' : role === 'admin' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              {loading ? 'Signing in...' : `Sign In as ${visibleRole}`}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {role === 'citizen' && (
            <div className="mt-6 text-center text-xs text-slate-500">
              New citizen?{' '}
              <button onClick={() => setCurrentPage('register')} className="font-bold text-blue-700 hover:underline">Create an account</button>
            </div>
          )}

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => { setRole(role === 'admin' ? 'citizen' : 'admin'); setError(''); }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
            >
              {role === 'admin' ? 'Return to user sign in' : 'Administrator access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
