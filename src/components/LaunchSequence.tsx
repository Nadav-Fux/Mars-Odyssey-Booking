import { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { CheckCircle } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   FULL-SCREEN LAUNCH SEQUENCE

   Phases:
     countdown (T-3, T-2, T-1) → ignition → liftoff → flash → confirmed

   • SVG rocket with SMIL-animated exhaust flame
   • GSAP timeline: power3.in ascent + shake keyframes
   • Framer Motion particle emitter + flash + confirmation card
   ================================================================ */

// ── Pre-computed constants ──

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  dx: Math.sin(i * 1.7) * 55,
  dy: 100 + Math.cos(i * 2.3) * 100,
  size: 2 + i % 3 * 1.5,
  delay: i % 5 * 0.09,
  color: ['#FF6600', '#FFD700', '#FF4500'][i % 3]
}));

const SPEED_LINES = Array.from({ length: 22 }, (_, i) => ({
  x: `${5 + i * 41 % 90}%`,
  h: 22 + i % 5 * 14,
  delay: i * 0.07
}));

const STARS_BG = Array.from({ length: 70 }, (_, i) => ({
  x: `${i * 12.7 % 100}%`,
  y: `${(i * 8.1 + 4) % 100}%`,
  o: 0.08 + i % 6 * 0.04
}));

type Phase = 'countdown' | 'ignition' | 'liftoff' | 'flash' | 'confirmed';

export interface LaunchBooking {
  cabin: string;
  cabinColor: string;
  seat: string;
  passenger: string;
  destination: string;
  date: string;
  price: string;
}

interface Props {
  active: boolean;
  onComplete: () => void;
  booking: LaunchBooking;
}

// ── Rocket SVG ──

function RocketSVG() {
  return (
    <svg viewBox="-35 -75 70 175" width="90" height="225" className="block">
      <defs>
        <linearGradient id="ls-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8c8c8" />
          <stop offset="45%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#a8a8a8" />
        </linearGradient>
        <linearGradient id="ls-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="40%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Body */}
      <path
      d="M0,-65 Q-16,-50 -17,8 L-17,20 Q-17,22 -15,22 L15,22 Q17,22 17,20 L17,8 Q16,-50 0,-65Z"
      fill="url(#ls-b)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

      {/* Nose */}
      <path d="M0,-65 Q-10,-55 -12,-42 L12,-42 Q10,-55 0,-65Z" fill="#FF4500" />
      {/* Window */}
      <circle cx="0" cy="-20" r="7" fill="#0a1628" stroke="#4ab8c4" strokeWidth="0.8" />
      <circle cx="0" cy="-20" r="5" fill="#1a3a5c" />
      <circle cx="-2" cy="-22" r="1.8" fill="rgba(255,255,255,0.25)" />
      {/* Panels */}
      <line x1="-11" y1="-8" x2="-11" y2="16" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      <line x1="11" y1="-8" x2="11" y2="16" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
      <text
      x="0" y="5" textAnchor="middle" fontSize="4.5"
      fill="rgba(0,0,0,0.12)" fontFamily="Orbitron,monospace" letterSpacing="1">

        ARES-X
      </text>
      {/* Fins */}
      <path d="M-17,14 L-28,38 L-17,24Z" fill="#FF4500" />
      <path d="M17,14 L28,38 L17,24Z" fill="#FF4500" />
      <path d="M0,22 L-4,36 L0,30 L4,36Z" fill="#cc3500" />
      {/* Nozzle */}
      <ellipse cx="0" cy="24" rx="9" ry="3" fill="#555" />
      <ellipse cx="0" cy="25.5" rx="7" ry="2" fill="#333" />

      {/* Exhaust */}
      <ellipse cx="0" cy="50" rx="13" ry="40" fill="url(#ls-f)" opacity="0.8">
        <animate attributeName="ry" values="40;48;40" dur="0.1s" repeatCount="indefinite" />
        <animate attributeName="rx" values="13;17;13" dur="0.12s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="0" cy="44" rx="6" ry="28" fill="#FFD700" opacity="0.7">
        <animate attributeName="ry" values="28;34;28" dur="0.08s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="0" cy="42" rx="3" ry="18" fill="white" opacity="0.5">
        <animate attributeName="ry" values="18;22;18" dur="0.06s" repeatCount="indefinite" />
      </ellipse>
    </svg>);

}

// ── Component ──

