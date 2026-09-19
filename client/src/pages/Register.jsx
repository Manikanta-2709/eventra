import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = async (e) => { e.preventDefault(); setBusy(true);
    try {
      const u = await register({
        ...f,
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.replace(/[\s()-]/g, ''),
      });
      toast.success('Account created!');
      nav(u.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/user');
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const message = Array.isArray(validationErrors) && validationErrors.length > 0
        ? validationErrors.map((item) => item.msg).join('. ')
        : err.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally { setBusy(false); } };
  const input = 'mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100';
  return (
  <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
    <div className="flex h-48 flex-col justify-between p-6 text-white relative overflow-hidden lg:h-auto lg:p-12">
      {/* Hero background image */}
      <img
        src="/register-hero.jpg"
        alt="Conference networking scene"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/85 via-purple-800/80 to-fuchsia-900/85" />
      {/* Decorative blur */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl" />
      <Link to="/" className="relative z-10 flex items-center gap-3">
        <div className="h-11 w-11 grid place-items-center rounded-2xl bg-white text-violet-700 font-black text-2xl shadow-lg shadow-violet-900/30">E</div>
        <p className="font-black text-2xl">Eventra</p>
      </Link>
      <div className="relative z-10 hidden lg:block">
        <h1 className="text-5xl font-black leading-tight drop-shadow-lg">Create your<br />account today.</h1>
        <p className="text-purple-100/90 mt-4 max-w-md">Discover events, book in seconds, or organize your own.</p>
      </div>
      <p className="relative z-10 hidden text-xs text-purple-200 lg:block">Free for attendees · Copyright 2026 Eventra</p>
    </div>
    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-rise">
        <h2 className="text-3xl font-black dark:text-white">Join Eventra</h2>
        <form onSubmit={submit} className="mt-6 rounded-3xl border dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {['user', 'organizer'].map((v) => (
              <button type="button" key={v} onClick={() => set('role', v)}
                className={`rounded-2xl border-2 p-4 text-left capitalize font-bold text-sm ${f.role === v ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 dark:text-white' : 'border-slate-200 dark:border-slate-700 dark:text-slate-300'}`}>{v}</button>))}
          </div>
          <div><label className="text-sm font-semibold dark:text-slate-200">Full name</label>
            <input required placeholder="John Doe" value={f.name} onChange={(e) => set('name', e.target.value)} className={input} /></div>
          <div><label className="text-sm font-semibold dark:text-slate-200">Email</label>
            <input type="email" required placeholder="you@example.com" value={f.email} onChange={(e) => set('email', e.target.value)} className={input} /></div>
          <div><label className="text-sm font-semibold dark:text-slate-200">Phone</label>
            <input required placeholder="+91 98765 43210" value={f.phone} onChange={(e) => set('phone', e.target.value)} className={input} /></div>
          <div><label className="text-sm font-semibold dark:text-slate-200">Password</label>
            <div className="relative mt-2">
              <input type={show ? 'text' : 'password'} required minLength="6" placeholder="Min. 6 characters" value={f.password} onChange={(e) => set('password', e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 pr-16 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-600 px-3 py-1.5">{show ? 'HIDE' : 'SHOW'}</button>
            </div></div>
          <button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3.5 text-sm shadow-lg disabled:opacity-70">{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">Have an account? <Link to="/login" className="font-bold text-violet-600 hover:underline">Log in</Link></p>
      </div>
    </div>
  </div>);
}
