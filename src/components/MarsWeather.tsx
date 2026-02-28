import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import OuraRing from '@/components/OuraRing';
import { Thermometer, Wind, Sun, Droplets } from 'lucide-react';

// Simulated 24-hour temperature data (°C)
const TEMP_DATA = [-73, -70, -68, -65, -60, -55, -48, -42, -38, -33, -28, -25, -23, -25, -30, -38, -45, -52, -58, -62, -66, -69, -71, -73];
// Simulated dust optical depth (tau)
const DUST_DATA = [0.4, 0.38, 0.35, 0.32, 0.35, 0.42, 0.55, 0.68, 0.82, 0.95, 1.05, 1.1, 1.08, 1.0, 0.9, 0.78, 0.65, 0.55, 0.48, 0.44, 0.42, 0.41, 0.40, 0.40];

function toPath(data: number[], width: number, height: number, padding = 16): string {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const stepX = (width - padding * 2) / (data.length - 1);

  return data.map((v, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (v - minVal) / range * (height - padding * 2);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

function toAreaPath(data: number[], width: number, height: number, padding = 16): string {
  const line = toPath(data, width, height, padding);
  const stepX = (width - padding * 2) / (data.length - 1);
  const lastX = padding + (data.length - 1) * stepX;
  return `${line} L${lastX.toFixed(1)} ${height - padding} L${padding} ${height - padding} Z`;
}

interface ChartProps {
  data: number[];
  color: string;
  label: string;
  unit: string;
  width?: number;
  height?: number;
}

function AnimatedChart({ data, color, label, unit, width = 280, height = 120 }: ChartProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentVal, setCurrentVal] = useState(data[data.length - 1]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const linePath = toPath(data, width, height);
  const areaPath = toAreaPath(data, width, height);
  const padding = 16;
  const stepX = (width - padding * 2) / (data.length - 1);
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${len}`;
    pathRef.current.style.strokeDashoffset = `${len}`;
  }, []);

  useGSAP(() => {
    if (!pathRef.current || !areaRef.current) return;
    const len = pathRef.current.getTotalLength();

    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%'
      }
    });

    gsap.fromTo(areaRef.current,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      delay: 0.8,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%'
      }
    }
    );
  }, { scope: containerRef });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaledX = mouseX / rect.width * width;
    const idx = Math.round((scaledX - padding) / stepX);
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    setHoveredIdx(clampedIdx);
    setCurrentVal(data[clampedIdx]);
  };

  const hoveredX = hoveredIdx !== null ? padding + hoveredIdx * stepX : null;
  const hoveredY = hoveredIdx !== null ?
  height - padding - (data[hoveredIdx] - minVal) / range * (height - padding * 2) :
  null;

  return (
    <div ref={containerRef} className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-display tracking-[0.2em] text-white/30 uppercase">{label}</span>
        <span className="font-display text-sm font-bold" style={{ color }}>
          {currentVal.toFixed(1)}<span className="text-[10px] text-white/30 ml-0.5">{unit}</span>
        </span>
      </div>

      <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {setHoveredIdx(null);setCurrentVal(data[data.length - 1]);}}>

        <defs>
          <linearGradient id={`chart-grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((pct) =>
        <line
        key={pct}
        x1={padding} y1={padding + pct * (height - padding * 2)}
        x2={width - padding} y2={padding + pct * (height - padding * 2)}
        stroke="white" strokeOpacity="0.04" strokeWidth="0.5" />

        )}

        {/* Area fill */}
        <path ref={areaRef} d={areaPath} fill={`url(#chart-grad-${label})`} opacity="0" />

        {/* Line */}
        <path ref={pathRef} d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover indicator */}
        {hoveredX !== null && hoveredY !== null &&
        <>
            <line x1={hoveredX} y1={padding} x2={hoveredX} y2={height - padding} stroke={color} strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 3" />
            <circle cx={hoveredX} cy={hoveredY} r="4" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
            <circle cx={hoveredX} cy={hoveredY} r="2" fill={color} />
          </>
        }

        {/* Hour labels */}
        {[0, 6, 12, 18, 23].map((h) =>
        <text
        key={h}
        x={padding + h * stepX}
        y={height - 2}
        textAnchor="middle"
        fill="white" fillOpacity="0.15" fontSize="7" fontFamily="Orbitron, monospace">

            {`${h.toString().padStart(2, '0')}:00`}
          </text>
        )}
      </svg>
    </div>);

}

// Weather status data
const WEATHER_STATS = [
{ icon: Thermometer, label: 'Surface Temp', value: '-25°C', sub: 'High today', color: '#FF4500' },
{ icon: Wind, label: 'Wind Speed', value: '24 km/h', sub: 'NNW bearing', color: '#4ab8c4' },
{ icon: Sun, label: 'UV Index', value: '0.3', sub: 'No atmosphere', color: '#eab308' },
{ icon: Droplets, label: 'Humidity', value: '0.03%', sub: 'Trace H₂O', color: '#6b8aed' }];


export default function MarsWeather() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.weather-card', {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.7,
      scrollTrigger: { trigger: ref.current, start: 'top 85%' }
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="space-y-5">
      {/* Section title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
        <span className="text-[10px] font-display tracking-[0.3em] text-white/50 uppercase">SOL 847 • LIVE TELEMETRY</span>
        <div className="h-px flex-1 bg-gradient-to-l from-primary/20 to-transparent" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md lg:backdrop-blur-2xl border border-white/[0.06] rounded-2xl" />
          <div className="relative p-4">
            <AnimatedChart data={TEMP_DATA} color="#FF4500" label="Temperature" unit="°C" />
          </div>
        </div>
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md lg:backdrop-blur-2xl border border-white/[0.06] rounded-2xl" />
          <div className="relative p-4">
            <AnimatedChart data={DUST_DATA} color="#ff6b35" label="Dust Opacity" unit="τ" />
          </div>
        </div>
      </div>

      {/* Stats row with OuraRing icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {WEATHER_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              className="weather-card group relative rounded-xl overflow-hidden p-4"
              whileHover={{ y: -2 }}>

              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-xl group-hover:border-white/[0.1] transition-all" />
              <div className="relative flex items-center gap-3">
                <OuraRing size={40} color={s.color} strokeWidth={1.2} speed={10}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </OuraRing>
                <div>
                  <div className="text-[9px] text-white/50 font-display tracking-[0.15em] uppercase">{s.label}</div>
                  <div className="font-display text-sm font-bold text-white">{s.value}</div>
                  <div className="text-[9px] text-white/50">{s.sub}</div>
                </div>
              </div>
            </motion.div>);

        })}
      </div>
    </div>);

}