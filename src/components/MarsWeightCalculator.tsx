import { useRef, useState, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Scale, Rocket, PartyPopper, ChevronRight } from 'lucide-react';
import RevealText from '@/components/RevealText';

/* ================================================================
   WEIGHT ON MARS CALCULATOR

   Features:
     • Numeric input for Earth weight (kg or lbs)
     • Detailed SVG balance-scale that tilts via GSAP
     • Mars weight = Earth weight × 0.3794
     • Animated result counter
     • Celebration confetti burst on calculate
   ================================================================ */

const MARS_G_RATIO = 0.3794;
const MAX_TILT = 18; // degrees

// ── Confetti particle ──
interface Particle {
  id: number;
  x: number;
  y: number;
  r: number;
  color: string;
  dx: number;
  dy: number;
  rot: number;
  shape: 'circle' | 'rect' | 'star';
}

const COLORS = ['#FF4500', '#ff6b35', '#4ab8c4', '#a855f7', '#eab308', '#22c55e', '#ec4899'];
let _pid = 0;

function spawnConfetti(cx: number, cy: number, count = 40): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    return {
      id: ++_pid,
      x: cx,
      y: cy,
      r: 3 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 3,
      rot: Math.random() * 360,
      shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)]
    };
  });
}

// ── Confetti canvas ──
function ConfettiCanvas({ particles, onDone }: {particles: Particle[];onDone: () => void;}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const pRef = useRef(particles.map((p) => ({ ...p })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const W = canvas.width;
    const H = canvas.height;
    let frame = 0;

    const draw = () => {
      ctx2d.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of pRef.current) {
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.15; // gravity
        p.dx *= 0.985; // friction
        p.rot += p.dx * 2;
        const opacity = Math.max(0, 1 - frame / 80);
        if (opacity <= 0) continue;
        alive++;
        ctx2d.save();
        ctx2d.globalAlpha = opacity;
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rot * Math.PI / 180);
        ctx2d.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx2d.beginPath();
          ctx2d.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx2d.fill();
        } else if (p.shape === 'rect') {
          ctx2d.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        } else {
          // star
          ctx2d.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * 72 - 90) * (Math.PI / 180);
            const ra = i === 0 ? 'moveTo' : 'lineTo';
            (ctx2d as any)[ra](Math.cos(a) * p.r, Math.sin(a) * p.r);
            const b = (i * 72 + 36 - 90) * (Math.PI / 180);
            ctx2d.lineTo(Math.cos(b) * p.r * 0.4, Math.sin(b) * p.r * 0.4);
          }
          ctx2d.closePath();
          ctx2d.fill();
        }
        ctx2d.restore();
      }
      frame++;
      if (alive > 0 && frame < 100) {
        frameRef.current = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [onDone, particles]);

  return (
    <canvas
    ref={canvasRef}
    width={600}
    height={400}
    className="absolute inset-0 w-full h-full pointer-events-none z-20" />);


}

