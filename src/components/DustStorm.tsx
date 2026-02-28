import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';
import { EXPO_IN_OUT, EXPO_OUT } from '@/lib/easing';

/**
 * DustStorm
 *
 * A self-contained Martian dust storm that randomly triggers
 * every ~2 minutes. When active it layers:
 *
 *  1. Full-screen animated orange noise grain (SVG feTurbulence)
 *  2. Directional sand-streak particles (canvas)
 *  3. A warm orange colour shift on the viewport
 *  4. A CSS class on <html> that applies "wind" sway
 *     to all glassmorphism cards & sections
 *  5. A small HUD warning banner
 *
 * Storm duration: 12-18 s (randomised).
 * Interval between storms: 100-140 s (≈ 2 min, randomised).
 */

// ── Config ──────────────────────────────────────────────
const MIN_INTERVAL = 100_000; // ms between storms
const MAX_INTERVAL = 140_000;
const MIN_DURATION = 12_000; // storm length
const MAX_DURATION = 18_000;
const FADE_IN = 2500; // ms
const FADE_OUT = 3500;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// ── Wind CSS injected once ──────────────────────────────
const windCSS = `
/* === DUST STORM: Wind sway on UI panels === */
@keyframes dust-sway {
  0%   { transform: translateX(0)    rotate(0deg);   }
  15%  { transform: translateX(3px)  rotate(0.15deg); }
  30%  { transform: translateX(-2px) rotate(-0.1deg); }
  50%  { transform: translateX(4px)  rotate(0.2deg);  }
  70%  { transform: translateX(-3px) rotate(-0.15deg);}
  85%  { transform: translateX(2px)  rotate(0.1deg);  }
  100% { transform: translateX(0)    rotate(0deg);    }
}

@keyframes dust-sway-subtle {
  0%   { transform: translateX(0)    skewX(0deg);    }
  20%  { transform: translateX(1.5px) skewX(0.08deg); }
  40%  { transform: translateX(-1px) skewX(-0.05deg);}
  60%  { transform: translateX(2px)  skewX(0.1deg);  }
  80%  { transform: translateX(-1.5px) skewX(-0.06deg);}
  100% { transform: translateX(0)    skewX(0deg);    }
}

@keyframes dust-streak {
  0%   { transform: translateX(-120vw) scaleX(1); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateX(120vw) scaleX(1.3); opacity: 0; }
}

@keyframes dust-noise-drift {
  0%   { transform: translate(0, 0); }
  50%  { transform: translate(-5%, 2%); }
  100% { transform: translate(0, 0); }
}

/* Cards / sections sway when storm is active */
.dust-storm-active section,
.dust-storm-active [class*="rounded-2xl"],
.dust-storm-active [class*="rounded-xl"] {
  animation: dust-sway 3.2s ease-in-out infinite;
}

/* Headings and text get a subtler shift */
.dust-storm-active h1,
.dust-storm-active h2,
.dust-storm-active h3,
.dust-storm-active p,
.dust-storm-active span {
  animation: dust-sway-subtle 2.8s ease-in-out infinite;
}

/* Stagger child delays for organic feel */
.dust-storm-active section:nth-child(odd)  { animation-delay: 0s;    }
.dust-storm-active section:nth-child(even) { animation-delay: -0.6s; }
.dust-storm-active [class*="rounded-2xl"]:nth-child(odd)  { animation-delay: -0.3s; }
.dust-storm-active [class*="rounded-2xl"]:nth-child(even) { animation-delay: -1.1s; }
.dust-storm-active [class*="rounded-xl"]:nth-child(3n)    { animation-delay: -0.8s; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dust-storm-active * {
    animation: none !important;
  }
}
`;

// ── Sand streak particles ───────────────────────────────
function SandStreaks() {
  // 12 streaks at random vertical positions
  const streaks = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      top: rand(2, 95),
      height: rand(0.5, 2),
      duration: rand(2.5, 5),
      delay: rand(0, 4),
      opacity: rand(0.04, 0.12)
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[81] overflow-hidden">
      {streaks.current.map((s) =>
      <div
      key={s.id}
      className="absolute left-0 w-[200vw]"
      style={{
        top: `${s.top}%`,
        height: `${s.height}px`,
        background: `linear-gradient(90deg, transparent, rgba(210,120,40,${s.opacity}) 20%, rgba(190,100,30,${s.opacity * 1.3}) 50%, rgba(210,120,40,${s.opacity}) 80%, transparent)`,
        animation: `dust-streak ${s.duration}s ${s.delay}s linear infinite`
      }} />

      )}
    </div>);

}

