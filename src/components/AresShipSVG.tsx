import { memo } from 'react';

/* ================================================================
   ARES-7 SHIP SVG — Cinematic Profile

   A sleek, highly detailed interplanetary craft.
   Features:
     • Metallic hull with subsurface detail
     • Illuminated cockpit with HUD glow
     • Dual main engines with animated plasma exhaust
     • RCS pods, antenna array, solar radiators
     • Animated nav beacons & reactor cores
     • Habitat module with viewport windows

   Faces RIGHT (nose → right) for the flythrough trajectory.
   ================================================================ */

interface AresShipSVGProps {
  size?: number;
  thrust?: number;
  className?: string;
}

function AresShipSVG({ size = 120, thrust = 0.7, className = '' }: AresShipSVGProps) {
  const eo = 0.3 + thrust * 0.7; // exhaust opacity
  const es = 0.4 + thrust * 0.6; // exhaust scale

  return (
    <svg
    viewBox="0 0 260 100"
    width={size}
    height={size * 0.385}
    fill="none"
    className={className}
    style={{ filter: `drop-shadow(0 0 8px rgba(255,69,0,${0.2 + thrust * 0.2}))` }}>

      <defs>
        {/* Hull body gradient — titanium look */}
        <linearGradient id="hull-main" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8dce6" />
          <stop offset="30%" stopColor="#b0b8c8" />
          <stop offset="60%" stopColor="#7a8598" />
          <stop offset="100%" stopColor="#4a5568" />
        </linearGradient>

        {/* Hull underside */}
        <linearGradient id="hull-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        {/* Cockpit glass */}
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.5" />
        </linearGradient>

        {/* Engine nacelle metal */}
        <linearGradient id="engine-metal" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="50%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        {/* Plasma exhaust */}
        <radialGradient id="plasma" cx="100%" cy="50%" r="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="8%" stopColor="#fef3c7" stopOpacity="0.95" />
          <stop offset="20%" stopColor="#ffaa30" stopOpacity="0.7" />
          <stop offset="45%" stopColor="#ff6b35" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#FF4500" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0" />
        </radialGradient>

        {/* Engine bell inner glow */}
        <radialGradient id="bell-glow" cx="80%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#ffaa30" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Soft glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="blur-soft">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id="blur-wide">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        {/* Solar panel gradient */}
        <linearGradient id="solar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="50%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
      </defs>

      {/* ══════ ENGINE EXHAUST PLUMES ══════ */}
      <g style={{ opacity: eo }}>
        {/* Upper engine plume — wide soft glow */}
        <ellipse cx="26" cy="32" rx={30 * es} ry={7 * es} fill="url(#plasma)" filter="url(#blur-wide)">
          <animate attributeName="rx" values={`${28 * es};${36 * es};${28 * es}`} dur="0.15s" repeatCount="indefinite" />
          <animate attributeName="ry" values={`${6 * es};${8 * es};${6 * es}`} dur="0.2s" repeatCount="indefinite" />
        </ellipse>
        {/* Upper engine plume — bright core */}
        <ellipse cx="32" cy="32" rx={14 * es} ry={3.5 * es} fill="#fff" opacity={0.5 * thrust} filter="url(#blur-soft)">
          <animate attributeName="rx" values={`${12 * es};${16 * es};${12 * es}`} dur="0.12s" repeatCount="indefinite" />
        </ellipse>

        {/* Lower engine plume */}
        <ellipse cx="26" cy="68" rx={30 * es} ry={7 * es} fill="url(#plasma)" filter="url(#blur-wide)">
          <animate attributeName="rx" values={`${28 * es};${36 * es};${28 * es}`} dur="0.15s" repeatCount="indefinite" begin="0.03s" />
          <animate attributeName="ry" values={`${6 * es};${8 * es};${6 * es}`} dur="0.2s" repeatCount="indefinite" begin="0.03s" />
        </ellipse>
        <ellipse cx="32" cy="68" rx={14 * es} ry={3.5 * es} fill="#fff" opacity={0.5 * thrust} filter="url(#blur-soft)">
          <animate attributeName="rx" values={`${12 * es};${16 * es};${12 * es}`} dur="0.12s" repeatCount="indefinite" begin="0.03s" />
        </ellipse>

        {/* Mach diamonds (shock patterns in exhaust) */}
        {[0, 1, 2].map((i) =>
        <g key={`md-${i}`} opacity={0.15 - i * 0.04}>
            <circle cx={20 - i * 8} cy={32} r={1.2 - i * 0.3} fill="#ffcc00">
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.1s" repeatCount="indefinite" />
            </circle>
            <circle cx={20 - i * 8} cy={68} r={1.2 - i * 0.3} fill="#ffcc00">
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.1s" repeatCount="indefinite" begin="0.03s" />
            </circle>
          </g>
        )}
      </g>

      {/* ══════ ENGINE NACELLES ══════ */}
      {/* Upper nacelle */}
      <rect x="36" y="24" width="40" height="16" rx="3" fill="url(#engine-metal)" stroke="#9ca3af" strokeWidth="0.4" />
      {/* Engine bell */}
      <path d="M36 26 L30 24 L30 40 L36 38" fill="#4b5563" stroke="#6b7280" strokeWidth="0.3" />
      {/* Bell inner glow */}
      <rect x="30" y="25" width="7" height="14" rx="1" fill="url(#bell-glow)" opacity={thrust * 0.6} />
      {/* Nacelle detail lines */}
      <line x1="45" y1="24" x2="45" y2="40" stroke="#9ca3af" strokeWidth="0.2" opacity="0.3" />
      <line x1="55" y1="24" x2="55" y2="40" stroke="#9ca3af" strokeWidth="0.2" opacity="0.3" />
      <line x1="65" y1="24" x2="65" y2="40" stroke="#9ca3af" strokeWidth="0.2" opacity="0.3" />
      {/* Reactor core */}
      <circle cx="52" cy="32" r="5" fill="none" stroke="#ff6b35" strokeWidth="0.5" opacity="0.25" />
      <circle cx="52" cy="32" r="2" fill="#ff6b35" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="52" cy="32" r="3" fill="none" stroke="#ff6b35" strokeWidth="0.3" opacity="0.15">
        <animate attributeName="r" values="3;4;3" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="1.2s" repeatCount="indefinite" />
      </circle>

      {/* Lower nacelle */}
      <rect x="36" y="60" width="40" height="16" rx="3" fill="url(#engine-metal)" stroke="#9ca3af" strokeWidth="0.4" />
      <path d="M36 62 L30 60 L30 76 L36 74" fill="#4b5563" stroke="#6b7280" strokeWidth="0.3" />
      <rect x="30" y="61" width="7" height="14" rx="1" fill="url(#bell-glow)" opacity={thrust * 0.6} />
      <line x1="45" y1="60" x2="45" y2="76" stroke="#9ca3af" strokeWidth="0.2" opacity="0.3" />
      <line x1="55" y1="60" x2="55" y2="76" stroke="#9ca3af" strokeWidth="0.2" opacity="0.3" />
      <line x1="65" y1="60" x2="65" y2="76" stroke="#9ca3af" strokeWidth="0.2" opacity="0.3" />
      <circle cx="52" cy="68" r="5" fill="none" stroke="#ff6b35" strokeWidth="0.5" opacity="0.25" />
      <circle cx="52" cy="68" r="2" fill="#ff6b35" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="0.8s" repeatCount="indefinite" begin="0.3s" />
      </circle>

      {/* ══════ PYLONS (connect nacelles to hull) ══════ */}
      <path d="M70 32 L80 40" stroke="#9ca3af" strokeWidth="2" />
      <path d="M70 32 L80 40" stroke="#d1d5db" strokeWidth="0.6" />
      <path d="M70 68 L80 60" stroke="#9ca3af" strokeWidth="2" />
      <path d="M70 68 L80 60" stroke="#d1d5db" strokeWidth="0.6" />

      {/* ══════ MAIN HULL ══════ */}
      <path
      d="M76 34 L138 28 Q170 35 190 50 Q170 65 138 72 L76 66 Q64 50 76 34Z"
      fill="url(#hull-main)" stroke="#c0c8d8" strokeWidth="0.5" />

      {/* Hull highlight streak */}
      <path
      d="M84 36 L138 30 Q162 37 175 46"
      fill="none" stroke="white" strokeWidth="0.4" opacity="0.2" />

      {/* Hull underside shadow */}
      <path
      d="M84 62 L138 68 Q162 63 175 54"
      fill="none" stroke="#374151" strokeWidth="0.6" opacity="0.3" />


      {/* Hull panel lines */}
      {[92, 108, 124, 140, 156].map((x) =>
      <line key={x} x1={x} y1={29 + (x - 76) * 0.02} x2={x} y2={71 - (x - 76) * 0.02} stroke="#a0a8b8" strokeWidth="0.15" opacity="0.2" />
      )}

      {/* ══════ HABITAT MODULE — windows ══════ */}
      <ellipse cx="118" cy="50" rx="16" ry="18" fill="none" stroke="#a855f7" strokeWidth="0.6" opacity="0.2" />
      <ellipse cx="118" cy="50" rx="13" ry="15" fill="none" stroke="#a855f7" strokeWidth="0.3" opacity="0.1" strokeDasharray="2 3" />
      {/* Port windows */}
      {[-12, -6, 0, 6, 12].map((dy) =>
      <g key={`win-${dy}`}>
          <rect x={118 + Math.abs(dy) * 0.3 - 1} y={50 + dy - 1} width="2" height="2" rx="0.5"
        fill="#67e8f9" opacity={0.15 + Math.random() * 0.1} />
        </g>
      )}

      {/* ══════ CARGO BAY ══════ */}
      <rect x="92" y="40" width="12" height="8" rx="1" fill="none" stroke="#6b8aed" strokeWidth="0.3" opacity="0.15" />
      <rect x="92" y="52" width="12" height="8" rx="1" fill="none" stroke="#6b8aed" strokeWidth="0.3" opacity="0.15" />
      <line x1="98" y1="40" x2="98" y2="48" stroke="#6b8aed" strokeWidth="0.15" opacity="0.1" />
      <line x1="98" y1="52" x2="98" y2="60" stroke="#6b8aed" strokeWidth="0.15" opacity="0.1" />

      {/* ══════ COCKPIT ══════ */}
      <path
      d="M172 40 Q195 44 210 50 Q195 56 172 60"
      fill="url(#glass)" stroke="#22d3ee" strokeWidth="0.7" filter="url(#glow)" />

      {/* Inner glass reflection */}
      <path
      d="M178 43 Q192 46 202 50 Q192 54 178 57"
      fill="none" stroke="#67e8f9" strokeWidth="0.3" opacity="0.4" />

      {/* HUD reflection lines */}
      <line x1="182" y1="45" x2="195" y2="47" stroke="#22d3ee" strokeWidth="0.2" opacity="0.3" />
      <line x1="182" y1="55" x2="195" y2="53" stroke="#22d3ee" strokeWidth="0.2" opacity="0.2" />

      {/* Nose sensor probe */}
      <line x1="210" y1="50" x2="222" y2="50" stroke="#d1d5db" strokeWidth="0.8" />
      <circle cx="222" cy="50" r="2" fill="none" stroke="#22d3ee" strokeWidth="0.4" opacity="0.5" />
      <circle cx="222" cy="50" r="0.8" fill="#22d3ee" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>

      {/* ══════ DORSAL FIN ══════ */}
      <path d="M90 34 L100 10 L115 13 L105 32" fill="#6b7280" stroke="#9ca3af" strokeWidth="0.4" />
      {/* Fin detail */}
      <line x1="95" y1="24" x2="110" y2="18" stroke="#9ca3af" strokeWidth="0.2" opacity="0.25" />
      <line x1="97" y1="28" x2="108" y2="22" stroke="#9ca3af" strokeWidth="0.15" opacity="0.15" />
      {/* Nav beacon — red blink */}
      <circle cx="104" cy="12" r="1.5" fill="#ef4444" opacity="0.5">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="104" cy="12" r="3" fill="#ef4444" opacity="0.1" filter="url(#blur-soft)">
        <animate attributeName="opacity" values="0.05;0.2;0.05" dur="1.2s" repeatCount="indefinite" />
      </circle>

      {/* ══════ VENTRAL FIN ══════ */}
      <path d="M90 66 L100 90 L115 87 L105 68" fill="#6b7280" stroke="#9ca3af" strokeWidth="0.4" />
      <line x1="95" y1="76" x2="110" y2="82" stroke="#9ca3af" strokeWidth="0.2" opacity="0.25" />
      <circle cx="104" cy="88" r="1.5" fill="#ef4444" opacity="0.5">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" begin="0.6s" />
      </circle>

      {/* ══════ RADIATOR PANELS ══════ */}
      <rect x="130" y="16" width="22" height="5" rx="1" fill="url(#solar)" stroke="#3b82f6" strokeWidth="0.3" opacity="0.6" />
      <rect x="130" y="79" width="22" height="5" rx="1" fill="url(#solar)" stroke="#3b82f6" strokeWidth="0.3" opacity="0.6" />
      {/* Panel cell lines */}
      {[0, 1, 2, 3].map((i) =>
      <g key={`panel-${i}`}>
          <line x1={135 + i * 5} y1="16" x2={135 + i * 5} y2="21" stroke="#60a5fa" strokeWidth="0.15" opacity="0.3" />
          <line x1={135 + i * 5} y1="79" x2={135 + i * 5} y2="84" stroke="#60a5fa" strokeWidth="0.15" opacity="0.3" />
        </g>
      )}
      {/* Panel support arms */}
      <line x1="141" y1="28" x2="141" y2="21" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3" />
      <line x1="141" y1="72" x2="141" y2="79" stroke="#9ca3af" strokeWidth="0.5" opacity="0.3" />

      {/* ══════ ANTENNA ARRAY ══════ */}
      <line x1="152" y1="28" x2="152" y2="10" stroke="#d1d5db" strokeWidth="0.4" opacity="0.4" />
      <line x1="148" y1="12" x2="156" y2="12" stroke="#d1d5db" strokeWidth="0.3" opacity="0.3" />
      <circle cx="152" cy="9" r="2" fill="none" stroke="#eab308" strokeWidth="0.4" opacity="0.3" />
      <circle cx="152" cy="9" r="0.7" fill="#eab308" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* ══════ RCS THRUSTER PODS ══════ */}
      <rect x="162" y="36" width="5" height="4" rx="1" fill="none" stroke="#22d3ee" strokeWidth="0.3" opacity="0.25" />
      <rect x="162" y="60" width="5" height="4" rx="1" fill="none" stroke="#22d3ee" strokeWidth="0.3" opacity="0.25" />
      <circle cx="164" cy="38" r="0.6" fill="#22d3ee" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="164" cy="62" r="0.6" fill="#22d3ee" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" begin="1.5s" />
      </circle>

      {/* ══════ DOCKING PORT ══════ */}
      <circle cx="170" cy="50" r="3.5" fill="none" stroke="#6b8aed" strokeWidth="0.3" opacity="0.15" />
      <circle cx="170" cy="50" r="1.5" fill="none" stroke="#6b8aed" strokeWidth="0.2" opacity="0.2" />

      {/* ══════ HULL DESIGNATION ══════ */}
      <text x="130" y="52" textAnchor="middle" fontSize="4" fontFamily="monospace" fill="white" opacity="0.06" letterSpacing="1">
        ARES-7
      </text>
    </svg>);

}

export default memo(AresShipSVG);