import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  textStrength?: number;
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.35,
  textStrength = 0.6,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  // Button position
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const bSpringX = useSpring(bx, { damping: 15, stiffness: 150, mass: 0.5 });
  const bSpringY = useSpring(by, { damping: 15, stiffness: 150, mass: 0.5 });

  // Text position (moves more)
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const tSpringX = useSpring(tx, { damping: 12, stiffness: 120, mass: 0.3 });
  const tSpringY = useSpring(ty, { damping: 12, stiffness: 120, mass: 0.3 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    bx.set(dx * strength);
    by.set(dy * strength);
    tx.set(dx * textStrength);
    ty.set(dy * textStrength);
  };

  const handleEnter = () => setHovered(true);

  const handleLeave = () => {
    setHovered(false);
    bx.set(0);
    by.set(0);
    tx.set(0);
    ty.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ x: bSpringX, y: bSpringY }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-none ${className}`}
    >
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        animate={{
          boxShadow: hovered
            ? '0 0 40px rgba(255,69,0,0.25), 0 0 80px rgba(255,69,0,0.1)'
            : '0 0 0px rgba(255,69,0,0)',
        }}
        transition={{ duration: 0.3, ease: EXPO_OUT }}
      />

      {/* Content that follows cursor more aggressively */}
      <motion.span
        className="relative block"
        style={{ x: tSpringX, y: tSpringY }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
