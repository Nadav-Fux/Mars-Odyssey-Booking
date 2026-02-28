import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { MapPin, Thermometer, Timer, ArrowUpRight, Signal, Shield, Gauge, ChevronDown } from 'lucide-react';
import RevealText from '@/components/RevealText';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   DESTINATIONS SECTION — UPGRADED

   Enhanced expedition cards with:
     • Animated terrain profile per destination
     • Difficulty rating (1-5 dots)
     • Glowing animated card border on hover
     • Signal strength + radiation level indicators
     • Expandable details panel
     • Animated "scan" effect on terrain
     • Status badge (OPEN / LIMITED / WAITLIST)
   ================================================================ */

interface Destination {
  name: string;
  tag: string;
  desc: string;
  temp: string;
  duration: string;
  color: string;
  emoji: string;
  terrain: number[];
  difficulty: number;
  status: 'OPEN' | 'LIMITED' | 'WAITLIST';
  radiation: 'LOW' | 'MODERATE' | 'HIGH';
  distance: string;
  expandedDesc: string;
}

const DESTINATIONS: Destination[] = [
{
  name: 'OLYMPUS MONS',
  tag: 'Summit Expedition',
  desc: 'The tallest volcano in the solar system. 21.9 km above datum — nearly 3× Everest.',
  expandedDesc: 'Summit approach via the northwest flank. Base camp at 8km altitude with pressurized shelters. Final ascent requires supplemental O₂ beyond 16km. Caldera rim walk included.',
  temp: '-63°C', duration: '14 days', color: '#FF4500', emoji: '🌋',
  terrain: [0.1, 0.15, 0.22, 0.33, 0.48, 0.62, 0.78, 0.9, 0.98, 1.0, 0.98, 0.92, 0.8, 0.65, 0.5, 0.38, 0.28, 0.2, 0.14, 0.1],
  difficulty: 5, status: 'LIMITED', radiation: 'HIGH', distance: '3,400 km'
},
{
  name: 'VALLES MARINERIS',
  tag: 'Canyon Trek',
  desc: '4,000 km of canyon stretching across the equator. Rappel into the solar system\'s grandest rift.',
  expandedDesc: 'Multi-day canyon descent with overnight bivouacs on ledge platforms. Geological sampling opportunities at exposed strata. Rover support available for horizontal traverses.',
  temp: '-58°C', duration: '21 days', color: '#ff6b35', emoji: '🏜️',
  terrain: [0.8, 0.75, 0.7, 0.4, 0.15, 0.08, 0.05, 0.08, 0.12, 0.1, 0.08, 0.06, 0.1, 0.2, 0.45, 0.65, 0.75, 0.8, 0.82, 0.8],
  difficulty: 4, status: 'OPEN', radiation: 'MODERATE', distance: '2,800 km'
},
{
  name: 'JEZERO CRATER',
  tag: 'Ancient Lake',
  desc: 'Walk where water once flowed. Visit the Perseverance site and search for ancient microbial fossils.',
  expandedDesc: 'Guided fossil-hunting excursions with onboard astrobiologist. Visit the Perseverance rover monument. Delta sediment sampling and microscopy lab sessions.',
  temp: '-55°C', duration: '10 days', color: '#4ab8c4', emoji: '🔬',
  terrain: [0.3, 0.35, 0.4, 0.5, 0.7, 0.85, 0.9, 0.85, 0.6, 0.3, 0.25, 0.2, 0.25, 0.3, 0.35, 0.4, 0.38, 0.35, 0.3, 0.28],
  difficulty: 2, status: 'OPEN', radiation: 'LOW', distance: '0 km'
},
{
  name: 'POLAR ICE CAPS',
  tag: 'Arctic Mission',
  desc: 'Frozen CO₂ and water ice formations under alien aurora. The most remote destination on Mars.',
  expandedDesc: 'Extreme-weather expedition to the Martian arctic. Drill core sampling of ancient ice layers. Northern lights observation during solar events. Heated habitat modules throughout.',
  temp: '-125°C', duration: '18 days', color: '#6b8aed', emoji: '❄️',
  terrain: [0.35, 0.4, 0.45, 0.5, 0.55, 0.58, 0.6, 0.58, 0.55, 0.52, 0.5, 0.52, 0.55, 0.58, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35],
  difficulty: 5, status: 'WAITLIST', radiation: 'MODERATE', distance: '8,200 km'
}];


const STATUS_COLORS = {
  OPEN: '#22c55e',
  LIMITED: '#eab308',
  WAITLIST: '#ef4444'
};

const RAD_COLORS = {
  LOW: '#22c55e',
  MODERATE: '#eab308',
  HIGH: '#ef4444'
};

