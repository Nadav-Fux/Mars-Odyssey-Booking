import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import BlueprintDetailOverlay from '@/components/BlueprintDetailOverlay';

/* ================================================================
   SPACECRAFT BLUEPRINT — ARES-7 INTERPLANETARY CRUISER

   A fully-detailed technical blueprint SVG with phased GSAP
   draw-in animation grouped by ship subsystem.

   Animation sequence on scroll:
     Phase 0  → scan-line sweep across canvas
     Phase 1  → center-spine + construction grid
     Phase 2  → main hull contour
     Phase 3  → cockpit / command module
     Phase 4  → engine nacelles + nozzles + exhaust cones
     Phase 5  → dorsal / ventral fins + structural ribs
     Phase 6  → habitat ring + life-support
     Phase 7  → cargo bays + docking ports
     Phase 8  → solar arrays + radiator panels + antenna
     Phase 9  → RCS thrusters + maneuvering jets
     Phase 10 → dimension lines + measurement annotations
     Phase 11 → area fills fade in
     Phase 12 → labels + callout lines pop
     Phase 13 → status dots pulse on

   Interactive:
     • Hovering a subsystem region highlights its paths
     • Status lights illuminate green as each phase completes
   ================================================================ */

// ── Subsystem phase tags (className prefixes) ──
const PHASES = [
'ph-grid', // 0
'ph-spine', // 1
'ph-hull', // 2
'ph-cockpit', // 3
'ph-engine', // 4
'ph-wing', // 5
'ph-habitat', // 6
'ph-cargo', // 7
'ph-solar', // 8
'ph-rcs', // 9
'ph-dim' // 10
] as const;

const PHASE_LABELS = [
'GRID',
'SPINE',
'HULL',
'COMMAND',
'PROPULSION',
'FINS',
'HABITAT',
'CARGO',
'POWER',
'RCS',
'DIMS'];


const PHASE_COLORS = [
'#ffffff',
'#FF4500',
'#FF4500',
'#4ab8c4',
'#ff6b35',
'#FF4500',
'#a855f7',
'#6b8aed',
'#eab308',
'#22d3ee',
'#FF4500'];


// ── Helpers ──
function prepareStroke(el: SVGGeometryElement) {
  const len = el.getTotalLength();
  el.style.strokeDasharray = `${len}`;
  el.style.strokeDashoffset = `${len}`;
  el.style.willChange = 'stroke-dashoffset';
}

// ── Section hover zones (SVG viewBox coords) ──
interface HoverZone {
  id: string;
  label: string;
  x: number;y: number;w: number;h: number;
  phase: number;
}

const ZONES: HoverZone[] = [
{ id: 'cockpit', label: 'COMMAND MODULE', x: 700, y: 200, w: 150, h: 100, phase: 3 },
{ id: 'engines', label: 'NTP ENGINES', x: 60, y: 195, w: 130, h: 110, phase: 4 },
{ id: 'wings', label: 'STABILIZER FINS', x: 340, y: 90, w: 140, h: 320, phase: 5 },
{ id: 'habitat', label: 'HABITAT RING', x: 430, y: 195, w: 140, h: 110, phase: 6 },
{ id: 'cargo', label: 'CARGO BAY', x: 310, y: 195, w: 90, h: 110, phase: 7 },
{ id: 'solar', label: 'SOLAR / POWER', x: 540, y: 155, w: 100, h: 190, phase: 8 },
{ id: 'rcs', label: 'RCS THRUSTERS', x: 620, y: 175, w: 80, h: 150, phase: 9 },
{ id: 'dim', label: 'DIMENSION LINES', x: 82, y: 415, w: 840, h: 10, phase: 10 }];

// ── Diagnostics sequence config ──
const DIAG_SEQUENCE = [
{ system: 'PROPULSION', zone: 'engines', duration: 0.6 },
{ system: 'HULL INTEGRITY', zone: null, duration: 0.5 },
{ system: 'COMMAND MODULE', zone: 'cockpit', duration: 0.5 },
{ system: 'HABITAT RING', zone: 'habitat', duration: 0.7 },
{ system: 'CARGO BAY', zone: 'cargo', duration: 0.4 },
{ system: 'POWER SYSTEMS', zone: 'solar', duration: 0.5 },
{ system: 'RCS THRUSTERS', zone: 'rcs', duration: 0.4 },
{ system: 'STABILIZER FINS', zone: 'wings', duration: 0.5 },
{ system: 'NAV COMPUTER', zone: 'cockpit', duration: 0.6 },
{ system: 'COMMS ARRAY', zone: 'solar', duration: 0.4 }] as
const;


