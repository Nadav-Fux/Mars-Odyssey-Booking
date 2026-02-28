import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { motion } from 'framer-motion';
import FlightHUD, { Crosshair } from './FlightHUD';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   MARS LANDING SIMULATOR — Core Experience

   A scroll-pinned, 6-phase cinematic descent:

   Phase 1 (0–15%)  — ORBIT: Mars below, instruments boot up
   Phase 2 (15–28%) — DEORBIT BURN: engines fire, altitude drops
   Phase 3 (28–55%) — ATMOSPHERIC ENTRY: plasma, heat, G-force
   Phase 4 (55–70%) — PARACHUTE: sky clears, terrain visible
   Phase 5 (70–90%) — POWERED DESCENT: retrorockets, dust
   Phase 6 (90–100%) — TOUCHDOWN: contact light, celebration

   Everything is driven by a single GSAP ScrollTrigger pin.
   ================================================================ */

/* ── Generate stars ── */
function makeStars(count: number, seed: number) {
  const stars: {x: number;y: number;s: number;o: number;}[] = [];
  let r = seed;
  const rand = () => {r = r * 16807 % 2147483647;return r / 2147483647;};
  for (let i = 0; i < count; i++)
  stars.push({ x: rand() * 100, y: rand() * 100, s: 0.3 + rand() * 1.5, o: 0.2 + rand() * 0.6 });
  return stars;
}

