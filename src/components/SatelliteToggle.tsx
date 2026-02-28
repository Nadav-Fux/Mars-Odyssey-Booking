import { motion, AnimatePresence } from 'framer-motion';
import { Satellite } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { useSatelliteMode } from '@/hooks/useSatelliteMode';

/**
 * SatelliteToggle
 *
 * A floating toggle button that switches between
 * Artistic (glassmorphism) and Satellite (tactical) view.
 */
export default function SatelliteToggle() {
  const { satellite, toggle } = useSatelliteMode();

  return (
    <motion.button
      onClick={toggle}
      className={`fixed bottom-5 right-[4.5rem] z-50 w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
        satellite
          ? 'bg-[rgba(0,220,255,0.1)] border-[rgba(0,220,255,0.3)] text-[#00dcff] shadow-lg shadow-[rgba(0,220,255,0.15)]'
          : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08]'
      }`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={satellite ? 'Switch to Artistic View' : 'Switch to Satellite View'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {satellite ? (
          <motion.div
            key="sat"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: EXPO_OUT }}
          >
            <Satellite className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="art"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25, ease: EXPO_OUT }}
          >
            <Satellite className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse ring when active */}
      {satellite && (
        <motion.div
          className="absolute inset-0 rounded-xl border border-[rgba(0,220,255,0.3)]"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
