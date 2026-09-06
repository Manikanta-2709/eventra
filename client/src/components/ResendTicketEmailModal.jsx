import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ResendTicketEmailModal = ({ booking, isOpen, onClose, onUpdated }) => {
  const [backupEmail, setBackupEmail] = useState(booking?.backupEmail || '');
  const [sending, setSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setPreviewUrl(null);
    try {
      const res = await api.post(`/bookings/${booking._id}/resend-email`, {
        backupEmail: backupEmail.trim() || undefined,
      });

      toast.success(res.data.message || 'Ticket pass sent to your email!');

      if (res.data.emailResult?.previewUrl) {
        setPreviewUrl(res.data.emailResult.previewUrl);
      }

      if (onUpdated) {
        onUpdated({ ...booking, backupEmail: res.data.backupEmail || backupEmail });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send ticket email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              📧
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Email Ticket Pass & QR
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Send your official digital pass to primary or backup email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Event Summary Card */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Ticket #{booking.ticketCode}
          </span>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {booking.event?.title}
          </h4>
          <p className="text-[11px] text-slate-500">
            {booking.numberOfTickets} ticket(s) • {booking.tierName || 'General'} Tier
          </p>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Account Email:
            </label>
            <input
              disabled
              value={booking.user?.email || 'Your account email'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-slate-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Backup / Alternate Email (Optional):
            </label>
            <input
              type="email"
              placeholder="e.g. secondary@gmail.com or work email"
              value={backupEmail}
              onChange={(e) => setBackupEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If provided, an identical pass with QR code will also be delivered here.
            </p>
          </div>

          {previewUrl && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                ✓ Email Delivered!
              </span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
              >
                🔗 Click here to preview rendered email with QR code →
              </a>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md shadow-blue-500/25 disabled:opacity-60"
            >
              {sending ? 'Sending...' : '⚡ Send Ticket Email Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResendTicketEmailModal;
