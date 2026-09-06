import { Link } from 'react-router-dom';

const categoryColors = {
  Music: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  Tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Sports: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Arts: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const EventCard = ({ event }) => {
  const date = new Date(event.date);
  const soldOut = event.availableSeats <= 0;
  const hasReviews = event.reviewsCount > 0;
  const fallbackUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80';

  return (
    <Link
      to={`/events/${event._id}`}
      className="group block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={event.banner?.url || fallbackUrl}
          alt={event.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackUrl;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Date Stamp Badge */}
        <div className="absolute top-3 left-3 flex flex-col items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl px-2.5 py-1 shadow-sm border border-white/40 dark:border-slate-800">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
            {date.toLocaleString('default', { month: 'short' }).toUpperCase()}
          </span>
          <span className="text-base font-display font-black leading-none text-slate-900 dark:text-white">
            {date.getDate()}
          </span>
        </div>

        {/* Price or Sold Out Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {soldOut ? (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              Sold Out
            </span>
          ) : (
            <span className="bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-sm">
              {event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md mb-2 ${categoryColors[event.category] || categoryColors.Other}`}>
            {event.category}
          </span>
          <h3 className="font-display font-bold text-base leading-snug line-clamp-1 group-hover:text-blue-600 transition">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
            <span>📍</span> {event.venue}, {event.city}
          </p>

          {/* Seat Progress Bar */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Seats</span>
              <span className={soldOut ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
                {soldOut ? 'Full' : `${event.availableSeats} left`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  soldOut
                    ? 'bg-rose-500 w-full'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}
                style={{
                  width: soldOut
                    ? '100%'
                    : `${Math.min(100, Math.max(10, ((event.maxSeats - event.availableSeats) / (event.maxSeats || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {hasReviews ? `★ ${event.averageRating} (${event.reviewsCount})` : '⭐ New Event'}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition text-xs">
            →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
