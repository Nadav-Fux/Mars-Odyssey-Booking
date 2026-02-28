import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import {
  Rocket,
  Twitter,
  Github,
  Globe,
  Radio,
  Wifi,
  Signal,
  Satellite,
  ChevronRight,
  Heart } from
'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   FOOTER — Mission Control Console

   A living, breathing footer that feels like a command center:
   • Animated signal-strength bars
   • Live-updating "systems" status indicators
   • Flickering data readouts
   • Easter egg: click the logo 5 times for a hidden message
   • Social links styled as comms channels
   ================================================================ */

// ── System status indicators ──
const SYSTEMS = [
{ label: 'NAV', status: 'NOMINAL', color: '#22c55e' },
{ label: 'COMMS', status: 'ACTIVE', color: '#4ab8c4' },
{ label: 'LIFE-SUP', status: 'NOMINAL', color: '#22c55e' },
{ label: 'NTP-DRV', status: 'STANDBY', color: '#eab308' },
{ label: 'RAD-SHLD', status: 'OPTIMAL', color: '#22c55e' }];


function SystemStatus({ label, status, color, delay }: {label: string;status: string;color: string;delay: number;}) {
  const [flicker, setFlicker] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tick = () => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 120);
      const next = 3000 + Math.random() * 5000;
      timeoutRef.current = setTimeout(tick, next);
    };
    timeoutRef.current = setTimeout(tick, delay + Math.random() * 4000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [delay]);

  return (
    <div className="flex items-center gap-2">
      <div
      className="w-1.5 h-1.5 rounded-full transition-opacity"
      style={{
        backgroundColor: color,
        opacity: flicker ? 0.3 : 1,
        boxShadow: `0 0 6px ${color}60`
      }} />

      <span className="text-[8px] font-display tracking-[0.15em] text-white/50">
        {label}
      </span>
      <span
      className="text-[7px] font-mono tracking-wider transition-opacity"
      style={{ color: `${color}90`, opacity: flicker ? 0.2 : 0.7 }}>

        {status}
      </span>
    </div>);

}

