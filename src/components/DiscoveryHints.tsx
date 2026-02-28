import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useBatterySaver } from '@/hooks/useBatterySaver';
import {
  TerminalSquare, Search, MousePointerClick, Trophy, Gamepad2 } from
'lucide-react';

/* ================================================================
   DISCOVERY HINTS

   Subtle, non-intrusive nudges for first-time visitors that point
   to hidden features.  Each hint shows ONCE EVER (localStorage).
   They appear staggered over time, dismissed on click or auto-fade.

   • Tiny pill at bottom-center
   • Appears → stays 8s → fades out
   • Never shows the same hint twice
   • Respects Battery Saver (disabled)
   • Doesn't stack — only 1 hint at a time
   ================================================================ */

interface Hint {
  id: string;
  icon: React.ReactNode;
  text: string;
  delay: number; // ms after mount before showing
}

const HINTS: Hint[] = [
{
  id: 'terminal',
  icon: <TerminalSquare className="w-3.5 h-3.5" />,
  text: 'Press ~ to open the Command Terminal',
  delay: 15_000
},
{
  id: 'palette',
  icon: <Search className="w-3.5 h-3.5" />,
  text: 'Try Ctrl+K for quick search',
  delay: 40_000
},
{
  id: 'mars-globe',
  icon: <MousePointerClick className="w-3.5 h-3.5" />,
  text: 'Double-click the Mars globe for a surprise',
  delay: 65_000
},
{
  id: 'achievements',
  icon: <Trophy className="w-3.5 h-3.5" />,
  text: '10 hidden achievements to discover',
  delay: 100_000
},
{
  id: 'game',
  icon: <Gamepad2 className="w-3.5 h-3.5" />,
  text: 'Type "game" in the terminal to play',
  delay: 140_000
}];


const STORAGE_KEY = 'ares-hints-seen';
const DISPLAY_DURATION = 8_000;

function getSeenHints(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {return new Set();}
}

function markSeen(id: string) {
  const seen = getSeenHints();
  seen.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

function DiscoveryHints() {
  const { isSaving: isBatterySaver } = useBatterySaver();
  const [current, setCurrent] = useState<Hint | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isBatterySaver) return;

    const seen = getSeenHints();
    const remaining = HINTS.filter((h) => !seen.has(h.id));
    if (remaining.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Schedule each remaining hint
    // But only show 1 at a time — use a queue via sequential timeouts
    let cumulativeDelay = 0;

    for (const hint of remaining) {
      const showAt = hint.delay;
      timers.push(
        setTimeout(() => {
          // Only show if nothing else is currently showing
          setCurrent((prev) => {
            if (prev) return prev; // something already showing
            return hint;
          });
        }, showAt)
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [isBatterySaver]);

  // When current hint changes, show → auto-dismiss
  useEffect(() => {
    if (!current) return;
    setVisible(true);
    markSeen(current.id);

    const dismissTimer = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_DURATION);

    return () => clearTimeout(dismissTimer);
  }, [current]);

  // When visible becomes false and we had a current, clear it after exit animation
  useEffect(() => {
    if (!visible && current) {
      const clearTimer = setTimeout(() => {
        setCurrent(null);
      }, 500); // wait for exit animation
      return () => clearTimeout(clearTimer);
    }
  }, [visible, current]);

  if (isBatterySaver) return null;

  return (
    <div className="fixed bottom-32 sm:bottom-24 left-1/2 -translate-x-1/2 z-[85] pointer-events-none">
      <AnimatePresence>
        {visible && current &&
        <motion.button
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.4, ease: EXPO_OUT }}
          onClick={dismiss}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer
              bg-white/[0.05] border border-white/[0.08] backdrop-blur-md
              shadow-[0_0_20px_rgba(0,0,0,0.25)]
              hover:bg-white/[0.08] transition-colors">




            {/* Pulsing dot */}
            <span className="relative flex-shrink-0">
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-primary/40 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-primary/70 block" />
            </span>

            {/* Icon */}
            <span className="text-primary/60 flex-shrink-0">{current.icon}</span>

            {/* Text */}
            <span className="text-[11px] font-mono text-white/50 whitespace-nowrap">
              {current.text}
            </span>

            {/* Dismiss hint */}
            <span className="text-[8px] font-display tracking-[0.12em] text-white/50 ml-1">
              ✕
            </span>
          </motion.button>
        }
      </AnimatePresence>
    </div>);

}

export default memo(DiscoveryHints);