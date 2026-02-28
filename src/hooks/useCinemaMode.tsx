import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ================================================================
   CINEMA MODE

   Press `P` (when not in an input) or use the terminal command
   `cinema` to hide ALL floating UI.  Only the main page content
   + background remain.  Perfect for screenshots.

   All floating components read `isCinemaMode` from context and
   hide themselves via a simple CSS class.
   ================================================================ */

interface CinemaModeContextValue {
  isCinemaMode: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const CinemaModeContext = createContext<CinemaModeContextValue | null>(null);

export function CinemaModeProvider({ children }: {children: ReactNode;}) {
  const [active, setActive] = useState(false);

  const enable = useCallback(() => setActive(true), []);
  const disable = useCallback(() => setActive(false), []);
  const toggle = useCallback(() => setActive((v) => !v), []);

  // Global `P` key listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'p' || e.key === 'P') {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        // Don't trigger if Ctrl/Cmd held (browser print)
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return (
    <CinemaModeContext.Provider value={{ isCinemaMode: active, toggle, enable, disable }}>
      {children}

      {/* Cinema mode indicator */}
      <AnimatePresence>
        {active &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none">

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/[0.05]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/70 animate-pulse" />
              <span className="text-[9px] font-display tracking-[0.18em] text-white/50">
                CINEMA MODE
              </span>
              <span className="text-[8px] font-mono text-white/12">
                P to exit
              </span>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </CinemaModeContext.Provider>);

}

export function useCinemaMode() {
  const ctx = useContext(CinemaModeContext);
  if (!ctx) throw new Error('useCinemaMode must be used within CinemaModeProvider');
  return ctx;
}