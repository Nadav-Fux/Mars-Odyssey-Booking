import { useRef, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Sun, Moon, Sunrise, Sunset, Camera, Wind, Gauge } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { useAchievements } from '@/hooks/useAchievements';

/* ================================================================
   MARS SURFACE PANORAMA — UPGRADED

   Cinematic panoramic view of the Martian surface with:
     • Multi-layer parallax terrain
     • Mars sky gradients (butterscotch day, blue dusk, dark night)
     • Animated dust particles
     • Phobos & Deimos moons
     • Time-of-day selector (dawn / day / dusk / night)
     • Stars & twinkling
     • ARES-7 orbital dot
   NEW:
     • Shooting stars (random meteors)
     • Foreground rock silhouettes
     • Rover silhouette
     • Lens flare on sun
     • Atmospheric haze layer
     • Enhanced HUD with live telemetry
     • Smooth time transitions
   ================================================================ */

interface TimePreset {
  id: string;
  label: string;
  icon: typeof Sun;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  horizonGlow: string;
  sunY: number;
  sunColor: string;
  sunOpacity: number;
  starOpacity: number;
  terrainFar: string;
  terrainMid: string;
  terrainNear: string;
  terrainFg: string;
  dustOpacity: number;
  moonOpacity: number;
  temp: string;
  wind: string;
  pressure: string;
}

const TIMES: TimePreset[] = [
{
  id: 'dawn', label: 'DAWN', icon: Sunrise,
  skyTop: '#1a0a2e', skyMid: '#4a1a3d', skyBottom: '#c4603a',
  horizonGlow: 'rgba(255, 140, 50, 0.4)',
  sunY: 0.05, sunColor: '#ff8c32', sunOpacity: 0.9, starOpacity: 0.3,
  terrainFar: '#2a1008', terrainMid: '#1e0a06', terrainNear: '#150805', terrainFg: '#0d0503',
  dustOpacity: 0.15, moonOpacity: 0.4,
  temp: '-78°C', wind: '12 m/s', pressure: '636 Pa'
},
{
  id: 'day', label: 'MIDDAY', icon: Sun,
  skyTop: '#7a4020', skyMid: '#c48050', skyBottom: '#d4a878',
  horizonGlow: 'rgba(212, 168, 120, 0.3)',
  sunY: -0.6, sunColor: '#fff0d0', sunOpacity: 0.7, starOpacity: 0,
  terrainFar: '#6a3018', terrainMid: '#4a2010', terrainNear: '#32150a', terrainFg: '#1e0c06',
  dustOpacity: 0.25, moonOpacity: 0.15,
  temp: '-23°C', wind: '28 m/s', pressure: '720 Pa'
},
{
  id: 'dusk', label: 'DUSK', icon: Sunset,
  skyTop: '#0d1832', skyMid: '#1a2848', skyBottom: '#8a5030',
  horizonGlow: 'rgba(138, 80, 48, 0.5)',
  sunY: 0.1, sunColor: '#4a8ab8', sunOpacity: 0.8, starOpacity: 0.4,
  terrainFar: '#1a1020', terrainMid: '#120a18', terrainNear: '#0a0610', terrainFg: '#060408',
  dustOpacity: 0.1, moonOpacity: 0.6,
  temp: '-58°C', wind: '15 m/s', pressure: '680 Pa'
},
{
  id: 'night', label: 'NIGHT', icon: Moon,
  skyTop: '#020208', skyMid: '#060612', skyBottom: '#0a0a1a',
  horizonGlow: 'rgba(255, 69, 0, 0.08)',
  sunY: 1, sunColor: '#FF4500', sunOpacity: 0, starOpacity: 1,
  terrainFar: '#0a0608', terrainMid: '#080406', terrainNear: '#060304', terrainFg: '#040202',
  dustOpacity: 0.05, moonOpacity: 0.9,
  temp: '-95°C', wind: '5 m/s', pressure: '610 Pa'
}];


