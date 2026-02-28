import { useRef, useState, useCallback, useMemo, memo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { motion } from 'framer-motion';
import { Activity, Fuel, ThermometerSun, Wind } from 'lucide-react';
import RevealText from '@/components/RevealText';

/* ================================================================
   MISSION LOGISTICS DASHBOARD
   Two animated SVG line charts (O₂ & Fuel) with:
    • GSAP-driven stroke-dashoffset line draw on scroll
    • Animated gradient area fills
    • Interactive hover-tooltip per data point
    • Grid + axis labels styled for tactical HUD
    • KPI summary cards with counters
   ================================================================ */

// ── Chart dimensions (SVG viewBox units) ──
const W = 700;
const H = 260;
const PAD = { top: 20, right: 20, bottom: 30, left: 44 };
const CW = W - PAD.left - PAD.right; // chart area width
const CH = H - PAD.top - PAD.bottom; // chart area height

// ── Generate realistic 24-hour telemetry data ──
function generateO2Data(): number[] {
  // Oxygen: 20.5-21.5% with circadian dips around hour 3-5 (sleep) and spike at 12 (activity)
  return Array.from({ length: 25 }, (_, i) => {
    const base = 21.0;
    const circadian = -0.4 * Math.sin((i - 4) / 24 * Math.PI * 2);
    const noise = Math.sin(i * 3.7) * 0.15 + Math.cos(i * 2.3) * 0.1;
    return Math.round((base + circadian + noise) * 100) / 100;
  });
}

function generateFuelData(): number[] {
  // Fuel: starts ~94%, decreases with periodic burns at hours 6, 14, 20
  let fuel = 94.2;
  return Array.from({ length: 25 }, (_, i) => {
    if (i > 0) {
      const burn = i === 6 || i === 14 || i === 20 ? 2.5 + Math.random() * 1.5 : 0;
      const drift = 0.08 + Math.random() * 0.04;
      fuel -= burn + drift;
    }
    return Math.round(fuel * 100) / 100;
  });
}

const O2_DATA = generateO2Data();
const FUEL_DATA = generateFuelData();

// ── Chart config ──
interface ChartConfig {
  label: string;
  unit: string;
  data: number[];
  min: number;
  max: number;
  color: string;
  gradientId: string;
  warnLow?: number;
  icon: typeof Activity;
}

const CHARTS: ChartConfig[] = [
{
  label: 'O₂ CONCENTRATION',
  unit: '%',
  data: O2_DATA,
  min: 20.0,
  max: 22.0,
  color: '#4ab8c4',
  gradientId: 'o2Fill',
  warnLow: 20.5,
  icon: Wind
},
{
  label: 'FUEL RESERVES',
  unit: '%',
  data: FUEL_DATA,
  min: Math.floor(Math.min(...FUEL_DATA) - 2),
  max: 96,
  color: '#FF4500',
  gradientId: 'fuelFill',
  warnLow: 80,
  icon: Fuel
}];


// ── KPI cards ──
const KPIS = [
{ label: 'CABIN TEMP', value: '22.4°C', icon: ThermometerSun, color: '#ff6b35' },
{ label: 'AVG O₂', value: `${(O2_DATA.reduce((a, b) => a + b, 0) / O2_DATA.length).toFixed(1)}%`, icon: Wind, color: '#4ab8c4' },
{ label: 'BURN CYCLES', value: '3', icon: Activity, color: '#FF4500' },
{ label: 'FUEL REMAIN', value: `${FUEL_DATA[FUEL_DATA.length - 1].toFixed(1)}%`, icon: Fuel, color: '#a855f7' }];


// ── Helpers ──
function mapX(i: number): number {
  return PAD.left + i / 24 * CW;
}
function mapY(val: number, min: number, max: number): number {
  return PAD.top + CH - (val - min) / (max - min) * CH;
}
function buildPath(data: number[], min: number, max: number): string {
  return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${mapX(i).toFixed(1)},${mapY(v, min, max).toFixed(1)}`).join(' ');
}
function buildAreaPath(data: number[], min: number, max: number): string {
  const line = data.map((v, i) => `${mapX(i).toFixed(1)},${mapY(v, min, max).toFixed(1)}`).join(' L');
  return `M${line} L${mapX(24).toFixed(1)},${(PAD.top + CH).toFixed(1)} L${PAD.left},${(PAD.top + CH).toFixed(1)} Z`;
}

// ── Single Chart component ──
function Chart({ config, index }: {config: ChartConfig;index: number;}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  // GSAP scroll-triggered line draw
  useGSAP(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const line = svg.querySelector('.chart-line') as SVGPathElement;
    const area = svg.querySelector('.chart-area') as SVGPathElement;
    const dots = svg.querySelectorAll('.chart-dot');

    if (line) {
      const len = line.getTotalLength();
      line.style.strokeDasharray = `${len}`;
      line.style.strokeDashoffset = `${len}`;

      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: svg, start: 'top 85%', once: true }
      });
    }

    if (area) {
      gsap.from(area, {
        opacity: 0,
        duration: 1.5,
        delay: 0.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: svg, start: 'top 85%', once: true }
      });
    }

    if (dots.length) {
      gsap.from(dots, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        stagger: 0.04,
        delay: 1.2,
        ease: 'expo.out',
        transformOrigin: 'center',
        scrollTrigger: { trigger: svg, start: 'top 85%', once: true }
      });
    }
  }, { scope: svgRef });

  const linePath = useMemo(() => buildPath(config.data, config.min, config.max), [config]);
  const areaPath = useMemo(() => buildAreaPath(config.data, config.min, config.max), [config]);

  // Y axis ticks
  const yTicks = useMemo(() => {
    const step = (config.max - config.min) / 4;
    return Array.from({ length: 5 }, (_, i) => {
      const val = config.min + i * step;
      return { val, y: mapY(val, config.min, config.max) };
    });
  }, [config]);

  const Icon = config.icon;

  return (
    <div className="relative">
      {/* Chart header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}12` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
        </div>
        <span className="text-[10px] font-display font-bold tracking-[0.15em] text-white/50">{config.label}</span>
      </div>

      {/* SVG Chart */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHover(null)}>

          <defs>
            {/* Area gradient */}
            <linearGradient id={config.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.01" />
            </linearGradient>
            {/* Line glow */}
            <filter id={`glow-${index}`}>
              <feGaussianBlur stdDeviation="2" />
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {yTicks.map((t) =>
          <line key={t.val} x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          )}
          {/* Vertical hour lines */}
          {[0, 4, 8, 12, 16, 20, 24].map((h) =>
          <line key={h} x1={mapX(h)} y1={PAD.top} x2={mapX(h)} y2={PAD.top + CH} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          )}

          {/* Warning threshold line */}
          {config.warnLow && config.warnLow > config.min &&
          <line
          x1={PAD.left} y1={mapY(config.warnLow, config.min, config.max)}
          x2={W - PAD.right} y2={mapY(config.warnLow, config.min, config.max)}
          stroke={config.color} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 3" />

          }

          {/* Y axis labels */}
          {yTicks.map((t) =>
          <text key={`yl-${t.val}`} x={PAD.left - 6} y={t.y + 3} textAnchor="end" fontSize="7" fontFamily="Orbitron, monospace" fill="white" fillOpacity="0.2">
              {t.val.toFixed(1)}
            </text>
          )}

          {/* X axis labels */}
          {[0, 4, 8, 12, 16, 20, 24].map((h) =>
          <text key={`xl-${h}`} x={mapX(h)} y={H - 6} textAnchor="middle" fontSize="7" fontFamily="Orbitron, monospace" fill="white" fillOpacity="0.2">
              {String(h).padStart(2, '0')}:00
            </text>
          )}

          {/* Area fill */}
          <path className="chart-area" d={areaPath} fill={`url(#${config.gradientId})`} />

          {/* Line (glow layer) */}
          <path d={linePath} stroke={config.color} strokeWidth="2.5" fill="none" strokeOpacity="0.15" filter={`url(#glow-${index})`} />

          {/* Line (main - animated) */}
          <path className="chart-line" d={linePath} stroke={config.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ willChange: 'stroke-dashoffset' }} />

          {/* Data dots */}
          {config.data.map((v, i) => {
            const cx = mapX(i);
            const cy = mapY(v, config.min, config.max);
            const isHovered = hover === i;
            const isBelowWarn = config.warnLow !== undefined && v < config.warnLow;
            return (
              <g key={`dot-${i}`}>
                {/* Hit area for hover */}
                <rect
                x={cx - CW / 48} y={PAD.top} width={CW / 24} height={CH}
                fill="transparent" style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHover(i)} />

                {/* Vertical indicator on hover */}
                {isHovered &&
                <line x1={cx} y1={PAD.top} x2={cx} y2={PAD.top + CH} stroke={config.color} strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="3 3" />
                }
                {/* Dot */}
                <circle
                className="chart-dot"
                cx={cx} cy={cy}
                r={isHovered ? 4 : isBelowWarn ? 2.5 : 2}
                fill={isBelowWarn ? '#ff3040' : config.color}
                fillOpacity={isHovered ? 1 : 0.7}
                stroke={isHovered ? 'white' : 'none'}
                strokeWidth={isHovered ? 1 : 0} />

                {/* Tooltip */}
                {isHovered &&
                <g>
                    <rect
                  x={cx - 28} y={cy - 28} width="56" height="18" rx="4"
                  fill="rgba(0,0,0,0.8)" stroke={config.color} strokeWidth="0.5" strokeOpacity="0.4" />

                    <text x={cx} y={cy - 16} textAnchor="middle" fontSize="8" fontFamily="Orbitron, monospace" fill="white" fontWeight="bold">
                      {v.toFixed(1)}{config.unit}
                    </text>
                    <text x={cx} y={cy - 36} textAnchor="middle" fontSize="6" fontFamily="Orbitron, monospace" fill={config.color} fillOpacity="0.5">
                      {String(i).padStart(2, '0')}:00 MTC
                    </text>
                  </g>
                }
              </g>);

          })}

          {/* Unit label */}
          <text x={PAD.left + 4} y={PAD.top + 10} fontSize="6" fontFamily="Orbitron, monospace" fill={config.color} fillOpacity="0.3" letterSpacing="1">
            {config.unit}
          </text>
        </svg>
      </div>
    </div>);

}

