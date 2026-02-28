import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Compass, Clock, Ticket, Menu, X, ChevronRight,
  Star, Orbit, Ship, Users, ClipboardList, ArrowRight, Globe, Crosshair } from
'lucide-react';
import GlitchText from '@/components/GlitchText';
import { EXPO_OUT } from '@/lib/easing';

/* ── Nav items: scroll-to sections on the main page ── */
const SCROLL_ITEMS = [
{ id: 'hero', icon: Rocket, label: 'Home' },
{ id: 'destinations', icon: Compass, label: 'Destinations' },
{ id: 'flythrough', icon: Orbit, label: 'Flythrough' },
{ id: 'experience', icon: Clock, label: 'Experience' },
{ id: 'reviews', icon: Star, label: 'Reviews' },
{ id: 'booking', icon: Ticket, label: 'Book' }];


/* ── Sub-page links ── */
const PAGE_LINKS = [
{ to: '/ship', icon: Ship, label: 'The Ship', accent: '#FF4500' },
{ to: '/crew', icon: Users, label: 'The Crew', accent: '#a855f7' },
{ to: '/mission', icon: ClipboardList, label: 'Mission Info', accent: '#4ab8c4' },
{ to: '/explore', icon: Globe, label: 'Explore Mars', accent: '#6b8aed' },
{ to: '/simulate', icon: Crosshair, label: 'Simulator', accent: '#ef4444' }];


