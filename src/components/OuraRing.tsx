import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface OuraRingProps {
  children: ReactNode;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  /** rotation duration in seconds */
  speed?: number;
}

export default function OuraRing({
  children,
  size = 56,
  color = '#FF4500',
  strokeWidth = 1.5,
  className = '',
  speed = 8
}: OuraRingProps) {
  const r = 46;
  const circ = 2 * Math.PI * r;

  return (
    <div
    className={`relative flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}>

      {/* Glow layer */}
      <div
      className="absolute inset-0 rounded-full blur-md opacity-30"
      style={{ backgroundColor: color }} />


      {/* Rotating ring SVG */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}>

        <defs>
          <linearGradient id={`oura-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="50%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Dashed arc ring */}
        <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={`url(#oura-grad-${color.replace('#', '')})`}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circ * 0.25} ${circ * 0.08} ${circ * 0.15} ${circ * 0.08} ${circ * 0.2} ${circ * 0.08}`}
        strokeLinecap="round" />


        {/* Tiny orbiting dot */}
        <circle cx="50" cy={50 - r} r="2" fill={color} opacity="0.9">
          <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="-360 50 50"
          dur={`${speed * 0.6}s`}
          repeatCount="indefinite" />

        </circle>
      </motion.svg>

      {/* Static outer faint ring */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-15">
        <circle
        cx="50" cy="50" r={r + 2}
        fill="none" stroke={color} strokeWidth="0.5" />

      </svg>

      {/* Inner icon container */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>);

}