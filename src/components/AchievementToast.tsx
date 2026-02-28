import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { useAchievements } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';

/* ================================================================
   ACHIEVEMENT TOAST

   Shows a cinematic notification when a new achievement is unlocked.
   Auto-dismisses after 4 seconds.
   ================================================================ */

export default function AchievementToast() {
  const { lastUnlocked, clearLastUnlocked } = useAchievements();
  const { logAchievement } = useMissionLog();

  useEffect(() => {
    if (!lastUnlocked) return;
    logAchievement(lastUnlocked.title, lastUnlocked.icon);
    const t = setTimeout(clearLastUnlocked, 4000);
    return () => clearTimeout(t);
  }, [lastUnlocked, clearLastUnlocked, logAchievement]);

  return (
    <AnimatePresence>
      {lastUnlocked &&
      <motion.div
        initial={{ y: -80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: EXPO_OUT }}
        className="fixed top-10 left-1/2 -translate-x-1/2 z-[9000] pointer-events-none">

          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-amber-500/20 shadow-2xl">
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: '0 0 30px rgba(245,158,11,0.1), inset 0 0 30px rgba(245,158,11,0.03)' }} />
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg shrink-0">
              {lastUnlocked.icon}
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-3 h-3 text-amber-400/70" />
                <span className="text-[8px] font-display tracking-[0.25em] text-amber-400/70 font-bold">ACHIEVEMENT UNLOCKED</span>
              </div>
              <div className="text-sm text-white/70 font-medium mt-0.5">{lastUnlocked.title}</div>
              <div className="text-[10px] text-white/50 mt-0.5">{lastUnlocked.description}</div>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}