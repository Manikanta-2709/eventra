import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getGoogleCalendarUrl, downloadICSFile } from '../utils/calendar';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [booking, setBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMode, setPaymentMode] = useState('demo');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState('');

  // Tier, Questions, & Waitlist State
  const [selectedTier, setSelectedTier] = useState(null);
  const [customAnswers, setCustomAnswers] = useState({});
  const [backupEmail, setBackupEmail] = useState('');
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  const fetchEvent = () => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => {
        const ev = res.data.event;
        setEvent(ev);
        setReviews(res.data.reviews || []);
        if (ev.ticketTiers && ev.ticketTiers.length > 0) {
          setSelectedTier(ev.ticketTiers[0]);
        }
      })
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user) {
      api.get('/users/favorites').then((res) => {
        setIsFavorite(res.data.favorites.some((f) => f._id === id));
      });
    }
  }, [user, id]);

  useEffect(() => {
    if (!scannerOpen) return;
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scanner.render(async (decodedText) => {
      try {
        const parts = decodedText.split('|');
        const ticketCode = parts.length >= 2 ? parts[1] : decodedText;
        const res = await api.post('/bookings/check-in', { ticketCode });
        setScannerMessage(res.data.message || 'Check-in successful');
        scanner.clear();
        setScannerOpen(false);
      } catch (error) {
        setScannerMessage(error.response?.data?.message || 'Scan failed');
      }
    });

    return () => scanner.clear().catch(() => {});
  }, [scannerOpen]);

  const activeUnitPrice = selectedTier ? selectedTier.price : (event?.ticketPrice || 0);
  const activeAvailableSeats = selectedTier
    ? Math.max(0, selectedTier.capacity - (selectedTier.soldCount || 0))
    : (event?.availableSeats || 0);

  const handleBook = async () => {
    if (!user) return navigate('/login');

    // Validate required custom registration questions
    if (event.customQuestions && event.customQuestions.length > 0) {
      for (const q of event.customQuestions) {
        if (q.required && (!customAnswers[q.question] || !customAnswers[q.question].trim())) {
          toast.error(`Please answer required question: "${q.question}"`);
          return;
        }
      }
    }

    setBooking(true);
    try {
      const formattedAnswers = Object.entries(customAnswers).map(([k, v]) => ({
        question: k,
        answer: v,
      }));

      const payload = {
        eventId: id,
        numberOfTickets: tickets,
        couponCode,
        paymentProvider: paymentMode,
        tierName: selectedTier ? selectedTier.name : undefined,
        customAnswers: formattedAnswers,
        backupEmail: backupEmail.trim() || undefined,
      };

      if (paymentMode === 'stripe') {
        const paymentRes = await api.post('/payments/create-session', {
          eventTitle: `${event.title} (${selectedTier?.name || 'General'})`,
          amount: activeUnitPrice * tickets,
        });
        window.location.href = paymentRes.data.url;
        return;
      }

      await api.post('/bookings', payload);
      toast.success('Booking confirmed!');
      fetchEvent();
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) return navigate('/login');
    setJoiningWaitlist(true);
    try {
      await api.post(`/events/${id}/waitlist`, {
        tierName: selectedTier ? selectedTier.name : 'General',
      });
      toast.success('Added to waitlist! We will notify you by email if a spot opens up.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return navigate('/login');
    const res = await api.post(`/users/favorites/${id}`);
    setIsFavorite(res.data.favorites.some((f) => f === id || f._id === id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      const res = await api.post(`/events/${id}/reviews`, reviewForm);
      setEvent(res.data.event);
      toast.success('Thanks for your review!');
      setReviewForm({ rating: 5, comment: '' });
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate-500">Loading event...</div>;
  if (!event) return <div className="max-w-5xl mx-auto px-6 py-16 text-center text-slate-500">Event not found.</div>;

  const isTierSoldOut = activeAvailableSeats <= 0;
  const isOverallSoldOut = event.availableSeats <= 0;
  const isSoldOut = selectedTier ? isTierSoldOut : isOverallSoldOut;
  const past = new Date(event.date) < new Date();
  const ratingSummary =
    event.reviewsCount > 0
      ? `★ ${event.averageRating} from ${event.reviewsCount} review${event.reviewsCount === 1 ? '' : 's'}`
      : 'No reviews yet';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Banner */}
      <div className="rounded-3xl overflow-hidden h-72 md:h-96 bg-slate-200 dark:bg-slate-800 mb-8 relative shadow-lg">
        {event.banner?.url ? (
          <img src={event.banner.url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-600 to-indigo-700 text-white font-bold text-3xl">
            {event.title}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {event.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-1 mb-3 text-slate-900 dark:text-white">
              {event.title}
            </h1>
            <p className="mb-4 text-sm font-semibold text-amber-500">{ratingSummary}</p>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>

            {/* Quick Metadata */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8 text-sm border-t border-slate-200 dark:border-slate-800 pt-6">
              <div>
                <span className="text-slate-400 block text-xs">Venue</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{event.venue}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">City</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{event.city}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Date & Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at {event.time}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Organizer</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{event.organizer?.name}</span>
              </div>
            </div>

            {/* Calendar Sync Shortcuts */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-slate-400">Add to Calendar:</span>
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <span>📅</span> Google Calendar
              </a>
              <button
                type="button"
                onClick={() => downloadICSFile(event)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <span>💾</span> Apple / Outlook (.ics)
              </button>
            </div>
          </div>

          {/* Organizer Announcements Feed */}
          {event.announcements && event.announcements.length > 0 && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📢</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Announcements from Organizer
                </h3>
              </div>
              <div className="space-y-4">
                {event.announcements.map((ann, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-indigo-100 bg-white p-4 shadow-xs dark:border-indigo-900/40 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{ann.title}</h4>
                      <span className="text-xs text-slate-400">
                        {new Date(ann.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                      {ann.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Tiers Selection Cards */}
          {event.ticketTiers && event.ticketTiers.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Choose Ticket Tier</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {event.ticketTiers.map((tier, idx) => {
                  const remaining = Math.max(0, tier.capacity - (tier.soldCount || 0));
                  const isSelected = selectedTier?.name === tier.name;
                  const isSold = remaining <= 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTier(tier)}
                      className={`cursor-pointer rounded-2xl border p-4 transition relative ${
                        isSelected
                          ? 'border-primary-600 ring-2 ring-primary-500/20 bg-primary-50/30 dark:bg-primary-950/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{tier.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{tier.description || 'Access pass'}</p>
                        </div>
                        <span className="text-base font-black text-primary-600 dark:text-primary-400">
                          {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className={isSold ? 'text-rose-500 font-semibold' : 'text-slate-500'}>
                          {isSold ? 'Sold out' : `${remaining} spot${remaining === 1 ? '' : 's'} remaining`}
                        </span>
                        {isSelected && (
                          <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Questions Section */}
          {event.customQuestions && event.customQuestions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registration Questions
              </h3>
              <div className="space-y-3">
                {event.customQuestions.map((q, idx) => (
                  <div key={idx}>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {q.question} {q.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      required={q.required}
                      placeholder="Your answer"
                      value={customAnswers[q.question] || ''}
                      onChange={(e) =>
                        setCustomAnswers({ ...customAnswers, [q.question]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Checkout Card */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-fit sticky top-24 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {selectedTier ? selectedTier.name : 'General'} Pass
            </span>
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {activeUnitPrice === 0 ? 'Free' : `₹${activeUnitPrice}`}
            </p>
          </div>

          {event.registrationClosed || past ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold"
            >
              {past ? 'Event ended' : 'Registration closed'}
            </button>
          ) : isSoldOut ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 font-medium">
                Tickets for this pass are currently sold out.
              </div>
              <button
                type="button"
                onClick={handleJoinWaitlist}
                disabled={joiningWaitlist}
                className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold shadow-md hover:bg-amber-500 transition disabled:opacity-60"
              >
                {joiningWaitlist ? 'Joining...' : 'Join Ticket Waitlist'}
              </button>
            </div>
          ) : (
            <>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Number of tickets (Max: {activeAvailableSeats})
              </label>
              <input
                type="number"
                min={1}
                max={activeAvailableSeats}
                value={tickets}
                onChange={(e) =>
                  setTickets(Math.max(1, Math.min(activeAvailableSeats, Number(e.target.value))))
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent mb-4 text-sm font-semibold"
              />

              <label className="text-xs font-semibold text-slate-500 block mb-1">Coupon code</label>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMO2026"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent mb-3 text-sm uppercase font-mono"
              />

              <label className="text-xs font-semibold text-slate-500 block mb-1">Payment method</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent mb-5 text-sm"
              >
                <option value="demo" className="dark:bg-slate-900">Demo Instant Payment</option>
                <option value="stripe" className="dark:bg-slate-900">Stripe Checkout (Card)</option>
              </select>

              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Backup Email <span className="text-[10px] font-normal text-slate-400">(Optional — receive duplicate QR pass)</span>
              </label>
              <input
                type="email"
                placeholder="secondary@example.com"
                value={backupEmail}
                onChange={(e) => setBackupEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent mb-4 text-sm"
              />

              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold shadow-md hover:bg-primary-500 disabled:opacity-60 transition text-sm"
              >
                {booking ? 'Booking...' : `Book Now · ₹${activeUnitPrice * tickets}`}
              </button>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => {
                navigator.share?.({
                  title: event.title,
                  text: `Join ${event.title}`,
                  url: window.location.href,
                });
              }}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Share Event
            </button>

            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <button
                onClick={() => setScannerOpen(true)}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                Scan Ticket QR
              </button>
            )}

            <button
              onClick={toggleFavorite}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              {isFavorite ? '♥ Saved to favorites' : '♡ Save to favorites'}
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal / Section */}
      {scannerOpen && (
        <div className="mt-8 rounded-3xl border border-slate-200 p-6 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Check-in Scanner</h2>
            <button onClick={() => setScannerOpen(false)} className="text-sm font-semibold text-primary-600">
              Close Scanner
            </button>
          </div>
          <div id="qr-reader" className="w-full max-w-md mx-auto" />
          {scannerMessage && <p className="mt-3 text-sm text-center font-bold text-emerald-600">{scannerMessage}</p>}
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet. Book the event and be the first to share feedback.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{review.user?.name || 'Attendee'}</p>
                    <span className="text-sm font-semibold text-amber-500">★ {review.rating}</span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleReviewSubmit} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 h-fit bg-white dark:bg-slate-900">
          <h3 className="font-bold mb-2 text-slate-900 dark:text-white">Add Your Review</h3>
          <p className="text-xs text-slate-500 mb-4">Only verified attendees can leave reviews.</p>
          <label className="text-xs text-slate-500 block mb-1">Rating</label>
          <select
            value={reviewForm.rating}
            onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent mb-4 text-sm"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating} className="dark:bg-slate-900">
                {rating} Star{rating === 1 ? '' : 's'}
              </option>
            ))}
          </select>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            maxLength={600}
            rows={4}
            placeholder="Share your experience..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent mb-4 text-sm"
          />
          <button
            disabled={submittingReview}
            className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60 transition text-sm"
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventDetails;
