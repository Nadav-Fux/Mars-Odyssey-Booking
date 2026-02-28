import { useState, useRef, useEffect, memo, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollText, X, Trash2 } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { useMissionLog, type LogEntry } from '@/hooks/useMissionLog';

/* ================================================================
   MISSION LOG  —  Captain's Journal Panel

   Floating button (bottom-left, above Battery Saver) opens a
   scrollable timeline of auto-recorded mission events.
   ================================================================ */

// ── Single log entry ──
function Entry({ entry, isNew }: {entry: LogEntry;isNew: boolean;}) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: EXPO_OUT }}
      className="flex gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors">

      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <div className="text-sm leading-none">{entry.icon}</div>
        <div className="w-px flex-1 bg-white/[0.04] mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-mono text-white/60 leading-relaxed">
          {entry.text}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] font-display tracking-[0.15em] text-white/50">
            SOL {entry.sol}
          </span>
          <span className="text-[8px] font-mono text-white/12">
            MET {entry.met}
          </span>
        </div>
      </div>
    </motion.div>);

}

function MissionLog() {
  const { entries, unreadCount, markRead, clearLog } = useMissionLog();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(entries.length);

  // Auto-scroll when new entries arrive while open
  useEffect(() => {
    if (open && scrollRef.current && entries.length > prevLenRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 60);
    }
    prevLenRef.current = entries.length;
  }, [entries.length, open]);

  // Mark read when opened
  useEffect(() => {
    if (open) markRead();
  }, [open, markRead, entries.length]);

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
      onClick={() => setOpen((v) => !v)}
      className="fixed bottom-16 left-6 z-[100] hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer
          bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-primary/20
          transition-all duration-300 group"


      aria-label="Open mission log"
      title="Captain's Mission Log">

        <ScrollText className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary/80 transition-colors" />
        <span className="text-[9px] font-display tracking-[0.15em] text-white/30 group-hover:text-white/50 transition-colors">
          LOG
        </span>
        {/* Unread badge */}
        {unreadCount > 0 && !open &&
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/80 text-[8px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        }
      </button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open &&
        <motion.div
          className="fixed bottom-28 left-6 z-[101] w-80 max-h-[60vh] hidden lg:flex flex-col rounded-xl overflow-hidden"
          style={{
            background: 'rgba(8,8,18,0.96)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 2px rgba(255,69,0,0.1)'
          }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: EXPO_OUT }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ScrollText className="w-3.5 h-3.5 text-primary/50" />
                <span className="text-[10px] font-display tracking-[0.18em] text-primary/50 font-bold">
                  CAPTAIN'S LOG
                </span>
                <span className="text-[8px] font-display tracking-[0.12em] text-white/50">
                  {entries.length} entries
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {entries.length > 0 &&
              <button
              onClick={clearLog}
              className="p-1 rounded hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Clear log">

                    <Trash2 className="w-3 h-3 text-white/50 hover:text-red-400/60" />
                  </button>
              }
                <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/[0.06] transition-colors cursor-pointer">

                  <X className="w-3.5 h-3.5 text-white/30" />
                </button>
              </div>
            </div>

            {/* Scrollable entries */}
            <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-2 min-h-0"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>

              {entries.length === 0 ?
            <div className="px-4 py-8 text-center">
                  <div className="text-white/50 text-xs font-mono">No entries yet</div>
                  <div className="text-white/8 text-[10px] font-mono mt-1">Explore the site to generate log entries</div>
                </div> :

            entries.map((entry, i) =>
            <Entry
              key={entry.id}
              entry={entry}
              isNew={i >= prevLenRef.current - 1 && i === entries.length - 1} />

            )
            }
            </div>

            {/* Footer */}
            <div className="px-4 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse" />
                <span className="text-[8px] font-display tracking-[0.12em] text-white/50">
                  AUTO-RECORDING
                </span>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}

export default memo(MissionLog);