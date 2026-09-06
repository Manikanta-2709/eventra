import { useEffect, useState } from 'react';
import api from '../api/axios';

const CertificateModal = ({ bookingId, onClose }) => {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    api
      .get(`/bookings/${bookingId}/certificate`)
      .then((res) => {
        setCertData(res.data.certificate);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Certificate unavailable');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Verified Attendance Certificate
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Generating verified certificate...</div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          ) : (
            <div
              id="printable-certificate"
              className="relative rounded-2xl border-4 border-double border-amber-400/70 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 p-8 text-center dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20 shadow-inner"
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-400 text-xs font-serif">✦</div>
              <div className="absolute top-2 right-2 text-amber-400 text-xs font-serif">✦</div>
              <div className="absolute bottom-2 left-2 text-amber-400 text-xs font-serif">✦</div>
              <div className="absolute bottom-2 right-2 text-amber-400 text-xs font-serif">✦</div>

              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-700 dark:text-amber-400">
                Certificate of Participation
              </span>
              <p className="mt-2 text-xs text-slate-400">This acknowledges that</p>

              <h2 className="mt-2 text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white capitalize">
                {certData.attendeeName}
              </h2>

              <p className="mt-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                has officially checked in and attended the event
              </p>

              <h3 className="mt-2 text-lg md:text-xl font-black text-primary-600 dark:text-primary-400">
                {certData.eventTitle}
              </h3>

              <div className="mt-6 flex flex-wrap items-center justify-around gap-4 border-t border-b border-amber-200/60 py-3 text-xs text-slate-600 dark:border-amber-900/40 dark:text-slate-300">
                <div>
                  <span className="block text-slate-400 font-medium">Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(certData.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Venue</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{certData.eventVenue}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Ticket Pass</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{certData.tierName}</span>
                </div>
              </div>

              {/* Seal & Signatures */}
              <div className="mt-6 flex items-center justify-between text-left">
                <div>
                  <div className="h-0.5 w-28 bg-slate-300 dark:bg-slate-700"></div>
                  <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{certData.organizerName}</p>
                  <p className="text-[10px] text-slate-400">Event Organizer</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 border-2 border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 text-sm font-bold shadow-xs">
                    ✓ VERIFIED
                  </div>
                  <p className="mt-1 font-mono text-[9px] text-slate-400">{certData.certificateId}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
          {!loading && !error && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