function LaunchSequence({ active, onComplete, booking }: Props) {
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countNum, setCountNum] = useState(3);
  const rocketRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Phase timeline */
  useEffect(() => {
    if (!active) return;
    setPhase('countdown');
    setCountNum(3);

    const t = [
    setTimeout(() => setCountNum(2), 800),
    setTimeout(() => setCountNum(1), 1600),
    setTimeout(() => {setPhase('ignition');setCountNum(0);}, 2300),
    setTimeout(() => setPhase('liftoff'), 2700),
    setTimeout(() => setPhase('flash'), 4700),
    setTimeout(() => setPhase('confirmed'), 5300),
    setTimeout(onComplete, 8500)];

    return () => t.forEach(clearTimeout);
  }, [active, onComplete]);

  /* GSAP rocket ascent + shake */
  useEffect(() => {
    if (phase !== 'liftoff') return;
    const rocket = rocketRef.current;
    const ctr = containerRef.current;
    if (!rocket || !ctr) return;

    const tl = gsap.timeline();
    tl.to(rocket, {
      y: -(window.innerHeight + 400),
      duration: 2,
      ease: 'expo.in'
    });

    const shakeKf = Array.from({ length: 28 }, () => ({
      x: gsap.utils.random(-7, 7),
      y: gsap.utils.random(-4, 4),
      duration: 0.055
    }));
    shakeKf.push({ x: 0, y: 0, duration: 0.25 });
    gsap.to(ctr, { keyframes: shakeKf, ease: 'none' });

    return () => {tl.kill();};
  }, [phase]);

  if (!active) return null;

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[200] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EXPO_OUT }}>

      {/* Background */}
      <div className="absolute inset-0 bg-[#030308]" />
      {STARS_BG.map((s, i) =>
      <div
      key={i}
      className="absolute w-px h-px bg-white rounded-full"
      style={{ left: s.x, top: s.y, opacity: s.o }} />

      )}

      {/* ── Countdown ── */}
      <AnimatePresence mode="wait">
        {phase === 'countdown' &&
        <motion.div
          key={`c-${countNum}`}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.35 }}>

            <span className="font-display text-8xl sm:text-9xl font-bold text-white/80 select-none">
              T&minus;{countNum}
            </span>
          </motion.div>
        }

        {phase === 'ignition' &&
        <motion.div
          key="ign"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ duration: 0.3 }}>

            <span className="font-display text-5xl sm:text-7xl font-bold text-primary tracking-[0.15em] select-none">
              IGNITION
            </span>
          </motion.div>
        }
      </AnimatePresence>

      {/* ── Rocket + particles ── */}
      {(phase === 'ignition' || phase === 'liftoff') &&
      <div
      ref={rocketRef}
      className="absolute left-1/2 -translate-x-1/2"
      style={{ bottom: -30 }}>

          <RocketSVG />

          {phase === 'liftoff' &&
        PARTICLES.map((p, i) =>
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: 150,
            width: p.size,
            height: p.size,
            backgroundColor: p.color
          }}
          animate={{
            x: [0, p.dx],
            y: [0, p.dy],
            opacity: [0.9, 0],
            scale: [1, 0.15]
          }}
          transition={{
            duration: 0.7 + i % 4 * 0.2,
            repeat: Infinity,
            delay: p.delay
          }} />

        )}
        </div>
      }

      {/* ── Speed lines ── */}
      {phase === 'liftoff' &&
      SPEED_LINES.map((l, i) =>
      <motion.div
        key={i}
        className="absolute bg-white/20 rounded-full"
        style={{ left: l.x, width: 1, height: l.h, top: -60 }}
        animate={{ y: [0, window.innerHeight + 100], opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.35 + i % 3 * 0.15, delay: l.delay, repeat: 3 }} />

      )}

      {/* ── Flash ── */}
      <AnimatePresence>
        {phase === 'flash' &&
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }} />

        }
      </AnimatePresence>

      {/* ── Confirmation ── */}
      {phase === 'confirmed' &&
      <motion.div
        className="absolute inset-0 flex items-center justify-center p-6"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}>

          <div className="text-center max-w-sm">
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
            className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto mb-6">

              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>

            <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">

              BOOKING CONFIRMED
            </motion.h2>

            <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="space-y-1.5">

              <p className="text-white/40 text-sm">
                Seat{' '}
                <span className="font-bold" style={{ color: booking.cabinColor }}>
                  {booking.seat}
                </span>{' '}
                &mdash; {booking.cabin} Class
              </p>
              <p className="text-white/30 text-xs">
                {booking.passenger} &middot; {booking.destination} &middot; {booking.date}
              </p>
              <p className="text-white/50 text-[10px] font-display tracking-[0.18em] mt-4">
                CHECK YOUR EMAIL FOR BOARDING PASS
              </p>
            </motion.div>
          </div>
        </motion.div>
      }
    </motion.div>);

}

export default memo(LaunchSequence);