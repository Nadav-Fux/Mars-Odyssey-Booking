import { useRef, useState, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { MapPin, Mountain, Thermometer, Ruler, ChevronRight, Crosshair, Signal, Navigation } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   LANDING ZONES GRID — UPGRADED

   Enhanced cards with:
     • Animated terrain drawing (stroke draws in)
     • Glowing scan line on hover
     • Signal strength indicator
     • Distance from base progress bar
     • Zone index badge
     • Coordinate readout
     • Enhanced expand animation
   ================================================================ */

interface Zone {
  id: string;
  name: string;
  tag: string;
  desc: string;
  emoji: string;
  color: string;
  elevation: string;
  temp: string;
  feature: string;
  terrain: number[];
  lat: string;
  lon: string;
  distance: number; // km from base
  signal: number; // 0-5 bars
}

const ZONES: Zone[] = [
{
  id: 'jezero', name: 'Jezero Crater', tag: 'PRIMARY SITE',
  desc: 'A 45km-wide impact crater with a pristine river delta — the most promising site for ancient microbial life. Your base camp for surface operations.',
  emoji: '◎', color: '#4ab8c4',
  elevation: '-2.6 km', temp: '-60°C avg', feature: 'Ancient delta',
  terrain: [0.3, 0.35, 0.4, 0.5, 0.7, 0.85, 0.9, 0.85, 0.6, 0.3, 0.25, 0.2, 0.25, 0.3, 0.35, 0.4, 0.38, 0.35, 0.3, 0.28],
  lat: '18.38°N', lon: '77.58°E', distance: 0, signal: 5
},
{
  id: 'olympus', name: 'Olympus Mons', tag: 'SUMMIT EXPEDITION',
  desc: 'At 21.9 km, the tallest volcano in the solar system. A caldera 80 km wide with cliffs rising 6 km at the edge — visible from orbit.',
  emoji: '▲', color: '#FF4500',
  elevation: '+21.9 km', temp: '-73°C avg', feature: 'Shield volcano',
  terrain: [0.1, 0.15, 0.22, 0.33, 0.48, 0.62, 0.78, 0.9, 0.98, 1.0, 0.98, 0.92, 0.8, 0.65, 0.5, 0.38, 0.28, 0.2, 0.14, 0.1],
  lat: '18.65°N', lon: '226.2°E', distance: 3400, signal: 3
},
{
  id: 'valles', name: 'Valles Marineris', tag: 'CANYON DESCENT',
  desc: '4,000 km of canyons up to 7 km deep and 200 km wide. The Grand Canyon would be a side-gully here. Rappelling excursions available.',
  emoji: '≡', color: '#ff6b35',
  elevation: '-7 km', temp: '-58°C avg', feature: 'Canyon system',
  terrain: [0.8, 0.75, 0.7, 0.4, 0.15, 0.08, 0.05, 0.08, 0.12, 0.1, 0.08, 0.06, 0.1, 0.2, 0.45, 0.65, 0.75, 0.8, 0.82, 0.8],
  lat: '14°S', lon: '70°W', distance: 2800, signal: 4
},
{
  id: 'hellas', name: 'Hellas Basin', tag: 'DEEP EXPLORATION',
  desc: 'The deepest and largest visible impact basin — 2,300 km wide and 7 km deep. Atmospheric pressure here is 89% higher than surface average.',
  emoji: '○', color: '#a855f7',
  elevation: '-7.1 km', temp: '-40°C avg', feature: 'Impact basin',
  terrain: [0.7, 0.65, 0.55, 0.4, 0.25, 0.15, 0.1, 0.08, 0.1, 0.12, 0.1, 0.08, 0.1, 0.18, 0.3, 0.45, 0.55, 0.62, 0.68, 0.7],
  lat: '42.4°S', lon: '70.5°E', distance: 6800, signal: 2
},
{
  id: 'polar', name: 'North Polar Cap', tag: 'ICE EXPEDITION',
  desc: 'Kilometers-thick layers of water ice and CO₂ frost. Spiral troughs carved by wind reveal millions of years of climate history in exposed strata.',
  emoji: '❄', color: '#d4c4b8',
  elevation: '-5 km', temp: '-110°C avg', feature: 'Water ice cap',
  terrain: [0.35, 0.4, 0.45, 0.5, 0.55, 0.58, 0.6, 0.58, 0.55, 0.52, 0.5, 0.52, 0.55, 0.58, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35],
  lat: '90°N', lon: '0°', distance: 8200, signal: 1
},
{
  id: 'elysium', name: 'Elysium Planitia', tag: 'SCIENCE OUTPOST',
  desc: 'A vast basalt plain chosen for InSight\'s seismometer. Perfectly flat, ideal for long rover traverses and subsurface ice drilling operations.',
  emoji: '◇', color: '#6b8aed',
  elevation: '-2.5 km', temp: '-55°C avg', feature: 'Basalt plain',
  terrain: [0.3, 0.32, 0.31, 0.33, 0.32, 0.34, 0.33, 0.35, 0.34, 0.33, 0.35, 0.34, 0.36, 0.35, 0.33, 0.34, 0.32, 0.33, 0.31, 0.3],
  lat: '4.5°N', lon: '135.9°E', distance: 1200, signal: 4
}];


/* ── Terrain SVG with animated draw-in ── */
const TerrainSVG = memo(function TerrainSVG({
  heights, color, isHovered
}: {heights: number[];color: string;isHovered: boolean;}) {
  const w = 200;
  const h = 60;
  const points = heights.map((v, i) => {
    const x = i / (heights.length - 1) * w;
    const y = h - v * h * 0.85;
    return `${x},${y}`;
  });
  const pathD = `M0,${h} L${points.join(' L')} L${w},${h} Z`;
  const linePoints = points.join(' ');

  // Calculate total path length for stroke animation
  const totalLen = heights.length * 12;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[60px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`terrain-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={isHovered ? 0.4 : 0.2} />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        {/* Scan line gradient */}
        <linearGradient id={`scan-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="40%" stopColor={color} stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} stopOpacity="0.8" />
          <stop offset="60%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={pathD} fill={`url(#terrain-${color.replace('#', '')})`}
      style={{ transition: 'fill-opacity 0.5s' }} />
      <polyline
      points={linePoints}
      fill="none"
      stroke={color}
      strokeWidth={isHovered ? 2 : 1.5}
      strokeOpacity={isHovered ? 0.7 : 0.4}
      strokeLinejoin="round"
      style={{ transition: 'stroke-opacity 0.5s, stroke-width 0.5s' }} />

      {/* Scan line on hover */}
      {isHovered &&
      <rect
      x="-20" y="0" width="40" height={h}
      fill={`url(#scan-${color.replace('#', '')})`}>

          <animate attributeName="x" from="-40" to={`${w + 40}`} dur="1.5s" repeatCount="indefinite" />
        </rect>
      }
    </svg>);

});

