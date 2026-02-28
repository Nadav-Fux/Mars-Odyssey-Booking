import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        progress.set(scrollTop / docHeight);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [progress]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX: smoothProgress,
        background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 60%, var(--color-primary) 100%)',
        boxShadow: '0 0 12px rgba(255,69,0,0.4), 0 0 4px rgba(255,69,0,0.6)',
      }}
    />
  );
}
