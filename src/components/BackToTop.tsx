import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 1.5);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    setLaunching(true);
    // Small delay so the user sees the rocket "launch" before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setLaunching(false), 1200);
    }, 300);
  };

  return (
    <AnimatePresence>
      {visible &&
      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        transition={{ duration: 0.4, ease: EXPO_OUT }}
        onClick={handleClick}
        className="fixed bottom-[4.25rem] right-6 lg:bottom-[6.5rem] z-50 group"
        aria-label="Back to top">

          {/* Glow */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Exhaust trail when launching */}
          <AnimatePresence>
            {launching &&
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 28, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-1/2 -translate-x-1/2 top-full w-1 rounded-full overflow-hidden">

                <div className="w-full h-full bg-gradient-to-b from-primary/80 via-accent/50 to-transparent" />
              </motion.div>
          }
          </AnimatePresence>
          
          {/* Button */}
          <motion.div
          animate={launching ? { y: -60, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="relative w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] hover:border-primary/30 transition-all duration-300">

            <Rocket className="w-4 h-4 text-primary -rotate-45 group-hover:scale-110 transition-transform" />
          </motion.div>
        </motion.button>
      }
    </AnimatePresence>);

}