/* ── Signal bars ── */
function SignalBars({ strength, color }: {strength: number;color: string;}) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[1, 2, 3, 4, 5].map((i) =>
      <div
      key={i}
      className="w-[3px] rounded-sm transition-all duration-300"
      style={{
        height: `${20 + i * 16}%`,
        backgroundColor: i <= strength ? color : 'rgba(255,255,255,0.08)',
        opacity: i <= strength ? 0.7 : 0.3
      }} />

      )}
    </div>);

}

/* ── Zone card ── */
function ZoneCard({ zone, index }: {zone: Zone;index: number;}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const maxDist = 8500; // max distance for progress bar

  return (
    <motion.div
      className="lz-card group cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}>

      <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.15] group-hover:bg-white/[0.05]"
      style={{ borderColor: expanded ? `${zone.color}30` : undefined }}>

        {/* Zone index badge */}
        <div
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-display font-bold transition-all duration-500"
        style={{
          backgroundColor: hovered || expanded ? `${zone.color}20` : 'rgba(255,255,255,0.03)',
          color: hovered || expanded ? zone.color : 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          borderColor: hovered || expanded ? `${zone.color}30` : 'rgba(255,255,255,0.06)'
        }}>

          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Terrain silhouette */}
        <div className="absolute bottom-0 left-0 right-0 transition-opacity duration-700" style={{ opacity: hovered ? 0.9 : 0.5 }}>
          <TerrainSVG heights={zone.terrain} color={zone.color} isHovered={hovered} />
        </div>

        {/* Ambient glow */}
        <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] transition-opacity duration-700"
        style={{ backgroundColor: zone.color + '15', opacity: hovered ? 1 : 0 }} />

        <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full blur-[40px] transition-opacity duration-700"
        style={{ backgroundColor: zone.color + '10', opacity: hovered ? 1 : 0 }} />


        <div className="relative p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3 pr-8">
            <div>
              <span className="text-2xl block mb-1">{zone.emoji}</span>
              <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">{zone.name}</h3>
              <span className="text-[10px] font-display tracking-[0.18em]" style={{ color: zone.color }}>{zone.tag}</span>
            </div>
          </div>

          {/* Coordinates */}
          <div className="flex items-center gap-1.5 mb-3">
            <Crosshair className="w-2.5 h-2.5" style={{ color: zone.color + '60' }} />
            <span className="text-[8px] sm:text-[9px] font-mono text-white/50 tracking-wider">
              {zone.lat} / {zone.lon}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-white/25 text-[10px] sm:text-xs">
              <Ruler className="w-3 h-3" style={{ color: zone.color + '80' }} />
              <span>{zone.elevation}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/25 text-[10px] sm:text-xs">
              <Thermometer className="w-3 h-3" style={{ color: zone.color + '80' }} />
              <span>{zone.temp}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/25 text-[10px] sm:text-xs">
              <Mountain className="w-3 h-3" style={{ color: zone.color + '80' }} />
              <span>{zone.feature}</span>
            </div>
          </div>

          {/* Signal + Distance */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SignalBars strength={zone.signal} color={zone.color} />
              <span className="text-[8px] font-display tracking-wider text-white/50">SIGNAL</span>
            </div>
            {zone.distance > 0 ?
            <div className="flex items-center gap-2">
                <Navigation className="w-2.5 h-2.5 text-white/50" />
                <span className="text-[8px] font-display tracking-wider text-white/50">
                  {zone.distance.toLocaleString()} KM
                </span>
              </div> :

            <span className="text-[8px] font-display tracking-wider px-2 py-0.5 rounded-full" style={{ color: zone.color, backgroundColor: zone.color + '15' }}>
                BASE CAMP
              </span>
            }
          </div>

          {/* Distance progress bar */}
          {zone.distance > 0 &&
          <div className="mb-4">
              <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: zone.color + '50' }}
                initial={{ width: 0 }}
                animate={{ width: `${zone.distance / maxDist * 100}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: EXPO_OUT }} />

              </div>
            </div>
          }

          {/* Expandable description */}
          <AnimatePresence>
            {expanded &&
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EXPO_OUT }}>

                <div className="pt-3 pb-2 border-t border-white/[0.04]">
                  <p className="text-white/35 text-xs sm:text-sm leading-relaxed">{zone.desc}</p>
                </div>
              </motion.div>
            }
          </AnimatePresence>

          {/* CTA */}
          <div
          className="flex items-center gap-1.5 text-[10px] sm:text-xs font-display tracking-wider transition-all duration-300"
          style={{ color: zone.color + (hovered ? 'cc' : '80') }}>

            <span>{expanded ? 'COLLAPSE' : 'VIEW DETAILS'}</span>
            <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-90' : hovered ? 'translate-x-0.5' : ''}`} />
          </div>
        </div>
      </div>
    </motion.div>);

}

/* ── Main grid ── */
export default function LandingZonesGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.lz-card', {
      y: 60, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  return (
    <section ref={ref} className="relative z-10 py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Section header */}
        <div className="mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            LANDING SITES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            WHERE WILL YOU{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">LAND</span>?
          </h2>
          <p className="text-white/30 text-sm sm:text-base max-w-md leading-relaxed">
            Six meticulously surveyed sites, each offering unique geological and scientific opportunities. Tap a zone to learn more.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ZONES.map((zone, i) =>
          <ZoneCard key={zone.id} zone={zone} index={i} />
          )}
        </div>
      </div>
    </section>);

}