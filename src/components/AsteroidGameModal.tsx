import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import AsteroidGame from '@/components/AsteroidGame';
import { useMissionLog } from '@/hooks/useMissionLog';

/* ================================================================
   ASTEROID GAME MODAL

   Standalone overlay wrapper for AsteroidGame that can be opened
   from the Command Palette, MobileActionHub, or keyboard shortcut.

   Listens for:
     • Custom event: 'open-asteroid-game'
     • Keyboard: Ctrl+G / Cmd+G
   ================================================================ */

function AsteroidGameModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { logEvent } = useMissionLog();

  const open = useCallback(() => {
    setIsOpen(true);
    logEvent('Initiated asteroid dodge simulation.');
  }, [logEvent]);

  const close = useCallback((score: number) => {
    setIsOpen(false);
    if (score > 0) {
      logEvent(`Asteroid simulation ended. Score: ${score}`);
    }
  }, [logEvent]);

  // Listen for custom event
  useEffect(() => {
    const handler = () => open();
    window.addEventListener('open-asteroid-game', handler);
    return () => window.removeEventListener('open-asteroid-game', handler);
  }, [open]);

  // Keyboard shortcut: Ctrl/Cmd + G
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (isOpen) {
          close(0);
        } else {
          open();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        close(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, open, close]);

  return (
    <AnimatePresence>
      {isOpen &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">

          {/* Container — taller on mobile portrait, widescreen on desktop */}
          <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="relative w-full max-w-3xl rounded-xl sm:rounded-2xl bg-[#020208] border border-white/[0.08] shadow-2xl overflow-hidden"
          style={{ maxHeight: '85vh' }}>

            {/* Aspect ratio wrapper — 4/3 on mobile, 16/9 on wider screens */}
            <div className="relative w-full" style={{ paddingBottom: 'clamp(56.25%, 75% - 10vw, 75%)' }}>
              <div className="absolute inset-0">

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] z-30" style={{ background: 'linear-gradient(90deg, transparent, #FF4500, transparent)' }} />

            {/* Header bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-[8px] sm:text-[9px] font-display tracking-[0.2em] text-white/30">
                  ASTEROID DODGE
                </span>
              </div>
              <button
                onClick={() => close(0)}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors active:bg-white/[0.15]"
                title="Close (ESC)">

                <X className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/40" />
              </button>
            </div>

            {/* Game canvas fills the container */}
            <AsteroidGame onExit={(score) => close(score)} />

            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 3px)' }} />

              </div>
            </div>

          </motion.div>

          {/* Hints — touch on mobile, keyboard on desktop */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4">
            <span className="text-[8px] sm:text-[9px] font-mono text-white/50 hidden sm:inline">↑↓ or W/S to steer</span>
            <span className="text-[8px] font-mono text-white/50 sm:hidden">Touch to steer</span>
            <span className="text-[8px] sm:text-[9px] font-mono text-white/50 hidden sm:inline">ESC to exit</span>
            <span className="text-[8px] font-mono text-white/50 sm:hidden">Tap × to exit</span>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}

export default memo(AsteroidGameModal);