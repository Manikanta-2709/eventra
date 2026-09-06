import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import PlanningGuideModal from './PlanningGuideModal';
import CommunityRulesModal from './CommunityRulesModal';

const dashboardPath = {
  user: '/dashboard/user',
  organizer: '/dashboard/organizer',
  admin: '/dashboard/admin',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const progress = (totalScroll / windowHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResourcesOpen(false);
      }
    };
    if (resourcesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [resourcesOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-100 dark:border-slate-800/80 transition-colors">
      {/* Scroll Reading Progress Bar */}
      <div
        className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-150 z-50 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />
      <nav className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
            E
          </div>
          <span className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            Eventra
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-full transition ${
              isActive('/')
                ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/50 dark:text-blue-400'
                : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={`px-4 py-1.5 rounded-full transition ${
              isActive('/events')
                ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/50 dark:text-blue-400'
                : 'hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            Events
          </Link>
          <a
            href="/#categories"
            className="px-3.5 py-1.5 rounded-full hover:text-blue-600 dark:hover:text-white transition"
          >
            Categories
          </a>
          <a
            href="/#speakers"
            className="px-3.5 py-1.5 rounded-full hover:text-blue-600 dark:hover:text-white transition"
          >
            Speakers
          </a>
          <a
            href="/#features"
            className="px-3.5 py-1.5 rounded-full hover:text-blue-600 dark:hover:text-white transition"
          >
            Venues
          </a>
          <a
            href="/#features"
            className="px-3.5 py-1.5 rounded-full hover:text-blue-600 dark:hover:text-white transition"
          >
            Pricing
          </a>

          {/* Resources Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 text-xs font-semibold ${
                resourcesOpen
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'hover:text-blue-600 dark:hover:text-white'
              }`}
              aria-expanded={resourcesOpen}
            >
              Resources{' '}
              <span
                className={`text-[9px] transition-transform duration-200 inline-block ${
                  resourcesOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                ▼
              </span>
            </button>
            {resourcesOpen && (
              <div
                className="absolute top-full right-0 lg:left-1/2 lg:-translate-x-1/2 mt-2 w-72 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50 space-y-1"
              >
                <button
                  onClick={() => {
                    setGuideOpen(true);
                    setResourcesOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition shadow-xs">
                    📖
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Event Planning Guide
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      5-step host playbook & checklist
                    </span>
                  </div>
                </button>

                <a
                  href="/#faq"
                  onClick={() => setResourcesOpen(false)}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition shadow-xs">
                    ❓
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Help Center & FAQs
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      Tickets, QR codes & certificates
                    </span>
                  </div>
                </a>

                <button
                  onClick={() => {
                    setRulesOpen(true);
                    setResourcesOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition shadow-xs">
                    🛡️
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Community Rules
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      Trust standards & refund policies
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Role links if logged in */}
          {user && (
            <Link
              to={dashboardPath[user.role]}
              className="px-3.5 py-1.5 rounded-full hover:text-blue-600 dark:hover:text-white transition font-semibold text-primary-600 dark:text-primary-400"
            >
              Dashboard
            </Link>
          )}
          {user?.role === 'organizer' && (
            <Link
              to="/events/create"
              className="px-3.5 py-1.5 rounded-full text-indigo-600 dark:text-indigo-400 hover:underline transition font-semibold"
            >
              + Host Event
            </Link>
          )}
          {user?.role === 'user' && (
            <Link
              to="/bookings"
              className="px-3.5 py-1.5 rounded-full hover:text-blue-600 dark:hover:text-white transition font-semibold"
            >
              My Bookings
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search trigger */}
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            title="Search Events"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <DarkModeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600"
              >
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs px-4 py-2 rounded-full font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="text-sm font-semibold px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition transform active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-6 py-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600"
          >
            Events
          </Link>
          <a
            href="/#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600"
          >
            Categories
          </a>
          <a
            href="/#speakers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600"
          >
            Featured Speakers
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600"
          >
            How It Works
          </a>

          {/* Mobile Resources Group */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Resources
            </span>
            <button
              onClick={() => {
                setGuideOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-1.5 px-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-2"
            >
              <span>📖</span> Event Planning Guide
            </button>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 px-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-2"
            >
              <span>❓</span> Help Center & FAQs
            </a>
            <button
              onClick={() => {
                setRulesOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-1.5 px-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-2"
            >
              <span>🛡️</span> Community Rules
            </button>
          </div>
          {user ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                to={dashboardPath[user.role]}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-blue-600 dark:text-blue-400"
              >
                Go to Dashboard →
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="text-xs text-rose-500 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Interactive Modals for Resources */}
      <PlanningGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
      <CommunityRulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </header>
  );
};

export default Navbar;
