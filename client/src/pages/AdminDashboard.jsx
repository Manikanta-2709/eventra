import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
const tabs = ['Overview', 'Users', 'Organizers', 'Events'];
export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');
  const load = () => {
    api.get('/admin/stats').then((r) => { setStats(r.data.stats); setRecent(r.data.recentUsers); }).catch(() => {});
    api.get('/admin/users?role=user').then((r) => setUsers(r.data.users)).catch(() => {});
    api.get('/admin/users?role=organizer').then((r) => setOrgs(r.data.users)).catch(() => {});
    api.get('/admin/events').then((r) => setEvents(r.data.events)).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  const block = async (id) => { try { await api.put('/admin/users/' + id + '/block'); toast.success('Status updated'); load(); } catch (e) { toast.error('Action failed'); } };
  const approve = async (id) => { try { await api.put('/admin/organizers/' + id + '/approve'); toast.success('Approved'); load(); } catch (e) { toast.error('Action failed'); } };
  const rmEvent = async (id) => { if (!confirm('Remove this event?')) return; try { await api.delete('/admin/events/' + id); toast.success('Removed'); load(); } catch (e) { toast.error('Action failed'); } };
  const cards = stats ? [
    { l: 'Total users', v: stats.totalUsers, g: 'from-blue-500 to-indigo-500' },
    { l: 'Organizers', v: stats.totalOrganizers, g: 'from-violet-500 to-purple-500' },
    { l: 'Events', v: stats.totalEvents, g: 'from-cyan-500 to-blue-500' },
    { l: 'Bookings', v: stats.totalBookings, g: 'from-emerald-500 to-teal-500' },
    { l: 'Revenue', v: 'Rs ' + stats.totalRevenue, g: 'from-amber-500 to-orange-500' },
  ] : [];
  const filt = (list) => list.filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));
  return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Eventra control center</p>
          <h1 className="text-3xl font-black mt-1">Good morning, Admin.</h1>
          <p className="text-sm text-slate-300 mt-1">Users, organizers and events — one calm command deck.</p></div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div><p className="text-sm font-bold">All systems live</p><p className="text-xs text-slate-300">Uptime 99.99%</p></div>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 -mt-6">
      <div className="rounded-3xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (<button key={t} onClick={() => setTab(t)}
            className={'px-5 py-2.5 rounded-full text-sm font-bold ' + (tab === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')}>{t}</button>))}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
            className="ml-auto rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none w-48" />
        </div>
        {tab === 'Overview' && (
          <div className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {cards.map((c) => (
                <div key={c.l} className="rounded-3xl border border-slate-100 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-950/50">
                  <div className={'h-10 w-10 rounded-2xl bg-gradient-to-br grid place-items-center text-white font-black ' + c.g}>{c.l[0]}</div>
                  <p className="text-2xl font-black mt-3 dark:text-white">{c.v}</p>
                  <p className="text-sm font-bold dark:text-slate-200">{c.l}</p>
                </div>))}
            </div>
            <h2 className="font-black text-lg mt-8 mb-2 dark:text-white">Recent registrations</h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((u) => (
                <div key={u._id} className="flex items-center gap-3 py-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white font-bold">{u.name?.[0]}</div>
                  <div className="flex-1"><p className="font-bold text-sm dark:text-white">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 dark:text-slate-300">{u.role}</span>
                </div>))}
            </div>
          </div>)}
        {tab === 'Users' && (<div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
          {filt(users).map((u) => (
            <div key={u._id} className="flex items-center gap-3 py-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 grid place-items-center font-bold text-blue-700 dark:text-blue-300">{u.name?.[0]}</div>
              <div className="flex-1"><p className="font-bold text-sm dark:text-white">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
              <span className={'text-xs font-bold px-3 py-1 rounded-full ' + (u.isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
              <button onClick={() => block(u._id)} className="text-xs font-bold px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 dark:text-white">{u.isBlocked ? 'Unblock' : 'Block'}</button>
            </div>))}</div>)}
        {tab === 'Organizers' && (<div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
          {filt(orgs).map((o) => (
            <div key={o._id} className="flex items-center gap-3 py-3 flex-wrap">
              <div className="h-10 w-10 rounded-full bg-violet-100 grid place-items-center font-bold text-violet-700">{o.name?.[0]}</div>
              <div className="flex-1 min-w-[10rem]"><p className="font-bold text-sm dark:text-white">{o.name}</p><p className="text-xs text-slate-400">{o.email}</p></div>
              <span className={'text-xs font-bold px-3 py-1 rounded-full ' + (o.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{o.isApproved ? 'Approved' : 'Pending'}</span>
              {!o.isApproved && (<button onClick={() => approve(o._id)} className="text-xs font-bold px-4 py-2 rounded-full bg-emerald-600 text-white">Approve</button>)}
              <button onClick={() => block(o._id)} className="text-xs font-bold px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 dark:text-white">{o.isBlocked ? 'Unblock' : 'Block'}</button>
            </div>))}</div>)}
        {tab === 'Events' && (<div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
          {events.map((ev) => (
            <div key={ev._id} className="flex items-center gap-3 py-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center text-white font-black">E</div>
              <div className="flex-1"><p className="font-bold text-sm dark:text-white">{ev.title}</p><p className="text-xs text-slate-400">by {ev.organizer?.name || 'Unknown'} - {ev.city}</p></div>
              <button onClick={() => rmEvent(ev._id)} className="text-xs font-bold px-4 py-2 rounded-full bg-rose-600 text-white">Remove</button>
            </div>))}</div>)}
      </div>
      <p className="h-10" />
    </div>
  </div>);
}
