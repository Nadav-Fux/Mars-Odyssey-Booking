import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { ShieldAlert } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   EMERGENCY ALERT BUTTON

   Floating trigger in the top-right.  On click:
     Phase 0  → save current theme, override all colours to red
     Phase 1  → white flash (0.1 s)
     Phase 2  → GSAP shakes #root for ~2 s (haptic vibration)
     Phase 3  → siren starts (Web Audio two-tone sweep)
     Phase 4  → red vignette + scanlines + pulsing red flashes
     Phase 5  → large Warning SVG fades/bounces in, flashing

   "STAND DOWN" button reverses everything.
   ================================================================ */

// ── Theme save / override / restore ──
const THEME_KEYS = [
'--color-primary',
'--color-accent',
'--color-ring',
'--color-border'] as
const;

function saveTheme(): Record<string, string> {
  const s = document.documentElement.style;
  const saved: Record<string, string> = {};
  THEME_KEYS.forEach((k) => {saved[k] = s.getPropertyValue(k);});
  return saved;
}

function applyRedTheme() {
  const s = document.documentElement.style;
  s.setProperty('--color-primary', '#ff0020');
  s.setProperty('--color-accent', '#cc0018');
  s.setProperty('--color-ring', '#ff0020');
  s.setProperty('--color-border', 'rgba(255,0,32,0.25)');
}

function restoreTheme(saved: Record<string, string>) {
  const s = document.documentElement.style;
  THEME_KEYS.forEach((k) => {
    if (saved[k]) s.setProperty(k, saved[k]);else
    s.removeProperty(k);
  });
}

// ── Siren (Web Audio) ──
interface SirenNodes {ctx: AudioContext;stop(): void;}

function createSiren(): SirenNodes {
  const ctx = new AudioContext();
  ctx.resume();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Main tone
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 660;
  const oscG = ctx.createGain();
  oscG.gain.value = 0.09;
  osc.connect(oscG).connect(master);
  osc.start();

  // Frequency sweep LFO
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 1.8;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 220;
  lfo.connect(lfoG).connect(osc.frequency);
  lfo.start();

  // Second harmonic for depth
  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.value = 330;
  const osc2G = ctx.createGain();
  osc2G.gain.value = 0.03;
  osc2.connect(osc2G).connect(master);
  osc2.start();

  const lfo2 = ctx.createOscillator();
  lfo2.type = 'sine';
  lfo2.frequency.value = 1.8;
  const lfo2G = ctx.createGain();
  lfo2G.gain.value = 110;
  lfo2.connect(lfo2G).connect(osc2.frequency);
  lfo2.start();

  // Fade in
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.3);

  return {
    ctx,
    stop: () => {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => {
        [osc, lfo, osc2, lfo2].forEach((n) => {try {n.stop();} catch {}});
        ctx.close().catch(() => {});
      }, 700);
    }
  };
}

// ── GSAP page shake ──
function shakeUI(): gsap.core.Timeline {
  const el = document.getElementById('root');
  if (!el) return gsap.timeline();

  const kf = Array.from({ length: 28 }, () => ({
    x: gsap.utils.random(-10, 10),
    y: gsap.utils.random(-6, 6),
    rotation: gsap.utils.random(-0.7, 0.7),
    duration: 0.06
  }));
  kf.push({ x: 0, y: 0, rotation: 0, duration: 0.35 });

  return gsap.to(el, { keyframes: kf, ease: 'none' });
}

