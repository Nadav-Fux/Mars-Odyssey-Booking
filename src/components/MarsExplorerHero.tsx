import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import MarsGlobe from '@/components/MarsGlobe';
import { EXPO_OUT } from '@/lib/easing';
import { Wifi, Thermometer, MapPin, Satellite, Radio, Zap } from 'lucide-react';

/**
 * MarsExplorerHero — Upgraded
 *
 * Full-viewport interactive Mars globe with:
 *   • Orbiting HUD ring with data nodes
 *   • Floating telemetry readouts
 *   • Scan sweep effect
 *   • Ambient particles
 *   • Signal connection bar
 */

/* ── Telemetry data for HUD readouts ── */
const TELEMETRY = [
{ icon: Thermometer, label: 'SURFACE', value: '-63°C', color: '#FF4500' },
{ icon: MapPin, label: 'LATITUDE', value: '18.4°N', color: '#4ab8c4' },
{ icon: Satellite, label: 'ORBIT ALT', value: '248 km', color: '#a855f7' },
{ icon: Wifi, label: 'SIGNAL', value: '42 dBm', color: '#6b8aed' }];


/* ── Orbiting ring nodes ── */
const RING_NODES = [
{ angle: 0, label: 'NAV', active: true },
{ angle: 45, label: 'SCI', active: true },
{ angle: 90, label: 'COM', active: false },
{ angle: 135, label: 'PWR', active: true },
{ angle: 180, label: 'LIF', active: true },
{ angle: 225, label: 'GEO', active: false },
{ angle: 270, label: 'ATM', active: true },
{ angle: 315, label: 'RAD', active: true }];


/* ── Floating particles ── */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 50 + (Math.sin(i * 0.8) * 42 + i % 7 * 3),
  y: 50 + (Math.cos(i * 1.2) * 42 + i % 5 * 3),
  size: 1 + i % 3,
  duration: 3 + i % 5 * 2,
  delay: i * 0.15,
  opacity: 0.1 + i % 4 * 0.08
}));

