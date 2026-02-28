import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { EXPO_OUT } from '@/lib/easing';
import { Lightbulb } from 'lucide-react';

/* ================================================================
   GEOLOGICAL SCALE COMPARISONS — UPGRADED

   Animated side-by-side comparisons:
     • Mountain silhouette shapes (not just bars)
     • Animated count-up numbers
     • "X times bigger" ratio badge
     • Fun facts that reveal after animation
     • Subtle grid lines
     • Enhanced visual treatment
   ================================================================ */

interface Comparison {
  id: string;
  title: string;
  mars: {label: string;value: number;unit: string;color: string;desc: string;silhouette: string;};
  earth: {label: string;value: number;unit: string;color: string;desc: string;silhouette: string;};
  type: 'height' | 'depth' | 'width';
  funFact: string;
  ratio: string;
}

const COMPARISONS: Comparison[] = [
{
  id: 'olympus', title: 'TALLEST PEAK', type: 'height',
  mars: {
    label: 'Olympus Mons', value: 21.9, unit: 'km', color: '#FF4500',
    desc: 'Tallest volcano in the solar system',
    silhouette: 'M0,100 L10,95 L25,80 L35,60 L45,35 L55,15 L65,8 L75,5 L85,8 L95,15 L105,35 L115,60 L125,80 L140,95 L150,100 Z'
  },
  earth: {
    label: 'Mt. Everest', value: 8.8, unit: 'km', color: '#4ab8c4',
    desc: 'Tallest mountain on Earth',
    silhouette: 'M0,100 L20,90 L35,75 L45,60 L55,45 L65,30 L70,20 L75,30 L85,45 L95,60 L110,80 L130,92 L150,100 Z'
  },
  funFact: 'Olympus Mons is so large that an observer on its summit couldn\'t see its edges — they\'d curve beyond the horizon.',
  ratio: '2.5× taller'
},
{
  id: 'valles', title: 'DEEPEST CANYON', type: 'depth',
  mars: {
    label: 'Valles Marineris', value: 7, unit: 'km', color: '#ff6b35',
    desc: '4,000 km long canyon system',
    silhouette: 'M0,0 L10,5 L25,15 L40,40 L50,70 L55,85 L60,95 L70,98 L80,95 L85,85 L95,70 L105,40 L120,15 L135,5 L150,0 Z'
  },
  earth: {
    label: 'Grand Canyon', value: 1.8, unit: 'km', color: '#4ab8c4',
    desc: 'Earth\'s most famous gorge',
    silhouette: 'M0,0 L15,5 L35,15 L50,35 L60,55 L65,70 L70,80 L80,80 L85,70 L90,55 L100,35 L115,15 L135,5 L150,0 Z'
  },
  funFact: 'Valles Marineris stretches the equivalent distance from New York to Los Angeles — across the entire US.',
  ratio: '3.9× deeper'
},
{
  id: 'hellas', title: 'LARGEST BASIN', type: 'width',
  mars: {
    label: 'Hellas Basin', value: 2300, unit: 'km', color: '#a855f7',
    desc: 'Deepest impact crater on Mars',
    silhouette: 'M0,50 C50,50 50,80 75,80 C100,80 100,50 150,50'
  },
  earth: {
    label: 'Mediterranean', value: 2500, unit: 'km', color: '#4ab8c4',
    desc: 'For scale comparison',
    silhouette: 'M0,50 C50,50 50,75 75,75 C100,75 100,50 150,50'
  },
  funFact: 'If you stood at the bottom of Hellas Basin, the atmospheric pressure would be 89% higher than the Martian average — enough to briefly hold liquid water.',
  ratio: '∼ equal width'
}];