/* ── Generate terrain SVG path ── */
function makeTerrainPath(seed: number, baseY: number, amplitude: number, points: number) {
  const pts: string[] = [];
  const rand = (i: number) => {
    const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i <= points; i++) {
    const x = i / points * 100;
    const n1 = Math.sin(i * 0.2 + seed) * amplitude;
    const n2 = Math.sin(i * 0.5 + seed * 2.3) * amplitude * 0.4;
    const jitter = (rand(i) - 0.5) * amplitude * 0.3;
    const y = baseY + n1 + n2 + jitter;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M0,100 L${pts.join(' L')} L100,100 Z`;
}

const STARS = makeStars(200, 42);
const TERRAIN_FAR = makeTerrainPath(3.1, 60, 15, 50);
const TERRAIN_MID = makeTerrainPath(7.4, 70, 12, 60);
const TERRAIN_NEAR = makeTerrainPath(11.8, 82, 8, 40);

/* ── Helper: lerp between values at breakpoints ── */
function lerpPhase(progress: number, breakpoints: [number, number][], values: number[]): number {
  for (let i = 0; i < breakpoints.length; i++) {
    const [start, end] = breakpoints[i];
    if (progress >= start && progress <= end) {
      const t = (progress - start) / (end - start);
      return values[i] + (values[i + 1] - values[i]) * t;
    }
  }
  return values[values.length - 1];
}

export default function SimulatorExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  /* ── Phase elements refs ── */
  const starsRef = useRef<HTMLDivElement>(null);
  const marsOrbitRef = useRef<HTMLDivElement>(null);
  const plasmaRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const retroRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const chuteRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const hudDataRef = useRef<HTMLDivElement>(null);
  const phaseTextRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current!;
    const viewport = viewportRef.current!;

    /* Master timeline pinned for 600vh of scroll */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=600%',
        pin: true,
        scrub: 1.5,
        anticipatePin: 1
      }
    });

    /* === PHASE 1: ORBIT (0% – 15%) === */
    // Stars visible, Mars sphere below, instruments boot
    tl.fromTo(marsOrbitRef.current, { scale: 0.6, y: 200, opacity: 0 }, { scale: 1, y: 100, opacity: 1, duration: 5, ease: 'power2.out' }, 0);
    tl.fromTo(starsRef.current, { opacity: 0 }, { opacity: 1, duration: 3 }, 0);

    // Phase text: "MARS ORBIT ESTABLISHED"
    tl.fromTo(phaseTextRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 2);
    tl.to(phaseTextRef.current, { opacity: 0, duration: 2 }, 8);

    /* === PHASE 2: DEORBIT BURN (15% – 28%) === */
    // Mars grows, ship "descends"
    tl.to(marsOrbitRef.current, { scale: 2, y: -50, duration: 8, ease: 'power1.in' }, 10);

    // Engine glow at bottom
    tl.fromTo(retroRef.current, { opacity: 0 }, { opacity: 0.6, duration: 3 }, 10);
    tl.to(retroRef.current, { opacity: 0, duration: 2 }, 15);

    /* === PHASE 3: ATMOSPHERIC ENTRY (28% – 55%) === */
    // Hide Mars sphere, show plasma
    tl.to(marsOrbitRef.current, { opacity: 0, duration: 3 }, 18);
    tl.fromTo(plasmaRef.current, { opacity: 0 }, { opacity: 1, duration: 5 }, 18);

    // Plasma intensifies
    tl.to(plasmaRef.current, { scale: 1.2, duration: 10 }, 23);

    // Screen shake during entry
    tl.fromTo(shakeRef.current,
    { x: 0, y: 0 },
    { x: 3, y: -2, duration: 0.3, ease: 'power1.inOut', yoyo: true, repeat: 30 },
    20
    );

    // Plasma fades as we slow down
    tl.to(plasmaRef.current, { opacity: 0, scale: 1, duration: 5 }, 33);

    /* === PHASE 4: PARACHUTE (55% – 70%) === */
    // Stars fade, sky appears (butterscotch Mars sky)
    tl.to(starsRef.current, { opacity: 0.1, duration: 5 }, 33);

    // Chute deploys
    tl.fromTo(chuteRef.current, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 3, ease: 'elastic.out(1,0.5)' }, 35);

    // Terrain appears far below
    tl.fromTo(terrainRef.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 8 }, 35);

    // Slight swinging motion
    tl.fromTo(shakeRef.current,
    { rotation: 0 },
    { rotation: 1.5, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: 6 },
    36
    );

    // Chute detach
    tl.to(chuteRef.current, { opacity: 0, y: -200, duration: 3 }, 44);

    /* === PHASE 5: POWERED DESCENT (70% – 90%) === */
    // Retro rockets fire
    tl.fromTo(retroRef.current, { opacity: 0 }, { opacity: 0.8, duration: 2 }, 44);

    // Terrain gets closer rapidly
    tl.to(terrainRef.current, { scale: 3, y: -100, duration: 12 }, 44);

    // Dust cloud rises from ground
    tl.fromTo(dustRef.current, { opacity: 0, y: 50 }, { opacity: 0.7, y: 0, duration: 8 }, 48);

    // Retro fades as we touch down
    tl.to(retroRef.current, { opacity: 0, duration: 2 }, 55);

    /* === PHASE 6: TOUCHDOWN (90% – 100%) === */
    // Flash!
    tl.fromTo(flashRef.current, { opacity: 0 }, { opacity: 0.8, duration: 0.3, ease: 'power4.in' }, 56);
    tl.to(flashRef.current, { opacity: 0, duration: 1.5 }, 56.5);

    // Screen shake on impact
    tl.fromTo(shakeRef.current,
    { x: 0, y: 0 },
    { x: 5, y: -3, duration: 0.15, ease: 'power1.inOut', yoyo: true, repeat: 8 },
    56
    );

    // Dust settles
    tl.to(dustRef.current, { opacity: 0.3, y: 30, duration: 4 }, 57);

    // Success overlay appears
    tl.fromTo(successRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 3, ease: 'expo.out' }, 57);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '100vh' }}>
      {/* Viewport with shake wrapper */}
      <div ref={shakeRef} className="relative w-full h-screen overflow-hidden">
        <div ref={viewportRef} className="relative w-full h-full bg-black">

          {/* ── Stars ── */}
          <div ref={starsRef} className="absolute inset-0 opacity-0">
            {STARS.map((s, i) =>
            <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.s, height: s.s,
              opacity: s.o
            }} />

            )}
          </div>

          {/* ── Mars sphere (orbit view) ── */}
          <div ref={marsOrbitRef} className="absolute inset-0 flex items-center justify-center opacity-0">
            <div className="relative w-[60vmin] h-[60vmin] max-w-[500px] max-h-[500px]">
              {/* Planet */}
              <div className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #c4603a 0%, #8a3520 40%, #4a1a0e 75%, #1a0805 100%)',
                boxShadow: '0 0 80px rgba(255,69,0,0.15), inset -20px -20px 40px rgba(0,0,0,0.5)'
              }}>

                {/* Surface features */}
                <div className="absolute w-[30%] h-[20%] rounded-full top-[25%] left-[20%] opacity-20"
                style={{ background: 'radial-gradient(ellipse, #5a2a15, transparent)' }} />
                <div className="absolute w-[40%] h-[8%] top-[45%] left-[15%] opacity-15 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, #3a1a0a, transparent)' }} />
                <div className="absolute w-[15%] h-[15%] rounded-full top-[20%] left-[55%] opacity-25"
                style={{ background: 'radial-gradient(circle, #8a4a30, transparent)' }} />
                {/* Polar cap */}
                <div className="absolute w-[25%] h-[10%] top-[5%] left-[38%] opacity-20 rounded-full"
                style={{ background: 'radial-gradient(ellipse, #d4c4b8, transparent)' }} />
              </div>
              {/* Atmosphere halo */}
              <div className="absolute -inset-3 rounded-full"
              style={{ background: 'radial-gradient(circle, transparent 45%, rgba(255,69,0,0.04) 50%, transparent 55%)' }} />
            </div>
          </div>

          {/* ── Plasma effect (entry) ── */}
          <div ref={plasmaRef} className="absolute inset-0 opacity-0 pointer-events-none">
            {/* Edge plasma */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,100,0,0.4) 60%, rgba(255,50,0,0.8) 80%, rgba(200,30,0,0.9) 95%)'
            }} />
            {/* Central heat glow */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,200,100,0.15) 0%, transparent 40%)'
            }} />
            {/* Streaks */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(255,140,0,0.1) 3px, rgba(255,140,0,0.1) 4px)',
              animation: 'plasma-streaks 0.5s linear infinite'
            }} />
          </div>

          {/* ── Parachute ── */}
          <div ref={chuteRef} className="absolute top-0 left-1/2 -translate-x-1/2 opacity-0 origin-bottom" style={{ width: 120, zIndex: 15 }}>
            <svg viewBox="0 0 120 100" className="w-full">
              <path d="M10,60 Q30,5 60,5 Q90,5 110,60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <path d="M10,60 Q30,10 60,10 Q90,10 110,60 L60,95 Z" fill="rgba(255,100,0,0.15)" stroke="rgba(255,100,0,0.3)" strokeWidth="0.5" />
              {/* Cords */}
              <line x1="25" y1="45" x2="60" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="60" y1="10" x2="60" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="95" y1="45" x2="60" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* ── Terrain (descent view) ── */}
          <div ref={terrainRef} className="absolute bottom-0 left-0 right-0 opacity-0" style={{ height: '50%', zIndex: 10 }}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sim-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4603a" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4a2010" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill="url(#sim-sky)" />
              <path d={TERRAIN_FAR} fill="#3a1a0a" />
              <path d={TERRAIN_MID} fill="#2a1208" />
              <path d={TERRAIN_NEAR} fill="#1a0a05" />
            </svg>
          </div>

          {/* ── Retro rockets ── */}
          <div ref={retroRef} className="absolute bottom-0 left-0 right-0 h-[30%] opacity-0 pointer-events-none" style={{ zIndex: 12 }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-full" style={{
              background: 'linear-gradient(to top, rgba(255,100,0,0.6), rgba(255,200,50,0.2) 30%, transparent)',
              filter: 'blur(10px)'
            }} />
            {/* Side jets */}
            <div className="absolute bottom-0 left-[30%] w-[10%] h-[60%]" style={{
              background: 'linear-gradient(to top, rgba(255,80,0,0.3), transparent)',
              filter: 'blur(6px)'
            }} />
            <div className="absolute bottom-0 right-[30%] w-[10%] h-[60%]" style={{
              background: 'linear-gradient(to top, rgba(255,80,0,0.3), transparent)',
              filter: 'blur(6px)'
            }} />
          </div>

          {/* ── Dust cloud ── */}
          <div ref={dustRef} className="absolute bottom-0 left-0 right-0 h-[40%] opacity-0 pointer-events-none" style={{ zIndex: 11 }}>
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(180,120,60,0.5), rgba(120,80,40,0.2) 50%, transparent)',
              filter: 'blur(20px)'
            }} />
          </div>

          {/* ── Flash (touchdown) ── */}
          <div ref={flashRef} className="absolute inset-0 bg-white opacity-0 pointer-events-none" style={{ zIndex: 30 }} />

          {/* ── Crosshair overlay ── */}
          <Crosshair />

          {/* ── Phase text overlay ── */}
          <div ref={phaseTextRef} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0" style={{ zIndex: 25 }}>
            <div className="text-center">
              <div className="text-[10px] sm:text-xs font-display tracking-[0.3em] text-primary/50 mb-2">ORBIT ESTABLISHED</div>
              <div className="text-2xl sm:text-4xl font-display font-bold text-white/80">MARS BELOW</div>
              <div className="text-[9px] font-display tracking-[0.2em] text-white/50 mt-3">SCROLL TO INITIATE DESCENT</div>
            </div>
          </div>

          {/* ── Success overlay ── */}
          <div ref={successRef} className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0" style={{ zIndex: 25 }}>
            <div className="text-center">
              <motion.div
                className="inline-block px-4 py-1.5 rounded-full bg-green-400/10 border border-green-400/20 text-[10px] sm:text-xs font-display tracking-[0.25em] text-green-400/80 mb-4">

                CONTACT LIGHT
              </motion.div>
              <div className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-3" style={{ textShadow: '0 0 40px rgba(255,69,0,0.3)' }}>
                TOUCHDOWN
              </div>
              <div className="text-base sm:text-lg font-display text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-bold mb-4">
                JEZERO CRATER · SOL 1
              </div>
              <div className="text-[10px] sm:text-xs text-white/50 font-display tracking-wider">
                18.38°N · 77.58°E · ALTITUDE: 0.00 M
              </div>
              <div className="mt-6 text-[9px] font-display tracking-[0.2em] text-white/50 animate-pulse">
                WELCOME TO MARS
              </div>
            </div>
          </div>

          {/* ── Scanlines ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)',
            zIndex: 22
          }} />

          {/* ── Vignette ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)',
            zIndex: 21
          }} />

        </div>
      </div>

      {/* Plasma CSS animation */}
      <style>{`
        @keyframes plasma-streaks {
          from { transform: translateY(0); }
          to { transform: translateY(4px); }
        }
      `}</style>
    </div>);

}