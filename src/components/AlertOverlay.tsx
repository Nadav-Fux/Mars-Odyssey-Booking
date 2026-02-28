import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

interface AlertOverlayProps {
  active: boolean;
  onToggle: () => void;
}

// Glitch text effect
function GlitchText({ text, className = '' }: {text: string;className?: string;}) {
  const [glitchText, setGlitchText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let iteration = 0;

    intervalRef.current = setInterval(() => {
      setGlitchText(
        text.
        split('').
        map((char, i) => {
          if (char === ' ') return ' ';
          if (i < iteration) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).
        join('')
      );
      iteration += 1 / 2;
      if (iteration >= text.length) {
        iteration = 0;
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [text]);

  return <span className={className}>{glitchText}</span>;
}

export default function AlertOverlay({ active, onToggle }: AlertOverlayProps) {
  const [scanlineY, setScanlineY] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const animate = () => {
      setScanlineY((y) => (y + 2) % 100);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <AnimatePresence>
      {active &&
      <>
          {/* Red vignette overlay */}
          <motion.div
          className="fixed inset-0 pointer-events-none z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EXPO_OUT }}>

            {/* Red vignette */}
            <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,20,0,0.08) 70%, rgba(255,0,0,0.15) 100%)'
          }} />


            {/* Scanline */}
            <div
          className="absolute left-0 right-0 h-px opacity-20"
          style={{
            top: `${scanlineY}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.5), transparent)',
            boxShadow: '0 0 20px rgba(255,0,0,0.3)'
          }} />


            {/* CRT scanlines pattern */}
            <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)'
          }} />


            {/* Flicker */}
            <motion.div
            className="absolute inset-0 bg-red-500/[0.02]"
            animate={{ opacity: [0, 0.04, 0, 0.02, 0] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2 + Math.random() * 3 }} />


            {/* Corner brackets */}
            {[
          { top: 16, left: 16, borderTop: true, borderLeft: true },
          { top: 16, right: 16, borderTop: true, borderRight: true },
          { bottom: 16, left: 16, borderBottom: true, borderLeft: true },
          { bottom: 16, right: 16, borderBottom: true, borderRight: true }].
          map((pos, i) =>
          <motion.div
            key={i}
            className="absolute w-8 h-8 sm:w-12 sm:h-12"
            style={{
              top: 'top' in pos ? pos.top : undefined,
              bottom: 'bottom' in pos ? pos.bottom : undefined,
              left: 'left' in pos ? pos.left : undefined,
              right: 'right' in pos ? pos.right : undefined,
              borderTop: pos.borderTop ? '1px solid rgba(255,40,0,0.4)' : 'none',
              borderBottom: pos.borderBottom ? '1px solid rgba(255,40,0,0.4)' : 'none',
              borderLeft: pos.borderLeft ? '1px solid rgba(255,40,0,0.4)' : 'none',
              borderRight: pos.borderRight ? '1px solid rgba(255,40,0,0.4)' : 'none'
            }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />

          )}
          </motion.div>

          {/* HUD top bar */}
          <motion.div
          className="fixed top-14 lg:top-4 left-4 right-4 lg:left-24 z-[91] pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}>

            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-950/40 backdrop-blur-md border border-red-500/20">
              <div className="flex items-center gap-2">
                <motion.div
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}>

                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </motion.div>
                <GlitchText
                text="COMMAND CENTER — ALERT MODE ACTIVE"
                className="text-[10px] sm:text-xs font-display tracking-[0.2em] text-red-400" />

              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-display text-red-500/50 tracking-wider hidden sm:block">
                  PRESS [M] TO EXIT
                </span>
                <motion.div
                className="w-2 h-2 rounded-full bg-red-500"
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }} />

              </div>
            </div>
          </motion.div>

          {/* Mobile exit button */}
          <motion.button
          className="fixed top-14 lg:top-4 right-4 z-[92] lg:hidden w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center pointer-events-auto"
          onClick={onToggle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileTap={{ scale: 0.9 }}>

            <span className="text-red-400 text-xs font-bold">M</span>
          </motion.button>

          {/* Side telemetry */}
          <motion.div
          className="fixed right-4 top-1/2 -translate-y-1/2 z-[91] pointer-events-none hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ delay: 0.3, ease: EXPO_OUT }}>

            <div className="space-y-3">
              {[
            { label: 'HULL INTEGRITY', value: '98.7%', warn: false },
            { label: 'O₂ LEVEL', value: '21.4%', warn: false },
            { label: 'RAD EXPOSURE', value: '0.12 mSv', warn: false },
            { label: 'COMMS DELAY', value: '14.2 min', warn: true }].
            map((t) =>
            <div key={t.label} className="text-right">
                  <div className="text-[8px] font-display tracking-[0.15em] text-red-500/30">{t.label}</div>
                  <div className={`text-[11px] font-display font-bold ${t.warn ? 'text-red-400' : 'text-red-500/60'}`}>
                    <GlitchText text={t.value} />
                  </div>
                </div>
            )}
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}