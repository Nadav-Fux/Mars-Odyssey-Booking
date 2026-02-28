import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { ScanEye, Crosshair } from 'lucide-react';
import RevealText from '@/components/RevealText';

/* ================================================================
   WINDOW TO MARS  —  Interactive Porthole Lens

   A circular spaceship-porthole frame.  On hover the interior
   swaps from a dim, hazy view to a vivid, detailed Mars
   landscape rendered on a <canvas>, with:

     • Parallax movement that tracks the mouse cursor
     • Multi-layer terrain (sky → mountains → dunes → foreground)
     • Floating dust particles
     • Atmospheric rim glow
     • HUD overlay data readout
   ================================================================ */

// ── Constants ──
const SIZE = 480; // canvas resolution
const HALF = SIZE / 2;
const PARALLAX_RANGE = 25; // px max shift per layer

// ── Colour palette ──
const C = {
  sky1: '#1a0a04',
  sky2: '#3d1508',
  sky3: '#7a2e12',
  sun: '#ff8c42',
  mtn1: '#2a0f06',
  mtn2: '#3b1a0a',
  dune1: '#6b3018',
  dune2: '#8b4422',
  dune3: '#a35530',
  fg: '#4a2010',
  dust: '#ffb888',
  atmo: '#ff6b35'
};

// ── Dust particle ──
interface Mote {
  x: number;y: number;r: number;vx: number;vy: number;o: number;
}