// ── Balance Scale SVG ──
function BalanceScale({ tilt, earthW, marsW, unit, showResult

}: {tilt: number;earthW: number;marsW: number;unit: string;showResult: boolean;}) {
  const beamRef = useRef<SVGGElement>(null);

  useGSAP(() => {
    if (!beamRef.current) return;
    gsap.to(beamRef.current, {
      attr: { transform: `rotate(${tilt}, 250, 140)` },
      duration: 1.2,
      ease: 'elastic.out(1, 0.5)'
    });
  }, [tilt]);

  return (
    <svg viewBox="0 0 500 320" className="w-full h-auto" fill="none">
      <defs>
        <linearGradient id="mwc-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF4500" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="mwc-pan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4500" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0.03" />
        </linearGradient>
        <filter id="mwc-glow">
          <feGaussianBlur stdDeviation="3" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="mwc-glow-sm">
          <feGaussianBlur stdDeviation="1.5" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Base / pedestal */}
      <path
      d="M200,295 L250,260 L300,295 Z"
      stroke="#FF4500" strokeWidth="1" strokeOpacity="0.3"
      fill="#FF4500" fillOpacity="0.04" />

      <line x1="210" y1="295" x2="290" y2="295" stroke="#FF4500" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Base detail lines */}
      <line x1="225" y1="277" x2="250" y2="262" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="275" y1="277" x2="250" y2="262" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.15" />

      {/* Central pillar */}
      <line x1="250" y1="260" x2="250" y2="145" stroke="#FF4500" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="250" cy="145" r="6" stroke="#FF4500" strokeWidth="1" strokeOpacity="0.5" fill="#FF4500" fillOpacity="0.08" />
      <circle cx="250" cy="145" r="2.5" fill="#FF4500" fillOpacity="0.5" />

      {/* Pillar detail */}
      {[170, 195, 220, 245].map((y) =>
      <line key={y} x1="246" y1={y} x2="254" y2={y} stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.12" />
      )}

      {/* ======= ROTATING BEAM GROUP ======= */}
      <g ref={beamRef} transform={`rotate(0, 250, 140)`}>
        {/* Main beam */}
        <rect x="80" y="137" width="340" height="6" rx="3" fill="url(#mwc-beam)" />
        <rect x="80" y="137" width="340" height="6" rx="3" stroke="#FF4500" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />

        {/* Beam hash marks */}
        {[120, 160, 200, 300, 340, 380].map((x) =>
        <line key={`h-${x}`} x1={x} y1="137" x2={x} y2="143" stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.2" />
        )}

        {/* === LEFT PAN (Earth) === */}
        {/* Chains */}
        <line x1="95" y1="143" x2="75" y2="190" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.35" />
        <line x1="135" y1="143" x2="155" y2="190" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.35" />
        {/* Chain links */}
        {[0, 1, 2].map((i) =>
        <g key={`lc-${i}`}>
            <circle cx={95 - (i + 1) * 6.5} cy={143 + (i + 1) * 15.5} r="1.5" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.2" fill="none" />
            <circle cx={135 + (i + 1) * 6.5} cy={143 + (i + 1) * 15.5} r="1.5" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.2" fill="none" />
          </g>
        )}
        {/* Pan */}
        <ellipse cx="115" cy="195" rx="50" ry="10" fill="url(#mwc-pan)" stroke="#FF4500" strokeWidth="0.8" strokeOpacity="0.35" />
        {/* Earth icon */}
        <circle cx="115" cy="182" r="12" stroke="#4ab8c4" strokeWidth="1" strokeOpacity="0.5" fill="#4ab8c4" fillOpacity="0.06" />
        <text x="115" y="186" textAnchor="middle" fontSize="8" fontFamily="Orbitron, monospace" fill="#4ab8c4" fillOpacity="0.7">♁</text>
        {/* Earth label */}
        <text x="115" y="220" textAnchor="middle" fontSize="7" fontFamily="Orbitron, monospace" fill="white" fillOpacity="0.25" letterSpacing="1">EARTH</text>
        {showResult &&
        <text x="115" y="232" textAnchor="middle" fontSize="9" fontFamily="Orbitron, monospace" fill="white" fillOpacity="0.5" fontWeight="bold">
            {earthW.toFixed(1)} {unit}
          </text>
        }

        {/* === RIGHT PAN (Mars) === */}
        {/* Chains */}
        <line x1="365" y1="143" x2="345" y2="190" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.35" />
        <line x1="405" y1="143" x2="425" y2="190" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.35" />
        {/* Chain links */}
        {[0, 1, 2].map((i) =>
        <g key={`rc-${i}`}>
            <circle cx={365 - (i + 1) * 6.5} cy={143 + (i + 1) * 15.5} r="1.5" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.2" fill="none" />
            <circle cx={405 + (i + 1) * 6.5} cy={143 + (i + 1) * 15.5} r="1.5" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.2" fill="none" />
          </g>
        )}
        {/* Pan */}
        <ellipse cx="385" cy="195" rx="50" ry="10" fill="url(#mwc-pan)" stroke="#FF4500" strokeWidth="0.8" strokeOpacity="0.35" />
        {/* Mars icon */}
        <circle cx="385" cy="182" r="12" stroke="#FF4500" strokeWidth="1" strokeOpacity="0.5" fill="#FF4500" fillOpacity="0.06" />
        <text x="385" y="186" textAnchor="middle" fontSize="8" fontFamily="Orbitron, monospace" fill="#FF4500" fillOpacity="0.7">♂</text>
        {/* Mars label */}
        <text x="385" y="220" textAnchor="middle" fontSize="7" fontFamily="Orbitron, monospace" fill="white" fillOpacity="0.25" letterSpacing="1">MARS</text>
        {showResult &&
        <text x="385" y="232" textAnchor="middle" fontSize="9" fontFamily="Orbitron, monospace" fill="#FF4500" fillOpacity="0.7" fontWeight="bold" filter="url(#mwc-glow-sm)">
            {marsW.toFixed(1)} {unit}
          </text>
        }
      </g>

      {/* Fulcrum glow */}
      <circle cx="250" cy="140" r="14" fill="#FF4500" fillOpacity="0.04" filter="url(#mwc-glow)" />

      {/* Gravity labels */}
      <text x="115" y="308" textAnchor="middle" fontSize="6" fontFamily="Orbitron, monospace" fill="#4ab8c4" fillOpacity="0.3" letterSpacing="0.5">9.81 m/s²</text>
      <text x="385" y="308" textAnchor="middle" fontSize="6" fontFamily="Orbitron, monospace" fill="#FF4500" fillOpacity="0.3" letterSpacing="0.5">3.72 m/s²</text>
    </svg>);

}

