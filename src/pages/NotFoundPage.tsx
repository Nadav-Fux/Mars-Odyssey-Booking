import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, WifiOff } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   404 — SIGNAL LOST

   Cinematic "lost in space" 404 page:
     • Static noise background (CSS animated)
     • Glitchy "SIGNAL LOST" text
     • Floating astronaut silhouette (SVG)
     • Auto-redirect countdown (15s)
     • Terminal-style diagnostic messages
     • Quick-nav links back home
   ================================================================ */

const DIAGNOSTICS = [
'> SIGNAL INTEGRITY CHECK: FAILED',
'> PACKET LOSS: 100%',
'> ROUTE NOT FOUND IN NAVIGATION DATABASE',
'> ATTEMPTING TO RE-ESTABLISH UPLINK...',
'> FALLBACK: REDIRECTING TO MISSION CONTROL'];


/* Floating astronaut SVG */
function AstronautSVG() {
  return (
    <svg viewBox="0 0 100 140" className="w-20 sm:w-24 opacity-10">
      {/* Helmet */}
      <ellipse cx="50" cy="30" rx="22" ry="25" fill="none" stroke="white" strokeWidth="1.5" />
      <ellipse cx="50" cy="28" rx="15" ry="17" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Visor reflection */}
      <path d="M40,22 Q50,18 60,22" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Body */}
      <rect x="32" y="52" width="36" height="40" rx="8" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Backpack */}
      <rect x="26" y="56" width="8" height="30" rx="3" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
      {/* Arms */}
      <path d="M32,60 Q15,70 18,85" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M68,60 Q85,70 82,85" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Legs */}
      <path d="M42,92 L38,125" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58,92 L62,125" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Boots */}
      <ellipse cx="36" cy="128" rx="6" ry="4" fill="none" stroke="white" strokeWidth="1" />
      <ellipse cx="64" cy="128" rx="6" ry="4" fill="none" stroke="white" strokeWidth="1" />
      {/* Tether */}
      <path d="M50,55 Q80,40 95,60 Q110,80 90,100" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 4" />
    </svg>);

}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);
  const [visibleDiag, setVisibleDiag] = useState(0);

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {clearInterval(id);navigate('/');return 0;}
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [navigate]);

  // Progressive diagnostics
  useEffect(() => {
    const timers = DIAGNOSTICS.map((_, i) =>
    setTimeout(() => setVisibleDiag(i + 1), 600 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#020204] flex items-center justify-center overflow-auto">
      {/* Static noise */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '150px 150px',
        animation: 'noise-shift 0.3s steps(5) infinite'
      }} />

      {/* Floating astronaut */}
      <motion.div
        className="absolute"
        animate={{ y: [-10, 10, -10], rotate: [-3, 3, -3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '15%', right: '15%' }}>

        <AstronautSVG />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EXPO_OUT }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/[0.08] border border-red-500/20 mb-6">

          <WifiOff className="w-3 h-3 text-red-400/70" />
          <span className="text-[10px] font-display tracking-[0.25em] text-red-400/70">ERROR 404</span>
        </motion.div>

        {/* Main heading with glitch */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EXPO_OUT }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 relative"
          style={{ textShadow: '0 0 40px rgba(255,69,0,0.2)' }}>

          SIGNAL
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">LOST</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-sm sm:text-base mb-8 leading-relaxed">

          The coordinates you're looking for don't exist in our navigation database.
          Deep-space signal lost.
        </motion.p>

        {/* Diagnostics terminal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-left rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 mb-8">

          {DIAGNOSTICS.slice(0, visibleDiag).map((line, i) =>
          <div
          key={i}
          className="font-mono text-[10px] leading-relaxed"
          style={{ color: i === DIAGNOSTICS.length - 1 ? '#22c55e80' : 'rgba(255,255,255,0.2)' }}>

              {line}
            </div>
          )}
          {visibleDiag < DIAGNOSTICS.length &&
          <div className="font-mono text-[10px] text-white/50">
              <span className="animate-pulse">█</span>
            </div>
          }
        </motion.div>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-6">

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/15 border border-primary/25 text-primary font-display text-xs tracking-wider hover:bg-primary/25 transition-all">

            <Home className="w-3.5 h-3.5" />
            MISSION CONTROL
          </Link>
          <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 font-display text-xs tracking-wider hover:text-white/60 hover:bg-white/[0.08] transition-all">

            <ArrowLeft className="w-3.5 h-3.5" />
            GO BACK
          </button>
        </motion.div>

        {/* Auto-redirect */}
        <div className="text-[9px] font-display tracking-[0.2em] text-white/10">
          AUTO-REDIRECT IN {countdown}s
        </div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)'
      }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)'
      }} />

      <style>{`
        @keyframes noise-shift {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(1px, -2px); }
          60% { transform: translate(-1px, 2px); }
          80% { transform: translate(2px, -1px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>);

}