function SpacecraftBlueprint() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prepared = useRef(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [animStarted, setAnimStarted] = useState(false);

  // Mouse tracking state
  const [mousePos, setMousePos] = useState({ x: 500, y: 250 });
  const [isHovering, setIsHovering] = useState(false);

  // 3D tilt state (separate from mousePos for smooth lerping)
  const tiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const svgWrapRef = useRef<HTMLDivElement>(null);

  // Diagnostics state
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagStep, setDiagStep] = useState(-1);
  const [diagResults, setDiagResults] = useState<string[]>([]);
  const [diagComplete, setDiagComplete] = useState(false);
  const diagTimeline = useRef<gsap.core.Timeline | null>(null);

  // Prepare all drawable paths
  useEffect(() => {
    if (!svgRef.current || prepared.current) return;
    prepared.current = true;
    svgRef.current.querySelectorAll<SVGGeometryElement>('.draw').forEach(prepareStroke);
  }, []);

  // ── Master GSAP timeline ──
  useGSAP(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 78%',
        end: 'center center',
        toggleActions: 'play none none none'
      },
      onStart: () => setAnimStarted(true)
    });

    // Phase 0: Scan-line sweep
    const scanLine = svg.querySelector('.scan-line');
    if (scanLine) {
      tl.fromTo(scanLine,
      { attr: { x1: 50, x2: 50 } },
      { attr: { x1: 950, x2: 950 }, duration: 1.8, ease: 'expo.inOut' },
      0
      );
      tl.fromTo(scanLine,
      { opacity: 0 },
      { opacity: 1, duration: 0.2, ease: 'none' },
      0
      );
      tl.to(scanLine, { opacity: 0, duration: 0.3 }, 1.6);
    }

    // Draw each phase sequentially
    PHASES.forEach((phaseClass, idx) => {
      const paths = svg.querySelectorAll<SVGGeometryElement>(`.draw.${phaseClass}`);
      if (!paths.length) return;

      const offset = 0.3 + idx * 0.22;
      tl.to(paths, {
        strokeDashoffset: 0,
        duration: idx <= 1 ? 0.4 : 0.55,
        ease: 'expo.inOut',
        stagger: 0.035,
        onComplete: () => setCompletedPhases((prev) => new Set([...prev, idx]))
      }, offset);
    });

    // Phase 11: Area fills
    const fills = svg.querySelectorAll('.fill-reveal');
    if (fills.length) {
      tl.from(fills, { opacity: 0, duration: 0.6, stagger: 0.03 }, '-=0.6');
    }

    // Phase 12: Labels + callout connector lines
    const labels = svg.querySelectorAll('.label');
    const connectors = svg.querySelectorAll('.callout-line');
    if (connectors.length) {
      tl.from(connectors, { opacity: 0, scaleX: 0, transformOrigin: 'left center', duration: 0.3, stagger: 0.03 }, '-=0.3');
    }
    if (labels.length) {
      tl.from(labels, { opacity: 0, y: 4, duration: 0.3, stagger: 0.025 }, '-=0.2');
    }

    // Phase 13: Callout dots
    const dots = svg.querySelectorAll('.dot-pulse');
    if (dots.length) {
      tl.from(dots, { scale: 0, opacity: 0, duration: 0.25, stagger: 0.03, transformOrigin: 'center' }, '-=0.2');
    }

    // Cleanup GPU layers
    tl.eventCallback('onComplete', () => {
      svg.querySelectorAll<SVGGeometryElement>('.draw').forEach((p) => {
        p.style.willChange = 'auto';
      });
    });

  }, { scope: containerRef });

  const handleZoneEnter = useCallback((id: string) => setActiveZone(id), []);
  const handleZoneLeave = useCallback(() => setActiveZone(null), []);
  const handleZoneClick = useCallback((id: string) => setSelectedZone(id), []);
  const handleCloseDetail = useCallback(() => setSelectedZone(null), []);

  // ── Run Diagnostics sequence ──
  const runDiagnostics = useCallback(() => {
    if (diagRunning) return;
    const svg = svgRef.current;
    if (!svg) return;

    setDiagRunning(true);
    setDiagStep(-1);
    setDiagResults([]);
    setDiagComplete(false);

    // Kill previous timeline if any
    if (diagTimeline.current) diagTimeline.current.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        setDiagComplete(true);
        setTimeout(() => setDiagRunning(false), 3000);
      }
    });
    diagTimeline.current = tl;

    // Initial scan beam sweep
    const scanLine = svg.querySelector('.scan-line');
    if (scanLine) {
      tl.fromTo(scanLine, { attr: { x1: 50, x2: 50 }, opacity: 0 }, { attr: { x1: 950, x2: 950 }, opacity: 1, duration: 1.2, ease: 'power2.inOut' });
      tl.to(scanLine, { opacity: 0, duration: 0.3 });
    }

    // Run through each system check
    DIAG_SEQUENCE.forEach((step, i) => {
      tl.call(() => {
        setDiagStep(i);
        // Flash the zone
        if (step.zone) {
          const zone = ZONES.find((z) => z.id === step.zone);
          if (zone) {
            const zoneEls = svg.querySelectorAll(`.draw.${PHASES[zone.phase]}`);
            gsap.to(zoneEls, {
              stroke: PHASE_COLORS[zone.phase],
              strokeOpacity: 1,
              duration: 0.15,
              yoyo: true,
              repeat: 3,
              ease: 'power2.inOut'
            });
          }
        }
      });
      tl.to({}, { duration: step.duration });
      tl.call(() => {
        setDiagResults((prev) => [...prev, step.system]);
      });
    });

    // Final engine fire burst
    tl.call(() => setDiagStep(DIAG_SEQUENCE.length));
    const engineParts = svg.querySelectorAll('.draw.ph-engine');
    tl.to(engineParts, {
      strokeOpacity: 1,
      duration: 0.3,
      stagger: 0.02,
      ease: 'power2.out'
    });
    tl.to(engineParts, {
      strokeOpacity: 0.6,
      duration: 1.5,
      stagger: 0.02,
      ease: 'power2.inOut'
    });
  }, [diagRunning]);

  // ── Mouse tracking + 3D tilt ──
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // For spotlight
    const x = (e.clientX - rect.left) / rect.width * 1000;
    const y = (e.clientY - rect.top) / rect.height * 500;
    setMousePos({ x, y });
    // For 3D tilt (-1 to 1 normalized)
    tiltRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
    };
    // Also update spotlight pos
    const svgRect = svg.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - svgRect.left) / svgRect.width * 1000,
      y: (e.clientY - svgRect.top) / svgRect.height * 500
    });
    setIsHovering(true);
  }, []);

  // Touch support for 3D tilt
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const wrap = svgWrapRef.current;
    if (!wrap || !e.touches[0]) return;
    const rect = wrap.getBoundingClientRect();
    const touch = e.touches[0];
    tiltRef.current = {
      x: ((touch.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((touch.clientY - rect.top) / rect.height - 0.5) * 2
    };
    // Also update spotlight pos
    const svg = svgRef.current;
    if (svg) {
      const svgRect = svg.getBoundingClientRect();
      setMousePos({
        x: (touch.clientX - svgRect.left) / svgRect.width * 1000,
        y: (touch.clientY - svgRect.top) / svgRect.height * 500
      });
      setIsHovering(true);
    }
  }, []);

  // Smooth animation loop for 3D tilt
  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    const maxAngle = 8; // max degrees of rotation
    const lerp = 0.08; // smoothing factor

    const animate = () => {
      const targetX = isHovering ? tiltRef.current.y * -maxAngle : 0;
      const targetY = isHovering ? tiltRef.current.x * maxAngle : 0;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      if (svgWrapRef.current) {
        svgWrapRef.current.style.transform =
        `perspective(1200px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHovering]);

  // ── Diagnostics control panel ──
  return (
    <div ref={containerRef} className="relative w-full">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage: `
            linear-gradient(rgba(255,69,0,0.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,69,0,0.35) 1px, transparent 1px)
          `,
        backgroundSize: '40px 40px'
      }} />


      {/* Status indicator bar */}
      <div className="flex items-center gap-1.5 mb-3 px-1 flex-wrap">
        {PHASE_LABELS.map((label, i) => {
          const done = completedPhases.has(i);
          return (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: done ? PHASE_COLORS[i] : 'rgba(255,255,255,0.08)',
                boxShadow: done ? `0 0 6px ${PHASE_COLORS[i]}50` : 'none'
              }} />

              <span className="text-[7px] font-display tracking-[0.12em] transition-colors duration-500"
              style={{ color: done ? `${PHASE_COLORS[i]}90` : 'rgba(255,255,255,0.1)' }}>

                {label}
              </span>
              {i < PHASE_LABELS.length - 1 &&
              <span className="text-white/[0.06] text-[7px] mx-0.5">•</span>
              }
            </div>);

        })}
      </div>

      {/* 3D tilt wrapper */}
      <div
      ref={svgWrapRef}
      className="relative will-change-transform"
      style={{ transformStyle: 'preserve-3d', transition: 'none' }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {setIsHovering(false);tiltRef.current = { x: 0, y: 0 };}}
      onTouchStart={() => setIsHovering(true)}>

      {/* Main SVG */}
      <svg ref={svgRef}
        viewBox="0 0 1000 500"
        className="w-full h-auto relative"
        fill="none"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {setIsHovering(false);tiltRef.current = { x: 0, y: 0 };}}
        style={{ filter: activeZone ? 'none' : undefined }}>

        <defs>
          {/* Gradients */}
          <linearGradient id="bp-hull" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF4500" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#FF4500" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="bp-cockpit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ab8c4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4ab8c4" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="bp-engine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="bp-habitat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="bp-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4ab8c4" stopOpacity="0" />
            <stop offset="40%" stopColor="#4ab8c4" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#4ab8c4" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#4ab8c4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ab8c4" stopOpacity="0" />
          </linearGradient>

          {/* Cursor spotlight gradient */}
          <radialGradient id="bp-cursor-spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ab8c4" stopOpacity="0.08" />
            <stop offset="40%" stopColor="#4ab8c4" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#4ab8c4" stopOpacity="0" />
          </radialGradient>

          {/* Engine exhaust gradient */}
          <linearGradient id="bp-exhaust" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.5" />
            <stop offset="30%" stopColor="#FF4500" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#ff3300" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ff3300" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="bp-glow">
            <feGaussianBlur stdDeviation="2.5" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="bp-glow-sm">
            <feGaussianBlur stdDeviation="1.5" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="bp-exhaust-blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* ═══ SCAN LINE ═══ */}
        <line className="scan-line"
          x1="50" y1="20" x2="50" y2="480"
          stroke="url(#bp-scan)" strokeWidth="2" opacity="0" />


        {/* ═══ PHASE 0 — CONSTRUCTION GRID ═══ */}
        {/* Cross-hairs at center */}
        <line className="draw ph-grid" x1="480" y1="230" x2="520" y2="230" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.15" />
        <line className="draw ph-grid" x1="500" y1="210" x2="500" y2="270" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.15" />
        <circle className="draw ph-grid" cx="500" cy="250" r="12" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.1" />
        <circle className="draw ph-grid" cx="500" cy="250" r="25" stroke="#FF4500" strokeWidth="0.25" strokeOpacity="0.06" />
        {/* Origin markers */}
        {[200, 350, 500, 650, 800].map((x) =>
          <line key={`vg-${x}`} className="draw ph-grid" x1={x} y1="245" x2={x} y2="255" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.08" />
          )}
        {[170, 210, 250, 290, 330].map((y) =>
          <line key={`hg-${y}`} className="draw ph-grid" x1="495" y1={y} x2="505" y2={y} stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.08" />
          )}

        {/* ═══ PHASE 1 — CENTER SPINE ═══ */}
        <line className="draw ph-spine" x1="80" y1="250" x2="860" y2="250" stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.2" strokeDasharray="6 4" />
        {/* Waterline reference */}
        <line className="draw ph-spine" x1="130" y1="250" x2="830" y2="250" stroke="#FF4500" strokeWidth="0.15" strokeOpacity="0.35" />

        {/* ═══ PHASE 2 — MAIN HULL ═══ */}
        {/* Outer hull contour */}
        <path className="draw ph-hull"
          d="M180 210 L350 195 L680 195 Q780 205 810 250 Q780 295 680 305 L350 305 L180 290 Q140 250 180 210Z"
          stroke="#FF4500" strokeWidth="1.2" strokeOpacity="0.65" />

        {/* Inner hull double-wall */}
        <path className="draw ph-hull"
          d="M190 216 L352 201 L678 201 Q772 210 800 250 Q772 290 678 299 L352 299 L190 284 Q155 250 190 216Z"
          stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.2" />

        {/* Hull fill */}
        <path className="fill-reveal"
          d="M180 210 L350 195 L680 195 Q780 205 810 250 Q780 295 680 305 L350 305 L180 290 Q140 250 180 210Z"
          fill="url(#bp-hull)" />

        {/* Hull frame ribs */}
        {[275, 350, 425, 500, 575, 640].map((x) =>
          <line key={`rib-${x}`} className="draw ph-hull" x1={x} y1="197" x2={x} y2="303" stroke="#FF4500" strokeWidth="0.35" strokeOpacity="0.12" />
          )}
        {/* Keel reinforcement */}
        <path className="draw ph-hull" d="M200 245 L790 245" stroke="#FF4500" strokeWidth="0.2" strokeOpacity="0.1" />
        <path className="draw ph-hull" d="M200 255 L790 255" stroke="#FF4500" strokeWidth="0.2" strokeOpacity="0.1" />

        {/* ═══ PHASE 3 — COCKPIT / COMMAND ═══ */}
        {/* Command module shell */}
        <path className="draw ph-cockpit"
          d="M720 215 Q800 225 840 250 Q800 275 720 285"
          stroke="#4ab8c4" strokeWidth="1.1" strokeOpacity="0.75" />

        {/* Cockpit fill */}
        <path className="fill-reveal"
          d="M720 215 Q800 225 840 250 Q800 275 720 285 L720 215Z"
          fill="url(#bp-cockpit)" />

        {/* Windshield layers */}
        <path className="draw ph-cockpit"
          d="M750 226 Q800 236 818 250 Q800 264 750 274"
          stroke="#4ab8c4" strokeWidth="0.8" strokeOpacity="0.5" />
        <path className="draw ph-cockpit"
          d="M768 234 Q796 242 808 250 Q796 258 768 266"
          stroke="#4ab8c4" strokeWidth="0.5" strokeOpacity="0.35" />
        <path className="draw ph-cockpit"
          d="M782 240 Q793 246 798 250 Q793 254 782 260"
          stroke="#4ab8c4" strokeWidth="0.4" strokeOpacity="0.2" />
        {/* Sensor dome */}
        <circle className="draw ph-cockpit" cx="830" cy="250" r="5" stroke="#4ab8c4" strokeWidth="0.5" strokeOpacity="0.4" />
        <circle className="draw ph-cockpit" cx="830" cy="250" r="2" stroke="#4ab8c4" strokeWidth="0.3" strokeOpacity="0.6" />
        {/* Command bridge interior lines */}
        <line className="draw ph-cockpit" x1="730" y1="240" x2="780" y2="240" stroke="#4ab8c4" strokeWidth="0.3" strokeOpacity="0.2" />
        <line className="draw ph-cockpit" x1="730" y1="260" x2="780" y2="260" stroke="#4ab8c4" strokeWidth="0.3" strokeOpacity="0.2" />

        {/* ═══ PHASE 4 — ENGINES ═══ */}
        {/* Upper engine nacelle */}
        <rect className="draw ph-engine" x="130" y="216" width="58" height="24" rx="4" stroke="#ff6b35" strokeWidth="0.9" strokeOpacity="0.6" />
        <rect className="fill-reveal" x="130" y="216" width="58" height="24" rx="4" fill="url(#bp-engine)" />
        {/* Lower engine nacelle */}
        <rect className="draw ph-engine" x="130" y="260" width="58" height="24" rx="4" stroke="#ff6b35" strokeWidth="0.9" strokeOpacity="0.6" />
        <rect className="fill-reveal" x="130" y="260" width="58" height="24" rx="4" fill="url(#bp-engine)" />

        {/* Engine internal detail */}
        <line className="draw ph-engine" x1="138" y1="228" x2="180" y2="228" stroke="#ff6b35" strokeWidth="0.3" strokeOpacity="0.25" />
        <line className="draw ph-engine" x1="138" y1="272" x2="180" y2="272" stroke="#ff6b35" strokeWidth="0.3" strokeOpacity="0.25" />
        {/* Reactor cores (tiny circles) */}
        <circle className="draw ph-engine" cx="158" cy="228" r="5" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.3" />
        <circle className="draw ph-engine" cx="158" cy="272" r="5" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.3" />

        {/* Engine nozzles */}
        <path className="draw ph-engine" d="M130 218 L108 213 L108 239 L130 237" stroke="#ff6b35" strokeWidth="0.7" strokeOpacity="0.5" />
        <path className="draw ph-engine" d="M130 262 L108 257 L108 283 L130 280" stroke="#ff6b35" strokeWidth="0.7" strokeOpacity="0.5" />
        {/* Exhaust cones */}
        <path className="draw ph-engine" d="M108 216 L82 208 L82 244 L108 237" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.3" />
        <path className="draw ph-engine" d="M108 260 L82 252 L82 288 L108 280" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.3" />
        {/* Exhaust nozzle interior ribs */}
        <line className="draw ph-engine" x1="92" y1="215" x2="92" y2="237" stroke="#ff6b35" strokeWidth="0.25" strokeOpacity="0.2" />
        <line className="draw ph-engine" x1="98" y1="213" x2="98" y2="239" stroke="#ff6b35" strokeWidth="0.25" strokeOpacity="0.15" />
        <line className="draw ph-engine" x1="92" y1="259" x2="92" y2="281" stroke="#ff6b35" strokeWidth="0.25" strokeOpacity="0.2" />
        <line className="draw ph-engine" x1="98" y1="257" x2="98" y2="283" stroke="#ff6b35" strokeWidth="0.25" strokeOpacity="0.15" />

        {/* Fuel feed lines */}
        <path className="draw ph-engine" d="M188 228 Q210 228 210 240 Q210 250 188 250" stroke="#ff6b35" strokeWidth="0.3" strokeOpacity="0.2" />
        <path className="draw ph-engine" d="M188 272 Q210 272 210 262 Q210 250 188 250" stroke="#ff6b35" strokeWidth="0.3" strokeOpacity="0.2" />

        {/* ═══ PHASE 5 — FINS / WINGS ═══ */}
        {/* Upper dorsal fin */}
        <path className="draw ph-wing" d="M380 195 L415 105 L462 112 L430 195" stroke="#FF4500" strokeWidth="0.85" strokeOpacity="0.5" />
        <path className="fill-reveal" d="M380 195 L415 105 L462 112 L430 195Z" fill="#FF4500" fillOpacity="0.035" />
        {/* Lower ventral fin */}
        <path className="draw ph-wing" d="M380 305 L415 395 L462 388 L430 305" stroke="#FF4500" strokeWidth="0.85" strokeOpacity="0.5" />
        <path className="fill-reveal" d="M380 305 L415 395 L462 388 L430 305Z" fill="#FF4500" fillOpacity="0.035" />

        {/* Wing structural ribs */}
        <line className="draw ph-wing" x1="392" y1="175" x2="430" y2="118" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.18" />
        <line className="draw ph-wing" x1="405" y1="180" x2="445" y2="128" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.18" />
        <line className="draw ph-wing" x1="418" y1="188" x2="454" y2="136" stroke="#FF4500" strokeWidth="0.25" strokeOpacity="0.12" />
        <line className="draw ph-wing" x1="392" y1="325" x2="430" y2="382" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.18" />
        <line className="draw ph-wing" x1="405" y1="320" x2="445" y2="372" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.18" />
        <line className="draw ph-wing" x1="418" y1="312" x2="454" y2="364" stroke="#FF4500" strokeWidth="0.25" strokeOpacity="0.12" />

        {/* Fin tip lights */}
        <circle className="draw ph-wing" cx="420" cy="108" r="2" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.4" />
        <circle className="draw ph-wing" cx="420" cy="392" r="2" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.4" />

        {/* Small aft stabilizer fins */}
        <path className="draw ph-wing" d="M210 210 L195 170 L225 175 L220 200" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.3" />
        <path className="draw ph-wing" d="M210 290 L195 330 L225 325 L220 300" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.3" />

        {/* ═══ PHASE 6 — HABITAT RING ═══ */}
        <ellipse className="draw ph-habitat" cx="500" cy="250" rx="62" ry="50" stroke="#a855f7" strokeWidth="0.65" strokeOpacity="0.4" />
        <ellipse className="draw ph-habitat" cx="500" cy="250" rx="50" ry="40" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.22" strokeDasharray="3 5" />
        <ellipse className="fill-reveal" cx="500" cy="250" rx="62" ry="50" fill="url(#bp-habitat)" />
        {/* Habitat cross-beams */}
        <line className="draw ph-habitat" x1="462" y1="220" x2="538" y2="220" stroke="#a855f7" strokeWidth="0.25" strokeOpacity="0.15" />
        <line className="draw ph-habitat" x1="462" y1="280" x2="538" y2="280" stroke="#a855f7" strokeWidth="0.25" strokeOpacity="0.15" />
        <line className="draw ph-habitat" x1="478" y1="205" x2="478" y2="295" stroke="#a855f7" strokeWidth="0.25" strokeOpacity="0.12" />
        <line className="draw ph-habitat" x1="522" y1="205" x2="522" y2="295" stroke="#a855f7" strokeWidth="0.25" strokeOpacity="0.12" />
        {/* Life support module */}
        <rect className="draw ph-habitat" x="488" y="238" width="24" height="24" rx="3" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.3" />
        <line className="draw ph-habitat" x1="494" y1="250" x2="506" y2="250" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.2" />
        <line className="draw ph-habitat" x1="500" y1="244" x2="500" y2="256" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.2" />

        {/* ═══ PHASE 7 — CARGO BAYS ═══ */}
        <rect className="draw ph-cargo" x="320" y="208" width="45" height="32" rx="3" stroke="#6b8aed" strokeWidth="0.6" strokeOpacity="0.4" />
        <rect className="draw ph-cargo" x="320" y="260" width="45" height="32" rx="3" stroke="#6b8aed" strokeWidth="0.6" strokeOpacity="0.4" />
        {/* Cargo door lines */}
        <line className="draw ph-cargo" x1="342" y1="208" x2="342" y2="240" stroke="#6b8aed" strokeWidth="0.3" strokeOpacity="0.2" />
        <line className="draw ph-cargo" x1="342" y1="260" x2="342" y2="292" stroke="#6b8aed" strokeWidth="0.3" strokeOpacity="0.2" />
        {/* Cargo internal symbols */}
        <rect className="draw ph-cargo" x="327" y="215" width="8" height="8" rx="1" stroke="#6b8aed" strokeWidth="0.3" strokeOpacity="0.15" />
        <rect className="draw ph-cargo" x="327" y="267" width="8" height="8" rx="1" stroke="#6b8aed" strokeWidth="0.3" strokeOpacity="0.15" />

        {/* Docking port (forward) */}
        <circle className="draw ph-cargo" cx="700" cy="250" r="8" stroke="#6b8aed" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle className="draw ph-cargo" cx="700" cy="250" r="4" stroke="#6b8aed" strokeWidth="0.3" strokeOpacity="0.4" />

        {/* ═══ PHASE 8 — SOLAR / POWER ═══ */}
        {/* Solar arrays */}
        <rect className="draw ph-solar" x="558" y="174" width="54" height="10" rx="1.5" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.45" />
        <rect className="draw ph-solar" x="558" y="316" width="54" height="10" rx="1.5" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.45" />
        {/* Solar panel cell lines */}
        {[0, 1, 2, 3, 4, 5].map((i) =>
          <g key={`sc-${i}`}>
            <line className="draw ph-solar" x1={563 + i * 9} y1="174" x2={563 + i * 9} y2="184" stroke="#eab308" strokeWidth="0.3" strokeOpacity="0.2" />
            <line className="draw ph-solar" x1={563 + i * 9} y1="316" x2={563 + i * 9} y2="326" stroke="#eab308" strokeWidth="0.3" strokeOpacity="0.2" />
          </g>
          )}
        {/* Solar panel deployment arms */}
        <line className="draw ph-solar" x1="585" y1="198" x2="585" y2="184" stroke="#eab308" strokeWidth="0.35" strokeOpacity="0.3" />
        <line className="draw ph-solar" x1="585" y1="302" x2="585" y2="316" stroke="#eab308" strokeWidth="0.35" strokeOpacity="0.3" />

        {/* Heat radiator panels (retractable) */}
        <rect className="draw ph-solar" x="620" y="166" width="30" height="6" rx="1" stroke="#eab308" strokeWidth="0.35" strokeOpacity="0.25" />
        <rect className="draw ph-solar" x="620" y="328" width="30" height="6" rx="1" stroke="#eab308" strokeWidth="0.35" strokeOpacity="0.25" />
        {/* Radiator fins */}
        {[0, 1, 2].map((i) =>
          <g key={`rad-${i}`}>
            <line className="draw ph-solar" x1={626 + i * 10} y1="166" x2={626 + i * 10} y2="160" stroke="#eab308" strokeWidth="0.2" strokeOpacity="0.15" />
            <line className="draw ph-solar" x1={626 + i * 10} y1="334" x2={626 + i * 10} y2="340" stroke="#eab308" strokeWidth="0.2" strokeOpacity="0.15" />
          </g>
          )}

        {/* Antenna mast */}
        <line className="draw ph-solar" x1="680" y1="195" x2="680" y2="155" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.3" />
        <circle className="draw ph-solar" cx="680" cy="152" r="3" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.35" />
        <line className="draw ph-solar" x1="676" y1="152" x2="684" y2="152" stroke="#eab308" strokeWidth="0.3" strokeOpacity="0.25" />

        {/* ═══ PHASE 9 — RCS THRUSTERS ═══ */}
        {/* Forward RCS quads */}
        {[
          { x: 720, y: 210 }, { x: 720, y: 285 },
          { x: 660, y: 198 }, { x: 660, y: 300 }].
          map((t, i) =>
          <g key={`rcs-${i}`}>
            <rect className="draw ph-rcs" x={t.x - 5} y={t.y - 3} width="10" height="6" rx="1" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.4" />
            <line className="draw ph-rcs" x1={t.x} y1={t.y - 3} x2={t.x} y2={t.y + 3} stroke="#22d3ee" strokeWidth="0.2" strokeOpacity="0.2" />
          </g>
          )}
        {/* Aft RCS */}
        {[
          { x: 250, y: 205 }, { x: 250, y: 293 },
          { x: 300, y: 198 }, { x: 300, y: 300 }].
          map((t, i) =>
          <g key={`arcs-${i}`}>
            <rect className="draw ph-rcs" x={t.x - 4} y={t.y - 2.5} width="8" height="5" rx="1" stroke="#22d3ee" strokeWidth="0.35" strokeOpacity="0.3" />
          </g>
          )}
        {/* RCS jet cones (tiny) */}
        <path className="draw ph-rcs" d="M720 207 L725 202 L715 202 Z" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.2" />
        <path className="draw ph-rcs" d="M720 291 L725 296 L715 296 Z" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.2" />

        {/* ═══ PHASE 10 — DIMENSION LINES ═══ */}
        {/* Overall length */}
        <line className="draw ph-dim" x1="78" y1="420" x2="845" y2="420" stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.2" />
        <line className="draw ph-dim" x1="78" y1="415" x2="78" y2="425" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.25" />
        <line className="draw ph-dim" x1="845" y1="415" x2="845" y2="425" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.25" />
        {/* Wingspan */}
        <line className="draw ph-dim" x1="935" y1="105" x2="935" y2="395" stroke="#FF4500" strokeWidth="0.4" strokeOpacity="0.2" />
        <line className="draw ph-dim" x1="930" y1="105" x2="940" y2="105" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.25" />
        <line className="draw ph-dim" x1="930" y1="395" x2="940" y2="395" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.25" />
        {/* Hull height */}
        <line className="draw ph-dim" x1="870" y1="195" x2="870" y2="305" stroke="#FF4500" strokeWidth="0.35" strokeOpacity="0.15" />
        <line className="draw ph-dim" x1="866" y1="195" x2="874" y2="195" stroke="#FF4500" strokeWidth="0.35" strokeOpacity="0.15" />
        <line className="draw ph-dim" x1="866" y1="305" x2="874" y2="305" stroke="#FF4500" strokeWidth="0.35" strokeOpacity="0.15" />
        {/* Cockpit-to-engine span */}
        <line className="draw ph-dim" x1="82" y1="440" x2="840" y2="440" stroke="#FF4500" strokeWidth="0.25" strokeOpacity="0.1" strokeDasharray="4 6" />

        {/* ═══ LABELS ═══ */}
        {/* Dimension labels */}
        <text className="label" x="460" y="416" textAnchor="middle" fill="#FF4500" fillOpacity="0.45" fontSize="9" fontFamily="Orbitron, monospace" letterSpacing="1">127.4m OVERALL LENGTH</text>
        <text className="label" x="950" y="255" textAnchor="start" fill="#FF4500" fillOpacity="0.4" fontSize="9" fontFamily="Orbitron, monospace" transform="rotate(90 950 255)">68.2m SPAN</text>
        <text className="label" x="882" y="254" textAnchor="start" fill="#FF4500" fillOpacity="0.3" fontSize="7" fontFamily="Orbitron, monospace" transform="rotate(90 882 254)">22.4m</text>

        {/* ── Callout connector lines + component labels ── */}
        {/* Engines */}
        <line className="callout-line" x1="95" y1="206" x2="95" y2="180" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.35" />
        <line className="callout-line" x1="95" y1="180" x2="60" y2="180" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.35" />
        <text className="label" x="58" y="177" textAnchor="end" fill="#ff6b35" fillOpacity="0.6" fontSize="7" fontFamily="Orbitron, monospace">NTP ENGINES</text>
        <text className="label" x="58" y="187" textAnchor="end" fill="#ff6b35" fillOpacity="0.3" fontSize="5.5" fontFamily="Orbitron, monospace">4.2 TN THRUST</text>

        {/* Cargo */}
        <line className="callout-line" x1="342" y1="208" x2="342" y2="155" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.35" />
        <line className="callout-line" x1="342" y1="155" x2="310" y2="155" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.35" />
        <text className="label" x="308" y="152" textAnchor="end" fill="#6b8aed" fillOpacity="0.6" fontSize="7" fontFamily="Orbitron, monospace">CARGO BAY</text>
        <text className="label" x="308" y="162" textAnchor="end" fill="#6b8aed" fillOpacity="0.3" fontSize="5.5" fontFamily="Orbitron, monospace">240 m³ CAPACITY</text>

        {/* Habitat */}
        <line className="callout-line" x1="500" y1="198" x2="500" y2="142" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.35" />
        <line className="callout-line" x1="500" y1="142" x2="530" y2="142" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.35" />
        <text className="label" x="534" y="139" textAnchor="start" fill="#a855f7" fillOpacity="0.6" fontSize="7" fontFamily="Orbitron, monospace">HABITAT RING</text>
        <text className="label" x="534" y="149" textAnchor="start" fill="#a855f7" fillOpacity="0.3" fontSize="5.5" fontFamily="Orbitron, monospace">ROTATIONAL GRAVITY · 0.38g</text>

        {/* Solar */}
        <line className="callout-line" x1="585" y1="174" x2="585" y2="148" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.35" />
        <text className="label" x="585" y="143" textAnchor="middle" fill="#eab308" fillOpacity="0.55" fontSize="6.5" fontFamily="Orbitron, monospace">SOLAR ARRAY</text>

        {/* Cockpit */}
        <line className="callout-line" x1="790" y1="215" x2="790" y2="172" stroke="#4ab8c4" strokeWidth="0.4" strokeOpacity="0.35" />
        <line className="callout-line" x1="790" y1="172" x2="830" y2="172" stroke="#4ab8c4" strokeWidth="0.4" strokeOpacity="0.35" />
        <text className="label" x="834" y="169" textAnchor="start" fill="#4ab8c4" fillOpacity="0.6" fontSize="7" fontFamily="Orbitron, monospace">COMMAND MODULE</text>
        <text className="label" x="834" y="179" textAnchor="start" fill="#4ab8c4" fillOpacity="0.3" fontSize="5.5" fontFamily="Orbitron, monospace">QN-7000 NAV CORE</text>

        {/* Dorsal fin */}
        <text className="label" x="438" y="95" textAnchor="middle" fill="#FF4500" fillOpacity="0.4" fontSize="6" fontFamily="Orbitron, monospace">DORSAL FIN</text>

        {/* RCS */}
        <line className="callout-line" x1="660" y1="300" x2="660" y2="355" stroke="#22d3ee" strokeWidth="0.35" strokeOpacity="0.3" />
        <text className="label" x="660" y="365" textAnchor="middle" fill="#22d3ee" fillOpacity="0.5" fontSize="6" fontFamily="Orbitron, monospace">RCS QUAD</text>

        {/* Antenna */}
        <text className="label" x="680" y="145" textAnchor="middle" fill="#eab308" fillOpacity="0.4" fontSize="5.5" fontFamily="Orbitron, monospace">COMMS</text>

        {/* Section designations */}
        <text className="label" x="342" y="253" textAnchor="middle" fill="#6b8aed" fillOpacity="0.18" fontSize="9" fontFamily="Orbitron, monospace">A</text>
        <text className="label" x="500" y="253" textAnchor="middle" fill="#a855f7" fillOpacity="0.18" fontSize="9" fontFamily="Orbitron, monospace">B</text>
        <text className="label" x="640" y="253" textAnchor="middle" fill="#FF4500" fillOpacity="0.18" fontSize="9" fontFamily="Orbitron, monospace">C</text>
        <text className="label" x="780" y="253" textAnchor="middle" fill="#4ab8c4" fillOpacity="0.18" fontSize="9" fontFamily="Orbitron, monospace">D</text>

        {/* ═══ CALLOUT DOTS ═══ */}
        {[
          { cx: 95, cy: 228, color: '#ff6b35' },
          { cx: 95, cy: 272, color: '#ff6b35' },
          { cx: 500, cy: 250, color: '#a855f7' },
          { cx: 790, cy: 250, color: '#4ab8c4' },
          { cx: 585, cy: 179, color: '#eab308' },
          { cx: 585, cy: 321, color: '#eab308' },
          { cx: 420, cy: 108, color: '#FF4500' },
          { cx: 830, cy: 250, color: '#4ab8c4' },
          { cx: 700, cy: 250, color: '#6b8aed' },
          { cx: 660, cy: 300, color: '#22d3ee' },
          { cx: 420, cy: 392, color: '#FF4500' }].
          map((dot, i) =>
          <g key={`dot-${i}`} className="dot-pulse">
            <circle cx={dot.cx} cy={dot.cy} r="4" fill={dot.color} fillOpacity="0.12">
              <animate attributeName="r" values="4;7;4" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="fillOpacity" values="0.12;0.04;0.12" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={dot.cx} cy={dot.cy} r="1.8" fill={dot.color} fillOpacity="0.6" />
          </g>
          )}

        {/* ═══ ENGINE EXHAUST PLUMES ═══ */}
        <g style={{ pointerEvents: 'none' }}>
          {/* Upper engine exhaust */}
          <ellipse cx="55" cy="228" rx="28" ry="8" fill="url(#bp-exhaust)" filter="url(#bp-exhaust-blur)">
            <animate attributeName="rx" values="28;42;28" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="60" cy="228" rx="15" ry="4" fill="#ff6b35" fillOpacity="0.25">
            <animate attributeName="rx" values="15;22;15" dur="0.6s" repeatCount="indefinite" />
          </ellipse>
          {/* Lower engine exhaust */}
          <ellipse cx="55" cy="272" rx="28" ry="8" fill="url(#bp-exhaust)" filter="url(#bp-exhaust-blur)">
            <animate attributeName="rx" values="28;42;28" dur="0.8s" repeatCount="indefinite" begin="0.1s" />
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="0.8s" repeatCount="indefinite" begin="0.1s" />
          </ellipse>
          <ellipse cx="60" cy="272" rx="15" ry="4" fill="#ff6b35" fillOpacity="0.25">
            <animate attributeName="rx" values="15;22;15" dur="0.6s" repeatCount="indefinite" begin="0.1s" />
          </ellipse>
          {/* Exhaust particles — tiny dots streaming left */}
          {[0, 1, 2, 3, 4].map((i) =>
            <circle key={`ep1-${i}`} r="1" fill="#ff6b35" fillOpacity="0.3">
              <animate attributeName="cx" values={`${55 - i * 8};${20 - i * 6};${55 - i * 8}`} dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${226 + i * 0.5};${228};${226 + i * 0.5}`} dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
            </circle>
            )}
          {[0, 1, 2, 3, 4].map((i) =>
            <circle key={`ep2-${i}`} r="1" fill="#ff6b35" fillOpacity="0.3">
              <animate attributeName="cx" values={`${55 - i * 8};${20 - i * 6};${55 - i * 8}`} dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" begin="0.2s" />
              <animate attributeName="cy" values={`${270 + i * 0.5};${272};${270 + i * 0.5}`} dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur={`${1.2 + i * 0.15}s`} repeatCount="indefinite" />
            </circle>
            )}
        </g>

        {/* ═══ CURSOR SPOTLIGHT ═══ */}
        {isHovering &&
          <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r="120"
          fill="url(#bp-cursor-spot)"
          style={{ pointerEvents: 'none', transition: 'cx 0.08s, cy 0.08s' }} />

          }

        {/* ═══ DIAGNOSTICS ZONE HIGHLIGHT ═══ */}
        {diagRunning && diagStep >= 0 && diagStep < DIAG_SEQUENCE.length && (() => {
            const step = DIAG_SEQUENCE[diagStep];
            if (!step.zone) return null;
            const zone = ZONES.find((z) => z.id === step.zone);
            if (!zone) return null;
            return (
              <g style={{ pointerEvents: 'none' }}>
              <rect
                x={zone.x - 4} y={zone.y - 4}
                width={zone.w + 8} height={zone.h + 8}
                rx="6"
                fill="none"
                stroke={PHASE_COLORS[zone.phase]}
                strokeWidth="1.2"
                strokeOpacity="0.6"
                strokeDasharray="6 4">

                <animate attributeName="stroke-opacity" values="0.6;0.2;0.6" dur="0.5s" repeatCount="indefinite" />
              </rect>
              <rect
                x={zone.x} y={zone.y}
                width={zone.w} height={zone.h}
                rx="4"
                fill={PHASE_COLORS[zone.phase]}
                fillOpacity="0.04">

                <animate attributeName="fill-opacity" values="0.04;0.08;0.04" dur="0.5s" repeatCount="indefinite" />
              </rect>
            </g>);

          })()}

        {/* ═══ INTERACTIVE HOVER ZONES ═══ */}
        {ZONES.map((zone) =>
          <rect
          key={zone.id}
          x={zone.x} y={zone.y} width={zone.w} height={zone.h}
          fill={activeZone === zone.id ? `${PHASE_COLORS[zone.phase]}` : 'transparent'}
          fillOpacity={activeZone === zone.id ? 0.04 : 0}
          stroke={activeZone === zone.id ? PHASE_COLORS[zone.phase] : 'transparent'}
          strokeWidth={activeZone === zone.id ? 0.5 : 0}
          strokeOpacity={0.25}
          strokeDasharray="4 3"
          rx="4"
          style={{ cursor: 'pointer', transition: 'fill-opacity 0.3s, stroke 0.3s' }}
          onMouseEnter={() => handleZoneEnter(zone.id)}
          onMouseLeave={handleZoneLeave}
          onClick={() => handleZoneClick(zone.id)} />

          )}

        {/* Hover zone label tooltip */}
        {activeZone && (() => {
            const zone = ZONES.find((z) => z.id === activeZone);
            if (!zone) return null;
            const tx = zone.x + zone.w / 2;
            const ty = zone.y - 10;
            return (
              <g style={{ pointerEvents: 'none' }}>
              <rect
                x={tx - 56} y={ty - 14} width="112" height="16" rx="3"
                fill="rgba(0,0,0,0.85)" stroke={PHASE_COLORS[zone.phase]} strokeWidth="0.5" strokeOpacity="0.4" />

              <text
                x={tx} y={ty - 3} textAnchor="middle"
                fill={PHASE_COLORS[zone.phase]} fillOpacity="0.8"
                fontSize="6" fontFamily="Orbitron, monospace" fontWeight="bold">

                {zone.label} — INSPECT ▸
              </text>
            </g>);

          })()}

        {/* ═══ TITLE BAR ═══ */}
        <text className="label" x="500" y="472" textAnchor="middle" fill="white" fillOpacity="0.12" fontSize="7.5" fontFamily="Orbitron, monospace" letterSpacing="3.5">
          ARES-7 INTERPLANETARY CRUISER • BLUEPRINT REV 4.2 • PROFILE VIEW
        </text>
      </svg>
      </div>

      {/* Processing overlay text */}
      {animStarted && !completedPhases.has(10) &&
      <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm border border-white/[0.06]">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[8px] font-display tracking-[0.15em] text-primary/60">RENDERING SCHEMATIC...</span>
        </div>
      }

      {/* ═══ DIAGNOSTICS CONTROL PANEL ═══ */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Run button */}
        <button
        onClick={runDiagnostics}
        disabled={diagRunning}
        className={`group relative px-5 py-2.5 rounded-lg font-display text-[10px] tracking-[0.2em] uppercase transition-all cursor-pointer ${
        diagRunning ?
        'bg-white/[0.03] border border-white/[0.06] text-white/50' :
        diagComplete ?
        'bg-green-500/10 border border-green-500/20 text-green-400/80 hover:bg-green-500/15' :
        'bg-primary/10 border border-primary/20 text-primary/80 hover:bg-primary/15 hover:border-primary/30'}`
        }>

          <span className="flex items-center gap-2">
            {diagRunning && !diagComplete &&
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            }
            {diagComplete &&
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            }
            {!diagRunning && !diagComplete &&
            <span className="text-xs">▸</span>
            }
            {diagRunning && !diagComplete ?
            'SCANNING...' :
            diagComplete ?
            'ALL SYSTEMS NOMINAL' :
            'RUN SYSTEMS CHECK'
            }
          </span>
        </button>

        {/* Live diagnostics readout */}
        {diagRunning &&
        <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {diagStep >= 0 && diagStep < DIAG_SEQUENCE.length &&
          <span className="text-[9px] font-display tracking-[0.15em] text-yellow-400/60 animate-pulse">
                CHECKING: {DIAG_SEQUENCE[diagStep].system}
              </span>
          }
            {diagResults.map((sys) =>
          <span key={sys} className="text-[8px] font-display tracking-[0.1em] text-green-400/40">
                {sys} ✓
              </span>
          )}
            {diagComplete &&
          <span className="text-[9px] font-display tracking-[0.15em] text-green-400/70 font-bold">
                ● LAUNCH READY
              </span>
          }
          </div>
        }
      </div>

      {/* Detail overlay */}
      <BlueprintDetailOverlay zoneId={selectedZone} onClose={handleCloseDetail} />
    </div>);

}

export default memo(SpacecraftBlueprint);