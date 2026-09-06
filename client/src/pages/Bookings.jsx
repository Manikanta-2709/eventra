import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import TicketModal from '../components/TicketModal';
import CertificateModal from '../components/CertificateModal';
import ResendTicketEmailModal from '../components/ResendTicketEmailModal';
import { getGoogleCalendarUrl, downloadICSFile } from '../utils/calendar';

const qrSize = 100;

const statusColor = {
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [emailModalBooking, setEmailModalBooking] = useState(null);

  const ticketCodeFor = (booking) => booking.ticketCode || `EVT-${booking._id.slice(-8).toUpperCase()}`;

  const fetchBookings = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then((res) => setBookings(res.data.bookings))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking? A refund will be processed.')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your tickets, downloadable passes, calendar invites, and attendance certificates
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <p className="text-slate-500 font-medium">No bookings yet.</p>
          <a
            href="/events"
            className="mt-4 inline-block rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition"
          >
            Explore Events
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isConfirmed = b.bookingStatus === 'confirmed';
            return (
              <div
                key={b._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Left details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${statusColor[b.bookingStatus]}`}
                    >
                      {b.bookingStatus}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {b.tierName || 'General'} Pass
                    </span>
                    {b.checkedIn && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1">
                        ✓ Checked In
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {b.event?.title || 'Event Removed'}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {b.event && (
                      <>
                        {new Date(b.event.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at {b.event.time} · {b.event.venue}, {b.event.city}
                      </>
                    )}
                  </p>

                  <p className="text-xs text-slate-500">
                    {b.numberOfTickets} ticket(s) · Paid ₹{b.totalPrice} via {b.paymentProvider}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                      Code: {ticketCodeFor(b)}
                    </span>
                    {/* Add to Calendar links */}
                    {isConfirmed && b.event && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <a
                          href={getGoogleCalendarUrl(b.event)}
                          target="_blank"
                          rel="noreferrer"
                          title="Add to Google Calendar"
                          className="text-slate-400 hover:text-primary-600 transition text-[11px]"
                        >
                          Google Cal
                        </a>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <button
                          type="button"
                          onClick={() => downloadICSFile(b.event)}
                          title="Download iCal (.ics) file"
                          className="text-slate-400 hover:text-primary-600 transition text-[11px]"
                        >
                          .ics
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setSelectedTicket(b)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-3.5 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:hover:bg-primary-900/60 transition"
                  >
                    <span>🎫</span> View E-Ticket
                  </button>

                  <button
                    onClick={() => setEmailModalBooking(b)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
                    title="Email pass with QR code to primary or backup email"
                  >
                    <span>📧</span> Email Pass
                  </button>

                  {/* Certificate button if checked in */}
                  {b.checkedIn && (
                    <button
                      onClick={() => setSelectedCertId(b._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60 transition border border-amber-200 dark:border-amber-900/50"
                    >
                      <span>🏆</span> Certificate
                    </button>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal booking={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}

      {/* Certificate Modal */}
      {selectedCertId && (
        <CertificateModal
          bookingId={selectedCertId}
          onClose={() => setSelectedCertId(null)}
        />
      )}

      {/* Resend / Backup Email Modal */}
      {emailModalBooking && (
        <ResendTicketEmailModal
          booking={emailModalBooking}
          isOpen={!!emailModalBooking}
          onClose={() => setEmailModalBooking(null)}
          onUpdated={(updated) => {
            setBookings((prev) =>
              prev.map((item) => (item._id === updated._id ? updated : item))
            );
          }}
        />
      )}
    </div>
  );
};

export default Bookings;
