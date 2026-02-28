import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Interactive 3D Mars Globe
 *
 * Pure SVG + CSS — no WebGL.
 * Surface features and landing-zone markers are positioned using
 * longitude / latitude mapped onto a sphere via trigonometric
 * projection. Drag (mouse or touch) rotates the globe.
 *
 * Mobile optimizations:
 *  • Larger touch targets for landing zone markers
 *  • Tap-to-toggle tooltips (instead of hover-only)
 *  • Tooltip clamped to container bounds
 *  • Hint text adapts to touch vs pointer
 */

interface MarsGlobeProps {
  className?: string;
  size?: number;
}

// ────────── Sphere projection helpers ──────────
const DEG = Math.PI / 180;
const CX = 200;
const CY = 200;
const R = 155; // planet radius in viewBox units

/** Project lon/lat to x,y + depth. Returns null if on far side. */
function project(lon: number, lat: number, rotation: number) {
  const adjLon = (lon - rotation) * DEG;
  const latR = lat * DEG;
  const cosLon = Math.cos(adjLon);
  if (cosLon < -0.05) return null;
  const x = CX + R * Math.sin(adjLon) * Math.cos(latR);
  const y = CY - R * Math.sin(latR);
  const depth = Math.max(0, cosLon);
  return { x, y, depth };
}

// ────────── Landing Zones ──────────
interface LandingZone {
  id: string;
  name: string;
  desc: string;
  lon: number;
  lat: number;
  color: string;
  icon: string;
}

const ZONES: LandingZone[] = [
{ id: 'jezero', name: 'Jezero Crater', desc: 'Primary landing site — ancient river delta', lon: 77, lat: 18, color: '#4ab8c4', icon: '◎' },
{ id: 'olympus', name: 'Olympus Mons', desc: 'Tallest volcano in the solar system', lon: -134, lat: 18, color: '#FF4500', icon: '▲' },
{ id: 'valles', name: 'Valles Marineris', desc: '4,000 km canyon system', lon: -70, lat: -14, color: '#ff6b35', icon: '≡' },
{ id: 'hellas', name: 'Hellas Basin', desc: 'Deepest impact crater on Mars', lon: 70, lat: -43, color: '#a855f7', icon: '○' },
{ id: 'polar', name: 'North Polar Cap', desc: 'Water ice & CO₂ frost deposits', lon: 0, lat: 78, color: '#d4c4b8', icon: '❄' },
{ id: 'elysium', name: 'Elysium Planitia', desc: 'InSight landing zone — smooth basalt plain', lon: 155, lat: 5, color: '#6b8aed', icon: '◇' }];


// ────────── Surface features ──────────
interface SurfaceFeature {
  lon: number;
  lat: number;
  rx: number;
  ry: number;
  fill: string;
  opacity: number;
}

const FEATURES: SurfaceFeature[] = [
{ lon: -134, lat: 18, rx: 28, ry: 24, fill: '#c4621a', opacity: 0.5 },
{ lon: -134, lat: 18, rx: 12, ry: 10, fill: '#d47a3a', opacity: 0.35 },
{ lon: 70, lat: -43, rx: 30, ry: 25, fill: '#8a2500', opacity: 0.3 },
{ lon: 30, lat: 25, rx: 14, ry: 14, fill: '#9b3010', opacity: 0.3 },
{ lon: -30, lat: -10, rx: 10, ry: 10, fill: '#9b3010', opacity: 0.25 },
{ lon: 120, lat: 30, rx: 8, ry: 8, fill: '#9b3510', opacity: 0.25 },
{ lon: -90, lat: -30, rx: 12, ry: 12, fill: '#8a2800', opacity: 0.2 },
{ lon: 50, lat: 15, rx: 35, ry: 40, fill: '#b04020', opacity: 0.18 },
{ lon: -60, lat: -25, rx: 38, ry: 28, fill: '#a04020', opacity: 0.15 },
{ lon: 160, lat: -15, rx: 30, ry: 22, fill: '#a04020', opacity: 0.15 }];


