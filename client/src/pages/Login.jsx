import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true);
    try { const u = await login(f.email.trim(), f.password); toast.success('Welcome back!');
      nav({ admin: '/dashboard/admin', organizer: '/dashboard/organizer', user: '/dashboard/user' }[u.role] || '/');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); } finally { setBusy(false); } };
  return (
  <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
    <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
      {/* Hero background image */}
      <img
        src="/login-hero.jpg"
        alt="Concert event atmosphere"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-800/80 to-violet-900/85" />
      {/* Decorative blurs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <Link to="/" className="relative z-10 flex items-center gap-3">
        <div className="h-11 w-11 grid place-items-center rounded-2xl bg-white text-blue-700 font-black text-2xl shadow-lg shadow-blue-900/30">E</div>
        <div><p className="font-black text-2xl leading-none">Eventra</p><p className="text-[11px] tracking-[0.25em] text-blue-200 uppercase">More than events</p></div>
      </Link>
      <div className="relative z-10">
        <h1 className="text-5xl font-black leading-tight mt-6 drop-shadow-lg">Welcome back<br />to the celebration.</h1>
        <p className="text-blue-100/90 mt-4 max-w-md">Log in to manage bookings, track events and pick up where the music left off.</p>
        <div className="flex flex-col gap-3 mt-8 max-w-md">
          <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-sm">
            <span className="text-lg">🎫</span>
            <p className="text-sm text-blue-100">Instant e-tickets with QR check-in</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-sm">
            <span className="text-lg">📅</span>
            <p className="text-sm text-blue-100">Sync events to your calendar</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-sm">
            <span className="text-lg">🏆</span>
            <p className="text-sm text-blue-100">Attendance certificates after events</p>
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-rise">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Sign in</p>
        <h2 className="text-3xl sm:text-4xl font-black mt-2 dark:text-white">Good to see you again</h2>
        <p className="text-sm text-slate-500 mt-2">Enter your credentials to continue.</p>
        <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xl shadow-blue-600/5">
          <div><label className="text-sm font-semibold dark:text-slate-200">Email address</label>
            <input type="email" required placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950" /></div>
          <div><div className="flex justify-between items-center"><label className="text-sm font-semibold dark:text-slate-200">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">Forgot password?</Link></div>
            <div className="relative mt-2">
              <input type={show ? 'text' : 'password'} required placeholder="••••••••" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3.5 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50">{show ? 'HIDE' : 'SHOW'}</button>
            </div></div>
          <button disabled={busy} className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 active:scale-[0.99] disabled:opacity-70">
            {busy ? 'Signing you in…' : 'Log in →'}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">New to Eventra? <Link to="/register" className="font-bold text-blue-600 hover:underline">Create an account</Link></p>
      </div>
    </div>
  </div>);
}
