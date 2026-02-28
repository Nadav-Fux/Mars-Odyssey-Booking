import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Gauge, Clock, Navigation, Fuel, Wifi } from 'lucide-react';

/* ================================================================
   MISSION TELEMETRY BAR

   A thin, sleek bar at the very top of the page showing live-updating
   fake mission telemetry:
     • Mission clock (counting up from SOL 47 00:00:00)
     • Distance to Mars (oscillating)
     • Velocity
     • Hull temp
     • O₂ level
     • Signal strength
     • Fuel remaining

   Collapses to icon-only on mobile. Auto-hides when scrolled past hero.
   ================================================================ */

interface TelemetryDatum {
  icon: React.ReactNode;
  label: string;
  getValue: (t: number) => string;
  color: string;
  mobileHide?: boolean;
}

const DATA: TelemetryDatum[] = [
{
  icon: <Clock className="w-3 h-3" />,
  label: 'MET',
  getValue: (t) => {
    const h = Math.floor(t / 3600) % 24;
    const m = Math.floor(t % 3600 / 60);
    const s = Math.floor(t % 60);
    return `SOL 47 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },
  color: '#22c55e'
},
{
  icon: <Navigation className="w-3 h-3" />,
  label: 'DIST',
  getValue: (t) => {
    const base = 225.0 - Math.sin(t * 0.001) * 2.3;
    return `${base.toFixed(1)}M km`;
  },
  color: '#4ab8c4',
  mobileHide: true
},
{
  icon: <Gauge className="w-3 h-3" />,
  label: 'VEL',
  getValue: (t) => {
    const v = 24530 + Math.sin(t * 0.02) * 120;
    return `${v.toFixed(0)} m/s`;
  },
  color: '#FF4500',
  mobileHide: true
},
{
  icon: <Thermometer className="w-3 h-3" />,
  label: 'HULL',
  getValue: (t) => {
    const temp = -42 + Math.sin(t * 0.005) * 3;
    return `${temp.toFixed(1)}°C`;
  },
  color: '#a855f7',
  mobileHide: true
},
{
  icon: <Activity className="w-3 h-3" />,
  label: 'O₂',
  getValue: (t) => {
    const o2 = 98.7 + Math.sin(t * 0.008) * 0.8;
    return `${o2.toFixed(1)}%`;
  },
  color: '#22c55e'
},
{
  icon: <Fuel className="w-3 h-3" />,
  label: 'FUEL',
  getValue: (t) => {
    const fuel = 73.2 - t * 0.0001;
    return `${Math.max(fuel, 60).toFixed(1)}%`;
  },
  color: '#eab308',
  mobileHide: true
},
{
  icon: <Wifi className="w-3 h-3" />,
  label: 'SIG',
  getValue: (t) => {
    const sig = -68 + Math.sin(t * 0.01) * 5;
    return `${sig.toFixed(0)} dBm`;
  },
  color: '#6b8aed',
  mobileHide: true
}];


export default function TelemetryBar() {
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const startRef = useRef(Date.now());

  // Tick the clock
  useEffect(() => {
    const id = setInterval(() => {
      setTick((Date.now() - startRef.current) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Hide when scrolled past hero
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < window.innerHeight * 2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: visible ? 0 : -40, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[90] pointer-events-none hidden lg:block"
    >

      <div className="w-full h-7 bg-black/40 backdrop-blur-md border-b border-white/[0.04] flex items-center justify-center gap-1 sm:gap-4 px-2 sm:px-4 overflow-hidden">
        {/* Live indicator */}
        <div className="flex items-center gap-1 mr-1 sm:mr-2 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[7px] font-display tracking-[0.2em] text-green-400/50 hidden sm:inline">LIVE</span>
        </div>

        {/* Data points */}
        {DATA.map((d, i) =>
        <div
        key={i}
        className={`flex items-center gap-1 sm:gap-1.5 ${d.mobileHide ? 'hidden sm:flex' : 'flex'}`}>

            <span style={{ color: d.color, opacity: 0.4 }}>{d.icon}</span>
            <span className="text-[7px] font-display tracking-[0.1em] text-white/50 hidden md:inline">{d.label}</span>
            <span className="text-[8px] sm:text-[9px] font-mono tabular-nums" style={{ color: d.color, opacity: 0.5 }}>
              {d.getValue(tick)}
            </span>

            {/* Separator */}
            {i < DATA.length - 1 &&
          <span className="text-white/[0.06] mx-0.5 sm:mx-1 hidden sm:inline">·</span>
          }
          </div>
        )}
      </div>
    </motion.div>);

}