// Detect touch device for hint text
const isTouchDevice = () =>
typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// ────────── Component ──────────
function MarsGlobe({ className = '', size = 600 }: MarsGlobeProps) {
  const [rotation, setRotation] = useState(40);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startRot: 0, moved: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<number>(0);
  const lastDrag = useRef(0);

  // Auto-rotate when not dragging
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      if (Date.now() - lastDrag.current > 3000 && !dragging) {
        setRotation((r) => (r + 0.06) % 360);
      }
      autoRef.current = requestAnimationFrame(tick);
    };
    autoRef.current = requestAnimationFrame(tick);
    return () => {active = false;cancelAnimationFrame(autoRef.current);};
  }, [dragging]);

  // ── Drag handlers ──
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragRef.current.startX = e.clientX;
    dragRef.current.startRot = rotation;
    dragRef.current.moved = false;
  }, [rotation]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 3) dragRef.current.moved = true;
    const containerW = containerRef.current?.clientWidth || 400;
    const degPerPx = 180 / containerW;
    setRotation((dragRef.current.startRot + dx * degPerPx) % 360);
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    lastDrag.current = Date.now();
  }, []);

  // Tap on a marker toggles tooltip (mobile-friendly)
  const handleMarkerTap = useCallback((zoneId: string) => {
    // Only toggle via tap if didn't drag
    if (dragRef.current.moved) return;
    setActiveZone((prev) => prev === zoneId ? null : zoneId);
  }, []);

  // Dismiss tooltip when tapping elsewhere on the globe
  const handleGlobeTap = useCallback(() => {
    if (!dragRef.current.moved && activeZone) {
      setActiveZone(null);
    }
  }, [activeZone]);

  // ── Project all features ──
  const projectedFeatures = FEATURES.map((f) => {
    const p = project(f.lon, f.lat, rotation);
    if (!p) return null;
    const scale = 0.4 + p.depth * 0.6;
    return { ...f, x: p.x, y: p.y, depth: p.depth, scale };
  }).filter(Boolean).sort((a, b) => a!.depth - b!.depth);

  // ── Project landing zones ──
  const projectedZones = ZONES.map((z) => {
    const p = project(z.lon, z.lat, rotation);
    if (!p || p.depth < 0.15) return null;
    return { ...z, x: p.x, y: p.y, depth: p.depth };
  }).filter(Boolean).sort((a, b) => a!.depth - b!.depth);

  // Polar caps
  const northPole = project(0, 82, rotation);
  const southPole = project(0, -82, rotation);

  // Valles Marineris line
  const vmPoints: {x: number;y: number;depth: number;}[] = [];
  for (let lon = -90; lon <= -50; lon += 5) {
    const p = project(lon, -14 + Math.sin((lon + 70) * DEG * 3) * 3, rotation);
    if (p && p.depth > 0.05) vmPoints.push(p);
  }
  const vmPath = vmPoints.length > 2 ?
  `M${vmPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}` :
  null;
  const vmAvgDepth = vmPoints.length > 0 ?
  vmPoints.reduce((s, p) => s + p.depth, 0) / vmPoints.length :
  0;

  // Active zone data for tooltip
  const activeData = projectedZones.find((z) => z!.id === activeZone);

  // Clamp tooltip position to stay within container
  const getTooltipStyle = () => {
    if (!activeData) return {};
    const xPct = activeData.x / 400 * 100;
    const yPct = activeData.y / 400 * 100;

    // If marker is on the right half, show tooltip to the left
    const isRightSide = xPct > 60;
    // If marker is near the top, show tooltip below
    const isNearTop = yPct < 25;

    return {
      left: `${Math.min(Math.max(xPct, 5), 95)}%`,
      top: `${yPct}%`,
      transform: `translate(${isRightSide ? 'calc(-100% - 12px)' : '12px'}, ${isNearTop ? '8px' : '-100%'})`
    };
  };

  return (
    <div
    ref={containerRef}
    className={`relative ${className}`}
    style={{ width: size, height: size, touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}>

      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(255,69,0,0.12) 0%, rgba(255,69,0,0.04) 40%, transparent 70%)',
        transform: 'scale(1.8)', filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div className="absolute inset-0 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 60%)',
        transform: 'scale(1.5)', filter: 'blur(20px)', pointerEvents: 'none'
      }} />

      <svg
      viewBox="0 0 400 400"
      className="w-full h-full relative"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => {onPointerUp();handleGlobeTap();}}
      onPointerLeave={onPointerUp}
      style={{ overflow: 'visible' }}>

        <defs>
          <radialGradient id="gMarsBody" cx="38%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#e8734a" />
            <stop offset="25%" stopColor="#d4532a" />
            <stop offset="50%" stopColor="#b83a1a" />
            <stop offset="75%" stopColor="#8b2500" />
            <stop offset="100%" stopColor="#3d1100" />
          </radialGradient>
          <radialGradient id="gMarsShadow" cx="70%" cy="65%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="60%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
          </radialGradient>
          <radialGradient id="gMarsAtmo" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="93%" stopColor="rgba(255,69,0,0.08)" />
            <stop offset="100%" stopColor="rgba(255,69,0,0.02)" />
          </radialGradient>
          <filter id="gSurfNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="42" />
            <feColorMatrix type="saturate" values="0.1" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feBlend in2="SourceGraphic" mode="overlay" />
          </filter>
          <filter id="gHeatHaze" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feTurbulence type="turbulence" baseFrequency="0.012 0.018" numOctaves="3" seed="7" result="w1">
              <animate attributeName="baseFrequency" dur="12s" values="0.012 0.018;0.016 0.022;0.010 0.020;0.012 0.018" repeatCount="indefinite" />
            </feTurbulence>
            <feTurbulence type="turbulence" baseFrequency="0.035 0.05" numOctaves="2" seed="23" result="w2">
              <animate attributeName="baseFrequency" dur="7s" values="0.035 0.05;0.04 0.06;0.03 0.045;0.035 0.05" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="w1" scale="5" xChannelSelector="R" yChannelSelector="G" result="d1" />
            <feDisplacementMap in="d1" in2="w2" scale="2.5" xChannelSelector="G" yChannelSelector="B" />
          </filter>
          <clipPath id="gPlanetClip">
            <circle cx={CX} cy={CY} r={R + 2} />
          </clipPath>
          <clipPath id="gHazeClip">
            <circle cx={CX} cy={CY} r={R + 20} />
          </clipPath>
          <clipPath id="gHazeInner">
            <path d={`M0 0 h400 v400 h-400 Z M${CX} ${CY} m-${R - 8},0 a${R - 8},${R - 8} 0 1,0 ${(R - 8) * 2},0 a${R - 8},${R - 8} 0 1,0 -${(R - 8) * 2},0`} clipRule="evenodd" />
          </clipPath>
          <filter id="gMarkerGlow">
            <feGaussianBlur stdDeviation="2" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Planet body */}
        <circle cx={CX} cy={CY} r={R} fill="url(#gMarsBody)" />

        {/* Rotatable surface features (clipped to planet) */}
        <g clipPath="url(#gPlanetClip)">
          {projectedFeatures.map((f, i) => f &&
          <ellipse key={`sf-${i}`}
          cx={f.x} cy={f.y} rx={f.rx * f.scale} ry={f.ry * f.scale * 0.85}
          fill={f.fill} opacity={f.opacity * f.depth} />
          )}

          {vmPath &&
          <path d={vmPath} stroke="#7a1a00" strokeWidth={3 * (0.5 + vmAvgDepth * 0.5)} fill="none" opacity={0.45 * vmAvgDepth} strokeLinecap="round" />
          }

          {northPole && northPole.depth > 0.1 &&
          <>
              <ellipse cx={northPole.x} cy={northPole.y} rx={50 * northPole.depth} ry={14 * northPole.depth} fill="#d4c4b8" opacity={0.3 * northPole.depth} />
              <ellipse cx={northPole.x} cy={northPole.y} rx={35 * northPole.depth} ry={8 * northPole.depth} fill="#e8ddd4" opacity={0.2 * northPole.depth} />
            </>
          }
          {southPole && southPole.depth > 0.1 &&
          <ellipse cx={southPole.x} cy={southPole.y} rx={35 * southPole.depth} ry={10 * southPole.depth} fill="#c4b4a8" opacity={0.2 * southPole.depth} />
          }
        </g>

        {/* Surface noise */}
        <circle cx={CX} cy={CY} r={R} filter="url(#gSurfNoise)" opacity="0.12" fill="#c06030" />

        {/* Shadow */}
        <circle cx={CX} cy={CY} r={R} fill="url(#gMarsShadow)" />

        {/* Atmosphere rim */}
        <circle cx={CX} cy={CY} r={R + 3} fill="none" stroke="rgba(255,120,60,0.15)" strokeWidth="2.5" />
        <circle cx={CX} cy={CY} r={R + 7} fill="none" stroke="rgba(255,69,0,0.05)" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={R + 6} fill="url(#gMarsAtmo)" />

        {/* Heat haze ring */}
        <g filter="url(#gHeatHaze)" clipPath="url(#gHazeClip)">
          <g clipPath="url(#gHazeInner)">
            <circle cx={CX} cy={CY} r={R + 18} fill="none" stroke="rgba(255,100,40,0.05)" strokeWidth="2" />
            <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="rgba(255,80,30,0.04)" strokeWidth="1.5" />
          </g>
        </g>

        {/* Specular highlight */}
        <ellipse cx={CX - 40} cy={CY - 55} rx={55} ry={40} fill="rgba(255,200,170,0.05)" />

        {/* ── LANDING ZONE MARKERS ── */}
        {projectedZones.map((z) => z &&
        <g key={z.id} style={{ cursor: 'pointer' }}>
            {/* Ping ring */}
            <circle cx={z.x} cy={z.y} r={8 * z.depth} fill="none" stroke={z.color} strokeWidth={0.6} opacity={z.depth * 0.4}>
              <animate attributeName="r" values={`${6 * z.depth};${14 * z.depth};${6 * z.depth}`} dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values={`${z.depth * 0.4};${z.depth * 0.1};${z.depth * 0.4}`} dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* Invisible larger touch target (min 20px effective radius in viewBox) */}
            <circle
          cx={z.x} cy={z.y}
          r={Math.max(12, 6 * (0.5 + z.depth * 0.5))}
          fill="transparent"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => {
            e.stopPropagation();
            handleMarkerTap(z.id);
          }}
          onPointerEnter={() => {
            // Desktop hover: show tooltip immediately
            if (!isTouchDevice()) setActiveZone(z.id);
          }}
          onPointerLeave={() => {
            // Desktop hover: hide tooltip
            if (!isTouchDevice()) setActiveZone(null);
          }}
          style={{ cursor: 'pointer' }} />


            {/* Core visible dot */}
            <circle
          cx={z.x} cy={z.y}
          r={3.5 * (0.5 + z.depth * 0.5)}
          fill={z.color}
          opacity={z.depth * 0.9}
          filter={z.depth > 0.6 ? 'url(#gMarkerGlow)' : undefined}
          style={{ pointerEvents: 'none' }} />


            {/* Icon glyph */}
            {z.depth > 0.4 &&
          <text
          x={z.x} y={z.y + 1}
          textAnchor="middle" dominantBaseline="central"
          fontSize={8 * (0.6 + z.depth * 0.4)}
          fill="white" fillOpacity={z.depth * 0.7}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {z.icon}
              </text>
          }

            {/* Label (only when depth > 0.5) */}
            {z.depth > 0.5 &&
          <text
          x={z.x + 10 * z.depth} y={z.y - 10 * z.depth}
          fontSize={6 * (0.7 + z.depth * 0.3)}
          fontFamily="Orbitron, monospace"
          fill={z.color} fillOpacity={z.depth * 0.5}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {z.name.toUpperCase()}
              </text>
          }
          </g>
        )}

        {/* Pulsing orbit rings */}
        <circle cx={CX} cy={CY} r={R + 16} fill="none" stroke="#FF4500" strokeWidth="0.5" opacity="0.25">
          <animate attributeName="r" values={`${R + 12};${R + 26};${R + 12}`} dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.06;0.25" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Drag/touch hint */}
        {!dragging &&
        <text x={CX} y={CY + R + 32} textAnchor="middle" fontSize="7" fontFamily="Orbitron, monospace" fill="white" fillOpacity="0.15" letterSpacing="2">
            {isTouchDevice() ? 'SWIPE TO ROTATE · TAP MARKERS' : 'DRAG TO ROTATE'}
          </text>
        }
      </svg>

      {/* ── TOOLTIP ── */}
      <AnimatePresence>
        {activeData &&
        <motion.div
          className="absolute z-20 pointer-events-none"
          style={getTooltipStyle()}
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          transition={{ duration: 0.18 }}>
            <div className="px-3 py-2 rounded-lg bg-black/90 backdrop-blur-md border border-white/[0.1] min-w-[120px] max-w-[180px] sm:min-w-[140px] sm:max-w-[200px]">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeData.color }} />
                <span className="text-[9px] sm:text-[10px] font-display font-bold tracking-[0.12em] text-white/80 leading-tight">
                  {activeData.name.toUpperCase()}
                </span>
              </div>
              <p className="text-[8px] sm:text-[9px] text-white/35 leading-relaxed">{activeData.desc}</p>
              <div className="mt-1 text-[7px] sm:text-[8px] font-display text-white/50 tracking-wider">
                {activeData.lat > 0 ? `${activeData.lat}°N` : `${-activeData.lat}°S`}{' '}
                {activeData.lon > 0 ? `${activeData.lon}°E` : `${-activeData.lon}°W`}
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

export default memo(MarsGlobe);