// ── Draw the full Mars landscape into a canvas context ──
function drawMars(
ctx: CanvasRenderingContext2D,
w: number,
h: number,
ox: number, // parallax offset x (-1 … 1)
oy: number, // parallax offset y (-1 … 1)
intensity: number, // 0 = dim, 1 = vivid
motes: Mote[])
{
  const cx = w / 2;
  const cy = h / 2;

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // --- Background circle clip (not needed if canvas is circular via CSS) ---
  ctx.beginPath();
  ctx.arc(cx, cy, cx, 0, Math.PI * 2);
  ctx.clip();

  // ── Layer 0: Sky gradient (deepest, least parallax) ──
  const px0 = ox * PARALLAX_RANGE * 0.15;
  const py0 = oy * PARALLAX_RANGE * 0.15;
  const skyG = ctx.createLinearGradient(cx + px0, 0 + py0, cx + px0, h + py0);
  skyG.addColorStop(0, C.sky1);
  skyG.addColorStop(0.35, C.sky2);
  skyG.addColorStop(0.6, C.sky3);
  skyG.addColorStop(1, C.dune1);
  ctx.fillStyle = skyG;
  ctx.fillRect(0, 0, w, h);

  // ── Sun / haze glow ──
  const sunX = cx * 0.7 + px0 * 3;
  const sunY = cy * 0.38 + py0 * 2;
  const sunR = 60 + intensity * 30;
  const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  sunG.addColorStop(0, `rgba(255,140,66,${0.25 + intensity * 0.45})`);
  sunG.addColorStop(0.5, `rgba(255,100,30,${0.08 + intensity * 0.12})`);
  sunG.addColorStop(1, 'rgba(255,100,30,0)');
  ctx.fillStyle = sunG;
  ctx.fillRect(0, 0, w, h);

  // ── Layer 1: Distant mountains ──
  const px1 = ox * PARALLAX_RANGE * 0.35;
  const py1 = oy * PARALLAX_RANGE * 0.25;
  ctx.save();
  ctx.translate(px1, py1);
  ctx.beginPath();
  ctx.moveTo(-20, h * 0.62);
  ctx.lineTo(w * 0.08, h * 0.42);
  ctx.lineTo(w * 0.18, h * 0.48);
  ctx.lineTo(w * 0.30, h * 0.35);
  ctx.lineTo(w * 0.42, h * 0.44);
  ctx.lineTo(w * 0.52, h * 0.38);
  ctx.lineTo(w * 0.65, h * 0.43);
  ctx.lineTo(w * 0.78, h * 0.33);
  ctx.lineTo(w * 0.88, h * 0.40);
  ctx.lineTo(w * 1.02, h * 0.37);
  ctx.lineTo(w + 20, h * 0.62);
  ctx.closePath();
  ctx.fillStyle = C.mtn1;
  ctx.globalAlpha = 0.7 + intensity * 0.3;
  ctx.fill();
  ctx.restore();

  // ── Layer 2: Mid mountains ──
  const px2 = ox * PARALLAX_RANGE * 0.55;
  const py2 = oy * PARALLAX_RANGE * 0.4;
  ctx.save();
  ctx.translate(px2, py2);
  ctx.beginPath();
  ctx.moveTo(-20, h * 0.72);
  ctx.lineTo(w * 0.05, h * 0.54);
  ctx.lineTo(w * 0.15, h * 0.60);
  ctx.lineTo(w * 0.28, h * 0.50);
  ctx.lineTo(w * 0.40, h * 0.58);
  ctx.lineTo(w * 0.50, h * 0.52);
  ctx.lineTo(w * 0.62, h * 0.56);
  ctx.lineTo(w * 0.75, h * 0.48);
  ctx.lineTo(w * 0.85, h * 0.55);
  ctx.lineTo(w * 0.95, h * 0.50);
  ctx.lineTo(w + 20, h * 0.72);
  ctx.closePath();
  ctx.fillStyle = C.mtn2;
  ctx.globalAlpha = 0.75 + intensity * 0.25;
  ctx.fill();
  ctx.restore();

  // ── Layer 3: Sand dunes ──
  const px3 = ox * PARALLAX_RANGE * 0.75;
  const py3 = oy * PARALLAX_RANGE * 0.55;
  ctx.save();
  ctx.translate(px3, py3);
  ctx.beginPath();
  ctx.moveTo(-20, h);
  ctx.lineTo(-20, h * 0.68);
  ctx.quadraticCurveTo(w * 0.12, h * 0.60, w * 0.25, h * 0.65);
  ctx.quadraticCurveTo(w * 0.38, h * 0.70, w * 0.50, h * 0.63);
  ctx.quadraticCurveTo(w * 0.65, h * 0.56, w * 0.78, h * 0.62);
  ctx.quadraticCurveTo(w * 0.90, h * 0.68, w + 20, h * 0.60);
  ctx.lineTo(w + 20, h);
  ctx.closePath();
  const duneG = ctx.createLinearGradient(0, h * 0.55, 0, h);
  duneG.addColorStop(0, C.dune1);
  duneG.addColorStop(0.4, C.dune2);
  duneG.addColorStop(1, C.dune3);
  ctx.fillStyle = duneG;
  ctx.globalAlpha = 0.8 + intensity * 0.2;
  ctx.fill();
  ctx.restore();

  // ── Layer 4: Foreground rocks ──
  const px4 = ox * PARALLAX_RANGE;
  const py4 = oy * PARALLAX_RANGE * 0.7;
  ctx.save();
  ctx.translate(px4, py4);
  ctx.globalAlpha = 0.6 + intensity * 0.4;
  // Rock cluster left
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.92);
  ctx.lineTo(w * 0.08, h * 0.78);
  ctx.lineTo(w * 0.14, h * 0.80);
  ctx.lineTo(w * 0.18, h * 0.75);
  ctx.lineTo(w * 0.24, h * 0.82);
  ctx.lineTo(w * 0.28, h * 0.92);
  ctx.closePath();
  ctx.fillStyle = C.fg;
  ctx.fill();
  // Rock cluster right
  ctx.beginPath();
  ctx.moveTo(w * 0.72, h * 0.95);
  ctx.lineTo(w * 0.76, h * 0.80);
  ctx.lineTo(w * 0.82, h * 0.83);
  ctx.lineTo(w * 0.88, h * 0.77);
  ctx.lineTo(w * 0.94, h * 0.84);
  ctx.lineTo(w * 0.98, h * 0.95);
  ctx.closePath();
  ctx.fill();
  // Small scattered rocks
  [[0.35, 0.88, 4], [0.45, 0.91, 3], [0.55, 0.87, 5], [0.65, 0.93, 3]].forEach(([rx, ry, rr]) => {
    ctx.beginPath();
    ctx.arc(w * rx, h * ry, rr as number, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // ── Dust motes ──
  ctx.save();
  for (const m of motes) {
    m.x += m.vx;
    m.y += m.vy;
    if (m.x < -10) m.x = w + 10;
    if (m.x > w + 10) m.x = -10;
    if (m.y < -10) m.y = h + 10;
    if (m.y > h + 10) m.y = -10;
    ctx.beginPath();
    ctx.arc(m.x + px3 * 0.5, m.y + py3 * 0.3, m.r, 0, Math.PI * 2);
    ctx.fillStyle = C.dust;
    ctx.globalAlpha = m.o * intensity;
    ctx.fill();
  }
  ctx.restore();

  // ── Atmospheric haze gradient at bottom ──
  const hazeG = ctx.createLinearGradient(0, h * 0.85, 0, h);
  hazeG.addColorStop(0, 'rgba(30,12,6,0)');
  hazeG.addColorStop(1, `rgba(30,12,6,${0.3 + intensity * 0.2})`);
  ctx.fillStyle = hazeG;
  ctx.globalAlpha = 1;
  ctx.fillRect(0, 0, w, h);

  // ── Vignette ──
  const vigG = ctx.createRadialGradient(cx, cy, cx * 0.5, cx, cy, cx);
  vigG.addColorStop(0, 'rgba(0,0,0,0)');
  vigG.addColorStop(0.7, 'rgba(0,0,0,0)');
  vigG.addColorStop(1, `rgba(0,0,0,${0.5 + (1 - intensity) * 0.35})`);
  ctx.fillStyle = vigG;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

// ── Generate initial dust motes ──
function createMotes(count: number, w: number, h: number): Mote[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.5 + Math.random() * 1.8,
    vx: 0.15 + Math.random() * 0.4,
    vy: -0.05 + Math.random() * 0.1,
    o: 0.15 + Math.random() * 0.35
  }));
}