function AnimatedNumber({ value, delay = 0 }: {value: string;delay?: number;}) {
  const [display, setDisplay] = useState('---');
  useEffect(() => {
    const t = setTimeout(() => {
      let step = 0;
      const chars = '0123456789.-°CNkmdb ';
      const interval = setInterval(() => {
        if (step >= 8) {
          setDisplay(value);
          clearInterval(interval);
          return;
        }
        setDisplay(
          value.
          split('').
          map((c, i) => i <= step ? c : chars[Math.floor(Math.random() * chars.length)]).
          join('')
        );
        step++;
      }, 60);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return <span className="tabular-nums">{display}</span>;
}

export default function MarsExplorerHero() {
  const ref = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const [scanActive, setScanActive] = useState(false);

  // Periodic scan sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setScanActive(true);
      setTimeout(() => setScanActive(false), 2000);
    }, 6000);
    setScanActive(true);
    setTimeout(() => setScanActive(false), 2000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (!globeRef.current) return;
    gsap.fromTo(
      globeRef.current,
      { scale: 1, y: 0 },
      {
        scale: 0.85,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  }, { scope: ref });

  return (
    <section ref={ref} className="relative z-10 py-10 sm:py-16">
      {/* Ambient glow layers */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="w-[700px] h-[700px] rounded-full bg-primary/[0.05] blur-[140px]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="w-[450px] h-[450px] rounded-full bg-accent/[0.04] blur-[100px]" />
      </div>

      {/* Main globe container */}
      <div className="relative mx-auto max-w-[700px]">
        <motion.div
          ref={globeRef}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: EXPO_OUT }}
          className="relative flex items-center justify-center">

          {/* ── Orbiting ring SVG ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg
            viewBox="0 0 600 600"
            className="w-[130%] h-[130%] absolute"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.1))' }}>

              {/* Outer dashed orbit */}
              <circle
              cx="300" cy="300" r="260"
              fill="none" stroke="rgba(255,69,0,0.08)" strokeWidth="1"
              strokeDasharray="4 8">

                <animateTransform
                attributeName="transform" type="rotate"
                from="0 300 300" to="360 300 300"
                dur="60s" repeatCount="indefinite" />

              </circle>

              {/* Inner solid orbit */}
              <circle
              cx="300" cy="300" r="240"
              fill="none" stroke="rgba(74,184,196,0.06)" strokeWidth="0.5">

                <animateTransform
                attributeName="transform" type="rotate"
                from="360 300 300" to="0 300 300"
                dur="45s" repeatCount="indefinite" />

              </circle>

              {/* Data nodes on ring */}
              {RING_NODES.map((node, i) => {
                const rad = node.angle * Math.PI / 180;
                const x = 300 + Math.cos(rad) * 260;
                const y = 300 + Math.sin(rad) * 260;
                return (
                  <g key={i}>
                    <animateTransform
                    attributeName="transform" type="rotate"
                    from="0 300 300" to="360 300 300"
                    dur="60s" repeatCount="indefinite" />

                    <circle
                    cx={x} cy={y} r={node.active ? 4 : 2.5}
                    fill={node.active ? 'rgba(255,69,0,0.5)' : 'rgba(255,255,255,0.1)'}>

                      {node.active &&
                      <animate
                      attributeName="r" values="3;5;3"
                      dur="2s" repeatCount="indefinite" />

                      }
                    </circle>
                    {node.active &&
                    <circle
                    cx={x} cy={y} r="8"
                    fill="none" stroke="rgba(255,69,0,0.2)" strokeWidth="0.5">

                        <animate
                      attributeName="r" values="6;12;6"
                      dur="2s" repeatCount="indefinite" />

                        <animate
                      attributeName="opacity" values="0.3;0;0.3"
                      dur="2s" repeatCount="indefinite" />

                      </circle>
                    }
                  </g>);

              })}

              {/* Scan sweep */}
              {scanActive &&
              <line
              x1="300" y1="300" x2="300" y2="40"
              stroke="rgba(74,184,196,0.3)" strokeWidth="1">

                  <animateTransform
                attributeName="transform" type="rotate"
                from="0 300 300" to="360 300 300"
                dur="2s" fill="freeze" />

                </line>
              }
              {scanActive &&
              <circle
              cx="300" cy="300" r="0"
              fill="none" stroke="rgba(74,184,196,0.15)" strokeWidth="1">

                  <animate attributeName="r" from="0" to="280" dur="2s" fill="freeze" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" fill="freeze" />
                </circle>
              }
            </svg>
          </div>

          {/* ── Floating particles ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            {PARTICLES.map((p) =>
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-primary/40"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`
              }}
              animate={{
                x: [0, p.id % 2 === 0 ? 20 : -20, 0],
                y: [0, p.id % 3 === 0 ? -15 : 15, 0],
                opacity: [0, p.opacity, 0]
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }} />

            )}
          </div>

          {/* ── The Globe ── */}
          <MarsGlobe size={520} className="w-full max-w-[85vw] sm:max-w-[520px] relative z-10" />
        </motion.div>

        {/* ── Telemetry HUD readouts ── */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none" aria-hidden>
          {/* Left side readouts */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 space-y-4">
            {TELEMETRY.slice(0, 2).map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1 + i * 0.2, ease: EXPO_OUT }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">

                  <Icon className="w-3 h-3 shrink-0" style={{ color: t.color }} />
                  <div className="flex flex-col">
                    <span className="text-[7px] font-display tracking-[0.2em] text-white/50">{t.label}</span>
                    <span className="text-xs font-display font-bold" style={{ color: t.color }}>
                      <AnimatedNumber value={t.value} delay={1200 + i * 300} />
                    </span>
                  </div>
                </motion.div>);

            })}
          </div>

          {/* Right side readouts */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 space-y-4">
            {TELEMETRY.slice(2, 4).map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.4 + i * 0.2, ease: EXPO_OUT }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06]">

                  <Icon className="w-3 h-3 shrink-0" style={{ color: t.color }} />
                  <div className="flex flex-col">
                    <span className="text-[7px] font-display tracking-[0.2em] text-white/50">{t.label}</span>
                    <span className="text-xs font-display font-bold" style={{ color: t.color }}>
                      <AnimatedNumber value={t.value} delay={1800 + i * 300} />
                    </span>
                  </div>
                </motion.div>);

            })}
          </div>
        </div>

        {/* ── Signal connection bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex items-center justify-center gap-3 mt-8">

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <Radio className="w-3 h-3 text-green-400/60" />
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) =>
              <motion.div
                key={i}
                className="w-1 rounded-full bg-green-400/60"
                style={{ height: 4 + i * 3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }} />

              )}
            </div>
            <span className="text-[8px] font-display tracking-[0.15em] text-green-400/50 ml-1">LINK ACTIVE</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <Zap className="w-3 h-3 text-yellow-400/50" />
            <span className="text-[8px] font-display tracking-[0.15em] text-yellow-400/40">PWR 98%</span>
          </div>
        </motion.div>
      </div>

      {/* Instruction hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        className="text-center text-[10px] sm:text-xs font-display tracking-[0.25em] text-white/50 mt-6 sm:mt-10">

        INTERACTIVE GLOBE · CLICK LANDING ZONES FOR DETAILS
      </motion.p>
    </section>);

}