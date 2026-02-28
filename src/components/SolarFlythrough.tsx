import { useRef, useState, useMemo, useEffect, memo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { motion } from 'framer-motion';
import AresShipSVG from '@/components/AresShipSVG';

/* ================================================================
   SOLAR SYSTEM FLYTHROUGH — v2

   Scroll-pinned cinematic: fly from deep space, past Earth,
   launch the ARES-7, cruise through the void, arrive at Mars.

   The ARES-7 ship stays visible throughout the journey:
     Phase 1 → Deep space approach
     Phase 2 → Earth appears, ship orbits
     Phase 3 → LAUNCH — ship detaches and accelerates
     Phase 4 → Transit — ship cruises along trajectory
     Phase 5 → Mars approach — ship decelerates into orbit
     Phase 6 → Arrival fade
   ================================================================ */

function generateStars(count: number, seed: number) {
  const stars: {x: number;y: number;s: number;o: number;}[] = [];
  let r = seed;
  const rand = () => {r = r * 16807 % 2147483647;return r / 2147483647;};
  for (let i = 0; i < count; i++)
  stars.push({ x: rand() * 100, y: rand() * 100, s: 0.5 + rand() * 1.8, o: 0.15 + rand() * 0.6 });
  return stars;
}

function Planet({
  size, colors, glow, rings, children
}: {size: number;colors: {base: string;light: string;shadow: string;atmo?: string;};glow?: string;rings?: boolean;children?: React.ReactNode;}) {
  return (
    <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      background: `radial-gradient(circle at 35% 30%, ${colors.light} 0%, ${colors.base} 50%, ${colors.shadow} 100%)`,
      boxShadow: glow ? `0 0 ${size * 0.4}px ${glow}, 0 0 ${size * 0.8}px ${glow}40` : undefined
    }}>

      {/* Atmosphere rim */}
      {colors.atmo &&
      <div className="absolute inset-[-6%] rounded-full" style={{
        background: `radial-gradient(circle at 35% 30%, transparent 42%, ${colors.atmo}30 60%, ${colors.atmo}50 72%, transparent 100%)`
      }} />
      }
      {/* Specular highlight */}
      <div className="absolute rounded-full" style={{
        width: '40%', height: '30%', top: '10%', left: '16%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)',
        filter: 'blur(3px)'
      }} />
      {/* Limb darkening */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle at 42% 45%, transparent 35%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.85) 100%)'
      }} />
      {/* Terminator shadow */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'linear-gradient(105deg, rgba(0,0,0,0.05) 10%, transparent 25%, transparent 45%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.5) 68%, rgba(0,0,0,0.85) 82%)'
      }} />
      {children}
    </div>);

}

