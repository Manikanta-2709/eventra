import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const EventAttendees = () => {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, checked_in, pending

  // Announcement modal state
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const fetchAttendees = () => {
    setLoading(true);
    api
      .get(`/events/${id}/attendees`)
      .then((res) => setAttendees(res.data.attendees || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendees();
  }, [id]);

  const handleToggleCheckIn = async (bookingId) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/toggle-check-in`);
      toast.success(res.data.message);
      // Update local state smoothly
      setAttendees((prev) =>
        prev.map((a) => (a._id === bookingId ? { ...a, ...res.data.booking } : a))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in update failed');
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    setSendingAnnouncement(true);
    try {
      const res = await api.post(`/events/${id}/announcements`, announcementForm);
      toast.success(res.data.message || 'Announcement sent!');
      setAnnouncementOpen(false);
      setAnnouncementForm({ title: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get(`/events/${id}/attendees/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendees-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    }
  };

  // Metrics calculation
  const totalTickets = attendees.reduce((sum, a) => sum + (a.numberOfTickets || 1), 0);
  const checkedInTickets = attendees
    .filter((a) => a.checkedIn)
    .reduce((sum, a) => sum + (a.numberOfTickets || 1), 0);
  const pendingTickets = totalTickets - checkedInTickets;
  const attendanceRate = totalTickets ? Math.round((checkedInTickets / totalTickets) * 100) : 0;

  // Filtered attendees
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      (a.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.ticketCode || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'checked_in') return a.checkedIn;
    if (filterStatus === 'pending') return !a.checkedIn;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/organizer"
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              ← Organizer Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Attendee Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time check-in rates, verify attendees, and broadcast updates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAnnouncementOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            <span>📢</span> Broadcast Update
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Live Check-in Attendance Bar */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Check-In Attendance Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {attendanceRate}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({checkedInTickets} of {totalTickets} tickets checked in)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {checkedInTickets} Checked In
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400"></span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {pendingTickets} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${attendanceRate}%` }}
          ></div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, or ticket code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'checked_in', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filterStatus === status
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Attendees Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading attendees...</div>
      ) : filteredAttendees.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          No attendees match the criteria.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-5 py-4">Attendee</th>
                <th className="px-5 py-4">Ticket Pass</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Custom Answers</th>
                <th className="px-5 py-4">Check-In Status</th>
                <th className="px-5 py-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAttendees.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{a.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{a.user?.email}</p>
                    {a.user?.phone && <p className="text-[11px] text-slate-400">{a.user.phone}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {a.tierName || 'General'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{a.numberOfTickets} seat(s) · ₹{a.totalPrice}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {a.ticketCode}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {a.customAnswers && a.customAnswers.length > 0 ? (
                      <div className="space-y-1">
                        {a.customAnswers.map((ans, i) => (
                          <div key={i}>
                            <span className="text-slate-400 font-medium">{ans.question}: </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{ans.answer || '—'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {a.checkedIn ? (
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ✓ Checked In
                        </span>
                        {a.checkedInAt && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(a.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleToggleCheckIn(a._id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        a.checkedIn
                          ? 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30'
                          : 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-500'
                      }`}
                    >
                      {a.checkedIn ? 'Undo Check-in' : 'Check In'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {announcementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Broadcast Announcement
              </h3>
              <button
                onClick={() => setAnnouncementOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Send an urgent email broadcast to all {attendees.length} confirmed attendees and post to the event bulletin.
            </p>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Title / Subject
                </label>
                <input
                  required
                  placeholder="e.g. Schedule Update, Parking Instructions"
                  value={announcementForm.title}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Message Body
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={announcementForm.message}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, message: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAnnouncement}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-500 disabled:opacity-60 transition"
                >
                  {sendingAnnouncement ? 'Sending...' : 'Send Broadcast Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAttendees;