/* ── Procedural terrain ── */
function generateTerrain(seed: number, roughness: number, baseY: number, amplitude: number, points: number): string {
  const pts: string[] = [];
  const rand = (i: number) => {
    const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i <= points; i++) {
    const x = i / points * 1000;
    const n1 = Math.sin(i * 0.15 + seed) * amplitude;
    const n2 = Math.sin(i * 0.4 + seed * 2.3) * amplitude * 0.4;
    const n3 = Math.sin(i * 0.8 + seed * 4.7) * amplitude * roughness * 0.2;
    const jitter = (rand(i) - 0.5) * amplitude * roughness * 0.3;
    const y = baseY + n1 + n2 + n3 + jitter;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M0,400 L${pts.join(' L')} L1000,400 Z`;
}

const TERRAIN_FAR = generateTerrain(1.2, 0.3, 200, 50, 80);
const TERRAIN_MID = generateTerrain(3.7, 0.5, 260, 40, 100);
const TERRAIN_NEAR = generateTerrain(7.1, 0.7, 310, 30, 120);
const TERRAIN_FG = generateTerrain(11.3, 0.9, 360, 20, 60);

/* ── Stars ── */
const STARS = Array.from({ length: 150 }, (_, i) => ({
  x: (i * 127.1 + 31.7) % 1000,
  y: (i * 269.3 + 47.2) % 250,
  r: 0.3 + i % 5 * 0.2,
  opacity: 0.3 + i % 7 * 0.1
}));

/* ── Dust particles ── */
const DUST = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: 30 + Math.random() * 60,
  size: 1 + Math.random() * 3,
  speed: 8 + Math.random() * 20,
  opacity: 0.08 + Math.random() * 0.15
}));

/* ── Foreground rocks SVG path ── */
const ROCKS_PATH = 'M0,400 L30,390 L35,375 L42,380 L50,365 L55,370 L65,355 L70,360 L75,370 L90,385 L110,390 L120,380 L125,370 L130,365 L140,375 L150,390 L200,395 L220,388 L225,378 L230,380 L240,370 L245,372 L250,390 L350,395 L355,388 L360,375 L368,370 L372,365 L380,368 L385,372 L390,380 L400,395 L600,398 L610,390 L615,378 L620,372 L628,368 L635,370 L640,375 L650,382 L660,395 L750,398 L760,392 L765,385 L770,378 L775,372 L785,375 L790,380 L800,388 L820,395 L900,398 L905,392 L910,385 L920,380 L930,390 L1000,400 Z';

/* ── Rover silhouette ── */
const ROVER_PATH = 'M680,375 L682,372 L686,370 L690,370 L694,368 L698,368 L700,370 L704,370 L706,372 L708,372 L710,370 L712,368 L714,366 L716,364 L718,362 L720,364 L720,368 L718,370 L716,372 L718,374 L722,374 L724,376 L724,378 L720,378 L718,376 L710,376 L708,378 L706,378 L704,376 L696,376 L694,378 L692,378 L690,376 L682,376 L680,375 Z';

/* ── Shooting star component ── */
function ShootingStar({ index }: {index: number;}) {
  const startX = 100 + Math.random() * 700;
  const startY = 10 + Math.random() * 100;
  return (
    <line
    x1={startX} y1={startY}
    x2={startX + 80} y2={startY + 40}
    stroke="white" strokeWidth="1" strokeLinecap="round"
    opacity="0">

      <animate
      attributeName="opacity"
      values="0;0.7;0" dur="0.8s"
      begin={`${2 + index * 4}s`}
      repeatCount="indefinite" />

      <animate
      attributeName="x1"
      values={`${startX};${startX + 60}`} dur="0.8s"
      begin={`${2 + index * 4}s`}
      repeatCount="indefinite" />

      <animate
      attributeName="y1"
      values={`${startY};${startY + 30}`} dur="0.8s"
      begin={`${2 + index * 4}s`}
      repeatCount="indefinite" />

      <animate
      attributeName="x2"
      values={`${startX + 80};${startX + 140}`} dur="0.8s"
      begin={`${2 + index * 4}s`}
      repeatCount="indefinite" />

      <animate
      attributeName="y2"
      values={`${startY + 40};${startY + 70}`} dur="0.8s"
      begin={`${2 + index * 4}s`}
      repeatCount="indefinite" />

    </line>);

}

export default function MarsPanorama() {
  const [timeIdx, setTimeIdx] = useState(0);
  const t = TIMES[timeIdx];
  const { unlock } = useAchievements();

  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0, y: 40, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%' }
    });
  }, { scope: ref });

  return (
    <section ref={ref} className="relative z-10 py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Section header */}
        <div className="mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            SURFACE VIEW
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            VIEW FROM THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">SURFACE</span>
          </h2>
          <p className="text-white/30 text-sm sm:text-base max-w-md leading-relaxed">
            See Mars through the eyes of an explorer. Toggle the time of day to witness the alien beauty of Martian skies.
          </p>
        </div>

        {/* Panorama viewport */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black group">
          {/* Aspect ratio container */}
          <div className="relative w-full" style={{ paddingBottom: '42%', minHeight: 280 }}>
            <svg
            viewBox="0 0 1000 420"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice">

              <defs>
                <linearGradient id="pano-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.skyTop}>
                    <animate attributeName="stop-color" to={t.skyTop} dur="1.5s" fill="freeze" />
                  </stop>
                  <stop offset="50%" stopColor={t.skyMid}>
                    <animate attributeName="stop-color" to={t.skyMid} dur="1.5s" fill="freeze" />
                  </stop>
                  <stop offset="100%" stopColor={t.skyBottom}>
                    <animate attributeName="stop-color" to={t.skyBottom} dur="1.5s" fill="freeze" />
                  </stop>
                </linearGradient>

                <radialGradient id="pano-sun" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={t.sunColor} stopOpacity="1" />
                  <stop offset="30%" stopColor={t.sunColor} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={t.sunColor} stopOpacity="0" />
                </radialGradient>

                <radialGradient id="pano-horizon" cx="50%" cy="100%" r="60%">
                  <stop offset="0%" stopColor={t.horizonGlow} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                {/* Lens flare gradient */}
                <radialGradient id="pano-flare" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={t.sunColor} stopOpacity="0.3" />
                  <stop offset="40%" stopColor={t.sunColor} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={t.sunColor} stopOpacity="0" />
                </radialGradient>

                {/* Atmospheric haze */}
                <linearGradient id="pano-haze" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="60%" stopColor="transparent" />
                  <stop offset="100%" stopColor={t.skyBottom} stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Sky */}
              <rect x="0" y="0" width="1000" height="420" fill="url(#pano-sky)" />

              {/* Horizon glow */}
              <ellipse cx="500" cy="300" rx="600" ry="200" fill="url(#pano-horizon)"
              style={{ transition: 'opacity 1.5s', opacity: t.sunOpacity > 0 ? 1 : 0.3 }} />

              {/* Stars */}
              <g style={{ transition: 'opacity 1.5s', opacity: t.starOpacity }}>
                {STARS.map((s, i) =>
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity}>
                    {i % 6 === 0 &&
                  <animate
                  attributeName="opacity" values={`${s.opacity};${s.opacity * 0.2};${s.opacity}`}
                  dur={`${2 + i % 3}s`} repeatCount="indefinite" />

                  }
                  </circle>
                )}
              </g>

              {/* Shooting stars (visible at night/dusk) */}
              <g style={{ transition: 'opacity 1.5s', opacity: t.starOpacity * 0.8 }}>
                <ShootingStar index={0} />
                <ShootingStar index={1} />
                <ShootingStar index={2} />
              </g>

              {/* Sun + lens flare */}
              {t.sunOpacity > 0 &&
              <g style={{ transition: 'transform 1.5s, opacity 1.5s', opacity: t.sunOpacity }}>
                  {/* Main sun glow */}
                  <circle cx="500" cy={220 + t.sunY * 150} r="70" fill="url(#pano-sun)" />
                  {/* Sun disc */}
                  <circle cx="500" cy={220 + t.sunY * 150} r="14" fill={t.sunColor} opacity="0.95" />
                  {/* Lens flare */}
                  <ellipse cx="500" cy={220 + t.sunY * 150} rx="120" ry="3" fill={t.sunColor} opacity="0.15">
                    <animate attributeName="rx" values="100;140;100" dur="4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.1;0.2;0.1" dur="4s" repeatCount="indefinite" />
                  </ellipse>
                  {/* Vertical flare */}
                  <ellipse cx="500" cy={220 + t.sunY * 150} rx="2" ry="60" fill={t.sunColor} opacity="0.08">
                    <animate attributeName="ry" values="50;70;50" dur="5s" repeatCount="indefinite" />
                  </ellipse>
                  {/* Secondary flare dot */}
                  <circle cx="540" cy={250 + t.sunY * 100} r="15" fill="url(#pano-flare)" />
                  <circle cx="460" cy={280 + t.sunY * 80} r="8" fill="url(#pano-flare)" opacity="0.5" />
                </g>
              }

              {/* Phobos */}
              <g style={{ transition: 'opacity 1.5s', opacity: t.moonOpacity }}>
                <circle cx="750" cy="80" r="6" fill="#a0907a" opacity="0.7">
                  <animate attributeName="cx" values="750;790;750" dur="20s" repeatCount="indefinite" />
                </circle>
                <ellipse cx="748" cy="79" rx="3" ry="4" fill="#8a7a64" opacity="0.3">
                  <animate attributeName="cx" values="748;788;748" dur="20s" repeatCount="indefinite" />
                </ellipse>
              </g>

              {/* Deimos */}
              <g style={{ transition: 'opacity 1.5s', opacity: t.moonOpacity * 0.6 }}>
                <circle cx="300" cy="60" r="2.5" fill="#b0a090" opacity="0.5">
                  <animate attributeName="cx" values="300;325;300" dur="35s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* ARES-7 orbital */}
              <g opacity="0.5">
                <circle r="1.5" fill="#FF4500">
                  <animate attributeName="cx" values="100;900" dur="12s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="40;30;50;40" dur="12s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="none" stroke="#FF4500" strokeWidth="0.3" opacity="0.3">
                  <animate attributeName="cx" values="100;900" dur="12s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="40;30;50;40" dur="12s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2;6;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Terrain layers */}
              <path d={TERRAIN_FAR} fill={t.terrainFar} style={{ transition: 'fill 1.5s' }} />

              {/* Atmospheric haze between layers */}
              <rect x="0" y="200" width="1000" height="220" fill="url(#pano-haze)" style={{ transition: 'opacity 1.5s', opacity: 0.4 }} />

              <path d={TERRAIN_MID} fill={t.terrainMid} style={{ transition: 'fill 1.5s' }} />
              <path d={TERRAIN_NEAR} fill={t.terrainNear} style={{ transition: 'fill 1.5s' }} />

              {/* Rover silhouette on near terrain */}
              <path d={ROVER_PATH} fill={t.terrainFg} stroke={t.skyBottom} strokeWidth="0.3" strokeOpacity="0.2"
              style={{ transition: 'fill 1.5s' }} />
              {/* Rover antenna blink */}
              <circle cx="717" cy="361" r="1" fill="#FF4500" opacity="0">
                <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" />
              </circle>

              <path d={TERRAIN_FG} fill={t.terrainFg} style={{ transition: 'fill 1.5s' }} />

              {/* Foreground rocks */}
              <path d={ROCKS_PATH} fill={t.terrainFg} style={{ transition: 'fill 1.5s' }} />
              <path d={ROCKS_PATH} fill="none" stroke={t.skyBottom} strokeWidth="0.5" strokeOpacity="0.1"
              style={{ transition: 'stroke 1.5s' }} />

              {/* Terrain edge highlight */}
              <path d={TERRAIN_NEAR} fill="none" stroke={t.skyBottom} strokeWidth="0.5" strokeOpacity="0.15"
              style={{ transition: 'stroke 1.5s' }} />
            </svg>

            {/* Dust particles overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ transition: 'opacity 1.5s', opacity: t.dustOpacity }}>
              {DUST.map((d) =>
              <div
              key={d.id}
              className="absolute rounded-full bg-orange-200/80"
              style={{
                width: d.size, height: d.size,
                top: `${d.y}%`, left: `${d.x}%`,
                opacity: d.opacity,
                animation: `pano-drift ${d.speed}s linear infinite`
              }} />

              )}
            </div>

            {/* HUD overlay - top left */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400/60 animate-pulse" />
              <span className="text-[8px] sm:text-[9px] font-display tracking-[0.2em] text-white/50">SURFACE CAM FEED</span>
            </div>

            {/* HUD overlay - top right */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              <Camera className="w-3 h-3 text-white/50" />
              <span className="text-[8px] sm:text-[9px] font-display tracking-[0.15em] text-white/50">
                JEZERO CRATER · 18°N 77°E
              </span>
            </div>

            {/* HUD overlay - bottom telemetry */}
            <div className="absolute bottom-12 sm:bottom-14 left-3 sm:left-4 flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/30 backdrop-blur-sm border border-white/[0.04]">
                <Gauge className="w-2.5 h-2.5 text-primary/50" />
                <span className="text-[7px] sm:text-[8px] font-display tracking-wider text-white/30">{t.temp}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-black/30 backdrop-blur-sm border border-white/[0.04]">
                <Wind className="w-2.5 h-2.5 text-accent/50" />
                <span className="text-[7px] sm:text-[8px] font-display tracking-wider text-white/30">{t.wind}</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-black/30 backdrop-blur-sm border border-white/[0.04]">
                <span className="text-[7px] sm:text-[8px] font-display tracking-wider text-white/30">{t.pressure}</span>
              </div>
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)'
            }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)'
            }} />
          </div>

          {/* Time selector bar */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4 bg-black/60 border-t border-white/[0.06]">
            {TIMES.map((preset, i) => {
              const Icon = preset.icon;
              return (
                <button
                key={preset.id}
                onClick={() => {setTimeIdx(i);if (preset.id === 'night') unlock('night_sky');}}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-display tracking-wider transition-all duration-300 ${
                preset.id === timeIdx ?
                'bg-primary/15 border border-primary/30 text-primary shadow-lg shadow-primary/10' :
                'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/60 hover:bg-white/[0.06]'}`
                }>

                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden min-[400px]:inline">{preset.label}</span>
                </button>);

            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pano-drift {
          from { transform: translateX(0); }
          to { transform: translateX(120vw); }
        }
      `}</style>
    </section>);

}