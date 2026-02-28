import { useRef, useEffect, useState, memo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { EXPO_OUT } from '@/lib/easing';
import { TrendingUp } from 'lucide-react';

/* ================================================================
   MISSION STATS — UPGRADED

   Cinematic stat strip with:
     • Radial progress circles (SVG)
     • Animated count-up numbers
     • Live pulse effect on numbers
     • Mini sparkline charts per stat
     • "Live" data simulation
     • Trend indicators
   ================================================================ */

function Counter({ target, suffix = '' }: {target: number;suffix?: string;}) {
  const [val, setVal] = useState(0);
  const elRef = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !ran.current) {
          ran.current = true;
          const dur = 2400;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            const ease = 1 - Math.pow(2, -10 * p);
            setVal(Math.floor(ease * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (elRef.current) obs.observe(elRef.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={elRef}>
      {val.toLocaleString()}
      {suffix}
    </span>);

}

/* ── Radial Progress Circle ── */
function RadialProgress({
  progress, color, size = 64
}: {progress: number;color: string;size?: number;}) {
  const ref = useRef<SVGCircleElement>(null);
  const inView = useInView(ref as any, { once: true, margin: '-20%' });
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      {/* Background track */}
      <circle
      cx={size / 2} cy={size / 2} r={radius}
      fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />

      {/* Progress arc */}
      <circle
      ref={ref}
      cx={size / 2} cy={size / 2} r={radius}
      fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={inView ? offset : circumference}
      style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 6px ${color}40)` }} />

      {/* Pulse dot at end of arc */}
      {inView &&
      <circle
      cx={size / 2 + radius * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
      cy={size / 2 + radius * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
      r="3" fill={color}>

          <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>
      }
    </svg>);

}

/* ── Sparkline ── */
function Sparkline({ data, color }: {data: number[];color: string;}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const points = data.map((v, i) => {
    const x = i / (data.length - 1) * w;
    const y = h - (v - min) / range * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[60px] h-[20px]">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
      points={`0,${h} ${points} ${w},${h}`}
      fill={`url(#spark-${color.replace('#', '')})`} />

      <polyline
      points={points}
      fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinejoin="round" />

      {/* End dot */}
      <circle
      cx={w}
      cy={h - (data[data.length - 1] - min) / range * h * 0.8 - h * 0.1}
      r="2" fill={color}>

        <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>);

}

interface StatData {
  val: number;
  suffix: string;
  label: string;
  color: string;
  gauge: number;
  trend: number;
  sparkline: number[];
}

const DATA: StatData[] = [
{
  val: 47, suffix: '', label: 'COMPLETED MISSIONS', color: '#FF4500', gauge: 0.85,
  trend: 12, sparkline: [28, 31, 35, 33, 38, 40, 42, 41, 44, 45, 47, 47]
},
{
  val: 2847, suffix: '+', label: 'PASSENGERS BOOKED', color: '#4ab8c4', gauge: 0.72,
  trend: 23, sparkline: [800, 1100, 1400, 1600, 1800, 2000, 2200, 2350, 2500, 2650, 2780, 2847]
},
{
  val: 12, suffix: '', label: 'MARS SURFACE BASES', color: '#ff6b35', gauge: 0.45,
  trend: 3, sparkline: [3, 4, 5, 6, 7, 8, 8, 9, 10, 10, 11, 12]
},
{
  val: 8, suffix: '', label: 'YEARS OPERATIONAL', color: '#6b8aed', gauge: 0.92,
  trend: 1, sparkline: [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8]
}];


function MissionStats() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.ms-stat', {
      y: 60, opacity: 0, stagger: 0.15, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' }
    });
  }, { scope: ref });

  return (
    <section ref={ref} className="relative z-10 py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-12 sm:mb-16">
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
          <span className="text-[9px] font-display tracking-[0.3em] text-white/50 uppercase">MISSION OVERVIEW</span>
          <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DATA.map((d) =>
          <div key={d.label} className="ms-stat group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 overflow-hidden hover:border-white/[0.12] transition-colors duration-500">
              {/* Glow */}
              <div
            className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
            style={{ backgroundColor: d.color }} />


              {/* Radial progress + Number */}
              <div className="flex items-center gap-4 mb-4">
                <RadialProgress progress={d.gauge} color={d.color} size={56} />
                <div>
                  <div
                className="font-display text-3xl sm:text-4xl font-bold tabular-nums leading-none"
                style={{ color: d.color }}>

                    <Counter target={d.val} suffix={d.suffix} />
                  </div>
                  <span className="text-[8px] font-display tracking-[0.2em] text-white/50">{d.label}</span>
                </div>
              </div>

              {/* Sparkline + trend */}
              <div className="flex items-center justify-between">
                <Sparkline data={d.sparkline} color={d.color} />
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" style={{ color: '#22c55e80' }} />
                  <span className="text-[9px] font-display tracking-wider text-green-400/50">
                    +{d.trend} YoY
                  </span>
                </div>
              </div>

              {/* Bottom accent line */}
              <div
            className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${d.color}40, transparent)` }} />

            </div>
          )}
        </div>
      </div>
    </section>);

}

export default memo(MissionStats);