import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Sparkles, Cpu, Palette, MousePointer, Gauge, Accessibility } from 'lucide-react';
import { useDiscoveryMode, CONCEPTS, type DiscoveryConcept } from '@/hooks/useDiscoveryMode';
import { EXPO_OUT } from '@/lib/easing';

const CATEGORY_CONFIG: Record<DiscoveryConcept['category'], {icon: typeof Cpu;color: string;label: string;}> = {
  animation: { icon: Sparkles, color: 'text-purple-400', label: 'Animation' },
  design: { icon: Palette, color: 'text-pink-400', label: 'Design' },
  interaction: { icon: MousePointer, color: 'text-primary', label: 'Interaction' },
  performance: { icon: Gauge, color: 'text-emerald-400', label: 'Performance' },
  accessibility: { icon: Accessibility, color: 'text-sky-400', label: 'Accessibility' }
};

export default function DiscoveryMode() {
  const { isActive, activeIndex, next, prev, toggle, totalConcepts, setActiveIndex } = useDiscoveryMode();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef(0);

  // Track the highlighted element's position
  useEffect(() => {
    if (!isActive || activeIndex < 0) {
      setRect(null);
      return;
    }

    const concept = CONCEPTS[activeIndex];
    const el = document.querySelector(concept.selector);

    if (!el) {
      setRect(null);
      return;
    }

    // Scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const updateRect = () => {
      const r = el.getBoundingClientRect();
      setRect(r);
      rafRef.current = requestAnimationFrame(updateRect);
    };

    // Small delay for scroll to settle
    const timeout = setTimeout(() => {
      updateRect();
    }, 600);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') {
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, next, prev, toggle]);

  const concept = activeIndex >= 0 ? CONCEPTS[activeIndex] : null;
  const catConfig = concept ? CATEGORY_CONFIG[concept.category] : null;
  const CatIcon = catConfig?.icon ?? Cpu;

  return (
    <AnimatePresence>
      {isActive &&
      <>
          {/* Dim overlay */}
          <motion.div
          key="discovery-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EXPO_OUT }}
          className="fixed inset-0 z-[300] bg-black/60 pointer-events-none"
          aria-hidden />


          {/* Highlight ring around target element */}
          {rect &&
        <motion.div
          key="discovery-ring"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="fixed z-[301] pointer-events-none rounded-xl border-2 border-primary/60"
          style={{
            top: rect.top - 12,
            left: rect.left - 12,
            width: rect.width + 24,
            height: rect.height + 24,
            boxShadow: '0 0 40px rgba(255,69,0,0.15), inset 0 0 40px rgba(255,69,0,0.05)'
          }}>

              {/* Pulsing corners */}
              {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) =>
          <motion.div
            key={pos}
            className={`absolute ${pos} w-3 h-3 border-2 border-primary rounded-sm`}
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />

          )}
            </motion.div>
        }

          {/* Info panel */}
          <motion.div
          key="discovery-panel"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[302] w-[90vw] max-w-lg"
          role="dialog"
          aria-label="Discovery Mode"
          aria-live="polite">

            <div className="relative bg-secondary/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-5 shadow-2xl">
              {/* Close button */}
              <button
            onClick={toggle}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close Discovery Mode">

                <X className="w-4 h-4" />
              </button>

              {concept && catConfig &&
            <>
                  {/* Category badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] ${catConfig.color}`}>
                      <CatIcon className="w-3 h-3" />
                      <span className="text-[10px] font-display tracking-[0.15em] uppercase">
                        {catConfig.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50 font-display">
                      {activeIndex + 1} / {totalConcepts}
                    </span>
                  </div>

                  {/* Title */}
                  <AnimatePresence mode="wait">
                    <motion.h3
                  key={`title-${activeIndex}`}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3, ease: EXPO_OUT }}
                  className="font-display text-lg font-bold text-white mb-2 tracking-wide">

                      {concept.title}
                    </motion.h3>
                  </AnimatePresence>

                  {/* Description */}
                  <AnimatePresence mode="wait">
                    <motion.p
                  key={`desc-${activeIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EXPO_OUT, delay: 0.05 }}
                  className="text-sm text-white/45 leading-relaxed">

                      {concept.description}
                    </motion.p>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                    <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors text-xs font-display tracking-wider"
                aria-label="Previous concept">

                      <ChevronLeft className="w-3.5 h-3.5" />
                      PREV
                    </button>

                    {/* Progress dots */}
                    <div className="flex gap-1.5">
                      {CONCEPTS.map((_, i) =>
                  <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ?
                  'bg-primary w-4' :
                  'bg-white/30 hover:bg-white/30'}`
                  }
                  aria-label={`Go to concept ${i + 1}`} />

                  )}
                    </div>

                    <button
                onClick={next}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors text-xs font-display tracking-wider"
                aria-label="Next concept">

                      NEXT
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
            }
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}