// ── Main component ──────────────────────────────────────
function DustStorm() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'fadein' | 'peak' | 'fadeout'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Lifecycle: schedule → fadein → peak → fadeout → idle → schedule…
  const scheduleStorm = useCallback(() => {
    const wait = rand(MIN_INTERVAL, MAX_INTERVAL);
    timeoutRef.current = setTimeout(() => {
      startStorm();
    }, wait);
  }, []);

  const startStorm = useCallback(() => {
    setActive(true);
    setPhase('fadein');
    document.documentElement.classList.add('dust-storm-active');

    // After fade-in → peak
    timeoutRef.current = setTimeout(() => {
      setPhase('peak');

      // After peak duration → fadeout
      const dur = rand(MIN_DURATION, MAX_DURATION);
      timeoutRef.current = setTimeout(() => {
        setPhase('fadeout');

        // After fade-out → idle → reschedule
        timeoutRef.current = setTimeout(() => {
          setActive(false);
          setPhase('idle');
          document.documentElement.classList.remove('dust-storm-active');
          scheduleStorm();
        }, FADE_OUT);
      }, dur);
    }, FADE_IN);
  }, [scheduleStorm]);

  // Kick off initial schedule
  useEffect(() => {
    scheduleStorm();
    return () => {
      clearTimeout(timeoutRef.current);
      document.documentElement.classList.remove('dust-storm-active');
    };
  }, [scheduleStorm]);

  // Compute opacity based on phase
  const intensity =
  phase === 'fadein' ? 0.6 :
  phase === 'peak' ? 1 :
  phase === 'fadeout' ? 0 : 0;

  const transitionDur =
  phase === 'fadein' ? FADE_IN / 1000 :
  phase === 'fadeout' ? FADE_OUT / 1000 : 0.3;

  return (
    <>
      {/* Inject wind CSS (always present, only activates with .dust-storm-active) */}
      <style dangerouslySetInnerHTML={{ __html: windCSS }} />

      <AnimatePresence>
        {active &&
        <>
            {/* ── 1. Orange colour wash ── */}
            <motion.div
            key="dust-wash"
            className="fixed inset-0 pointer-events-none z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity * 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDur, ease: EXPO_IN_OUT }}
            style={{
              background: `
                  radial-gradient(ellipse 130% 80% at 40% 45%,
                    rgba(180,80,20,0.25) 0%,
                    rgba(150,60,10,0.15) 40%,
                    rgba(120,50,10,0.08) 70%,
                    transparent 100%
                  )
                `,
              mixBlendMode: 'screen'
            }} />


            {/* ── 2. Orange noise / grain (SVG turbulence) ── */}
            <motion.div
            key="dust-noise"
            className="fixed inset-0 pointer-events-none z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity * 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDur, ease: EXPO_IN_OUT }}
            style={{ animation: 'dust-noise-drift 8s ease-in-out infinite' }}>

              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <filter id="dust-grain" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65"
                  numOctaves="4"
                  stitchTiles="stitch"
                  result="noise">

                      <animate
                    attributeName="seed"
                    values="0;50;100;30;80;0"
                    dur="4s"
                    repeatCount="indefinite" />

                    </feTurbulence>
                    {/* Tint the noise orange */}
                    <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="
                        0.8 0   0   0 0.15
                        0.3 0   0   0 0.05
                        0   0   0   0 0
                        0   0   0 0.12 0
                      "





                  result="orangeNoise" />

                    <feBlend in="orangeNoise" in2="SourceGraphic" mode="screen" />
                  </filter>
                </defs>
                <rect
              width="100%"
              height="100%"
              filter="url(#dust-grain)"
              fill="transparent" />

              </svg>
            </motion.div>

            {/* ── 3. Sand streaks ── */}
            <motion.div
            key="dust-streaks"
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDur, ease: EXPO_IN_OUT }}>

              <SandStreaks />
            </motion.div>

            {/* ── 4. Directional gradient (wind direction: left → right) ── */}
            <motion.div
            key="dust-direction"
            className="fixed inset-0 pointer-events-none z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity * 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDur, ease: EXPO_IN_OUT }}
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(200,100,30,0.06) 30%, rgba(180,80,20,0.1) 60%, rgba(160,70,15,0.04) 100%)'
            }} />


            {/* ── 5. HUD warning banner ── */}
            <motion.div
            key="dust-hud"
            className="fixed top-14 lg:top-4 left-1/2 -translate-x-1/2 z-[85] pointer-events-none"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EXPO_OUT }}>

              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[rgba(60,25,5,0.7)] backdrop-blur-md border border-[rgba(200,100,30,0.25)]">
                <motion.div
                animate={{ rotate: [0, 15, -10, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}>

                  <Wind className="w-3.5 h-3.5 text-orange-400" />
                </motion.div>
                <span className="text-[10px] sm:text-xs font-display tracking-[0.18em] text-orange-300/80">
                  DUST STORM DETECTED — VISIBILITY REDUCED
                </span>
                <motion.div
                className="w-1.5 h-1.5 rounded-full bg-orange-400"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }} />

              </div>
            </motion.div>

            {/* ── 6. Edge darkening / atmosphere haze ── */}
            <motion.div
            key="dust-vignette"
            className="fixed inset-0 pointer-events-none z-[79]"
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity * 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDur, ease: EXPO_IN_OUT }}
            style={{
              background: `
                  radial-gradient(ellipse at center, transparent 20%,
                    rgba(80,35,10,0.12) 60%,
                    rgba(40,15,5,0.25) 100%
                  )
                `
            }} />

          </>
        }
      </AnimatePresence>
    </>);

}

export default memo(DustStorm);