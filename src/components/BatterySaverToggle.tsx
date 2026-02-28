import { motion, AnimatePresence } from 'framer-motion';
import { BatteryLow, BatteryFull, Zap } from 'lucide-react';
import { useBatterySaver } from '@/hooks/useBatterySaver';
import { EXPO_OUT } from '@/lib/easing';
import { useState } from 'react';

export default function BatterySaverToggle() {
  const { isSaving, toggle, batteryLevel, isMobile } = useBatterySaver();
  const [showTooltip, setShowTooltip] = useState(false);

  const batteryPercent = batteryLevel !== null ? Math.round(batteryLevel * 100) : null;

  return (
    <div className="fixed bottom-6 left-6 z-[200]" role="status">
      <motion.button
        onClick={toggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.3, ease: EXPO_OUT }}
        className={`
          group relative flex items-center justify-center
          w-10 h-10 rounded-full backdrop-blur-md border
          transition-colors duration-300
          ${isSaving ?
        'bg-primary/15 border-primary/30 text-primary' :
        'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70'}
        `
        }
        aria-label={isSaving ? 'Disable battery saver mode' : 'Enable battery saver mode'}
        aria-pressed={isSaving}>

        {isSaving ?
        <BatteryLow className="w-4 h-4" /> :

        <BatteryFull className="w-4 h-4" />
        }

        {/* Active pulse */}
        {isSaving &&
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/40"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />

        }
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip &&
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: EXPO_OUT }}
          className="absolute bottom-full left-0 mb-3 min-w-[180px] px-3 py-2 rounded-lg bg-secondary/95 backdrop-blur-md border border-white/[0.08] shadow-xl"
          role="tooltip">

            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-display tracking-wider text-white/80">
                {isSaving ? 'BATTERY SAVER ON' : 'BATTERY SAVER OFF'}
              </span>
            </div>
            <p className="text-[10px] text-white/35 leading-relaxed">
              {isSaving ?
            'Animations reduced for performance' :
            'Full animations active'}
            </p>
            {batteryPercent !== null &&
          <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
              className="h-full rounded-full bg-primary/60 transition-all duration-500"
              style={{ width: `${batteryPercent}%` }} />

                </div>
                <span className="text-[9px] text-white/50 font-display">
                  {batteryPercent}%
                </span>
              </div>
          }
            {isMobile &&
          <p className="text-[9px] text-primary/50 mt-1">Mobile detected</p>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}