function SolarFlythrough() {
  const pinRef = useRef<HTMLElement>(null);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [phase, setPhase] = useState('APPROACH');

  const starsBack = useMemo(() => generateStars(120, 42), []);
  const starsMid = useMemo(() => generateStars(60, 137), []);
  const starsFront = useMemo(() => generateStars(30, 271), []);

  // Safety refresh: ensure ScrollTrigger recalculates after mount + paint
  useEffect(() => {
    const id1 = setTimeout(() => ScrollTrigger.refresh(), 1200);
    // Second refresh after boot sequence finishes (~7s)
    const id2 = setTimeout(() => ScrollTrigger.refresh(), 8000);
    return () => {clearTimeout(id1);clearTimeout(id2);};
  }, []);

  useGSAP(() => {
    const el = pinRef.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=500%',
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    });

    // ═════ STAR PARALLAX (continuous) ═════
    tl.fromTo('.sf-stars-back', { xPercent: 0 }, { xPercent: -8, yPercent: -5, ease: 'none', duration: 1 }, 0);
    tl.fromTo('.sf-stars-mid', { xPercent: 0 }, { xPercent: -15, yPercent: -10, ease: 'none', duration: 1 }, 0);
    tl.fromTo('.sf-stars-front', { xPercent: 0, opacity: 0.7 }, { xPercent: -25, yPercent: -18, opacity: 0.3, ease: 'none', duration: 1 }, 0);

    // ═════ PHASE 1 — Deep Space (0→15%) ═════
    // Approach label is already visible via CSS — just animate it out
    tl.to('.sf-label-approach', { opacity: 0, y: -30, duration: 0.10 }, 0.08);

    // Sun glow
    tl.fromTo('.sf-sun', { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 0.8, duration: 0.15 }, 0);
    tl.to('.sf-sun', { scale: 0.6, x: -100, opacity: 0.3, duration: 0.35 }, 0.2);
    tl.to('.sf-sun', { opacity: 0, duration: 0.15 }, 0.55);

    // ═════ PHASE 2 — Earth (15→35%) ═════
    tl.fromTo('.sf-earth', { scale: 0.04, x: 400, opacity: 0 }, { scale: 1, x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0.12);
    tl.fromTo('.sf-label-earth', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0.22);
    tl.to('.sf-label-earth', { opacity: 0, duration: 0.04 }, 0.32);
    tl.fromTo('.sf-moon-orbit', { rotation: 0 }, { rotation: 50, duration: 0.3 }, 0.15);

    // ═════ PHASE 3 — ARES-7 LAUNCH (32→48%) ═════
    // Ship appears docked near Earth
    tl.fromTo('.sf-ship',
    { opacity: 0, scale: 0.3, x: 0, y: 30, rotation: 0 },
    { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.06, ease: 'power2.out' },
    0.32
    );

    // Launch label
    tl.fromTo('.sf-label-launch', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.04 }, 0.34);
    tl.to('.sf-label-launch', { opacity: 0, duration: 0.04 }, 0.42);

    // Engine flare intensifies
    tl.fromTo('.sf-ship-glow',
    { opacity: 0, scaleX: 0.5 },
    { opacity: 0.8, scaleX: 1, duration: 0.04 },
    0.36
    );

    // Ship accelerates away from Earth (moves right and up)
    tl.to('.sf-ship', {
      x: 250, y: -80, scale: 0.6, rotation: -8,
      duration: 0.14, ease: 'power2.in'
    }, 0.40);
    tl.to('.sf-ship-glow', { opacity: 0.4, duration: 0.10 }, 0.44);

    // Earth recedes
    tl.to('.sf-earth', { scale: 0.12, x: -300, opacity: 0.3, duration: 0.25 }, 0.36);
    tl.to('.sf-earth', { opacity: 0, duration: 0.1 }, 0.56);

    // ═════ PHASE 4 — TRANSIT (48→72%) ═════
    // Ship settles into cruise position (center-right)
    tl.to('.sf-ship', {
      x: 80, y: 0, scale: 0.85, rotation: 0,
      duration: 0.08, ease: 'power2.out'
    }, 0.48);

    // Gentle ship bobbing during transit
    tl.to('.sf-ship', {
      y: -15, rotation: -2, duration: 0.12, ease: 'sine.inOut'
    }, 0.54);
    tl.to('.sf-ship', {
      y: 10, rotation: 2, duration: 0.12, ease: 'sine.inOut'
    }, 0.62);

    // Trajectory line draws
    tl.fromTo('.sf-trajectory', { strokeDashoffset: 2000 }, { strokeDashoffset: 0, duration: 0.35, ease: 'none' }, 0.36);

    // Transit label
    tl.fromTo('.sf-label-transit', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.52);
    tl.to('.sf-label-transit', { opacity: 0, duration: 0.05 }, 0.67);

    // Speed lines effect
    tl.fromTo('.sf-speed-lines', { opacity: 0, scaleX: 0.3 }, { opacity: 0.5, scaleX: 1, duration: 0.1 }, 0.48);
    tl.to('.sf-speed-lines', { opacity: 0, duration: 0.1 }, 0.66);

    // Engine exhaust glow during transit
    tl.to('.sf-ship-glow', { opacity: 0.6, scaleX: 1.3, duration: 0.20 }, 0.50);

    // ═════ PHASE 5 — MARS ARRIVAL (70→95%) ═════
    // Ship brakes (slight nose-up tilt)
    tl.to('.sf-ship', {
      x: -30, y: 10, scale: 0.7, rotation: 5,
      duration: 0.12, ease: 'power2.out'
    }, 0.70);
    tl.to('.sf-ship-glow', { opacity: 0.9, scaleX: 1.6, duration: 0.06 }, 0.70);
    tl.to('.sf-ship-glow', { opacity: 0.3, scaleX: 0.8, duration: 0.10 }, 0.80);

    // Mars appears
    tl.fromTo('.sf-mars', { scale: 0.03, x: 500, opacity: 0 }, { scale: 1, x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.67);
    tl.fromTo('.sf-label-mars', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.06 }, 0.84);
    tl.fromTo('.sf-mars-glow', { opacity: 0, scale: 0.8 }, { opacity: 0.6, scale: 1.3, duration: 0.15 }, 0.82);

    // Ship settles into Mars orbit
    tl.to('.sf-ship', {
      x: -120, y: -50, scale: 0.45, rotation: 12,
      duration: 0.12, ease: 'power2.inOut'
    }, 0.84);

    // ═════ PHASE 6 — FADE (95→100%) ═════
    tl.to('.sf-mars', { scale: 2.5, opacity: 0.2, duration: 0.07 }, 0.94);
    tl.to('.sf-ship', { opacity: 0, scale: 0.2, duration: 0.05 }, 0.94);
    tl.to('.sf-ship-glow', { opacity: 0, duration: 0.04 }, 0.94);
    tl.to(['.sf-label-mars', '.sf-mars-glow', '.sf-hud'], { opacity: 0, duration: 0.05 }, 0.96);

    // Blackout — smooth transition to next section
    tl.fromTo('.sf-blackout',
    { opacity: 0 },
    { opacity: 1, duration: 0.06, ease: 'power2.in' },
    0.95
    );

    // ═════ HUD LIVE DATA ═════
    tl.eventCallback('onUpdate', () => {
      const p = tl.progress();
      setDistance(Math.floor(gsap.utils.clamp(0, 1, (p - 0.35) / 0.55) * 54_600_000));
      setSpeed(Math.floor(Math.sin(gsap.utils.clamp(0, 1, (p - 0.3) / 0.6) * Math.PI) * 40_000));
      if (p < 0.15) setPhase('DEEP SPACE');else
      if (p < 0.35) setPhase('EARTH ORBIT');else
      if (p < 0.48) setPhase('LAUNCH');else
      if (p < 0.70) setPhase('TRANSIT');else
      if (p < 0.95) setPhase('MARS APPROACH');else
      setPhase('ARRIVAL');
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, { scope: pinRef });

  const fmtDist = (d: number) =>
  d >= 1e6 ? (d / 1e6).toFixed(1) + 'M' : d >= 1e3 ? (d / 1e3).toFixed(0) + 'K' : String(d);

  return (
    <section
    ref={pinRef}
    id="flythrough"
    className="relative z-10 h-screen w-full overflow-hidden"
    style={{ background: '#020206' }}>

      {/* ══ AMBIENT NEBULA — prevents pure-black on initial load ══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(30,20,60,0.3) 0%, rgba(10,10,30,0.15) 40%, transparent 70%)'
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 40% 50% at 20% 30%, rgba(30,50,100,0.08) 0%, transparent 60%)'
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 35% 40% at 80% 70%, rgba(80,30,10,0.06) 0%, transparent 60%)'
      }} />

      {/* ══ STARS ══ */}
      <div className="sf-stars-back absolute inset-[-20%] pointer-events-none">
        {starsBack.map((s, i) =>
        <div key={i} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o * 0.5 }} />
        )}
      </div>
      <div className="sf-stars-mid absolute inset-[-15%] pointer-events-none">
        {starsMid.map((s, i) =>
        <div key={i} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s * 1.2, height: s.s * 1.2, opacity: s.o * 0.7 }} />
        )}
      </div>
      <div className="sf-stars-front absolute inset-[-10%] pointer-events-none">
        {starsFront.map((s, i) =>
        <div key={i} className="absolute rounded-full bg-blue-200" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s * 1.5, height: s.s * 1.5, opacity: s.o }} />
        )}
      </div>

      {/* ══ SPEED LINES ══ */}
      <div className="sf-speed-lines absolute inset-0 pointer-events-none opacity-0">
        {Array.from({ length: 25 }, (_, i) =>
        <div key={i} className="absolute bg-white/20 rounded-full" style={{
          left: `${10 + Math.random() * 80}%`, top: `${5 + Math.random() * 90}%`,
          width: `${60 + Math.random() * 120}px`, height: '1px',
          transform: `rotate(${-5 + Math.random() * 10}deg)`, opacity: 0.1 + Math.random() * 0.3
        }} />
        )}
      </div>

      {/* ══ SUN ══ */}
      <div className="sf-sun absolute opacity-0 pointer-events-none" style={{
        width: 200, height: 200, left: '15%', top: '25%',
        background: 'radial-gradient(circle, rgba(255,200,50,0.8) 0%, rgba(255,150,30,0.3) 30%, transparent 70%)',
        filter: 'blur(8px)'
      }} />

      {/* ══ EARTH ══ */}
      <div className="sf-earth absolute opacity-0" style={{ left: '50%', top: '50%', marginLeft: -80, marginTop: -80 }}>
        <Planet size={160} colors={{ base: '#1a4a7a', light: '#3a8ad0', shadow: '#0a1a30', atmo: '#4a9eff' }} glow="rgba(70,140,255,0.15)">
          <div className="absolute rounded-full" style={{ width: '30%', height: '35%', top: '25%', left: '28%', background: 'radial-gradient(ellipse, rgba(50,120,50,0.4) 0%, transparent 70%)' }} />
          <div className="absolute rounded-full" style={{ width: '50%', height: '8%', top: '35%', left: '10%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', filter: 'blur(3px)' }} />
        </Planet>
        <div className="sf-moon-orbit absolute pointer-events-none" style={{ width: 160, height: 160, top: 0, left: 0, transformOrigin: '80px 80px' }}>
          <div className="absolute rounded-full" style={{ width: 28, height: 28, top: -20, left: 66, background: 'radial-gradient(circle at 35% 30%, #d0d0d0 0%, #888 50%, #444 100%)', boxShadow: '0 0 10px rgba(200,200,200,0.1)' }} />
        </div>
      </div>

      {/* ══ TRAJECTORY ══ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="sf-tgrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.7" />
            <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FF4500" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="sf-tglow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0.2" />
          </linearGradient>
          <filter id="sf-blur-line">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="sf-blur-particle">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Trajectory — wide glow layer */}
        <path className="sf-trajectory" d="M 200,310 C 350,200 650,180 800,300" fill="none" stroke="url(#sf-tglow)" strokeWidth="12" strokeDasharray="8 6" strokeDashoffset="2000" strokeLinecap="round" filter="url(#sf-blur-line)" />
        {/* Trajectory — main line */}
        <path className="sf-trajectory" d="M 200,310 C 350,200 650,180 800,300" fill="none" stroke="url(#sf-tgrad)" strokeWidth="1.8" strokeDasharray="10 5" strokeDashoffset="2000" strokeLinecap="round" />
        {/* Trajectory — bright inner core */}
        <path className="sf-trajectory" d="M 200,310 C 350,200 650,180 800,300" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="10 5" strokeDashoffset="2000" strokeLinecap="round" opacity="0.2" />

        {/* Animated waypoint particles along trajectory */}
        {[0, 1, 2, 3, 4].map((i) =>
        <circle key={`wp-${i}`} r="2.5" fill="#FF4500" opacity="0">
            <animateMotion
          path="M 200,310 C 350,200 650,180 800,300"
          dur="6s"
          begin={`${i * 1.2}s`}
          repeatCount="indefinite"
          calcMode="linear" />

            <animate attributeName="opacity" values="0;0.5;0.3;0" dur="6s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="1;3;2;0.5" dur="6s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
          </circle>
        )}
        {/* Particle glow trails */}
        {[0, 1, 2].map((i) =>
        <circle key={`wpg-${i}`} r="6" fill="#FF4500" opacity="0" filter="url(#sf-blur-particle)">
            <animateMotion
          path="M 200,310 C 350,200 650,180 800,300"
          dur="6s"
          begin={`${i * 2}s`}
          repeatCount="indefinite"
          calcMode="linear" />

            <animate attributeName="opacity" values="0;0.15;0.08;0" dur="6s" begin={`${i * 2}s`} repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* ══ ARES-7 SHIP ══ */}
      <div
      className="sf-ship absolute z-[8] pointer-events-none"
      style={{ left: '50%', top: '45%', marginLeft: -75, marginTop: -30, opacity: 0 }}>

        {/* Engine exhaust glow (separate for animation) */}
        <div
        className="sf-ship-glow absolute pointer-events-none"
        style={{
          width: 100, height: 60,
          left: -70, top: -2,
          background: 'radial-gradient(ellipse at 90% 50%, rgba(255,120,40,0.6) 0%, rgba(255,69,0,0.25) 30%, transparent 70%)',
          filter: 'blur(10px)',
          transformOrigin: 'right center',
          opacity: 0
        }} />

        <AresShipSVG size={150} thrust={0.8} />
      </div>

      {/* ══ MARS ══ */}
      <div className="sf-mars absolute opacity-0 z-[4]" style={{ left: '50%', top: '50%', marginLeft: -100, marginTop: -100 }}>
        <div className="sf-mars-glow absolute opacity-0 pointer-events-none" style={{
          width: 400, height: 400, left: -100, top: -100,
          background: 'radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 60%)',
          filter: 'blur(30px)'
        }} />
        <Planet size={200} colors={{ base: '#a0441a', light: '#d4734a', shadow: '#3a1808', atmo: '#ff6b35' }} glow="rgba(255,69,0,0.12)">
          <div className="absolute rounded-full" style={{ width: '40%', height: '20%', top: '45%', left: '20%', background: 'radial-gradient(ellipse, rgba(80,25,10,0.5) 0%, transparent 70%)' }} />
          <div className="absolute rounded-full" style={{ width: '15%', height: '15%', top: '30%', left: '40%', background: 'radial-gradient(circle, rgba(160,80,40,0.4) 0%, transparent 70%)' }} />
          <div className="absolute rounded-full" style={{ width: '30%', height: '12%', top: '5%', left: '35%', background: 'radial-gradient(ellipse, rgba(220,200,190,0.35) 0%, transparent 70%)', filter: 'blur(2px)' }} />
        </Planet>
      </div>

      {/* ══ TEXT LABELS ══ */}
      {/* Approach label — visible immediately, GSAP will control it on scroll */}
      <div className="sf-label-approach absolute inset-0 flex flex-col items-center justify-center z-[10] pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-pulse" />
          <span className="text-[9px] font-display tracking-[0.3em] text-blue-400/50">NAVIGATION SYSTEM</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-pulse" />
        </div>
        <h3 className="font-display text-2xl sm:text-4xl font-bold text-white/70 tracking-wider">SOLAR SYSTEM</h3>
        <span className="text-[10px] font-display tracking-[0.25em] text-white/50 mt-2">APPROACH VECTOR CONFIRMED</span>
      </div>

      <div className="sf-label-earth absolute inset-0 flex flex-col items-center justify-end pb-[18%] z-[10] pointer-events-none opacity-0">
        <span className="text-[9px] font-display tracking-[0.25em] text-blue-400/50 mb-1">ORIGIN</span>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-blue-300/80 tracking-wider">EARTH</h3>
        <span className="text-[10px] font-display tracking-[0.15em] text-white/50 mt-1">SOL III · HOME WORLD</span>
      </div>

      <div className="sf-label-launch absolute inset-0 flex flex-col items-center justify-center z-[10] pointer-events-none opacity-0">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <h3 className="font-display text-3xl sm:text-5xl font-bold text-primary tracking-wider" style={{ textShadow: '0 0 30px rgba(255,69,0,0.4)' }}>LAUNCH</h3>
        </motion.div>
        <span className="text-[10px] font-display tracking-[0.2em] text-primary/50 mt-2">T-0 · ARES-7 DEPARTURE</span>
      </div>

      <div className="sf-label-transit absolute inset-0 flex flex-col items-center justify-center z-[10] pointer-events-none opacity-0">
        <span className="text-[9px] font-display tracking-[0.25em] text-white/30 mb-1">INTERPLANETARY CRUISE</span>
        <h3 className="font-display text-xl sm:text-3xl font-bold text-white/50 tracking-wider">225 MILLION KM</h3>
        <span className="text-[10px] font-display tracking-[0.15em] text-white/50 mt-1">ESTIMATED TRANSIT: 7 MONTHS</span>
      </div>

      <div className="sf-label-mars absolute inset-0 flex flex-col items-center justify-end pb-[15%] z-[10] pointer-events-none opacity-0">
        <span className="text-[9px] font-display tracking-[0.25em] text-primary/50 mb-1">DESTINATION</span>
        <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-wider" style={{ color: '#FF4500', textShadow: '0 0 20px rgba(255,69,0,0.3)' }}>MARS</h3>
        <span className="text-[10px] font-display tracking-[0.15em] text-white/50 mt-1">SOL IV · THE RED PLANET</span>
      </div>

      {/* ══ HUD ══ */}
      {/* Visible on load at low opacity — GSAP fades it out at end */}
      <div className="sf-hud absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[15] pointer-events-none">
        <div className="flex items-center gap-4 sm:gap-8 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl" style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}>
          {/* Phase */}
          <div className="flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] font-display tracking-[0.2em] text-white/50">PHASE</span>
            <span className="text-[10px] sm:text-sm font-display font-bold tracking-[0.12em] text-white/70 mt-0.5">{phase}</span>
          </div>
          <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
          {/* Velocity */}
          <div className="flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] font-display tracking-[0.2em] text-primary/50">VELOCITY</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-display text-sm sm:text-lg font-bold tabular-nums text-primary">
                {speed.toLocaleString()}
              </span>
              <span className="text-[7px] sm:text-[8px] text-primary/40 font-display">km/h</span>
            </div>
          </div>
          <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
          {/* Distance */}
          <div className="flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] font-display tracking-[0.2em] text-[#4ab8c4]/50">DISTANCE</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-display text-sm sm:text-lg font-bold tabular-nums text-[#4ab8c4]">
                {fmtDist(distance)}
              </span>
              <span className="text-[7px] sm:text-[8px] text-[#4ab8c4]/40 font-display">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SCROLL HINT ══ */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[15] pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          <span className="text-[8px] font-display tracking-[0.2em] text-white/50">SCROLL TO FLY</span>
        </div>
      </div>

      {/* Corner frame */}
      {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) =>
      <div key={i} className={`absolute ${pos} w-6 h-6 pointer-events-none z-[15]`} style={{
        borderTop: pos.includes('top') ? '1px solid rgba(255,255,255,0.06)' : 'none',
        borderBottom: pos.includes('bottom') ? '1px solid rgba(255,255,255,0.06)' : 'none',
        borderLeft: pos.includes('left') ? '1px solid rgba(255,255,255,0.06)' : 'none',
        borderRight: pos.includes('right') ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }} />
      )}

      {/* ═══ EDGE GRADIENTS — blend with adjacent sections ═══ */}
      <div
      className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-[18]"
      style={{ background: 'linear-gradient(to bottom, #050508, transparent)' }} />

      <div
      className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[18]"
      style={{ background: 'linear-gradient(to top, #050508, transparent)' }} />


      {/* ═══ BLACKOUT OVERLAY — fades to black at end of journey ═══ */}
      <div
      className="sf-blackout absolute inset-0 pointer-events-none z-[20]"
      style={{ backgroundColor: '#050508', opacity: 0 }} />

    </section>);

}

export default memo(SolarFlythrough);