// ── Signal Bars ──
function SignalBars() {
  const [strength, setStrength] = useState([0.4, 0.6, 0.75, 0.9, 1]);

  useEffect(() => {
    const id = setInterval(() => {
      setStrength((prev) =>
      prev.map((v) => Math.max(0.2, Math.min(1, v + (Math.random() - 0.48) * 0.15)))
      );
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end gap-[2px]">
      {strength.map((h, i) =>
      <div
      key={i}
      className="w-[3px] rounded-sm transition-all duration-700"
      style={{
        height: `${h * 14}px`,
        backgroundColor: h > 0.5 ? '#22c55e' : h > 0.3 ? '#eab308' : '#ef4444',
        opacity: 0.7
      }} />

      )}
    </div>);

}

// ── Typing readout ──
function DataReadout({ text, delay }: {text: string;delay: number;}) {
  const [display, setDisplay] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [started, text]);

  if (!started) return null;
  return (
    <span className="font-mono text-[9px] text-white/50">{display}</span>);

}

// ── Main Footer ──
function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [easterEgg, setEasterEgg] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [inView, setInView] = useState(false);

  // Track visibility for typed readouts
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {if (e.isIntersecting) setInView(true);},
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Easter egg: 5 clicks on logo
  const handleLogoClick = useCallback(() => {
    const next = easterEgg + 1;
    setEasterEgg(next);
    if (next >= 5) {
      setShowSecret(true);
      setTimeout(() => {setShowSecret(false);setEasterEgg(0);}, 4000);
    }
  }, [easterEgg]);

  // GSAP entrance
  useGSAP(() => {
    gsap.from('.ft-row', {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.7,
      scrollTrigger: { trigger: ref.current, start: 'top 90%' }
    });
  }, { scope: ref });

  const NAV_COLS: {title: string;links: {label: string;to?: string;scrollTo?: string;}[];}[] = [
  {
    title: 'Explore',
    links: [
    { label: 'Destinations', scrollTo: 'destinations' },
    { label: 'The Ship', to: '/ship' },
    { label: 'Experience', scrollTo: 'experience' },
    { label: 'Mars Surface', to: '/explore' }]

  },
  {
    title: 'Mission',
    links: [
    { label: 'Meet the Crew', to: '/crew' },
    { label: 'Mission Intel', to: '/mission' },
    { label: 'Simulator', to: '/simulate' },
    { label: 'Reviews', scrollTo: 'reviews' }]

  },
  {
    title: 'Support',
    links: [
    { label: 'Book a Flight', scrollTo: 'booking' },
    { label: 'Gallery', scrollTo: 'gallery' },
    { label: 'Mission Stats', scrollTo: 'stats' },
    { label: 'Back to Top', scrollTo: 'hero' }]

  }];



  return (
    <footer ref={ref} className="relative z-10 border-t border-white/[0.04]">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:pl-28">
        {/* ── Main grid ── */}
        <div className="ft-row grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 py-12 sm:py-16">
          {/* Brand column */}
          <div>
            <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 mb-4 group cursor-pointer">

              <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-primary/20"
              style={{
                background: 'rgba(255,69,0,0.06)',
                border: '1px solid rgba(255,69,0,0.15)'
              }}>

                <Rocket className="w-4 h-4 text-primary -rotate-45 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display text-sm font-bold tracking-[0.15em] text-white">
                ARES<span className="text-primary">-X</span>
              </span>
            </button>

            <p className="text-white/50 text-xs leading-relaxed mb-5">
              Pioneering interplanetary tourism.<br />
              Making Mars accessible since 2019.
            </p>

            {/* Social as "Comms Channels" */}
            <div className="space-y-2">
              <span className="text-[8px] font-display tracking-[0.2em] text-white/50">COMMS CHANNELS</span>
              <div className="flex gap-2">
                {[
                { Icon: Twitter, label: 'X/TWITTER' },
                { Icon: Github, label: 'GITHUB' },
                { Icon: Globe, label: 'WEB' }].
                map(({ Icon, label }) =>
                <button
                key={label}
                className="group/btn w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-primary hover:border-primary/25 hover:bg-primary/[0.04] transition-all cursor-pointer relative"
                aria-label={label}>

                    <Icon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) =>
          <div key={col.title}>
              <h4 className="text-[10px] font-display font-bold text-white/40 tracking-[0.25em] uppercase mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) =>
              <li key={l.label}>
                    {l.to ?
                <Link
                  to={l.to}
                  className="group/link flex items-center gap-1.5 text-white/50 text-xs hover:text-primary transition-colors">
                        <ChevronRight className="w-2.5 h-2.5 text-white/10 group-hover/link:text-primary/50 group-hover/link:translate-x-0.5 transition-all" />
                        {l.label}
                      </Link> :

                <button
                onClick={() => {
                  if (l.scrollTo) {
                    document.getElementById(l.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group/link flex items-center gap-1.5 text-white/50 text-xs hover:text-primary transition-colors">
                        <ChevronRight className="w-2.5 h-2.5 text-white/10 group-hover/link:text-primary/50 group-hover/link:translate-x-0.5 transition-all" />
                        {l.label}
                      </button>
                }
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>

        {/* ── Systems Status Bar ── */}
        <div
        className="ft-row py-4 flex flex-wrap items-center gap-x-5 gap-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>

          <div className="flex items-center gap-2 mr-auto">
            <Satellite className="w-3 h-3 text-white/15" />
            <span className="text-[8px] font-display tracking-[0.2em] text-white/50">
              SYSTEM STATUS
            </span>
          </div>
          {SYSTEMS.map((sys, i) =>
          <SystemStatus key={sys.label} {...sys} delay={i * 300} />
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div
        className="ft-row py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>

          {/* Left: Copyright + signal */}
          <div className="flex items-center gap-4">
            <p className="text-white/50 text-[10px] font-display tracking-wider">
              © 2026 ARES-X SPACE TOURISM INC.
            </p>
            <div className="hidden sm:flex items-center gap-2">
              <SignalBars />
              <span className="text-[8px] font-display text-white/50 tracking-wider">
                UPLINK
              </span>
            </div>
          </div>

          {/* Right: Live data readout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white/50 text-[10px] font-display tracking-wider">
                ALL SYSTEMS NOMINAL
              </span>
            </div>
            <span className="text-white/[0.06]">·</span>
            {inView &&
            <DataReadout text="MARS SOL 247 · 14:32 MTC · OLYMPUS MONS BASE" delay={500} />
            }
          </div>
        </div>

        {/* ── Made with love line ── */}
        <div
        className="ft-row py-3 flex items-center justify-center gap-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.02)' }}>

          <span className="text-[8px] text-white/[0.08] font-display tracking-[0.15em]">
            ENGINEERED WITH
          </span>
          <Heart className="w-2.5 h-2.5 text-primary/20" />
          <span className="text-[8px] text-white/[0.08] font-display tracking-[0.15em]">
            FOR THE STARS
          </span>
        </div>
      </div>

      {/* ── Easter egg overlay ── */}
      <AnimatePresence>
        {showSecret &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl bg-black/90 backdrop-blur-xl border border-primary/30"
          style={{ boxShadow: '0 0 40px rgba(255,69,0,0.15)' }}>

            <div className="flex items-center gap-3">
              <span className="text-lg">👽</span>
              <div>
                <p className="text-primary text-xs font-display font-bold tracking-wider">
                  SECRET TRANSMISSION RECEIVED
                </p>
                <p className="text-white/40 text-[10px] font-mono mt-0.5">
                  "We've been waiting for you." — Sol 1, Olympus Base
                </p>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </footer>);

}

export default memo(Footer);