/* ── Terrain SVG ── */
function TerrainProfile({ heights, color, hovered }: {heights: number[];color: string;hovered: boolean;}) {
  const w = 200;
  const h = 50;
  const points = heights.map((v, i) => {
    const x = i / (heights.length - 1) * w;
    const y = h - v * h * 0.9;
    return `${x},${y}`;
  });
  const pathD = `M0,${h} L${points.join(' L')} L${w},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[50px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`dest-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={hovered ? 0.4 : 0.15} />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id={`dest-scan-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="45%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor="white" stopOpacity="0.8" />
          <stop offset="55%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={pathD} fill={`url(#dest-${color.replace('#', '')})`} style={{ transition: 'fill-opacity 0.5s' }} />
      <polyline
      points={points.join(' ')}
      fill="none" stroke={color}
      strokeWidth={hovered ? 2 : 1.2}
      strokeOpacity={hovered ? 0.7 : 0.35}
      strokeLinejoin="round"
      style={{ transition: 'all 0.5s' }} />

      {hovered &&
      <rect x="-30" y="0" width="60" height={h} fill={`url(#dest-scan-${color.replace('#', '')})`}>
          <animate attributeName="x" from="-60" to={`${w + 60}`} dur="2s" repeatCount="indefinite" />
        </rect>
      }
    </svg>);

}

/* ── Difficulty dots ── */
function DifficultyDots({ level, color }: {level: number;color: string;}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) =>
      <div
      key={i}
      className="w-1.5 h-1.5 rounded-full transition-all duration-300"
      style={{
        backgroundColor: i <= level ? color : 'rgba(255,255,255,0.08)',
        boxShadow: i <= level ? `0 0 4px ${color}40` : 'none'
      }} />

      )}
    </div>);

}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const cardVariant = {
  hidden: { opacity: 0, y: 70, scale: 0.95, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EXPO_OUT }
  }
};

function DestCard({ d, index }: {d: Destination;index: number;}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="dest-card group relative rounded-2xl overflow-hidden cursor-pointer"
      variants={cardVariant}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.3, ease: EXPO_OUT }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}>

      {/* Glass */}
      <div className="absolute inset-0 bg-white/[0.025] backdrop-blur-md lg:backdrop-blur-2xl border border-white/[0.07] rounded-2xl transition-all duration-500 group-hover:border-white/[0.14]" />

      {/* Animated top border */}
      <div
      className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
      style={{
        background: `linear-gradient(90deg, transparent, ${d.color}50, transparent)`,
        opacity: hovered ? 1 : 0.3
      }} />


      {/* Terrain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 transition-opacity duration-500" style={{ opacity: hovered ? 0.9 : 0.5 }}>
        <TerrainProfile heights={d.terrain} color={d.color} hovered={hovered} />
      </div>

      <div className="relative p-5 sm:p-7">
        {/* Status + difficulty */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
            className="text-[8px] font-display tracking-[0.2em] px-2 py-0.5 rounded-full border"
            style={{
              color: STATUS_COLORS[d.status],
              borderColor: STATUS_COLORS[d.status] + '30',
              backgroundColor: STATUS_COLORS[d.status] + '10'
            }}>

              {d.status}
            </span>
            <DifficultyDots level={d.difficulty} color={d.color} />
          </div>
          <motion.div
            whileHover={{ rotate: 45 }}
            className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.15] transition-all">

            <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <span className="text-2xl sm:text-3xl block mb-2">{d.emoji}</span>
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">{d.name}</h3>
          <span className="text-[10px] sm:text-[11px] font-display tracking-[0.15em]" style={{ color: d.color }}>{d.tag}</span>
        </div>

        <p className="text-white/30 text-xs sm:text-sm leading-relaxed mb-5">{d.desc}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mb-4">
          {[
          { icon: Timer, val: d.duration },
          { icon: Thermometer, val: d.temp },
          { icon: MapPin, val: d.distance }].
          map((m, j) =>
          <div key={j} className="flex items-center gap-1.5 text-white/50 text-[10px] sm:text-xs">
              <m.icon className="w-3 h-3" style={{ color: d.color + '80' }} />
              <span>{m.val}</span>
            </div>
          )}
        </div>

        {/* Radiation + signal */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" style={{ color: RAD_COLORS[d.radiation] + '80' }} />
            <span className="text-[9px] font-display tracking-wider" style={{ color: RAD_COLORS[d.radiation] + 'aa' }}>
              RAD: {d.radiation}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3 text-white/50" />
            <div className="flex items-end gap-[2px] h-3">
              {[1, 2, 3, 4, 5].map((i) =>
              <div
              key={i}
              className="w-[2px] rounded-sm"
              style={{
                height: `${20 + i * 16}%`,
                backgroundColor: i <= 5 - Math.floor(parseInt(d.distance.replace(/,/g, '')) / 2000) ?
                d.color + '60' :
                'rgba(255,255,255,0.06)'
              }} />

              )}
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {expanded &&
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EXPO_OUT }}
            className="overflow-hidden">

              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-white/35 text-[11px] sm:text-xs leading-relaxed">{d.expandedDesc}</p>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* Expand hint */}
        <div className="flex items-center gap-1 mt-3" style={{ color: d.color + '70' }}>
          <span className="text-[9px] font-display tracking-wider">{expanded ? 'LESS' : 'MORE INFO'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Hover glow */}
      <div
      className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
      style={{ backgroundColor: `${d.color}12` }} />

    </motion.div>);

}

export default function DestinationsSection() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.dest-head', {
      y: 50, opacity: 0, stagger: 0.12, duration: 0.9,
      scrollTrigger: { trigger: '.dest-header', start: 'top 85%' }
    });
  }, { scope: ref });

  return (
    <section id="destinations" ref={ref} className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        <div className="dest-header mb-14 sm:mb-20">
          <span className="dest-head inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            DESTINATIONS
          </span>
          <h2 className="dest-head font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
            WHERE ON
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">MARS?</span>
          </h2>
          <RevealText
            text="Four expedition packages. Each a once-in-a-lifetime encounter with the alien landscape."
            className="dest-head text-white/30 text-sm sm:text-base max-w-md leading-relaxed" />

        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}>

          {DESTINATIONS.map((d, i) =>
          <DestCard key={d.name} d={d} index={i} />
          )}
        </motion.div>
      </div>
    </section>);

}