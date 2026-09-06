import React from 'react';

const CommunityRulesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rules = [
    {
      icon: '🛡️',
      title: 'Verified & Authentic Events Only',
      desc: 'All events must clearly represent legitimate organizers, accurate venue locations, realistic dates, and honest agenda details. Deceptive, bait-and-switch, or duplicate spam events are strictly prohibited.',
    },
    {
      icon: '🎟️',
      title: 'Zero Tolerance for Ticket Scalping',
      desc: 'Tickets purchased on Eventra cannot be resold for secondary profit. Eventra provides built-in QR validation to protect attendees from counterfeit or duplicated ticket passes.',
    },
    {
      icon: '🤝',
      title: 'Respectful, Inclusive & Safe Gatherings',
      desc: 'Whether in-person or virtual, hosts and attendees must foster a welcoming environment free from harassment, discrimination, or disruptive conduct. Organizers retain the right to deny check-in to violators.',
    },
    {
      icon: '💳',
      title: 'Clear Refund & Cancellation Policies',
      desc: 'Organizers must disclose refund timeframes in advance. If an event is cancelled or significantly rescheduled, all registered ticket holders are entitled to full, prompt refunds.',
    },
    {
      icon: '📜',
      title: 'Integrity of Certificates & Credentials',
      desc: 'Verified attendance certificates may only be granted to attendees whose physical or virtual presence was verified via official Eventra QR check-in.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-xs">
              ⚖️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Eventra Community Rules & Trust Standards
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guidelines ensuring safe, transparent, and fair event experiences for all members.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-4 flex items-center gap-3.5">
            <span className="text-2xl">🌱</span>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-normal">
              Eventra is built on mutual trust between passionate creators and curious attendees. By participating as an organizer or attendee, you commit to honoring these standards.
            </p>
          </div>

          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-1.5 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{rule.icon}</span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {rule.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Enforced by Eventra Moderation
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityRulesModal;
