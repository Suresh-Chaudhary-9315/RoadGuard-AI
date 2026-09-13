import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, Mail, Phone, ShieldAlert, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { registerCitizen, setCurrentPage } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerCitizen({ name, email, phone, password });
    } catch (err: any) {
      setError(err?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <button onClick={() => setCurrentPage('landing')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to RoadGuard AI
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Create Citizen Account</h2>
          <p className="mt-1 text-xs text-slate-500">Citizen registration only. Authority accounts are created by an administrator.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{error}</div>}
          <form onSubmit={handleRegister} className="space-y-4">
            <Field icon={<User className="h-4 w-4" />} label="Full Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />} label="Email Address">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
            </Field>
            <Field icon={<Phone className="h-4 w-4" />} label="Mobile Number">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Confirm Password">
              <input type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" required />
            </Field>

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">
              {loading ? 'Creating Account...' : 'Create Citizen Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <button onClick={() => setCurrentPage('login')} className="font-bold text-blue-700 hover:underline">Sign in</button>
          </div>
        </div>
      </div>
      <style>{`.input{width:100%;border-radius:.75rem;border:1px solid rgb(203 213 225);background:white;padding:.625rem .75rem .625rem 2.25rem;font-size:.875rem;outline:none}.input:focus{border-color:rgb(37 99 235);box-shadow:0 0 0 2px rgb(37 99 235 / .2)}`}</style>
    </div>
  );
};

const Field: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-3 text-slate-400">{icon}</div>
      {children}
    </div>
  </div>
);