export default function VerticalNav() {
  const [active, setActive] = useState('hero');
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const update = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      el.style.transform = `scaleY(${Math.min(progress, 1)})`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + window.innerHeight / 3;
      for (let i = SCROLL_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SCROLL_ITEMS[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActive(SCROLL_ITEMS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ═══ Desktop vertical nav ═══ */}
      <motion.nav
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EXPO_OUT }}
        className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col items-center justify-between w-20 py-8">

        {/* Logo */}
        <motion.button
          onClick={() => scrollTo('hero')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative group">

          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-11 h-11 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary -rotate-45" />
          </div>
        </motion.button>

        {/* Section nav + page links */}
        <div className="flex flex-col gap-2">
          {/* Scroll-to items */}
          {SCROLL_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const isHovered = hovered === item.id;

            return (
              <div key={item.id} className="relative glitch-icon">
                <motion.button
                  onClick={() => scrollTo(item.id)}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive ?
                  'bg-primary/15 border border-primary/30 shadow-lg shadow-primary/10' :
                  'bg-white/[0.02] border border-transparent hover:bg-white/[0.06] hover:border-white/[0.08]'}`
                  }>

                  <Icon
                    className={`w-[18px] h-[18px] transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-white/30 group-hover:text-white/60'}`
                    } />

                  {isActive &&
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />

                  }
                </motion.button>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered &&
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15, ease: EXPO_OUT }}
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center">

                      <div className="w-2 h-2 rotate-45 bg-white/10 backdrop-blur-xl border-l border-b border-white/10 -mr-1 relative z-0" />
                      <div className="relative z-10 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/10">
                        <GlitchText
                        text={item.label}
                        className="text-xs font-display font-medium text-white/80 whitespace-nowrap tracking-wide" />

                      </div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>);

          })}

          {/* Separator */}
          <div className="my-1 mx-auto w-5 h-px bg-white/[0.06]" />

          {/* Sub-page links */}
          {PAGE_LINKS.map((link) => {
            const Icon = link.icon;
            const isHovered = hovered === link.to;
            return (
              <div key={link.to} className="relative">
                <Link
                  to={link.to}
                  onMouseEnter={() => setHovered(link.to)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/[0.02] border border-transparent hover:bg-accent/[0.08] hover:border-accent/20">

                  <Icon className="w-[18px] h-[18px] text-white/20 transition-colors duration-300 hover:text-accent" />
                </Link>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered &&
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15, ease: EXPO_OUT }}
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 flex items-center">

                      <div className="w-2 h-2 rotate-45 bg-white/10 backdrop-blur-xl border-l border-b border-white/10 -mr-1 relative z-0" />
                      <div className="relative z-10 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/10 flex items-center gap-1.5">
                        <GlitchText
                        text={link.label}
                        className="text-xs font-display font-medium text-white/80 whitespace-nowrap tracking-wide" />

                        <ArrowRight className="w-2.5 h-2.5 text-accent/60" />
                      </div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>);

          })}
        </div>

        {/* Scroll progress */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-16 bg-white/[0.06] relative overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 left-0 w-full bg-primary rounded-full"
              style={{ height: '100%', scaleY: 0, transformOrigin: 'top' }}
              animate={{}}
              ref={progressRef} />

          </div>
          <span className="text-[9px] font-display text-white/50 tracking-widest -rotate-90 origin-center translate-y-4">
            SCROLL
          </span>
        </div>
      </motion.nav>

      {/* ═══ Mobile top bar ═══ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/70 backdrop-blur-2xl border-b border-white/[0.06]">
          {/* Left: Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[11px] font-bold text-white/80 tracking-[0.15em] leading-none">
                ARES<span className="text-primary">-X</span>
              </span>
              <span className="text-[7px] font-display tracking-[0.2em] text-white/50 leading-none mt-0.5">MARS MISSION</span>
            </div>
          </button>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2">
            {/* Book CTA — small pill */}
            <button
            onClick={() => scrollTo('booking')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 active:scale-95 transition-all">
              <Ticket className="w-3 h-3 text-primary/70" />
              <span className="text-[9px] font-display font-semibold tracking-[0.15em] text-primary/80">BOOK</span>
            </button>

            {/* Hamburger */}
            <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center active:scale-95 transition-all">
              <AnimatePresence mode="wait">
                {mobileOpen ?
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-4 h-4 text-white/70" />
                  </motion.div> :

                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-4 h-4 text-white/50" />
                  </motion.div>
                }
              </AnimatePresence>
              {/* Active section dot */}
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary/60 border border-black/50" />
            </button>
          </div>
        </div>

        {/* ═══ Full-screen overlay menu ═══ */}
        <AnimatePresence>
          {mobileOpen &&
          <>
              {/* Backdrop */}
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
              onClick={() => setMobileOpen(false)} />


              {/* Menu panel */}
              <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: EXPO_OUT }}
              className="bg-[#0a0a10]/95 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">

                {/* Active section indicator */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-display tracking-[0.25em] text-primary/50 uppercase">
                      CURRENT: {SCROLL_ITEMS.find((s) => s.id === active)?.label || 'Home'}
                    </span>
                  </div>
                </div>

                {/* Scroll sections */}
                <div className="px-3 pb-2">
                  <span className="block text-[8px] font-display tracking-[0.25em] text-white/50 uppercase px-2 pb-2">
                    NAVIGATE
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SCROLL_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => scrollTo(item.id)}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-center transition-all active:scale-95 ${
                        isActive ?
                        'bg-primary/10 border border-primary/20' :
                        'bg-white/[0.02] border border-white/[0.04] active:bg-white/[0.06]'}`
                        }>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-white/30'}`} />
                          <span className={`text-[9px] font-display font-medium tracking-wider ${isActive ? 'text-primary/80' : 'text-white/40'}`}>
                            {item.label.toUpperCase()}
                          </span>
                        </motion.button>);

                  })}
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 my-2 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                {/* Sub-page links — styled as horizontal cards */}
                <div className="px-3 pb-4">
                  <span className="block text-[8px] font-display tracking-[0.25em] text-white/50 uppercase px-2 pb-2">
                    EXPLORE PAGES
                  </span>
                  <div className="space-y-1.5">
                    {PAGE_LINKS.map((link, i) => {
                    const Icon = link.icon;
                    return (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.04 }}>
                          <Link
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98] bg-white/[0.02] border border-white/[0.04] active:bg-white/[0.06]">
                            <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: link.accent + '12', border: `1px solid ${link.accent}25` }}>
                              <Icon className="w-4 h-4" style={{ color: link.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-display font-medium tracking-wider text-white/60">
                                {link.label}
                              </div>
                              <div className="text-[8px] font-display tracking-[0.15em] text-white/50 mt-0.5">
                                {link.to === '/ship' && 'SPACECRAFT SYSTEMS'}
                                {link.to === '/crew' && 'MEET THE TEAM'}
                                {link.to === '/mission' && 'MISSION BRIEFING'}
                                {link.to === '/explore' && 'MARS SURFACE'}
                                {link.to === '/simulate' && 'FLIGHT TRAINING'}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />
                          </Link>
                        </motion.div>);

                  })}
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #FF4500, transparent)' }} />
              </motion.div>
            </>
          }
        </AnimatePresence>
      </div>
    </>);

}