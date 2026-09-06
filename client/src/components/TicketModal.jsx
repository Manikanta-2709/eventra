import { useRef } from 'react';

const TicketModal = ({ booking, onClose }) => {
  const ticketRef = useRef();

  if (!booking) return null;

  const event = booking.event || {};
  const ticketCode = booking.ticketCode || `EVT-${booking._id.slice(-8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Official E-Ticket
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div ref={ticketRef} id="printable-ticket" className="p-6">
          <div className="rounded-2xl border-2 border-dashed border-primary-500/40 bg-gradient-to-br from-primary-50/50 via-white to-indigo-50/40 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/20">
            {/* Top Row: Event name and tier */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded-md bg-primary-600 px-2.5 py-0.5 text-xs font-semibold text-white uppercase tracking-wide">
                  {booking.tierName || 'General Admission'}
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {event.title || 'Event Confirmation'}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-mono">Price</span>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">₹{booking.totalPrice}</p>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                  {event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{event.time || ''}</p>
              </div>

              <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Venue & City</p>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {event.venue || 'Venue'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{event.city || ''}</p>
              </div>

              <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Attendee</p>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {booking.user?.name || 'Attendee'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{booking.numberOfTickets} Ticket(s)</p>
              </div>

              <div className="rounded-xl bg-white/80 p-3 shadow-xs dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Status</p>
                <p className="mt-0.5 font-semibold capitalize text-emerald-600 dark:text-emerald-400">
                  {booking.bookingStatus}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {booking.checkedIn ? '✓ Checked In' : 'Entry pending'}
                </p>
              </div>
            </div>

            {/* QR Code and Code Section */}
            <div className="mt-6 flex flex-col items-center justify-center border-t border-dashed border-slate-300 dark:border-slate-700 pt-5">
              {booking.qrCodeData ? (
                <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-200">
                  <img src={booking.qrCodeData} alt="Ticket QR" className="h-32 w-32 object-contain" />
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
                  QR Pending
                </div>
              )}
              <div className="mt-3 text-center">
                <span className="font-mono text-xs text-slate-400 tracking-wider">TICKET CODE</span>
                <p className="font-mono text-base font-extrabold tracking-widest text-slate-900 dark:text-white">
                  {ticketCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