// ── Main section ──
function MissionLogistics() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Stagger KPI cards
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('.kpi-card').forEach((el, i) => {
      gsap.from(el, {
        y: 30, opacity: 0, duration: 0.6, delay: i * 0.1,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
  }, { scope: sectionRef });

  return (
    <section id="logistics" ref={sectionRef} className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/[0.04] mb-4">
            <Activity className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] text-primary/70">LIVE TELEMETRY</span>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
            MISSION
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">LOGISTICS</span>
          </h2>
          <RevealText
            text="Real-time environmental and propulsion telemetry from the Ares-7 habitat module. Data refreshed every mission cycle."
            className="text-white/30 text-sm sm:text-base max-w-lg leading-relaxed" />

        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
          {KPIS.map((k) => {
            const Icon = k.icon;
            return (
              <motion.div
                key={k.label}
                className="kpi-card group relative rounded-xl overflow-hidden p-4"
                whileHover={{ y: -2 }}>

                <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md lg:backdrop-blur-2xl border border-white/[0.06] rounded-xl group-hover:border-white/[0.12] transition-all" />
                <div className="relative flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${k.color}10` }}>
                    <Icon className="w-4 h-4" style={{ color: k.color }} />
                  </div>
                  <div>
                    <div className="font-display text-lg sm:text-xl font-bold text-white">{k.value}</div>
                    <div className="text-[8px] sm:text-[9px] text-white/50 font-display tracking-[0.18em]">{k.label}</div>
                  </div>
                </div>
              </motion.div>);

          })}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {CHARTS.map((c, i) =>
          <Chart key={c.label} config={c} index={i} />
          )}
        </div>

        {/* Timestamp footer */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[8px] font-display text-white/50 tracking-[0.15em]">MISSION TIME COORDINATED (MTC) • SOL 247</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
            <span className="text-[8px] font-display text-white/50 tracking-[0.15em]">SYSTEMS NOMINAL</span>
          </div>
        </div>
      </div>
    </section>);

}

export default memo(MissionLogistics);