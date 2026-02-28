import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Lock } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { ACHIEVEMENTS, useAchievements } from '@/hooks/useAchievements';

/* ================================================================
   ACHIEVEMENT PANEL

   Toggleable floating panel showing all achievements.
   Unlocked ones show icon + name. Locked secret ones show "???".
   ================================================================ */

export default function AchievementPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { isUnlocked, totalUnlocked, totalAchievements } = useAchievements();

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed top-20 right-6 z-[150] w-10 h-10 rounded-xl border backdrop-blur-sm items-center justify-center transition-all group hidden lg:flex"
        style={{
          backgroundColor: isOpen ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
          borderColor: isOpen ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Achievements">

        <Trophy className="w-4 h-4 transition-colors" style={{ color: isOpen ? '#f59e0b' : 'rgba(255,255,255,0.3)' }} />
        {totalUnlocked > 0 &&
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500/90 flex items-center justify-center">
            <span className="text-[7px] font-display font-bold text-black">{totalUnlocked}</span>
          </div>
        }
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: EXPO_OUT }}
          className="fixed top-20 right-[4.5rem] z-[150] w-[300px] rounded-2xl bg-[#0a0a12]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden hidden lg:block">

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400/60" />
                <span className="text-[9px] font-display tracking-[0.2em] text-amber-400/60 font-bold">ACHIEVEMENTS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-display tracking-wider text-white/50">
                  {totalUnlocked}/{totalAchievements}
                </span>
                <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors">

                  <X className="w-3 h-3 text-white/30" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-2 border-b border-white/[0.04]">
              <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${totalUnlocked / totalAchievements * 100}%`,
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              }} />

              </div>
            </div>

            {/* Achievements list */}
            <div className="px-3 py-2 max-h-[400px] overflow-y-auto space-y-1">
              {ACHIEVEMENTS.map((a) => {
              const unlocked = isUnlocked(a.id);
              const hidden = a.secret && !unlocked;

              return (
                <div
                key={a.id}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                unlocked ? 'bg-amber-500/[0.04]' : 'opacity-40'}`
                }>

                    {/* Icon */}
                    <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                  unlocked ?
                  'bg-amber-500/10 border border-amber-500/20' :
                  'bg-white/[0.03] border border-white/[0.06]'}`
                  }>

                      {hidden ? <Lock className="w-3 h-3 text-white/50" /> : unlocked ? a.icon : <span className="grayscale opacity-50">{a.icon}</span>}
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <div className={`text-[11px] font-medium truncate ${
                    unlocked ? 'text-white/50' : 'text-white/50'}`
                    }>
                        {hidden ? '???' : a.title}
                      </div>
                      <div className="text-[9px] text-white/50 truncate">
                        {hidden ? 'Secret achievement' : a.description}
                      </div>
                    </div>

                    {/* Check */}
                    {unlocked &&
                  <div className="shrink-0 ml-auto w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-[8px] text-amber-400">✓</span>
                      </div>
                  }
                  </div>);

            })}
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.004) 3px, rgba(255,255,255,0.004) 4px)'
          }} />
          </motion.div>
        }
      </AnimatePresence>
    </>);

}