// ── Porthole frame SVG ring ──
function PortholeFrame({ hovered }: {hovered: boolean;}) {
  return (
    <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full z-10 pointer-events-none" fill="none">
      <defs>
        <radialGradient id="wtm-rim" cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor="transparent" />
          <stop offset="92%" stopColor="rgba(255,69,0,0.06)" />
          <stop offset="100%" stopColor="rgba(255,69,0,0.02)" />
        </radialGradient>
        <filter id="wtm-glow"><feGaussianBlur stdDeviation="4" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Outer chrome ring */}
      <circle cx="250" cy="250" r="235" stroke="#FF4500" strokeWidth="2" strokeOpacity="0.25" />
      <circle cx="250" cy="250" r="240" stroke="white" strokeWidth="0.5" strokeOpacity="0.05" />

      {/* Thick frame ring */}
      <circle cx="250" cy="250" r="230" stroke="#3a1a0c" strokeWidth="14" strokeOpacity="0.6" />
      <circle cx="250" cy="250" r="230" stroke="#FF4500" strokeWidth="0.8" strokeOpacity="0.15" />

      {/* Inner bevel */}
      <circle cx="250" cy="250" r="222" stroke="white" strokeWidth="0.5" strokeOpacity="0.04" />
      <circle cx="250" cy="250" r="224" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.1" />

      {/* Bolts around the frame */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = i / 16 * Math.PI * 2 - Math.PI / 2;
        const r = 230;
        const bx = 250 + Math.cos(a) * r;
        const by = 250 + Math.sin(a) * r;
        return (
          <g key={i}>
            <circle cx={bx} cy={by} r="4" fill="#1a0a05" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.2" />
            <circle cx={bx} cy={by} r="1.5" fill="#FF4500" fillOpacity="0.15" />
          </g>);

      })}

      {/* Rim light on hover */}
      <circle
      cx="250" cy="250" r="223"
      stroke="#FF4500" strokeWidth="2"
      strokeOpacity={hovered ? 0.35 : 0}
      filter="url(#wtm-glow)"
      style={{ transition: 'stroke-opacity 0.6s ease' }} />


      {/* Inner radial fill */}
      <circle cx="250" cy="250" r="222" fill="url(#wtm-rim)" />

      {/* Section markers (N/S/E/W) */}
      {[0, 90, 180, 270].map((deg) => {
        const a = (deg - 90) * Math.PI / 180;
        const r1 = 236;
        const r2 = 244;
        return (
          <line
          key={deg}
          x1={250 + Math.cos(a) * r1} y1={250 + Math.sin(a) * r1}
          x2={250 + Math.cos(a) * r2} y2={250 + Math.sin(a) * r2}
          stroke="#FF4500" strokeWidth="1.5" strokeOpacity="0.2" />);


      })}

      {/* Mini ticks */}
      {Array.from({ length: 36 }, (_, i) => {
        if (i % 9 === 0) return null;
        const a = i / 36 * Math.PI * 2 - Math.PI / 2;
        const r1 = 238;
        const r2 = 242;
        return (
          <line
          key={`t-${i}`}
          x1={250 + Math.cos(a) * r1} y1={250 + Math.sin(a) * r1}
          x2={250 + Math.cos(a) * r2} y2={250 + Math.sin(a) * r2}
          stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.1" />);


      })}
    </svg>);

}

