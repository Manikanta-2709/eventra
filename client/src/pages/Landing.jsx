import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const fallbackEvents = [
  {
    _id: 'evt-1',
    title: 'Global AI & LLM DevCon 2026',
    description: 'A global gathering of innovators, creators, and generative AI pioneers.',
    date: '2026-03-25',
    city: 'Bengaluru, India',
    venue: 'KTPO Trade Center',
    banner: { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80' },
    category: 'Technology',
    tags: ['Technology', 'Conference'],
    ticketPrice: 1999,
    availableSeats: 380,
    maxSeats: 400,
    isFeatured: true,
  },
  {
    _id: 'evt-2',
    title: 'Global Venture & Pitchfest',
    description: 'Founders and investors connect for pitch sessions and growth masterclasses.',
    date: '2026-04-10',
    city: 'Mumbai, India',
    venue: 'St. Regis Ballroom',
    banner: { url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80' },
    category: 'Business',
    tags: ['Business', 'Workshop'],
    ticketPrice: 2499,
    availableSeats: 175,
    maxSeats: 200,
    isFeatured: true,
  },
  {
    _id: 'evt-3',
    title: 'Product Design & UX Horizons',
    description: 'A celebration of design systems, spatial interfaces, and creative UX.',
    date: '2026-04-18',
    city: 'Bengaluru, India',
    venue: 'WeWork Galaxy',
    banner: { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80' },
    category: 'Arts',
    tags: ['Arts & Culture', 'Design'],
    ticketPrice: 899,
    availableSeats: 110,
    maxSeats: 120,
    isFeatured: true,
  },
  {
    _id: 'evt-4',
    title: 'EdTech & Future of Learning',
    description: 'Exploring admissions, AI tutoring, scholarships, and academic careers.',
    date: '2026-05-05',
    city: 'Delhi, India',
    venue: 'Pragati Maidan Hall 5',
    banner: { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80' },
    category: 'Education',
    tags: ['Education', 'Summit'],
    ticketPrice: 0,
    availableSeats: 260,
    maxSeats: 300,
    isFeatured: true,
  },
  {
    _id: 'evt-5',
    title: 'Neon Nights Music Fest',
    description: 'A high-energy evening of indie bands, live DJs, and festival vibes.',
    date: '2026-04-22',
    city: 'Hyderabad, India',
    venue: 'Phoenix Arena',
    banner: { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80' },
    category: 'Music',
    tags: ['Music', 'Concert'],
    ticketPrice: 799,
    availableSeats: 270,
    maxSeats: 300,
    isFeatured: false,
  },
  {
    _id: 'evt-6',
    title: 'City Marathon & 10K Run',
    description: 'Community running with hydration stations, medals, and beginner groups.',
    date: '2026-05-12',
    city: 'Hyderabad, India',
    venue: "People's Plaza",
    banner: { url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80' },
    category: 'Sports',
    tags: ['Sports', 'Marathon'],
    ticketPrice: 499,
    availableSeats: 480,
    maxSeats: 500,
    isFeatured: false,
  },
  {
    _id: 'evt-7',
    title: 'Street Food Carnival & Demos',
    description: 'Taste regional delicacies, artisan desserts, and chef-led masterclasses.',
    date: '2026-05-20',
    city: 'Pune, India',
    venue: 'Necklace Road Grounds',
    banner: { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80' },
    category: 'Food',
    tags: ['Food', 'Carnival'],
    ticketPrice: 299,
    availableSeats: 210,
    maxSeats: 250,
    isFeatured: false,
  },
  {
    _id: 'evt-8',
    title: 'Mindful Morning Yoga & Meditation',
    description: 'Sunrise vinyasa flow, breathwork, and relaxing Himalayan singing bowl sounds.',
    date: '2026-04-05',
    city: 'Bengaluru, India',
    venue: 'Cubbon Park Green Lawn',
    banner: { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80' },
    category: 'Sports',
    tags: ['Health', 'Wellness'],
    ticketPrice: 299,
    availableSeats: 54,
    maxSeats: 60,
    isFeatured: false,
  },
];

const categoryList = [
  {
    name: 'Technology',
    bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2H4zm-2 13a1 1 0 011-1h18a1 1 0 110 2H3a1 1 0 01-1-1z" />
      </svg>
    ),
  },
  {
    name: 'Business',
    bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    name: 'Education',
    bg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    ),
  },
  {
    name: 'Health',
    bg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    name: 'Arts & Culture',
    bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.49 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-5.5 8c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4c-.83 0-1.5-.67-1.5-1.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    ),
  },
  {
    name: 'Community',
    bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    name: 'Environment',
    bg: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3 4.42 0 8-3.58 8-8 0-1.45-.39-2.82-1.07-4H17zm-5 10c-2.76 0-5-2.24-5-5 0-.58.1-1.13.29-1.65 2.15 1.48 4.29 2.5 6.71 3.1-.47 2.05-2.29 3.55-2 3.55z" />
      </svg>
    ),
  },
  {
    name: 'Sports',
    bg: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
      </svg>
    ),
  },
];

const featuresList = [
  {
    title: 'Event Management',
    desc: 'Create, manage, and promote events with ease.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Seamless Registration',
    desc: 'Hassle-free registration and ticketing for all events.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: 'QR Check-In',
    desc: 'Fast and secure check-in with QR codes.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    title: 'Analytics & Reports',
    desc: 'Track performance with real-time insights.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Venue Management',
    desc: 'Find and manage the perfect venues.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Certificates',
    desc: 'Generate and distribute digital certificates.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const Landing = () => {
  const [events, setEvents] = useState(fallbackEvents);
  const [demoOpen, setDemoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeEventFilter, setActiveEventFilter] = useState('All');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [savedEvents, setSavedEvents] = useState({});
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  const faqs = [
    {
      q: 'How do I register and receive my event tickets?',
      a: 'Browse upcoming events, select your preferred ticket tier (VIP, Early Bird, or General), and complete checkout. Your branded digital pass with a unique QR code is immediately generated and saved to your Bookings dashboard.',
    },
    {
      q: 'How does the QR check-in work at the venue?',
      a: 'On the event day, present your digital ticket pass on your phone or printout. Event staff scan your QR code for instant, frictionless check-in with real-time verification.',
    },
    {
      q: 'When and how do I receive my verified certificate?',
      a: 'Once your attendance is confirmed via QR check-in, an official digital certificate of attendance featuring a verifiable certificate ID is automatically unlocked in your Bookings history.',
    },
    {
      q: 'Can I sync events to Google Calendar or Apple Calendar?',
      a: 'Yes! Every event and booking confirmation includes 1-click sync options to add the date, time, and venue directly to Google Calendar or export universal .ics calendar files.',
    },
    {
      q: 'How can I host my own event on Eventra?',
      a: 'Any registered user can host events. Click "+ Host Event" in the header to set up multi-tier tickets, custom registration questions, and send broadcast announcements to attendees.',
    },
  ];

  const speakers = [
    {
      name: 'Dr. Elena Rostova',
      role: 'VP of AI Research',
      org: 'NeuralCore Labs',
      topic: 'Autonomous Agents & LLMs in Production',
      track: 'AI & Machine Learning',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      eventTitle: 'Global Tech Summit 2026',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      name: 'Marcus Chen',
      role: 'Principal Cloud Architect',
      org: 'CloudScale Global',
      topic: 'Zero-Downtime Microservices & Kubernetes',
      track: 'DevOps & Cloud',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      eventTitle: 'Cloud & DevOps Con',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    {
      name: 'Priya Nair',
      role: 'Chief Product Officer',
      org: 'Studio Horizon',
      topic: 'Spatial Design & Next-Gen Micro-Interactions',
      track: 'Design Systems & UX',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      eventTitle: 'Design Horizons 2026',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      name: 'Alex Rivera',
      role: 'Founding Partner',
      org: 'BlueHarbor Ventures',
      topic: 'Bootstrapping to Series B: Playbook for Founders',
      track: 'Startups & Venture',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      eventTitle: 'Startup Founders Conclave',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
  ];

  useEffect(() => {
    api
      .get('/events?limit=24')
      .then((res) => {
        if (res.data.events && res.data.events.length > 0) {
          setEvents(res.data.events);
        }
      })
      .catch(() => {
        // Keeps polished fallback events if server is offline or loading
      });

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCity) params.append('city', selectedCity);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/events?${params.toString()}`);
  };

  const toggleSaveEvent = (id, e) => {
    e.stopPropagation();
    setSavedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayedEvents = (
    events.filter((ev) => {
      if (activeEventFilter === 'All') return true;
      const cat = (ev.category || '').toLowerCase();
      const target = activeEventFilter.toLowerCase();
      return (
        cat.includes(target) ||
        (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(target)))
      );
    }).length > 0
      ? events.filter((ev) => {
          if (activeEventFilter === 'All') return true;
          const cat = (ev.category || '').toLowerCase();
          const target = activeEventFilter.toLowerCase();
          return (
            cat.includes(target) ||
            (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(target)))
          );
        })
      : fallbackEvents
  ).slice(0, 8);

  return (
    <div className="relative bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500 selection:text-white">
      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative pt-16 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Soft Ambient Background Glow Orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/15" />
        <div className="pointer-events-none absolute top-1/3 -right-32 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-purple-600/10" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                EVENTS BRING PEOPLE TOGETHER
              </span>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-[1.04] text-slate-900 dark:text-white">
                Discover. Attend. <br />
                <span className="text-gradient">Connect. Grow.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Eventra is your all-in-one event management platform to discover amazing events, register
                seamlessly, and build meaningful connections.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/40 transition transform active:scale-95"
                >
                  Explore Events →
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs">
                    ▶
                  </span>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6 relative">
              {/* Top Handwritten Annotation: "More Than Events" */}
              <div className="absolute -top-12 left-2 z-20 hidden sm:block">
                <span className="font-handwriting text-3xl md:text-4xl text-blue-600 dark:text-blue-400 rotate-[-10deg] inline-block select-none">
                  More <br /> Than <br /> Events
                </span>
              </div>

              {/* Top Right Curved Annotation: "Great People Brighter Tomorrows" */}
              <div className="absolute -top-8 -right-2 z-20 hidden sm:block">
                <span className="font-handwriting text-2xl text-blue-600 dark:text-blue-400 rotate-[12deg] inline-block select-none">
                  Great People <br /> Brighter <br /> Tomorrows
                </span>
              </div>

              {/* Main Arch-Shaped Hero Image */}
              <div className="relative mx-auto w-full max-w-lg aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl shadow-blue-500/10 border-4 border-white dark:border-slate-800">
                <img
                  src="/hero_audience.jpg"
                  alt="Event Audience Keynote"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
              </div>

              {/* Floating Event Pill Card on Bottom Right */}
              <div className="absolute -bottom-5 right-2 sm:right-6 z-20 max-w-xs animate-float">
                <div className="flex items-center gap-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl border border-slate-100 dark:border-slate-800 hover:scale-105 transition duration-300">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-base">
                    📅
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Trending Now</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Tech Summit 2025
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">Bengaluru, India • Mar 15, 2025</p>
                  </div>
                  <Link
                    to="/events"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 transition text-slate-600 dark:text-slate-300 text-xs"
                  >
                    →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Quick Interactive Search Anchor Bar */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="p-2.5 sm:p-3 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-blue-500/10 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-5 flex items-center gap-2.5 px-4 py-2">
                <span className="text-slate-400 text-base">🔍</span>
                <input
                  type="text"
                  placeholder="Search events, workshops, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-2">
                <span className="text-slate-400 text-sm">📍</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">All Locations</option>
                  <option value="Bengaluru" className="dark:bg-slate-900">Bengaluru</option>
                  <option value="Mumbai" className="dark:bg-slate-900">Mumbai</option>
                  <option value="Delhi" className="dark:bg-slate-900">Delhi</option>
                  <option value="Hyderabad" className="dark:bg-slate-900">Hyderabad</option>
                </select>
              </div>

              <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">All Types</option>
                  <option value="Tech" className="dark:bg-slate-900">Tech</option>
                  <option value="Business" className="dark:bg-slate-900">Business</option>
                  <option value="Arts" className="dark:bg-slate-900">Arts</option>
                  <option value="Education" className="dark:bg-slate-900">Education</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={handleQuickSearch}
                  className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 shadow-md shadow-blue-500/25 transition transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Find Events →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. CORE CAPABILITIES RIBBON */}
      {/* ============================================================ */}
      <section className="py-5 border-y border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">⚡</span>
              <span>Instant QR Check-In</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">🛡️</span>
              <span>Verified Attendance Certificates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600">🎟️</span>
              <span>Multi-Tier Smart Ticketing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600">📊</span>
              <span>Live Organizer Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600">📅</span>
              <span>1-Click Calendar Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. WHY EVENTRA / BALANCED 3x2 FEATURES GRID */}
      {/* ============================================================ */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            WHY EVENTRA
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Everything You Need <span className="text-gradient">for Successful Events</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            From planning and ticketing to seamless QR verification and automated certificates, Eventra delivers end-to-end event execution for organizers and attendees.
          </p>
        </div>

        {/* 3x2 Centered Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((f, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition duration-300 mb-4 shadow-sm">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FEATURED / UPCOMING EVENTS */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50/60 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                FEATURED EVENTS
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                Upcoming Events You'll Love
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Discover trending events, workshops, conferences, and more.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
            >
              View All Events →
            </Link>
          </div>

          {/* Live Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {['All', 'Technology', 'Business', 'Arts', 'Education'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveEventFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  activeEventFilter === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedEvents.map((ev, i) => (
              <div
                key={ev._id || i}
                onClick={() => navigate(ev._id?.startsWith('evt-') ? '/events' : `/events/${ev._id}`)}
                className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col relative"
              >
                {/* Banner Image with safe fallback */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      ev.banner?.url ||
                      fallbackEvents[i % fallbackEvents.length].banner.url
                    }
                    alt={ev.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackEvents[i % fallbackEvents.length].banner.url;
                    }}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Featured Badge */}
                  {(ev.isFeatured || i === 0) && (
                    <span className="absolute top-3 left-3 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                      Featured
                    </span>
                  )}

                  {/* Floating Price Pill */}
                  <div className="absolute top-3 right-3 rounded-full bg-slate-950/75 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/20 shadow-sm">
                    {ev.ticketPrice === 0 ? 'Free' : `₹${ev.ticketPrice || 499}`}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>📅 {new Date(ev.date || '2025-03-15').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>📍 {ev.city || 'Bengaluru, India'}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition line-clamp-1">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Seat Availability Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Availability</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {ev.availableSeats ?? 45} seats left
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: '78%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Tags & Arrow */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        {ev.category || 'Technology'}
                      </span>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {ev.tags?.[1] || 'Conference'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleSaveEvent(ev._id || i, e)}
                        className="text-slate-400 hover:text-rose-500 transition text-sm"
                        title="Save to favorites"
                      >
                        {savedEvents[ev._id || i] ? '❤️' : '🤍'}
                      </button>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition text-xs">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. EXPLORE BY CATEGORY */}
      {/* ============================================================ */}
      <section id="categories" className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              EXPLORE BY CATEGORY
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Events for Every Interest
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoryList.map((c, i) => (
            <Link
              key={i}
              to={`/events?category=${encodeURIComponent(c.name.split(' ')[0])}`}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition text-center group"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl mb-3 ${c.bg} group-hover:scale-110 transition`}
              >
                {c.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FEATURED SPEAKERS & THOUGHT LEADERS */}
      {/* ============================================================ */}
      <section id="speakers" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Industry Pioneers
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Learn from World-Class Speakers
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
                Hear directly from leading innovators, tech executives, designers, and venture capitalists headlining upcoming Eventra events.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs self-start md:self-auto"
            >
              Browse All Sessions →
            </Link>
          </div>

          {/* Speakers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {speakers.map((sp, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Speaker Photo with Gradient Frame */}
                <div>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
                    <img
                      src={sp.image}
                      alt={sp.name}
                      className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-[11px] font-semibold text-white">
                        Keynote Speaker • {sp.eventTitle}
                      </span>
                    </div>
                  </div>

                  {/* Track Badge */}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sp.badgeColor} mb-2.5`}>
                    {sp.track}
                  </span>

                  {/* Speaker Details */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center gap-1.5">
                    {sp.name}
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {sp.role} • <span className="font-semibold text-slate-700 dark:text-slate-300">{sp.org}</span>
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic mt-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{sp.topic}"
                  </p>
                </div>

                {/* Card Footer: Event Link */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                    📍 {sp.eventTitle}
                  </span>
                  <Link
                    to="/events"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Organizer / Speaker Callout Banner */}
          <div className="mt-10 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-950/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-blue-500/20">
                🎙️
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Are you an industry expert or event organizer?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Host an event, share your knowledge with thousands of attendees, or apply as a keynote speaker.
                </p>
              </div>
            </div>
            <Link
              to="/events/create"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition whitespace-nowrap"
            >
              + Host or Speak at Eventra
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. HOW IT WORKS & PROMO BANNER */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-16 bg-slate-50/60 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 4-step workflow */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                  HOW IT WORKS
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Get Started in Just 4 Steps
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  From discovery to participation, Eventra makes it simple and seamless.
                </p>
              </div>

              {/* 4 Steps Horizontal Row with connected dotted line */}
              <div className="relative pt-4">
                {/* Dotted connector line */}
                <div className="hidden sm:block absolute top-[28px] left-[10%] right-[10%] border-t-2 border-dashed border-blue-200 dark:border-blue-900/60 z-0"></div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-400 bg-white dark:bg-slate-900 text-blue-600 shadow-xs">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">1</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Discover Events</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Browse events that match your interests.
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/20">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2 2 2 0 012 2 2 2 0 01-2 2 2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 002-2V6a2 2 0 00-2-2H4z" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">2</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Register</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Sign up and get your ticket instantly.
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-blue-400 bg-white dark:bg-slate-900 text-blue-600 shadow-xs">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">3</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Attend</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Check in with your QR code at the venue.
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-400 bg-white dark:bg-slate-900 text-blue-500 shadow-xs">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">4</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Grow</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Gain knowledge, network, and achieve more.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Call-To-Action Banner */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-xl aspect-[16/10] flex flex-col justify-end p-8 text-white">
              <img
                src="/mountain_banner.jpg"
                alt="Mountain Hiker"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>

              <div className="relative z-10 space-y-3">
                <span className="font-handwriting text-2xl text-blue-200 rotate-[-4deg] inline-block">
                  Great People Brighter Tomorrows
                </span>
                <h3 className="text-2xl font-black tracking-tight leading-snug">
                  Be Part of Something Bigger
                </h3>
                <p className="text-xs text-blue-100 max-w-sm leading-relaxed">
                  Join Eventra today and experience events that inspire, connect, and create opportunities.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/register"
                    className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-blue-900 hover:bg-blue-50 transition shadow-sm"
                  >
                    Sign Up Now →
                  </Link>
                  <Link
                    to="/events"
                    className="rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/30 transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7: FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      {/* ============================================================ */}
      <section id="faq" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Common Questions
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to know about registering, ticketing, QR check-ins, and verified certificates.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-blue-500/40 bg-white dark:bg-slate-800/90 shadow-lg shadow-blue-500/5'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                          isOpen
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {faq.q}
                      </span>
                    </div>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      <p className="pl-10">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Have more questions?</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Our team and organizer guides are always available to help.</p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Explore Knowledge Base & Events →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8: PRE-FOOTER HIGH-CONVERTING CTA BANNER */}
      {/* ============================================================ */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-950 p-8 sm:p-14 shadow-2xl shadow-blue-500/20 text-white overflow-hidden">
            {/* Background Decorative Rings & Ambient Glows */}
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm border border-white/20">
                <span>✨</span> Built for Next-Generation Events
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Ready to Host Your Next Unforgettable Event?
              </h2>

              <p className="text-sm sm:text-base text-blue-100 leading-relaxed max-w-xl">
                Create your event page in under 3 minutes, set multi-tier tickets, accept registrations, and verify attendees effortlessly with our QR suite.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/events/create"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-blue-900 hover:bg-blue-50 shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Create An Event Now
                </Link>

                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/25 transition-all duration-200"
                >
                  Browse Upcoming Events →
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-blue-200/90 font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Instant QR Ticketing
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified Certificates
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  Live Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* ============================================================ */}
      {/* DEMO VIDEO MODAL */}
      {/* ============================================================ */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Eventra Platform Demo</h3>
              <button
                onClick={() => setDemoOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden relative">
              <img
                src="/hero_audience.jpg"
                alt="Demo preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 bg-slate-900/40">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl shadow-lg mb-3">
                  ▶
                </div>
                <h4 className="font-bold text-lg">Interactive Event Management Demo</h4>
                <p className="text-xs text-slate-200 max-w-sm mt-1">
                  Experience frictionless event discovery, multi-tier ticketing, QR check-in, and organizer analytics.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setDemoOpen(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Close Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FLOATING BACK TO TOP BUTTON */}
      {/* ============================================================ */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in"
          title="Scroll back to top"
          aria-label="Scroll back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Landing;