/* ── Animated counter ── */
function AnimatedCounter({
  target, duration = 1.5, delay = 0, snap = 0.1, suffix = ''
}: {target: number;duration?: number;delay?: number;snap?: number;suffix?: string;}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });

  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const durationMs = duration * 1000;
    const delayMs = delay * 1000;
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - startTime - delayMs;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / durationMs, 1);
      // ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = eased * target;
      // snap
      const snapped = Math.round(current / snap) * snap;
      setValue(snapped);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration, delay, snap]);

  return (
    <span ref={ref} className="tabular-nums">
      {target > 100 ? value.toFixed(0) : value.toFixed(1)}{suffix}
    </span>);

}

/* ── Comparison card ── */
function ComparisonCard({ comp, index }: {comp: Comparison;index: number;}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showFact, setShowFact] = useState(false);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setShowFact(true), 2500);
    return () => clearTimeout(t);
  }, [inView]);

  const maxVal = Math.max(comp.mars.value, comp.earth.value);
  const marsSize = comp.mars.value / maxVal * 100;
  const earthSize = comp.earth.value / maxVal * 100;
  const isVertical = comp.type !== 'width';

  return (
    <div
    ref={ref}
    className="geo-card relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 sm:p-7 overflow-hidden hover:border-white/[0.12] transition-colors duration-500">

      {/* Background glow */}
      <div
      className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[70px] opacity-15"
      style={{ backgroundColor: comp.mars.color }} />


      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-0 right-0 h-full" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 24%, rgba(255,255,255,0.02) 24%, rgba(255,255,255,0.02) 25%)`
        }} />
      </div>

      {/* Title + Ratio badge */}
      <div className="relative flex items-center justify-between mb-6">
        <span className="text-[9px] font-display tracking-[0.25em] text-white/50">{comp.title}</span>
        <span
        className="text-[8px] font-display tracking-wider px-2 py-0.5 rounded-full"
        style={{ color: comp.mars.color, backgroundColor: comp.mars.color + '12', border: `1px solid ${comp.mars.color}20` }}>

          {comp.ratio}
        </span>
      </div>

      {isVertical ? (
      /* ── Vertical (height/depth) with silhouettes ── */
      <div className="relative flex items-end justify-center gap-6 sm:gap-10 h-[220px] sm:h-[260px]">
          {/* Mars */}
          <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
            <span className="text-lg sm:text-2xl font-display font-bold" style={{ color: comp.mars.color }}>
              <AnimatedCounter target={comp.mars.value} delay={0.3} snap={comp.mars.value > 100 ? 10 : 0.1} />
            </span>
            <span className="text-[8px] font-display tracking-wider text-white/50">{comp.mars.unit}</span>
            <motion.div
            className="w-full max-w-[100px] relative"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: EXPO_OUT }}
            style={{ height: `${marsSize}%`, transformOrigin: comp.type === 'depth' ? 'top center' : 'bottom center' }}>

              <svg viewBox="0 0 150 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`sil-mars-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={comp.mars.color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={comp.mars.color} stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path d={comp.mars.silhouette} fill={`url(#sil-mars-${comp.id})`} />
                <path d={comp.mars.silhouette} fill="none" stroke={comp.mars.color} strokeWidth="1.5" strokeOpacity="0.4" />
              </svg>
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />
            </motion.div>
            <span className="text-[9px] sm:text-[10px] font-display font-bold tracking-wider text-white/60 text-center">
              {comp.mars.label.toUpperCase()}
            </span>
            <span className="text-[7px] sm:text-[8px] text-white/50 text-center leading-tight">{comp.mars.desc}</span>
          </div>

          {/* Earth */}
          <div className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
            <span className="text-lg sm:text-2xl font-display font-bold" style={{ color: comp.earth.color }}>
              <AnimatedCounter target={comp.earth.value} delay={0.5} snap={comp.earth.value > 100 ? 10 : 0.1} />
            </span>
            <span className="text-[8px] font-display tracking-wider text-white/50">{comp.earth.unit}</span>
            <motion.div
            className="w-full max-w-[100px] relative"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.5, ease: EXPO_OUT }}
            style={{ height: `${earthSize}%`, transformOrigin: comp.type === 'depth' ? 'top center' : 'bottom center' }}>

              <svg viewBox="0 0 150 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`sil-earth-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={comp.earth.color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={comp.earth.color} stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path d={comp.earth.silhouette} fill={`url(#sil-earth-${comp.id})`} />
                <path d={comp.earth.silhouette} fill="none" stroke={comp.earth.color} strokeWidth="1.5" strokeOpacity="0.4" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />
            </motion.div>
            <span className="text-[9px] sm:text-[10px] font-display font-bold tracking-wider text-white/60 text-center">
              {comp.earth.label.toUpperCase()}
            </span>
            <span className="text-[7px] sm:text-[8px] text-white/50 text-center leading-tight">{comp.earth.desc}</span>
          </div>

          {/* Base line */}
          <div className="absolute left-0 right-0 bottom-0 h-px bg-white/[0.06]" />

          {/* Scale markers */}
          <div className="absolute left-1 sm:left-2 top-0 bottom-0 flex flex-col justify-between py-1">
            {[...Array(5)].map((_, i) =>
          <span key={i} className="text-[6px] text-white/10 font-mono tabular-nums">
                {(maxVal * (4 - i) / 4).toFixed(comp.mars.value > 100 ? 0 : 1)}
              </span>
          )}
          </div>
        </div>) : (

      /* ── Horizontal bars (width) ── */
      <div className="relative space-y-6 sm:space-y-8">
          {[comp.mars, comp.earth].map((item, idx) =>
        <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] font-display font-bold tracking-wider text-white/60">
                  {item.label.toUpperCase()}
                </span>
                <span className="text-sm sm:text-lg font-display font-bold tabular-nums" style={{ color: item.color }}>
                  <AnimatedCounter target={item.value} delay={0.3 + idx * 0.2} snap={item.value > 100 ? 10 : 0.1} />
                </span>
              </div>
              <div className="h-10 sm:h-12 rounded-lg bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <motion.div
              className="h-full rounded-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${item.color}40, ${item.color}15)`,
                border: `1px solid ${item.color}30`
              }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${item.value / maxVal * 100}%` } : {}}
              transition={{ duration: 1.2, delay: 0.3 + idx * 0.2, ease: EXPO_OUT }}>

                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent" />
                </motion.div>
              </div>
              <span className="text-[7px] sm:text-[8px] text-white/50 mt-1 block">{item.desc}</span>
            </div>
        )}
        </div>)
      }

      {/* Mars vs Earth badge */}
      <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-white/[0.04]">
        <span className="text-[8px] font-display tracking-[0.15em]" style={{ color: comp.mars.color }}>♦ MARS</span>
        <span className="text-[8px] font-display tracking-[0.15em] text-white/50">VS</span>
        <span className="text-[8px] font-display tracking-[0.15em]" style={{ color: comp.earth.color }}>♦ EARTH</span>
      </div>

      {/* Fun fact (reveals after animation) */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={showFact ? { height: 'auto', opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: EXPO_OUT }}
        className="overflow-hidden">

        <div className="mt-4 pt-3 border-t border-white/[0.04] flex gap-2">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: comp.mars.color + '80' }} />
          <p className="text-[10px] sm:text-xs text-white/25 leading-relaxed italic">{comp.funFact}</p>
        </div>
      </motion.div>
    </div>);

}

export default function GeologicalScale() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.geo-card', {
      y: 50, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  return (
    <section ref={ref} className="relative z-10 py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Section header */}
        <div className="mb-12 sm:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            GEOLOGICAL DATA
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            MARS VS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ab8c4] to-[#6b8aed]">EARTH</span>
          </h2>
          <p className="text-white/30 text-sm sm:text-base max-w-md leading-relaxed">
            Everything on Mars is built to a different scale. The tallest, the deepest, the widest — the Red Planet rewrites every record.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {COMPARISONS.map((comp, i) =>
          <ComparisonCard key={comp.id} comp={comp} index={i} />
          )}
        </div>
      </div>
    </section>);

}