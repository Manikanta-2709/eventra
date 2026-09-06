import React from 'react';
import { Link } from 'react-router-dom';

const PlanningGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Define Your Event Vision & Format',
      desc: 'Choose between in-person, hybrid, or virtual. Establish clear goals, target audience, and set your agenda milestones.',
      tips: ['Select high-capacity, accessible venues', 'Set realistic dates giving at least 3-4 weeks lead time'],
    },
    {
      num: '02',
      title: 'Architect Multi-Tier Ticket Pricing',
      desc: 'Leverage tiered pricing to maximize early cash flow and reward dedicated attendees.',
      tips: ['Launch Early-Bird tiers with 15-20% discount', 'Offer VIP passes with exclusive perks & front-row seating'],
    },
    {
      num: '03',
      title: 'Create Captivating Listings & Custom Forms',
      desc: 'Use high-resolution banners and descriptive agendas. Collect essential attendee info with custom registration questions.',
      tips: ['Ask for dietary requirements, T-shirt sizes, or team names', 'Include clear refund policies and contact details'],
    },
    {
      num: '04',
      title: 'Frictionless Venue Check-In with QR Codes',
      desc: 'On event day, staff scan attendee digital QR passes in under a second using any mobile browser camera.',
      tips: ['No special hardware needed', 'Real-time sync prevents duplicate entries or scalped tickets'],
    },
    {
      num: '05',
      title: 'Issue Verified Attendance Certificates',
      desc: 'Reward attendee participation with tamper-proof certificates carrying unique verification IDs.',
      tips: ['Boost attendee satisfaction and resume credentials', 'Send broadcast announcements to gather post-event reviews'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-xs">
              📖
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Eventra Event Planning Guide
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A 5-step playbook to organizing, promoting, and hosting unforgettable events.
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
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <div className="rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-4 flex items-center gap-3.5">
            <span className="text-2xl">💡</span>
            <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-normal">
              Whether you are organizing a 50-person tech meetup, college workshop, or a 500-attendee conference, following these 5 steps ensures maximum attendance and zero event-day stress.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4.5 space-y-2 hover:border-blue-200 dark:hover:border-blue-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-bold text-white shadow-xs">
                    {step.num}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-9">
                  {step.desc}
                </p>
                <div className="pl-9 pt-1 flex flex-wrap gap-2">
                  {step.tips.map((tip, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
                    >
                      <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Need custom assistance? <span className="font-semibold text-slate-700 dark:text-slate-300">support@eventra.local</span>
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close Guide
            </button>
            <Link
              to="/events/create"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition whitespace-nowrap"
            >
              + Create Your Event Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningGuideModal;
