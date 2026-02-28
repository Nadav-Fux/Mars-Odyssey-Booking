import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   BLUEPRINT DETAIL OVERLAY

   Full-screen glass-card overlay that shows detailed specs for a
   clicked ship subsystem. Features:

   • Zoomed-in dedicated schematic SVG per component
   • Spec list with status indicators
   • Animated entry/exit
   • Close on backdrop click, X button, or Escape
   ================================================================ */

export interface SubsystemDetail {
  id: string;
  label: string;
  color: string;
  description: string;
  specs: {label: string;value: string;status?: 'ok' | 'warn';}[];
  schematic: React.ReactNode; // SVG content
}

// ── Per-subsystem data ──
export const SUBSYSTEM_DATA: Record<string, SubsystemDetail> = {
  cockpit: {
    id: 'cockpit',
    label: 'COMMAND MODULE',
    color: '#4ab8c4',
    description:
    'The nerve center of the Ares-7. Houses the QN-7000 quantum navigation core, ' +
    'AI flight-control systems, holographic tactical display, and crew stations for ' +
    'the Commander, Pilot, and Navigation Officer. Armored with 12cm composite plating.',
    specs: [
    { label: 'Navigation', value: 'QN-7000 Quantum Core', status: 'ok' },
    { label: 'Crew Stations', value: '3 Primary + 2 Aux' },
    { label: 'Sensor Dome', value: 'Multi-spectrum 360°', status: 'ok' },
    { label: 'Armor', value: '12cm Composite', status: 'ok' },
    { label: 'Emergency', value: 'Detachable Escape Pod' },
    { label: 'AI System', value: 'HELIOS v4.2 Autopilot' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        <path d="M50 60 Q200 70 260 100 Q200 130 50 140" stroke="#4ab8c4" strokeWidth="1.5" strokeOpacity="0.7" />
        <path d="M60 68 Q190 76 248 100 Q190 124 60 132" stroke="#4ab8c4" strokeWidth="0.7" strokeOpacity="0.3" />
        <path d="M80 76 Q180 82 236 100 Q180 118 80 124" stroke="#4ab8c4" strokeWidth="0.5" strokeOpacity="0.2" />
        <circle cx="250" cy="100" r="8" stroke="#4ab8c4" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="250" cy="100" r="3" fill="#4ab8c4" fillOpacity="0.4" />
        <line x1="70" y1="90" x2="200" y2="90" stroke="#4ab8c4" strokeWidth="0.4" strokeOpacity="0.2" />
        <line x1="70" y1="110" x2="200" y2="110" stroke="#4ab8c4" strokeWidth="0.4" strokeOpacity="0.2" />
        <rect x="90" y="85" width="30" height="12" rx="2" stroke="#4ab8c4" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="130" y="85" width="30" height="12" rx="2" stroke="#4ab8c4" strokeWidth="0.5" strokeOpacity="0.3" />
        <rect x="110" y="103" width="30" height="12" rx="2" stroke="#4ab8c4" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="105" y="93" fill="#4ab8c4" fillOpacity="0.3" fontSize="5" fontFamily="monospace">CDR</text>
        <text x="145" y="93" fill="#4ab8c4" fillOpacity="0.3" fontSize="5" fontFamily="monospace">PLT</text>
        <text x="125" y="111" fill="#4ab8c4" fillOpacity="0.3" fontSize="5" fontFamily="monospace">NAV</text>
        <text x="240" y="80" fill="#4ab8c4" fillOpacity="0.3" fontSize="5" fontFamily="monospace">SENSOR</text>
      </svg>

  },
  engines: {
    id: 'engines',
    label: 'NTP ENGINES',
    color: '#ff6b35',
    description:
    'Dual Nuclear Thermal Propulsion nacelles producing 4.2 teranewtons of combined thrust. ' +
    'Bi-modal reactor with fallback chemical propulsion. Tungsten-lined exhaust cones rated ' +
    'for 2,800°C continuous operation. Fuel: enriched liquid hydrogen.',
    specs: [
    { label: 'Thrust', value: '4.2 TN Combined', status: 'ok' },
    { label: 'Fuel', value: 'Enriched LH₂' },
    { label: 'Reactor Type', value: 'Bi-Modal NTP' },
    { label: 'Exhaust Temp', value: '2,800°C Max', status: 'warn' },
    { label: 'Nacelles', value: '2× Redundant' },
    { label: 'Backup', value: 'Chemical Fallback', status: 'ok' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        <rect x="140" y="50" width="80" height="40" rx="5" stroke="#ff6b35" strokeWidth="1.2" strokeOpacity="0.6" />
        <rect x="140" y="110" width="80" height="40" rx="5" stroke="#ff6b35" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="180" cy="70" r="10" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="180" cy="70" r="4" fill="#ff6b35" fillOpacity="0.3" />
        <circle cx="180" cy="130" r="10" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="180" cy="130" r="4" fill="#ff6b35" fillOpacity="0.3" />
        <path d="M140 52 L105 42 L105 88 L140 88" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M140 112 L105 102 L105 148 L140 148" stroke="#ff6b35" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M105 46 L65 36 L65 94 L105 86" stroke="#FF4500" strokeWidth="0.6" strokeOpacity="0.3" />
        <path d="M105 106 L65 96 L65 154 L105 146" stroke="#FF4500" strokeWidth="0.6" strokeOpacity="0.3" />
        <ellipse cx="55" cy="65" rx="15" ry="6" fill="#ff6b35" fillOpacity="0.15">
          <animate attributeName="rx" values="15;22;15" dur="1s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="55" cy="125" rx="15" ry="6" fill="#ff6b35" fillOpacity="0.15">
          <animate attributeName="rx" values="15;22;15" dur="1s" repeatCount="indefinite" />
        </ellipse>
        <line x1="220" y1="70" x2="250" y2="85" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.3" />
        <line x1="220" y1="130" x2="250" y2="115" stroke="#ff6b35" strokeWidth="0.4" strokeOpacity="0.3" />
        <text x="155" y="73" fill="#ff6b35" fillOpacity="0.3" fontSize="6" fontFamily="monospace">REACTOR-1</text>
        <text x="155" y="133" fill="#ff6b35" fillOpacity="0.3" fontSize="6" fontFamily="monospace">REACTOR-2</text>
      </svg>

  },
  habitat: {
    id: 'habitat',
    label: 'HABITAT RING',
    color: '#a855f7',
    description:
    'Rotating habitat ring providing 0.38g artificial gravity — matching Mars surface gravity. ' +
    'Houses 120 luxury cabins, 3 restaurants, medical bay, hydroponic gardens, zero-G recreation ' +
    'center, and the 360° Star Lounge observation deck.',
    specs: [
    { label: 'Gravity', value: '0.38g Rotational', status: 'ok' },
    { label: 'Cabins', value: '120 Luxury Units' },
    { label: 'Restaurants', value: '3 Michelin-starred' },
    { label: 'Medical', value: 'Full Surgical Bay', status: 'ok' },
    { label: 'Gardens', value: '450 m² Hydroponic' },
    { label: 'Recreation', value: 'Zero-G Sports Dome' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        <ellipse cx="150" cy="100" rx="90" ry="70" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.5" />
        <ellipse cx="150" cy="100" rx="72" ry="56" stroke="#a855f7" strokeWidth="0.5" strokeOpacity="0.25" strokeDasharray="4 6" />
        <line x1="80" y1="60" x2="220" y2="60" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.15" />
        <line x1="80" y1="140" x2="220" y2="140" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.15" />
        <line x1="100" y1="35" x2="100" y2="165" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.12" />
        <line x1="200" y1="35" x2="200" y2="165" stroke="#a855f7" strokeWidth="0.3" strokeOpacity="0.12" />
        <rect x="135" y="85" width="30" height="30" rx="4" stroke="#a855f7" strokeWidth="0.5" strokeOpacity="0.3" />
        <line x1="142" y1="100" x2="158" y2="100" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.3" />
        <line x1="150" y1="92" x2="150" y2="108" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.3" />
        <text x="150" y="80" textAnchor="middle" fill="#a855f7" fillOpacity="0.3" fontSize="5" fontFamily="monospace">LIFE SUPPORT</text>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) =>
      <circle key={deg} cx={150 + 80 * Math.cos(deg * Math.PI / 180)} cy={100 + 62 * Math.sin(deg * Math.PI / 180)} r="3" stroke="#a855f7" strokeWidth="0.4" strokeOpacity="0.3" fill="#a855f7" fillOpacity="0.06" />
      )}
      </svg>

  },
  cargo: {
    id: 'cargo',
    label: 'CARGO BAY',
    color: '#6b8aed',
    description:
    'Twin pressurized cargo modules with 240 m³ total capacity. Modular container system, ' +
    'automated robotic loading arms, and forward docking port for orbital resupply missions. ' +
    'Temperature-controlled sections for biological specimens and sensitive equipment.',
    specs: [
    { label: 'Capacity', value: '240 m³ Total', status: 'ok' },
    { label: 'Modules', value: '2× Pressurized' },
    { label: 'Loading', value: 'Robotic Arms' },
    { label: 'Docking Port', value: 'Universal Standard' },
    { label: 'Temperature', value: '-20°C to +40°C' },
    { label: 'Payload', value: '18,000 kg Max' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        <rect x="80" y="40" width="70" height="50" rx="4" stroke="#6b8aed" strokeWidth="1" strokeOpacity="0.5" />
        <rect x="80" y="110" width="70" height="50" rx="4" stroke="#6b8aed" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="115" y1="40" x2="115" y2="90" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.3" />
        <line x1="115" y1="110" x2="115" y2="160" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.3" />
        <rect x="88" y="48" width="15" height="15" rx="2" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.2" />
        <rect x="88" y="118" width="15" height="15" rx="2" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.2" />
        <circle cx="210" cy="100" r="14" stroke="#6b8aed" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="210" cy="100" r="7" stroke="#6b8aed" strokeWidth="0.4" strokeOpacity="0.5" />
        <line x1="150" y1="65" x2="196" y2="100" stroke="#6b8aed" strokeWidth="0.3" strokeOpacity="0.2" strokeDasharray="4 3" />
        <text x="115" y="38" textAnchor="middle" fill="#6b8aed" fillOpacity="0.3" fontSize="5" fontFamily="monospace">BAY-A</text>
        <text x="115" y="108" textAnchor="middle" fill="#6b8aed" fillOpacity="0.3" fontSize="5" fontFamily="monospace">BAY-B</text>
        <text x="210" y="80" textAnchor="middle" fill="#6b8aed" fillOpacity="0.3" fontSize="5" fontFamily="monospace">DOCK</text>
      </svg>

  },
  solar: {
    id: 'solar',
    label: 'SOLAR / POWER',
    color: '#eab308',
    description:
    'Primary power from a compact fusion reactor (840 MW) supplemented by deployable photovoltaic ' +
    'arrays for backup. Retractable heat radiator panels for thermal management. High-gain ' +
    'laser communications antenna for 12 Gbps Earth link via L2 relay chain.',
    specs: [
    { label: 'Primary Power', value: '840 MW Fusion', status: 'ok' },
    { label: 'Solar Backup', value: '2× Deployable Arrays' },
    { label: 'Radiators', value: 'Retractable Panels' },
    { label: 'Comms', value: '12 Gbps Laser Link', status: 'ok' },
    { label: 'Antenna', value: 'High-gain Directional' },
    { label: 'Battery', value: '72hr Reserve', status: 'ok' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        <rect x="90" y="30" width="80" height="14" rx="2" stroke="#eab308" strokeWidth="0.8" strokeOpacity="0.5" />
        <rect x="90" y="156" width="80" height="14" rx="2" stroke="#eab308" strokeWidth="0.8" strokeOpacity="0.5" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) =>
      <g key={i}>
            <line x1={96 + i * 11} y1="30" x2={96 + i * 11} y2="44" stroke="#eab308" strokeWidth="0.3" strokeOpacity="0.2" />
            <line x1={96 + i * 11} y1="156" x2={96 + i * 11} y2="170" stroke="#eab308" strokeWidth="0.3" strokeOpacity="0.2" />
          </g>
      )}
        <line x1="130" y1="44" x2="130" y2="80" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.3" />
        <line x1="130" y1="120" x2="130" y2="156" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.3" />
        <line x1="200" y1="80" x2="200" y2="40" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
        <circle cx="200" cy="36" r="5" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.4" />
        <line x1="196" y1="36" x2="204" y2="36" stroke="#eab308" strokeWidth="0.3" strokeOpacity="0.3" />
        <rect x="220" y="24" width="40" height="8" rx="1.5" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.3" />
        <rect x="220" y="168" width="40" height="8" rx="1.5" stroke="#eab308" strokeWidth="0.4" strokeOpacity="0.3" />
        <text x="130" y="104" textAnchor="middle" fill="#eab308" fillOpacity="0.3" fontSize="6" fontFamily="monospace">FUSION CORE</text>
        <text x="200" y="28" textAnchor="middle" fill="#eab308" fillOpacity="0.3" fontSize="4" fontFamily="monospace">ANTENNA</text>
        <text x="240" y="22" textAnchor="middle" fill="#eab308" fillOpacity="0.3" fontSize="4" fontFamily="monospace">RADIATOR</text>
      </svg>

  },
  wings: {
    id: 'wings',
    label: 'STABILIZER FINS',
    color: '#FF4500',
    description:
    'Dorsal and ventral stabilizer fins provide attitude control during atmospheric entry ' +
    'and aerobraking maneuvers. Internal structural ribs of titanium-carbon composite. ' +
    'Tip-mounted navigation beacons and secondary sensor arrays.',
    specs: [
    { label: 'Configuration', value: 'Dorsal + Ventral' },
    { label: 'Material', value: 'Ti-Carbon Composite' },
    { label: 'Function', value: 'Atmospheric Stability' },
    { label: 'Nav Beacons', value: '2× Tip-mounted', status: 'ok' },
    { label: 'Sensors', value: 'Secondary Arrays' },
    { label: 'Aft Stabilizers', value: '2× Canard Fins' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        <path d="M100 100 L140 30 L175 35 L150 100" stroke="#FF4500" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M100 100 L140 170 L175 165 L150 100" stroke="#FF4500" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="110" y1="80" x2="152" y2="38" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <line x1="125" y1="85" x2="163" y2="46" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <line x1="110" y1="120" x2="152" y2="162" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <line x1="125" y1="115" x2="163" y2="154" stroke="#FF4500" strokeWidth="0.3" strokeOpacity="0.2" />
        <circle cx="145" cy="32" r="3" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.4" fill="#FF4500" fillOpacity="0.15">
          <animate attributeName="fillOpacity" values="0.15;0.4;0.15" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="145" cy="168" r="3" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.4" fill="#FF4500" fillOpacity="0.15">
          <animate attributeName="fillOpacity" values="0.15;0.4;0.15" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="160" y="28" fill="#FF4500" fillOpacity="0.3" fontSize="5" fontFamily="monospace">NAV BEACON</text>
      </svg>

  },
  rcs: {
    id: 'rcs',
    label: 'RCS THRUSTERS',
    color: '#22d3ee',
    description:
    'Reaction Control System with 8 thruster quads providing 6-axis attitude control. ' +
    'Used for orbital insertion, docking maneuvers, and fine-tuning trajectory during ' +
    'aerobraking. Monopropellant hydrazine with electric heating.',
    specs: [
    { label: 'Quads', value: '8× Thruster Pods' },
    { label: 'Axes', value: '6-axis Control', status: 'ok' },
    { label: 'Fuel', value: 'Monopropellant N₂H₄' },
    { label: 'Response', value: '<50ms Firing' },
    { label: 'Use', value: 'Docking + Trim' },
    { label: 'Redundancy', value: '2× Backup Quads', status: 'ok' }],

    schematic:
    <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
        {[{ x: 80, y: 50 }, { x: 80, y: 130 }, { x: 180, y: 50 }, { x: 180, y: 130 }].map((pos, i) =>
      <g key={i}>
            <rect x={pos.x} y={pos.y} width="20" height="12" rx="2" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.5" />
            <line x1={pos.x + 10} y1={pos.y} x2={pos.x + 10} y2={pos.y + 12} stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.25" />
            <path d={`M${pos.x + 10} ${pos.y - 2} L${pos.x + 14} ${pos.y - 8} L${pos.x + 6} ${pos.y - 8} Z`} stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.3" />
          </g>
      )}
        <line x1="100" y1="62" x2="100" y2="130" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.15" strokeDasharray="3 4" />
        <line x1="200" y1="62" x2="200" y2="130" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.15" strokeDasharray="3 4" />
        <line x1="100" y1="96" x2="200" y2="96" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.15" strokeDasharray="3 4" />
        <text x="150" y="100" textAnchor="middle" fill="#22d3ee" fillOpacity="0.25" fontSize="6" fontFamily="monospace">6-AXIS</text>
      </svg>

  }
};

interface Props {
  zoneId: string | null;
  onClose: () => void;
}

function BlueprintDetailOverlay({ zoneId, onClose }: Props) {
  const data = zoneId ? SUBSYSTEM_DATA[zoneId] : null;

  // Close on Escape
  useEffect(() => {
    if (!zoneId) return;
    const handler = (e: KeyboardEvent) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoneId, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (zoneId) {
      document.body.style.overflow = 'hidden';
      return () => {document.body.style.overflow = '';};
    }
  }, [zoneId]);

  return createPortal(
    <AnimatePresence>
      {data &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">

          {/* Backdrop — click to close */}
          <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose} />


          {/* Card */}
          <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.45, ease: EXPO_OUT }}
          className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'rgba(10,10,18,0.95)',
            border: `1px solid ${data.color}25`,
            boxShadow: `0 0 80px ${data.color}10, 0 25px 60px rgba(0,0,0,0.5)`
          }}>

            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${data.color}50, transparent)` }} />

            {/* Close button */}
            <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all cursor-pointer">

              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: data.color, boxShadow: `0 0 8px ${data.color}60` }} />
                <span className="text-[9px] font-display tracking-[0.25em]" style={{ color: `${data.color}80` }}>SUBSYSTEM DETAIL</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3" style={{ color: data.color }}>
                {data.label}
              </h3>
              <p className="text-white/35 text-sm leading-relaxed mb-8 max-w-xl">
                {data.description}
              </p>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Schematic */}
                <div
              className="rounded-xl overflow-hidden p-4"
              style={{ background: `${data.color}06`, border: `1px solid ${data.color}12` }}>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${data.color}60` }} />
                    <span className="text-[8px] font-display tracking-[0.15em]" style={{ color: `${data.color}50` }}>SCHEMATIC VIEW</span>
                  </div>
                  <div className="aspect-[3/2]">
                    {data.schematic}
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${data.color}20, transparent)` }} />
                    <span className="text-[8px] font-display tracking-[0.2em]" style={{ color: `${data.color}50` }}>SPECIFICATIONS</span>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${data.color}20)` }} />
                  </div>

                  <div className="space-y-2.5">
                    {data.specs.map((spec, i) =>
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: EXPO_OUT }}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>

                        <span className="text-[10px] font-display tracking-[0.1em] text-white/30">{spec.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-display font-medium text-white/60">{spec.value}</span>
                          {spec.status === 'ok' && <CheckCircle className="w-3 h-3 text-green-500/60" />}
                          {spec.status === 'warn' && <AlertTriangle className="w-3 h-3 text-yellow-500/60" />}
                        </div>
                      </motion.div>
                  )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${data.color}10` }}>
                <span className="text-[8px] font-display tracking-[0.12em] text-white/10">
                  ARES-7 TECHNICAL MANUAL · REV 4.2
                </span>
                <span className="text-[8px] font-display tracking-[0.12em]" style={{ color: `${data.color}30` }}>
                  CLICK OUTSIDE OR ESC TO CLOSE
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}

export default memo(BlueprintDetailOverlay);