// ── HUD overlay shown on hover ──
function LensHUD() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Top-left readout */}
      <div className="absolute top-[18%] left-[15%]">
        <div className="text-[7px] font-display tracking-[0.15em] text-primary/40">VIEWPORT</div>
        <div className="text-[9px] font-display tracking-[0.1em] text-white/40 font-bold">OLYMPUS MONS</div>
      </div>
      {/* Top-right coordinates */}
      <div className="absolute top-[18%] right-[15%] text-right">
        <div className="text-[7px] font-display tracking-[0.1em] text-primary/30">18.65°N 226.2°E</div>
        <div className="text-[7px] font-display tracking-[0.1em] text-primary/30">ALT 21,229m</div>
      </div>
      {/* Bottom data */}
      <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 flex gap-6">
        {[
        { label: 'TEMP', value: '-63°C' },
        { label: 'WIND', value: '12 m/s' },
        { label: 'VIS', value: '8.4 km' }].
        map((d) =>
        <div key={d.label} className="text-center">
            <div className="text-[6px] font-display tracking-[0.15em] text-white/50">{d.label}</div>
            <div className="text-[9px] font-display text-primary/50 font-bold tabular-nums">{d.value}</div>
          </div>
        )}
      </div>
      {/* Center crosshair */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <line x1="46" y1="50" x2="40" y2="50" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <line x1="54" y1="50" x2="60" y2="50" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <line x1="50" y1="46" x2="50" y2="40" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <line x1="50" y1="54" x2="50" y2="60" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <circle cx="50" cy="50" r="5" stroke="#FF4500" strokeWidth="0.2" strokeOpacity="0.1" fill="none" />
      </svg>
    </div>);

}

