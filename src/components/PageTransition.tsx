import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { EXPO_OUT } from '@/lib/easing';
import { useBatterySaver } from '@/hooks/useBatterySaver';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
    filter: 'blur(8px)',
  },
  enter: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)',
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const { isSaving } = useBatterySaver();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeVariants = isSaving ? reducedVariants : variants;
  const duration = isSaving ? 0.2 : 0.7;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={wrapperRef}
        key={location.pathname}
        variants={activeVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{
          duration,
          ease: EXPO_OUT,
        }}
        onAnimationComplete={(definition) => {
          // After enter animation finishes, clear the inline
          // transform + filter styles. These create a CSS
          // "containing block" that breaks position:fixed for
          // descendants (e.g. Mars globe, modals, GSAP pins).
          if (definition === 'enter' && wrapperRef.current) {
            wrapperRef.current.style.transform = '';
            wrapperRef.current.style.filter = '';
            wrapperRef.current.style.willChange = 'auto';

            // Force GSAP ScrollTrigger to recalculate ALL pin positions.
            // Dynamic import avoids pulling GSAP into the critical bundle.
            // By the time enter animation finishes (~700ms), GSAP is already
            // loaded by page components, so this resolves from module cache.
            requestAnimationFrame(() => {
              import('@/lib/gsap').then(({ ScrollTrigger }) => {
                ScrollTrigger.refresh();
              });
            });
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