// ── Warning SVG ──
function WarningSVG() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <defs>
        <filter id="em-glow">
          <feGaussianBlur stdDeviation="6" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="em-glow-lg">
          <feGaussianBlur stdDeviation="12" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Pulsing outer rings */}
      <circle cx="100" cy="100" r="90" stroke="#ff0020" strokeWidth="1" strokeOpacity="0.1">
        <animate attributeName="r" values="90;96;90" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.1;0.03;0.1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="100" r="82" stroke="#ff0020" strokeWidth="0.5" strokeOpacity="0.06">
        <animate attributeName="r" values="82;88;82" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Rotating scanner arc */}
      <circle
      cx="100" cy="100" r="75"
      stroke="#ff0020" strokeWidth="2" strokeOpacity="0.15"
      strokeDasharray="30 442" strokeLinecap="round"
      fill="none">

        <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Triangle (glow) */}
      <path
      d="M100 30 L170 155 L30 155 Z"
      stroke="#ff0020" strokeWidth="5" strokeOpacity="0.25"
      strokeLinejoin="round" filter="url(#em-glow-lg)" />

      {/* Triangle (main) */}
      <path
      d="M100 30 L170 155 L30 155 Z"
      stroke="#ff0020" strokeWidth="3" strokeLinejoin="round">

        <animate attributeName="stroke-opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite" />
      </path>
      {/* Triangle fill */}
      <path d="M100 30 L170 155 L30 155 Z" fill="#ff0020" fillOpacity="0.04" />

      {/* Exclamation mark */}
      <line x1="100" y1="70" x2="100" y2="115" stroke="#ff0020" strokeWidth="6" strokeLinecap="round">
        <animate attributeName="stroke-opacity" values="1;0.4;1" dur="0.6s" repeatCount="indefinite" />
      </line>
      <circle cx="100" cy="135" r="4" fill="#ff0020">
        <animate attributeName="opacity" values="1;0.4;1" dur="0.6s" repeatCount="indefinite" />
      </circle>

      {/* WARNING text */}
      <text x="100" y="182" textAnchor="middle" fontSize="11" fontFamily="Orbitron, monospace" fontWeight="bold" fill="#ff0020" letterSpacing="5">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        WARNING
      </text>

      {/* Corner markers */}
      {[
      [10, 10, 25, 10, 10, 25],
      [190, 10, 175, 10, 190, 25],
      [10, 190, 25, 190, 10, 175],
      [190, 190, 175, 190, 190, 175]].
      map(([x1, y1, x2, y2, x3, y3], i) =>
      <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff0020" strokeWidth="1" strokeOpacity="0.3" />
          <line x1={x1} y1={y1} x2={x3} y2={y3} stroke="#ff0020" strokeWidth="1" strokeOpacity="0.3" />
        </g>
      )}
    </svg>);

}

