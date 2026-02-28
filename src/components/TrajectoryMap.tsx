import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { EXPO_IN_OUT, EXPO_OUT } from '@/lib/easing';

/* ================================================================
   TRAJECTORY MAP

   Animated SVG Hohmann-transfer visualisation.
   When a launch window is selected the component draws a curved
   trajectory from Earth → Mars, with a spacecraft dot travelling
   along the path, waypoint diamonds, and an arrival pulse.

   • Framer Motion `pathLength` — line-drawing effect
   • SVG `<animateMotion>`      — spacecraft dot follows the curve
   • Keyed `<g>`               — re-animates when the date changes
   ================================================================ */

// ── Fixed positions ──
const EARTH = { x: 72, y: 122 };
const MARS = { x: 488, y: 100 };
const SUN = { x: 270, y: 112 };

// ── Per-launch-window data ──
interface WindowData {
  days: number;
  distMkm: number;
  deltaV: number;
  /** cubic-bezier control points (C cx1 cy1, cx2 cy2) */
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
}

const WINDOWS: Record<string, WindowData> = {
  'March 2026': { days: 182, distMkm: 225, deltaV: 3.6, cx1: 185, cy1: 26, cx2: 375, cy2: 26 },
  'June 2026': { days: 214, distMkm: 310, deltaV: 4.1, cx1: 175, cy1: 205, cx2: 385, cy2: 205 },
  'September 2026': { days: 243, distMkm: 401, deltaV: 4.8, cx1: 145, cy1: 16, cx2: 415, cy2: 16 },
  'January 2027': { days: 168, distMkm: 195, deltaV: 3.3, cx1: 205, cy1: 195, cx2: 355, cy2: 195 }
};

// ── Helpers ──
function bez(t: number, p0: number, c1: number, c2: number, p1: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t * t * t * p1;
}

/** Deterministic star field (constant between renders) */
const STARS = Array.from({ length: 40 }, (_, i) => ({
  cx: i * 137.508 % 560,
  cy: (i * 97.31 + 13) % 240,
  r: 0.35 + i % 4 * 0.25,
  o: 0.08 + i % 5 * 0.04
}));

const DRAW_DUR = 2; // seconds
const DRAW_EASE = EXPO_IN_OUT;
const SMIL_SPLINE = '0.42 0 0.58 1';

// ── Stat chip ──
function Stat({ label, value }: {label: string;value: string;}) {
  return (
    <div className="text-center px-1">
      <div className="text-[7px] sm:text-[8px] font-display tracking-[0.18em] text-white/50 leading-none">
        {label}
      </div>
      <div className="text-[10px] sm:text-[11px] font-display font-bold text-primary/70 mt-0.5 leading-none">
        {value}
      </div>
    </div>);

}

// ── Component ──
interface TrajectoryMapProps {
  selectedDate: string;
}

