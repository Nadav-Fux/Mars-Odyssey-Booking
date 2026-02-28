import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   LIVE MARS CLOCK WIDGET

   Calculates the Mars Sol Date (MSD) and Mars Coordinated Time
   (MTC) from the current Earth time in real-time.

   Mars time math:
     Julian Date  = unix_ms / 86400000 + 2440587.5
     MSD          = (JD − 2451549.5) / 1.02749125170 + 44796.0 − 0.00096
     MTC (24h)    = fractional_MSD × 24

   Features:
     • Live-ticking Sol counter + MTC clock (HH:MM:SS)
     • Earth time comparison
     • Sol progress arc
     • Interlocking SVG mechanical gear cluster that spins
     • Collapsible floating widget (bottom-right)
     • Hidden on mobile (< lg) to save screen real estate
   ================================================================ */

// ── Mars time constants ──
const JULIAN_UNIX_EPOCH = 2440587.5;
const MARS_SOL_EPOCH_JD = 2451549.5; // Jan 6, 2000
const MARS_SOL_RATIO = 1.02749125170; // Earth days per Mars sol
const MSD_OFFSET = 44796.0;
const MSD_CORRECTION = 0.00096;
const MS_PER_DAY = 86400000;

interface MarsTime {
  msd: number; // Mars Sol Date
  sol: number; // Integer sol number
  hours: number;
  minutes: number;
  seconds: number;
  fraction: number; // Sol fraction 0-1
  earthISO: string;
}

function computeMarsTime(now: Date): MarsTime {
  const jd = now.getTime() / MS_PER_DAY + JULIAN_UNIX_EPOCH;
  const msd = (jd - MARS_SOL_EPOCH_JD) / MARS_SOL_RATIO + MSD_OFFSET - MSD_CORRECTION;

  const sol = Math.floor(msd);
  const fraction = msd - sol;
  const totalMarsSeconds = fraction * 24 * 3600;

  const hours = Math.floor(totalMarsSeconds / 3600);
  const minutes = Math.floor(totalMarsSeconds % 3600 / 60);
  const seconds = Math.floor(totalMarsSeconds % 60);

  const earthISO = now.toISOString().slice(11, 19);

  return { msd, sol, hours, minutes, seconds, fraction, earthISO };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// ── SVG Gear path generator ──
function gearPath(cx: number, cy: number, outerR: number, innerR: number, teeth: number): string {
  const pts: string[] = [];
  const step = Math.PI * 2 / teeth;

  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const tipWidth = step * 0.22;
    const rootWidth = step * 0.28;

    const r1a = a - rootWidth;
    pts.push(`${cx + innerR * Math.cos(r1a)},${cy + innerR * Math.sin(r1a)}`);
    const t1a = a - tipWidth;
    pts.push(`${cx + outerR * Math.cos(t1a)},${cy + outerR * Math.sin(t1a)}`);
    const t2a = a + tipWidth;
    pts.push(`${cx + outerR * Math.cos(t2a)},${cy + outerR * Math.sin(t2a)}`);
    const r2a = a + rootWidth;
    pts.push(`${cx + innerR * Math.cos(r2a)},${cy + innerR * Math.sin(r2a)}`);
  }

  return `M${pts.join(' L')} Z`;
}

// ── Gear cluster component ──
const GearCluster = memo(function GearCluster({ fraction }: {fraction: number;}) {
  const g1 = useMemo(() => gearPath(0, 0, 28, 21, 12), []);
  const g2 = useMemo(() => gearPath(0, 0, 18, 13, 8), []);
  const g3 = useMemo(() => gearPath(0, 0, 12, 8.5, 6), []);

  return (
    <svg viewBox="-42 -42 84 84" className="w-full h-full" fill="none">
      <defs>
        <filter id="gear-glow">
          <feGaussianBlur stdDeviation="1.2" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Large main gear */}
      <g style={{ animation: 'spin-cw 16s linear infinite', transformOrigin: '0px 0px' }}>
        <path d={g1} stroke="#FF4500" strokeWidth="0.8" strokeOpacity="0.45" fill="#FF4500" fillOpacity="0.04" filter="url(#gear-glow)" />
        <circle cx="0" cy="0" r="5" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
        <circle cx="0" cy="0" r="2" fill="#FF4500" fillOpacity="0.35" />
        {[0, 60, 120, 180, 240, 300].map((deg) =>
          <line key={deg} x1="0" y1="0"
            x2={16 * Math.cos(deg * Math.PI / 180)} y2={16 * Math.sin(deg * Math.PI / 180)}
            stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.15" />
        )}
      </g>

      {/* Medium gear */}
      <g style={{ animation: 'spin-ccw 10.67s linear infinite', transformOrigin: '30px -18px' }}>
        <g transform="translate(30, -18)">
          <path d={g2} stroke="#ff6b35" strokeWidth="0.7" strokeOpacity="0.4" fill="#ff6b35" fillOpacity="0.03" />
          <circle cx="0" cy="0" r="3" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.3" fill="none" />
          <circle cx="0" cy="0" r="1.2" fill="#ff6b35" fillOpacity="0.35" />
          {[0, 90, 180, 270].map((deg) =>
            <line key={deg} x1="0" y1="0"
              x2={9 * Math.cos(deg * Math.PI / 180)} y2={9 * Math.sin(deg * Math.PI / 180)}
              stroke="#ff6b35" strokeWidth="0.35" strokeOpacity="0.12" />
          )}
        </g>
      </g>

      {/* Small gear */}
      <g style={{ animation: 'spin-cw 8s linear infinite', transformOrigin: '24px 22px' }}>
        <g transform="translate(24, 22)">
          <path d={g3} stroke="#4ab8c4" strokeWidth="0.6" strokeOpacity="0.35" fill="#4ab8c4" fillOpacity="0.03" />
          <circle cx="0" cy="0" r="2" stroke="#4ab8c4" strokeWidth="0.35" strokeOpacity="0.3" fill="none" />
          <circle cx="0" cy="0" r="0.8" fill="#4ab8c4" fillOpacity="0.35" />
        </g>
      </g>

      {/* Sol progress arc */}
      <circle cx="0" cy="0" r="38" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" fill="none" />
      <circle cx="0" cy="0" r="38" stroke="#FF4500" strokeWidth="1.2" strokeOpacity="0.3" fill="none" strokeLinecap="round"
        strokeDasharray={`${fraction * 238.76} 238.76`} transform="rotate(-90)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <circle
        cx={38 * Math.cos((fraction * 360 - 90) * Math.PI / 180)}
        cy={38 * Math.sin((fraction * 360 - 90) * Math.PI / 180)}
        r="2" fill="#FF4500" fillOpacity="0.7" style={{ transition: 'cx 1s ease, cy 1s ease' }}>
        <animate attributeName="fillOpacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Tick marks */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = i / 24 * 360 - 90;
        const rad = angle * Math.PI / 180;
        const isMajor = i % 6 === 0;
        const r1 = isMajor ? 34.5 : 36;
        const r2 = 38;
        return (
          <line key={`tick-${i}`}
            x1={r1 * Math.cos(rad)} y1={r1 * Math.sin(rad)}
            x2={r2 * Math.cos(rad)} y2={r2 * Math.sin(rad)}
            stroke="white" strokeWidth={isMajor ? 0.6 : 0.3} strokeOpacity={isMajor ? 0.15 : 0.06} />
        );
      })}
    </svg>
  );
});