// ── Component ──
function EmergencyButton() {
  const [active, setActive] = useState(false);
  const savedThemeRef = useRef<Record<string, string>>({});
  const sirenRef = useRef<SirenNodes | null>(null);
  const shakeRef = useRef<gsap.core.Timeline | null>(null);
  const [flash, setFlash] = useState(false);

  const activate = useCallback(() => {
    if (active) return;

    // Save & override theme
    savedThemeRef.current = saveTheme();
    applyRedTheme();

    // White flash
    setFlash(true);
    setTimeout(() => setFlash(false), 120);

    // Shake UI
    shakeRef.current = shakeUI();

    // Siren
    sirenRef.current = createSiren();

    setActive(true);
  }, [active]);

  const deactivate = useCallback(() => {
    if (!active) return;

    // Restore theme
    restoreTheme(savedThemeRef.current);

    // Stop siren
    sirenRef.current?.stop();
    sirenRef.current = null;

    // Kill residual shake
    shakeRef.current?.kill();
    const root = document.getElementById('root');
    if (root) gsap.set(root, { clearProps: 'x,y,rotation' });

    setActive(false);
  }, [active]);

  // Toggle handler for the button
  const toggle = useCallback(() => {
    if (active) deactivate();
    else activate();
  }, [active, activate, deactivate]);

  // Keyboard shortcut: M to deactivate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (active) deactivate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, deactivate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sirenRef.current?.stop();
      shakeRef.current?.kill();
      const root = document.getElementById('root');
      if (root) gsap.set(root, { clearProps: 'x,y,rotation' });
    };
  }, []);

  return (
    <>
      {/* Trigger button — now toggles on/off */}
      <motion.button
        onClick={toggle}
        className={`fixed top-5 right-16 lg:right-16 z-[94] w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
        active ?
        'bg-red-500/20 border-red-500/40 text-red-400 shadow-lg shadow-red-500/25' :
        'bg-white/[0.03] border-white/[0.07] text-white/50 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/[0.06]'}`
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        title="Emergency Alert">

        <ShieldAlert className="w-4 h-4" />
      </motion.button>

      {/* White flash overlay */}
      <AnimatePresence>
        {flash &&
        <motion.div
          className="fixed inset-0 z-[200] bg-white pointer-events-none"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }} />

        }
      </AnimatePresence>

      {/* Emergency overlay */}
      <AnimatePresence>
        {active &&
        <>
            {/* Red vignette + scan effects */}
            <motion.div
            className="fixed inset-0 z-[95] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>

              {/* Radial red vignette */}
              <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,20,0.1) 60%, rgba(255,0,20,0.22) 100%)'
            }} />


              {/* Pulsing red flash */}
              <motion.div
              className="absolute inset-0 bg-red-600/[0.06]"
              animate={{ opacity: [0, 0.08, 0, 0.04, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }} />


              {/* Scan line */}
              <motion.div
              className="absolute left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,0,20,0.5), transparent)',
                boxShadow: '0 0 20px rgba(255,0,20,0.3)'
              }}
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />


              {/* CRT scanlines */}
              <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,20,0.15) 2px, rgba(255,0,20,0.15) 4px)'
            }} />


              {/* Pulsing red border */}
              <motion.div
              className="absolute inset-2 rounded-xl pointer-events-none"
              style={{ border: '1px solid rgba(255,0,20,0.15)' }}
              animate={{ borderColor: ['rgba(255,0,20,0.15)', 'rgba(255,0,20,0.4)', 'rgba(255,0,20,0.15)'] }}
              transition={{ duration: 1.5, repeat: Infinity }} />


              {/* Corner brackets */}
              {[
            { top: 8, left: 8 },
            { top: 8, right: 8 },
            { bottom: 8, left: 8 },
            { bottom: 8, right: 8 }].
            map((pos, i) =>
            <motion.div
              key={i}
              className="absolute w-6 h-6 sm:w-10 sm:h-10"
              style={{
                ...pos,
                borderTop: 'top' in pos ? '2px solid rgba(255,0,20,0.5)' : 'none',
                borderBottom: 'bottom' in pos ? '2px solid rgba(255,0,20,0.5)' : 'none',
                borderLeft: 'left' in pos && !('right' in pos) ? '2px solid rgba(255,0,20,0.5)' : 'none',
                borderRight: 'right' in pos && !('left' in pos) ? '2px solid rgba(255,0,20,0.5)' : 'none'
              } as React.CSSProperties}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />

            )}
            </motion.div>

            {/* Centre warning symbol */}
            <motion.div
            className="fixed inset-0 z-[96] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.15 }}>

              <div className="w-40 h-40 sm:w-56 sm:h-56">
                <WarningSVG />
              </div>
            </motion.div>

            {/* Top HUD bar */}
            <motion.div
            className="fixed top-14 lg:top-4 left-4 right-4 lg:left-24 z-[97] pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}>

              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-950/50 backdrop-blur-md border border-red-500/25">
                <div className="flex items-center gap-2.5">
                  <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}>

                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  </motion.div>
                  <motion.span
                  className="text-[10px] sm:text-xs font-display tracking-[0.2em] text-red-400 font-bold"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}>

                    ⚠ EMERGENCY PROTOCOL ACTIVE
                  </motion.span>
                </div>
                <div className="flex items-center gap-3">
                  <motion.div
                  className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }} />

                </div>
              </div>
            </motion.div>

            {/* STAND DOWN button */}
            <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[97]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}>

              <motion.button
              onClick={deactivate}
              className="px-8 py-3 rounded-xl bg-red-950/60 backdrop-blur-md border border-red-500/30 text-red-300 font-display text-sm font-bold tracking-[0.2em] cursor-pointer"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,0,20,0.6)' }}
              whileTap={{ scale: 0.95 }}
              animate={{ boxShadow: ['0 0 0px rgba(255,0,20,0)', '0 0 25px rgba(255,0,20,0.2)', '0 0 0px rgba(255,0,20,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}>

                ■ STAND DOWN
              </motion.button>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </>);

}

export default memo(EmergencyButton);