function TrajectoryMap({ selectedDate }: TrajectoryMapProps) {
  const w = WINDOWS[selectedDate];
  if (!w) return null;

  const pathD = `M ${EARTH.x} ${EARTH.y} C ${w.cx1} ${w.cy1}, ${w.cx2} ${w.cy2}, ${MARS.x} ${MARS.y}`;

  // Waypoint positions (25 %, 50 %, 75 %)
  const waypoints = useMemo(
    () =>
    [0.25, 0.5, 0.75].map((t) => ({
      x: bez(t, EARTH.x, w.cx1, w.cx2, MARS.x),
      y: bez(t, EARTH.y, w.cy1, w.cy2, MARS.y)
    })),
    [w.cx1, w.cy1, w.cx2, w.cy2]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EXPO_OUT }}
      className="mt-5 rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05]">

      {/* ── SVG ── */}
      <svg
      viewBox="0 0 560 240"
      className="w-full h-auto block"
      role="img"
      aria-label={`Trajectory map for ${selectedDate} launch window`}
      style={{ fontFamily: 'Orbitron, monospace' }}>

        <defs>
          <radialGradient id="tm-sun"><stop offset="0%" stopColor="#eab308" stopOpacity="0.22" /><stop offset="100%" stopColor="#eab308" stopOpacity="0" /></radialGradient>
          <radialGradient id="tm-earth"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></radialGradient>
          <radialGradient id="tm-mars"><stop offset="0%" stopColor="#FF4500" stopOpacity="0.18" /><stop offset="100%" stopColor="#FF4500" stopOpacity="0" /></radialGradient>
          <filter id="tm-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="5" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="tm-dot" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Stars */}
        {STARS.map((s, i) =>
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity={s.o} />
        )}

        {/* Orbital rings (dashed) */}
        <ellipse cx={SUN.x} cy={SUN.y} rx={200} ry={75} fill="none" stroke="rgba(100,160,255,0.05)" strokeWidth="0.5" strokeDasharray="4 8" />
        <ellipse cx={SUN.x} cy={SUN.y} rx={240} ry={98} fill="none" stroke="rgba(255,69,0,0.05)" strokeWidth="0.5" strokeDasharray="4 8" />

        {/* ── Sun ── */}
        <circle cx={SUN.x} cy={SUN.y} r={30} fill="url(#tm-sun)" />
        <circle cx={SUN.x} cy={SUN.y} r={5} fill="#eab308" opacity={0.35} />
        <circle cx={SUN.x} cy={SUN.y} r={2.5} fill="#eab308" opacity={0.65} />
        <text x={SUN.x} y={SUN.y + 14} textAnchor="middle" fontSize="5" fill="#eab308" opacity={0.2} letterSpacing="1.5">SOL</text>

        {/* ── Earth ── */}
        <circle cx={EARTH.x} cy={EARTH.y} r={24} fill="url(#tm-earth)" />
        <circle cx={EARTH.x} cy={EARTH.y} r={9} fill="#1e3a5f" opacity={0.55} />
        <circle cx={EARTH.x} cy={EARTH.y} r={8} fill="none" stroke="#3b82f6" strokeWidth="0.6" opacity={0.4} />
        <circle cx={EARTH.x} cy={EARTH.y} r={4.5} fill="#3b82f6" opacity={0.35} />
        {/* crosshairs */}
        <line x1={EARTH.x - 15} y1={EARTH.y} x2={EARTH.x - 11} y2={EARTH.y} stroke="#3b82f6" strokeWidth="0.5" opacity={0.25} />
        <line x1={EARTH.x + 11} y1={EARTH.y} x2={EARTH.x + 15} y2={EARTH.y} stroke="#3b82f6" strokeWidth="0.5" opacity={0.25} />
        <line x1={EARTH.x} y1={EARTH.y - 15} x2={EARTH.x} y2={EARTH.y - 11} stroke="#3b82f6" strokeWidth="0.5" opacity={0.25} />
        <line x1={EARTH.x} y1={EARTH.y + 11} x2={EARTH.x} y2={EARTH.y + 15} stroke="#3b82f6" strokeWidth="0.5" opacity={0.25} />
        <text x={EARTH.x} y={EARTH.y + 22} textAnchor="middle" fontSize="5.5" fill="#3b82f6" opacity={0.4} letterSpacing="2">EARTH</text>
        {/* departure pulse */}
        <circle cx={EARTH.x} cy={EARTH.y} r={12} fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity={0.15}>
          <animate attributeName="r" values="12;18;12" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.03;0.15" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* ── Mars ── */}
        <circle cx={MARS.x} cy={MARS.y} r={22} fill="url(#tm-mars)" />
        <circle cx={MARS.x} cy={MARS.y} r={7.5} fill="#7f1d1d" opacity={0.5} />
        <circle cx={MARS.x} cy={MARS.y} r={6.5} fill="none" stroke="#FF4500" strokeWidth="0.6" opacity={0.35} />
        <circle cx={MARS.x} cy={MARS.y} r={3.8} fill="#FF4500" opacity={0.3} />
        {/* crosshairs */}
        <line x1={MARS.x - 13} y1={MARS.y} x2={MARS.x - 9} y2={MARS.y} stroke="#FF4500" strokeWidth="0.5" opacity={0.25} />
        <line x1={MARS.x + 9} y1={MARS.y} x2={MARS.x + 13} y2={MARS.y} stroke="#FF4500" strokeWidth="0.5" opacity={0.25} />
        <line x1={MARS.x} y1={MARS.y - 13} x2={MARS.x} y2={MARS.y - 9} stroke="#FF4500" strokeWidth="0.5" opacity={0.25} />
        <line x1={MARS.x} y1={MARS.y + 9} x2={MARS.x} y2={MARS.y + 13} stroke="#FF4500" strokeWidth="0.5" opacity={0.25} />
        <text x={MARS.x} y={MARS.y + 20} textAnchor="middle" fontSize="5.5" fill="#FF4500" opacity={0.4} letterSpacing="2">MARS</text>

        {/* ── Frame corners ── */}
        {[
        { x1: 4, y1: 4, x2: 22, y2: 4, x3: 4, y3: 22 },
        { x1: 556, y1: 4, x2: 538, y2: 4, x3: 556, y3: 22 },
        { x1: 4, y1: 236, x2: 22, y2: 236, x3: 4, y3: 218 },
        { x1: 556, y1: 236, x2: 538, y2: 236, x3: 556, y3: 218 }].
        map((c, i) =>
        <g key={i} opacity={0.07}>
            <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="white" strokeWidth="0.5" />
            <line x1={c.x1} y1={c.y1} x2={c.x3} y2={c.y3} stroke="white" strokeWidth="0.5" />
          </g>
        )}

        {/* ── ANIMATED GROUP (re-mounts on date change) ── */}
        <g key={selectedDate}>
          {/* Glow trail (wide, dim) */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#FF4500"
            strokeWidth={8}
            opacity={0.045}
            filter="url(#tm-glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: DRAW_DUR, ease: DRAW_EASE }} />


          {/* Main trajectory line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#FF4500"
            strokeWidth={1.3}
            opacity={0.65}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: DRAW_DUR, ease: DRAW_EASE }} />


          {/* Thin inner bright core */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="white"
            strokeWidth={0.4}
            opacity={0.15}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: DRAW_DUR, ease: DRAW_EASE }} />


          {/* Waypoint diamonds (fade in sequentially) */}
          {waypoints.map((wp, i) =>
          <motion.rect
            key={i}
            x={wp.x - 2.5}
            y={wp.y - 2.5}
            width={5}
            height={5}
            rx={0.5}
            fill="#FF4500"
            transform={`rotate(45 ${wp.x} ${wp.y})`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: (DRAW_DUR * (0.25 + i * 0.25)), duration: 0.25, ease: EXPO_OUT }} />

          )}

          {/* ── Spacecraft ── */}
          <g>
            <animateMotion
            dur={`${DRAW_DUR}s`}
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines={SMIL_SPLINE}
            path={pathD} />

            {/* outer glow */}
            <circle r={10} fill="#FF4500" opacity={0.12} filter="url(#tm-dot)" />
            {/* body */}
            <circle r={3.5} fill="#FF4500" opacity={0.9} />
            {/* highlight */}
            <circle r={1.6} fill="white" opacity={0.7} />
          </g>

          {/* Arrival pulse (appears when dot reaches Mars) */}
          <circle cx={MARS.x} cy={MARS.y} r={8} fill="none" stroke="#FF4500" strokeWidth="1" opacity={0}>
            <animate attributeName="opacity" values="0;0;0.5" keyTimes="0;0.95;1" dur={`${DRAW_DUR}s`} fill="freeze" />
            <animate attributeName="r" from="8" to="24" begin={`${DRAW_DUR}s`} dur="0.8s" fill="freeze" />
            <animate attributeName="opacity" values="0.5;0" begin={`${DRAW_DUR}s`} dur="0.8s" fill="freeze" />
          </circle>
          <circle cx={MARS.x} cy={MARS.y} r={8} fill="none" stroke="#FF4500" strokeWidth="0.5" opacity={0}>
            <animate attributeName="opacity" values="0;0;0.3" keyTimes="0;0.95;1" dur={`${DRAW_DUR}s`} fill="freeze" />
            <animate attributeName="r" from="8" to="18" begin={`${DRAW_DUR + 0.15}s`} dur="0.6s" fill="freeze" />
            <animate attributeName="opacity" values="0.3;0" begin={`${DRAW_DUR + 0.15}s`} dur="0.6s" fill="freeze" />
          </circle>
        </g>

        {/* Label */}
        <text x={280} y={234} textAnchor="middle" fontSize="4.5" fill="white" opacity={0.08} letterSpacing="3">
          HOHMANN TRANSFER TRAJECTORY
        </text>
      </svg>

      {/* ── Stats bar ── */}
      <motion.div
        key={`stats-${selectedDate}`}
        className="px-3 sm:px-5 py-2.5 flex items-center justify-between border-t border-white/[0.04]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: DRAW_DUR * 0.7, duration: 0.5, ease: EXPO_OUT }}>

        <Stat label="DISTANCE" value={`${w.distMkm}M km`} />
        <div className="w-px h-4 bg-white/[0.04]" />
        <Stat label="TRAVEL TIME" value={`${w.days} days`} />
        <div className="w-px h-4 bg-white/[0.04]" />
        <Stat label="DELTA-V" value={`${w.deltaV} km/s`} />
        <div className="w-px h-4 bg-white/[0.04] hidden sm:block" />
        <Stat label="WINDOW" value={selectedDate.toUpperCase()} />
      </motion.div>
    </motion.div>);

}

export default memo(TrajectoryMap);