// ── Inline keyframes (injected once) ──
const STYLE_ID = 'mars-clock-keyframes';
function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes spin-cw {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes spin-ccw {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ── Main widget ──
function MarsClock() {
  const [mars, setMars] = useState<MarsTime>(() => computeMarsTime(new Date()));
  const [expanded, setExpanded] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    injectKeyframes();
    intervalRef.current = setInterval(() => {
      setMars(computeMarsTime(new Date()));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    /* Hidden on mobile/tablet — shown on lg+ desktops only.
       On small screens the bottom-right is reserved for SpaceAudio + BackToTop. */
    <div className="hidden lg:block fixed bottom-5 right-5 z-[60] select-none" style={{ perspective: '600px' }}>
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.5, ease: EXPO_OUT }}>

        {/* Glass card */}
        <div
          className="rounded-2xl overflow-hidden backdrop-blur-xl"
          style={{
            background: 'rgba(8, 8, 18, 0.8)',
            border: '1px solid rgba(255, 69, 0, 0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)'
          }}>

          {/* Header — always visible */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-display tracking-[0.18em] text-primary/70 font-bold">MARS TIME</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-white tabular-nums tracking-wide">
                {pad(mars.hours)}:{pad(mars.minutes)}:{pad(mars.seconds)}
              </span>
              {expanded ?
                <ChevronDown className="w-3 h-3 text-white/50" /> :
                <ChevronUp className="w-3 h-3 text-white/50" />
              }
            </div>
          </button>

          {/* Expandable body */}
          <AnimatePresence>
            {expanded &&
              <motion.div key="body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EXPO_OUT }}
                className="overflow-hidden">
                <div className="px-3.5 pb-3.5">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent mb-3" />

                  <div className="flex items-start gap-3">
                    {/* Gear cluster */}
                    <div className="w-[92px] h-[92px] flex-shrink-0">
                      <GearCluster fraction={mars.fraction} />
                    </div>

                    {/* Data readouts */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="text-[7px] font-display tracking-[0.2em] text-white/50 mb-0.5">SOL DATE</div>
                        <div className="font-display text-lg font-bold text-white tabular-nums leading-none">
                          {mars.sol.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[7px] font-display tracking-[0.2em] text-white/50 mb-0.5">MTC</div>
                        <div className="font-display text-sm font-semibold text-primary tabular-nums leading-none">
                          {pad(mars.hours)}:{pad(mars.minutes)}:{pad(mars.seconds)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[7px] font-display tracking-[0.2em] text-white/50 mb-0.5">EARTH UTC</div>
                        <div className="font-display text-xs text-white/40 tabular-nums leading-none">
                          {mars.earthISO}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sol progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[7px] font-display tracking-[0.15em] text-white/50">SOL PROGRESS</span>
                      <span className="text-[7px] font-display tracking-[0.1em] text-primary/40 tabular-nums">
                        {(mars.fraction * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-accent/40"
                        style={{ width: `${mars.fraction * 100}%`, transition: 'width 1s ease', boxShadow: '0 0 8px rgba(255, 69, 0, 0.3)' }} />
                    </div>
                  </div>

                  <div className="mt-2 text-[6.5px] font-display tracking-[0.1em] text-white/10 text-center">
                    1 SOL = 24h 39m 35s EARTH TIME
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(MarsClock);
