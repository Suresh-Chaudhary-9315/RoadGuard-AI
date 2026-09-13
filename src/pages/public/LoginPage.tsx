import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Smartphone, Building2, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs, setCurrentPage } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'authority'>('citizen');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(role, { email });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sign in to RoadGuard AI
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Select your account to access your dashboard
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Quick Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-login-citizen"
              type="button"
              onClick={() => loginAs('citizen')}
              className="flex flex-col items-center justify-center rounded-xl border border-blue-300 bg-white p-3 text-center shadow-sm hover:border-blue-500 hover:bg-blue-50/40 transition active:scale-98"
            >
              <Smartphone className="h-5 w-5 text-blue-700 mb-1" />
              <span className="text-xs font-bold text-slate-900">Citizen Demo</span>
              <span className="text-[10px] text-slate-500">Rohan Sharma</span>
            </button>

            <button
              id="demo-login-authority"
              type="button"
              onClick={() => loginAs('authority')}
              className="flex flex-col items-center justify-center rounded-xl border border-emerald-300 bg-white p-3 text-center shadow-sm hover:border-emerald-500 hover:bg-emerald-50/40 transition active:scale-98"
            >
              <Building2 className="h-5 w-5 text-emerald-700 mb-1" />
              <span className="text-xs font-bold text-slate-900">Authority Demo</span>
              <span className="text-[10px] text-slate-500">NHAI / PWD Desk</span>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          {/* Role Toggle Tab */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setRole('citizen')}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                role === 'citizen'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Citizen Portal
            </button>
            <button
              type="button"
              onClick={() => setRole('authority')}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                role === 'authority'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Authority Console
            </button>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'authority' ? 'officer.pwd@nhai.gov.in' : 'citizen@gmail.com'
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <a href="#forgot" className="text-[11px] font-medium text-blue-700 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition active:scale-98"
            >
              Sign In to {role === 'authority' ? 'Authority Desk' : 'Citizen Dashboard'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => setCurrentPage('register')}
              className="font-bold text-blue-700 hover:underline"
            >
              Register as Citizen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