// ── Main component ──
function WindowToMars() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const motesRef = useRef<Mote[]>(createMotes(35, SIZE, SIZE));
  const mouseRef = useRef({ x: 0, y: 0 });
  const intensityRef = useRef(0.15);
  const targetIntensity = useRef(0.15);
  const [hovered, setHovered] = useState(false);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const loop = () => {
      if (!running) return;
      // Ease intensity
      intensityRef.current += (targetIntensity.current - intensityRef.current) * 0.06;
      drawMars(
        ctx, SIZE, SIZE,
        mouseRef.current.x, mouseRef.current.y,
        intensityRef.current,
        motesRef.current
      );
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {running = false;cancelAnimationFrame(frameRef.current);};
  }, []);

  // Hover state drives intensity
  useEffect(() => {
    targetIntensity.current = hovered ? 1 : 0.15;
  }, [hovered]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1…1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseRef.current.x = nx;
    mouseRef.current.y = ny;
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    // Ease mouse back to center
    const ease = () => {
      mouseRef.current.x *= 0.9;
      mouseRef.current.y *= 0.9;
      if (Math.abs(mouseRef.current.x) > 0.01) requestAnimationFrame(ease);else
      {mouseRef.current.x = 0;mouseRef.current.y = 0;}
    };
    requestAnimationFrame(ease);
  }, []);

  // Section entry animation
  useGSAP(() => {
    gsap.from('.wtm-head', {
      y: 40, opacity: 0, stagger: 0.1, duration: 0.8,
      scrollTrigger: { trigger: '.wtm-header', start: 'top 85%', once: true }
    });
    gsap.from('.wtm-porthole', {
      scale: 0.85, opacity: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: '.wtm-porthole', start: 'top 85%', once: true }
    });
  }, { scope: sectionRef });

  return (
    <section id="viewport" ref={sectionRef} className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="wtm-header mb-10 sm:mb-14 text-center">
          <span className="wtm-head inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/[0.04] mb-4">
            <ScanEye className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] text-primary/70">OBSERVATION DECK</span>
          </span>

          <h2 className="wtm-head font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            WINDOW TO{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">MARS</span>
          </h2>

          <RevealText
            text="Hover over the porthole to engage the observation lens. Move your cursor to pan across the Martian terrain."
            className="wtm-head text-white/30 text-sm sm:text-base max-w-lg mx-auto leading-relaxed" />

        </div>

        {/* Porthole */}
        <div className="flex justify-center">
          <div
          className="wtm-porthole relative cursor-crosshair"
          style={{ width: 'min(80vw, 420px)', aspectRatio: '1' }}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}>

            {/* Canvas scene (clipped to circle) */}
            <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="absolute inset-0 w-full h-full rounded-full"
            style={{ clipPath: 'circle(44.5% at 50% 50%)' }} />


            {/* Atmospheric rim glow on hover */}
            <div
            className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-700"
            style={{
              opacity: hovered ? 1 : 0,
              boxShadow: `inset 0 0 60px 10px rgba(255,107,53,0.12), 0 0 80px 20px rgba(255,69,0,0.06)`
            }} />


            {/* HUD overlay on hover */}
            <AnimatePresence>
              {hovered &&
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EXPO_OUT }}
                className="absolute inset-0"
                style={{ clipPath: 'circle(44.5% at 50% 50%)' }}>

                  <LensHUD />
                </motion.div>
              }
            </AnimatePresence>

            {/* Porthole frame ring (SVG) */}
            <PortholeFrame hovered={hovered} />

            {/* Status badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(8,8,18,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${hovered ? 'bg-green-500' : 'bg-white/30'}`} />
              <span className={`text-[8px] font-display tracking-[0.15em] transition-colors duration-500 ${hovered ? 'text-green-400/60' : 'text-white/50'}`}>
                {hovered ? 'LENS ACTIVE' : 'HOVER TO OBSERVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Instruction + data */}
        <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
          {[
          { label: 'REGION', value: 'THARSIS PLATEAU' },
          { label: 'ELEVATION', value: '21,229m' },
          { label: 'ATMOSPHERE', value: '0.636 kPa' }].
          map((d) =>
          <div key={d.label} className="text-center">
              <div className="text-[7px] font-display tracking-[0.18em] text-white/50">{d.label}</div>
              <div className="text-[10px] font-display text-white/30 font-semibold">{d.value}</div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

export default memo(WindowToMars);