// ── Animated counter ──
function AnimCounter({ value, active }: {value: number;active: boolean;}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const objRef = useRef({ v: 0 });

  useGSAP(() => {
    if (active && value > 0) {
      objRef.current.v = 0;
      gsap.to(objRef.current, {
        v: value,
        duration: 1.4,
        ease: 'expo.out',
        onUpdate: () => {
          if (spanRef.current) spanRef.current.textContent = objRef.current.v.toFixed(1);
        }
      });
    }
  }, [active, value]);

  return <span ref={spanRef}>0.0</span>;
}

// ── Section ──
function MarsWeightCalculator() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const confettiAreaRef = useRef<HTMLDivElement>(null);
  const [earthWeight, setEarthWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [marsWeight, setMarsWeight] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [confetti, setConfetti] = useState<Particle[] | null>(null);

  // Section entry
  useGSAP(() => {
    gsap.from('.mwc-head', {
      y: 40, opacity: 0, stagger: 0.1, duration: 0.8,
      scrollTrigger: { trigger: '.mwc-header', start: 'top 85%', once: true }
    });
  }, { scope: sectionRef });

  const calculate = useCallback(() => {
    const val = parseFloat(earthWeight);
    if (isNaN(val) || val <= 0) return;

    const mw = val * MARS_G_RATIO;
    setMarsWeight(mw);
    setShowResult(true);

    // Tilt: Earth side heavier → beam tilts left-down (negative rotation)
    // The heavier Earth side should drop, Mars side rises
    const ratio = 1 - MARS_G_RATIO; // ~0.62
    setTilt(-MAX_TILT * ratio);

    // Confetti burst from center of the scale area
    const area = confettiAreaRef.current;
    if (area) {
      const rect = area.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height * 0.45;
      setConfetti(spawnConfetti(cx * (600 / rect.width), cy * (400 / rect.height), 50));
    }
  }, [earthWeight]);

  const reset = useCallback(() => {
    setEarthWeight('');
    setMarsWeight(0);
    setTilt(0);
    setShowResult(false);
    setConfetti(null);
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calculate();
  }, [calculate]);

  const savingsPercent = showResult ? ((1 - MARS_G_RATIO) * 100).toFixed(1) : '0';

  return (
    <section id="calculator" ref={sectionRef} className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="mwc-header mb-12 sm:mb-14 text-center">
          <span className="mwc-head inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/[0.04] mb-4">
            <Scale className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] text-primary/70">GRAVITY LAB</span>
          </span>

          <h2 className="mwc-head font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            WEIGHT ON{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">MARS</span>
          </h2>

          <RevealText
            text="Enter your Earth weight and watch the scale tilt. Mars gravity is only 37.9% of Earth’s — you’ll feel feather-light."
            className="mwc-head text-white/30 text-sm sm:text-base max-w-lg mx-auto leading-relaxed" />

        </div>

        {/* Calculator card */}
        <div className="relative max-w-2xl mx-auto">
          {/* Glass card */}
          <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
          }}>

            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="p-6 sm:p-8">
              {/* Input row */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
                <div className="flex-1 relative">
                  <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="10000"
                  step="0.1"
                  value={earthWeight}
                  onChange={(e) => {
                    setEarthWeight(e.target.value);
                    if (showResult) reset();
                  }}
                  onKeyDown={handleKey}
                  placeholder="Enter your Earth weight…"
                  className="w-full h-12 px-4 pr-16 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-display text-sm placeholder:text-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all tabular-nums" />

                  {/* Unit toggle */}
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex rounded-lg overflow-hidden border border-white/[0.06]">
                    {(['kg', 'lbs'] as const).map((u) =>
                    <button
                    key={u}
                    onClick={() => {setUnit(u);if (showResult) reset();}}
                    className={`px-2.5 py-1 text-[10px] font-display tracking-[0.1em] transition-all cursor-pointer ${
                    unit === u ?
                    'bg-primary/15 text-primary' :
                    'bg-transparent text-white/50 hover:text-white/70'}`
                    }>

                        {u.toUpperCase()}
                      </button>
                    )}
                  </div>
                </div>

                <motion.button
                  onClick={calculate}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-display text-sm font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-shadow hover:shadow-lg hover:shadow-primary/20">

                  CALCULATE
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Scale SVG area */}
              <div ref={confettiAreaRef} className="relative">
                <BalanceScale
                  tilt={tilt}
                  earthW={parseFloat(earthWeight) || 0}
                  marsW={marsWeight}
                  unit={unit}
                  showResult={showResult} />

                {/* Confetti overlay */}
                {confetti &&
                <ConfettiCanvas
                  particles={confetti}
                  onDone={() => setConfetti(null)} />

                }
              </div>

              {/* Result readout */}
              <AnimatePresence>
                {showResult &&
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.6, ease: EXPO_OUT }}
                  className="mt-4">

                    {/* Result cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Earth weight */}
                      <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(74,184,196,0.04)', border: '1px solid rgba(74,184,196,0.1)' }}>
                        <div className="text-[8px] font-display tracking-[0.18em] text-[#4ab8c4]/50 mb-1">EARTH WEIGHT</div>
                        <div className="font-display text-xl font-bold text-[#4ab8c4] tabular-nums">
                          {parseFloat(earthWeight).toFixed(1)}
                          <span className="text-xs text-[#4ab8c4]/40 ml-1">{unit}</span>
                        </div>
                      </div>

                      {/* Mars weight */}
                      <div className="rounded-xl p-4 text-center relative overflow-hidden" style={{ background: 'rgba(255,69,0,0.06)', border: '1px solid rgba(255,69,0,0.15)' }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.04] to-transparent" />
                        <div className="relative">
                          <div className="text-[8px] font-display tracking-[0.18em] text-primary/50 mb-1">MARS WEIGHT</div>
                          <div className="font-display text-2xl font-bold text-primary tabular-nums" style={{ textShadow: '0 0 20px rgba(255,69,0,0.3)' }}>
                            <AnimCounter value={marsWeight} active={showResult} />
                            <span className="text-xs text-primary/40 ml-1">{unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Savings */}
                      <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                        <div className="text-[8px] font-display tracking-[0.18em] text-green-500/50 mb-1">YOU SAVE</div>
                        <div className="font-display text-xl font-bold text-green-400 tabular-nums">
                          {savingsPercent}%
                          <span className="text-xs text-green-400/40 ml-1">lighter</span>
                        </div>
                      </div>
                    </div>

                    {/* Fun fact */}
                    <motion.div
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}>

                      <Rocket className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                      <p className="text-[11px] text-white/30 leading-relaxed">
                        On Mars you could jump <span className="text-primary/60 font-bold">{(1 / MARS_G_RATIO).toFixed(1)}× higher</span> than on Earth.
                        A {parseFloat(earthWeight).toFixed(0)} {unit} person would feel like just <span className="text-primary/60 font-bold">{marsWeight.toFixed(1)} {unit}</span>!
                      </p>
                    </motion.div>

                    {/* Reset */}
                    <div className="mt-4 text-center">
                      <button
                    onClick={reset}
                    className="text-[10px] font-display tracking-[0.15em] text-white/50 hover:text-white/70 transition-colors cursor-pointer">

                        ↻ RESET CALCULATOR
                      </button>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>

          {/* Decorative corner markers */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) =>
          <div
          key={i}
          className={`absolute ${pos} w-3 h-3 pointer-events-none`}
          style={{
            borderTop: pos.includes('top') ? '1px solid rgba(255,69,0,0.15)' : 'none',
            borderBottom: pos.includes('bottom') ? '1px solid rgba(255,69,0,0.15)' : 'none',
            borderLeft: pos.includes('left') ? '1px solid rgba(255,69,0,0.15)' : 'none',
            borderRight: pos.includes('right') ? '1px solid rgba(255,69,0,0.15)' : 'none'
          }} />

          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <span className="text-[8px] font-display tracking-[0.12em] text-white/10">
            GRAVITY CONSTANT: MARS 3.72076 m/s² · EARTH 9.80665 m/s² · RATIO 0.3794
          </span>
        </div>
      </div>
    </section>);

}

export default memo(MarsWeightCalculator);