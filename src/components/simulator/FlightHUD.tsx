import { memo } from 'react';

/* ================================================================
   FLIGHT HUD — Mars Landing Simulator Instruments

   Reusable SVG-based heads-up display elements:
     • Altimeter (circular gauge)
     • Speed indicator
     • G-force meter
     • Heat shield temperature
     • Attitude indicator
     • Phase label
   ================================================================ */

/* ── Circular Gauge ── */
export function CircularGauge({
  value, max, label, unit, color, size = 90, danger = false



}: {value: number;max: number;label: string;unit: string;color: string;size?: number;danger?: boolean;}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress * 0.75); // 270° arc

  const displayVal = value >= 1000 ?
  `${(value / 1000).toFixed(1)}k` :
  value >= 100 ?
  value.toFixed(0) :
  value.toFixed(1);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* Track */}
        <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />

        {/* Progress arc */}
        <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={danger ? '#ef4444' : color} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.3s ease-out, stroke 0.3s',
          filter: danger ? 'drop-shadow(0 0 8px #ef444480)' : `drop-shadow(0 0 4px ${color}30)`
        }} />

      </svg>
      {/* Value overlay */}
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span
        className="font-mono text-sm sm:text-base font-bold tabular-nums leading-none"
        style={{ color: danger ? '#ef4444' : color }}>

          {displayVal}
        </span>
        <span className="text-[6px] font-display tracking-wider text-white/50 mt-0.5">{unit}</span>
      </div>
      <span className="text-[7px] font-display tracking-[0.2em] text-white/50 -mt-1">{label}</span>
    </div>);

}

/* ── Vertical Bar Gauge ── */
export function BarGauge({
  value, max, label, unit, color, danger = false



}: {value: number;max: number;label: string;unit: string;color: string;danger?: boolean;}) {
  const pct = Math.min(value / max * 100, 100);
  const displayVal = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(1);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[7px] font-display tracking-[0.15em] text-white/50">{label}</span>
      <div className="relative w-3 h-16 sm:h-20 rounded-full overflow-hidden bg-white/[0.04]">
        <div
        className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
        style={{
          height: `${pct}%`,
          background: danger ?
          'linear-gradient(to top, #ef4444, #ef444460)' :
          `linear-gradient(to top, ${color}, ${color}40)`,
          boxShadow: danger ? '0 0 10px #ef444460' : `0 0 6px ${color}30`
        }} />

      </div>
      <span
      className="font-mono text-[10px] font-bold tabular-nums"
      style={{ color: danger ? '#ef4444' : color }}>

        {displayVal}
      </span>
      <span className="text-[6px] font-display tracking-wider text-white/50">{unit}</span>
    </div>);

}

/* ── Altitude readout (big digital) ── */
export function AltitudeReadout({ value, unit = 'KM' }: {value: number;unit?: string;}) {
  const display = value >= 1000 ?
  value.toFixed(0) :
  value >= 10 ?
  value.toFixed(1) :
  value.toFixed(2);

  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-2xl sm:text-4xl font-bold tabular-nums text-white leading-none" style={{
        textShadow: '0 0 20px rgba(255,69,0,0.3)'
      }}>
        {display}
      </span>
      <span className="text-[10px] font-display tracking-[0.2em] text-white/30">{unit}</span>
    </div>);

}

/* ── Phase indicator ── */
export function PhaseIndicator({
  phase, label, color
}: {phase: number;label: string;color: string;}) {
  return (
    <div className="flex items-center gap-3">
      <div
      className="w-2 h-2 rounded-full animate-pulse"
      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />

      <div className="flex flex-col">
        <span className="text-[8px] font-display tracking-[0.25em] text-white/50">PHASE {phase}</span>
        <span className="text-[10px] sm:text-xs font-display tracking-[0.15em] font-bold" style={{ color }}>
          {label}
        </span>
      </div>
    </div>);

}

/* ── Crosshair overlay ── */
export const Crosshair = memo(function Crosshair({ color = 'rgba(255,69,0,0.15)' }: {color?: string;}) {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
      {/* Center cross */}
      <line x1="90" y1="100" x2="110" y2="100" stroke={color} strokeWidth="0.5" />
      <line x1="100" y1="90" x2="100" y2="110" stroke={color} strokeWidth="0.5" />
      {/* Corner brackets */}
      <path d="M30,30 L30,50" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M30,30 L50,30" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M170,30 L170,50" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M170,30 L150,30" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M30,170 L30,150" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M30,170 L50,170" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M170,170 L170,150" stroke={color} strokeWidth="0.5" fill="none" />
      <path d="M170,170 L150,170" stroke={color} strokeWidth="0.5" fill="none" />
      {/* Circle */}
      <circle cx="100" cy="100" r="40" fill="none" stroke={color} strokeWidth="0.3" strokeDasharray="4 6" />
    </svg>);

});

export default memo(function FlightHUD({
  altitude, speed, gForce, heatTemp, phase, phaseLabel, phaseColor








}: {altitude: number;speed: number;gForce: number;heatTemp: number;phase: number;phaseLabel: string;phaseColor: string;}) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 p-4 sm:p-6 flex flex-col justify-between">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <PhaseIndicator phase={phase} label={phaseLabel} color={phaseColor} />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.06]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 animate-pulse" />
          <span className="text-[7px] sm:text-[8px] font-display tracking-[0.2em] text-white/50">LIVE TELEMETRY</span>
        </div>
      </div>

      {/* Bottom row — instruments */}
      <div className="flex items-end justify-between">
        {/* Left: Altitude */}
        <div className="flex flex-col gap-1">
          <span className="text-[7px] font-display tracking-[0.2em] text-white/50">ALTITUDE</span>
          <AltitudeReadout value={altitude} unit={altitude > 10 ? 'KM' : 'M'} />
        </div>

        {/* Center: Gauges */}
        <div className="hidden sm:flex items-end gap-4">
          <BarGauge value={speed} max={7000} label="VELOCITY" unit="M/S" color="#4ab8c4" />
          <BarGauge value={gForce} max={15} label="G-FORCE" unit="G" color="#ff6b35" danger={gForce > 8} />
          <BarGauge value={heatTemp} max={2500} label="HEAT" unit="°C" color="#FF4500" danger={heatTemp > 1500} />
        </div>

        {/* Right: Speed readout (mobile) */}
        <div className="sm:hidden flex flex-col items-end gap-1">
          <span className="text-[7px] font-display tracking-[0.2em] text-white/50">SPEED</span>
          <span className="font-mono text-lg font-bold tabular-nums text-[#4ab8c4]">
            {speed >= 1000 ? `${(speed / 1000).toFixed(1)}k` : speed.toFixed(0)}
          </span>
          <span className="text-[6px] text-white/50">M/S</span>
        </div>
      </div>
    </div>);

});