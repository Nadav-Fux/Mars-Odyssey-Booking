import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useDiscoveryMode } from '@/hooks/useDiscoveryMode';
import { EXPO_OUT } from '@/lib/easing';

export default function DiscoveryToggle() {
  const { isActive, toggle } = useDiscoveryMode();

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.3, ease: EXPO_OUT }}
      className={`
        fixed bottom-6 right-6 z-[200]
        flex items-center gap-2
        h-10 px-4 rounded-full backdrop-blur-md border
        transition-all duration-300
        font-display text-[11px] tracking-[0.15em]
        ${isActive ?
      'bg-primary/15 border-primary/30 text-primary shadow-[0_0_20px_rgba(255,69,0,0.15)]' :
      'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70'}
      `
      }
      aria-label={isActive ? 'Exit Discovery Mode' : 'Enter Discovery Mode'}
      aria-pressed={isActive}>

      <Lightbulb className="w-4 h-4" />
      <span className="hidden sm:inline">
        {isActive ? 'EXIT' : 'DISCOVER'}
      </span>

      {/* Active glow pulse */}
      {isActive &&
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/40"
        animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />

      }
    </motion.button>);

}