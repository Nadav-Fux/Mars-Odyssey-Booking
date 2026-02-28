import { useState, lazy, Suspense, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import {
  Zap, X, Ticket, ScrollText, Trophy, TerminalSquare, Search, Gamepad2 } from
'lucide-react';
import { useAchievements, ACHIEVEMENTS } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';

const BoardingPass = lazy(() => import('@/components/BoardingPass'));

/* ================================================================
   MOBILE ACTION HUB  (FAB)

   Visible only on mobile/tablet (< lg).  A floating action button
   that expands into a radial menu giving access to features
   normally hidden on small screens:

     🎫  Boarding Pass
     📜  Mission Log (inline)
     🏆  Achievements (inline)
     💻  Terminal
     🔍  Command Palette
     🎮  Hint: game via terminal
   ================================================================ */

type Panel = null | 'boarding' | 'log' | 'achievements';

interface ActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

function MobileActionHub() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const { totalUnlocked, totalAchievements, unlocked } = useAchievements();
  const { entries, unreadCount, markRead } = useMissionLog();

  const close = useCallback(() => {
    setOpen(false);
    setPanel(null);
  }, []);

  const openPanel = useCallback((p: Panel) => {
    setPanel(p);
    setOpen(false);
    if (p === 'log') markRead();
  }, [markRead]);

  const items: ActionItem[] = [
  {
    id: 'boarding', icon: <Ticket className="w-4 h-4" />, label: 'Boarding Pass',
    color: '#FF4500',
    action: () => openPanel('boarding')
  },
  {
    id: 'log', icon: <ScrollText className="w-4 h-4" />, label: 'Mission Log',
    color: '#f59e0b',
    action: () => openPanel('log')
  },
  {
    id: 'achievements', icon: <Trophy className="w-4 h-4" />, label: `Achievements (${totalUnlocked}/${totalAchievements})`,
    color: '#a855f7',
    action: () => openPanel('achievements')
  },
  {
    id: 'terminal', icon: <TerminalSquare className="w-4 h-4" />, label: 'Terminal',
    color: '#22c55e',
    action: () => {close();window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));}
  },
  {
    id: 'palette', icon: <Search className="w-4 h-4" />, label: 'Command Palette',
    color: '#3b82f6',
    action: () => {close();window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));}
  },
  {
    id: 'game', icon: <Gamepad2 className="w-4 h-4" />, label: 'Asteroid Dodge',
    color: '#ef4444',
    action: () => {close();window.dispatchEvent(new CustomEvent('open-asteroid-game'));}
  }];


  return (
    <>
      {/* ── FAB Button ── */}
      <button
      onClick={() => {if (panel) {setPanel(null);} else {setOpen((v) => !v);}}}
      className="fixed bottom-5 right-5 z-[180] lg:hidden w-12 h-12 rounded-full flex items-center justify-center
          shadow-lg shadow-black/30 cursor-pointer transition-all duration-300"

      style={{
        background: open || panel ? 'rgba(255,69,0,0.9)' : 'rgba(255,69,0,0.7)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
      aria-label={open ? 'Close actions' : 'Open actions'}>

        <AnimatePresence mode="wait">
          {open || panel ?
          <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div> :

          <motion.div key="z" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="relative">
              <Zap className="w-5 h-5 text-white" />
              {unreadCount > 0 &&
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 text-[7px] font-bold text-black flex items-center justify-center">
                  {unreadCount > 9 ? '!' : unreadCount}
                </span>
            }
            </motion.div>
          }
        </AnimatePresence>
      </button>

      {/* ── Action Menu (fan-out) ── */}
      <AnimatePresence>
        {open &&
        <>
            {/* Scrim */}
            <motion.div
            className="fixed inset-0 z-[175] lg:hidden"
            style={{ background: 'rgba(2,2,8,0.5)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close} />


            {/* Items */}
            <div className="fixed bottom-20 right-5 z-[179] lg:hidden flex flex-col-reverse items-end gap-2">
              {items.map((item, i) =>
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: EXPO_OUT }}
              onClick={item.action}
              className="flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-full cursor-pointer
                    bg-black/80 backdrop-blur-md border border-white/[0.08]
                    hover:bg-white/[0.06] active:scale-95 transition-transform">



                  <span className="text-[11px] font-display tracking-[0.1em] text-white/60 whitespace-nowrap">
                    {item.label}
                  </span>
                  <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}22`, border: `1px solid ${item.color}33` }}>

                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                </motion.button>
            )}
            </div>
          </>
        }
      </AnimatePresence>

      {/* ── Inline Panels ── */}

      {/* Boarding Pass */}
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>}>
        {panel === 'boarding' &&
        <BoardingPass open onClose={() => setPanel(null)} />
        }
      </Suspense>

      {/* Mission Log inline */}
      <AnimatePresence>
        {panel === 'log' &&
        <motion.div
          className="fixed inset-0 z-[185] lg:hidden flex flex-col"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <div className="absolute inset-0" style={{ background: 'rgba(2,2,8,0.92)', backdropFilter: 'blur(6px)' }} onClick={() => setPanel(null)} />
            <motion.div
            className="relative mx-4 mt-16 mb-20 flex-1 flex flex-col rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,18,0.97)', border: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EXPO_OUT }}>

              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-primary/50" />
                  <span className="text-[10px] font-display tracking-[0.18em] text-primary/50 font-bold">CAPTAIN'S LOG</span>
                </div>
                <button onClick={() => setPanel(null)} className="p-1 cursor-pointer">
                  <X className="w-4 h-4 text-white/30" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-1" style={{ scrollbarWidth: 'thin' }}>
                {entries.length === 0 ?
              <div className="px-4 py-12 text-center text-white/50 text-xs font-mono">No entries yet</div> :
              entries.map((e) =>
              <div key={e.id} className="flex gap-2.5 px-3 py-1.5">
                    <span className="text-sm leading-none pt-0.5">{e.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono text-white/55">{e.text}</div>
                      <div className="text-[8px] font-display tracking-[0.12em] text-white/18 mt-0.5">SOL {e.sol} · MET {e.met}</div>
                    </div>
                  </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Achievements inline */}
      <AnimatePresence>
        {panel === 'achievements' &&
        <motion.div
          className="fixed inset-0 z-[185] lg:hidden flex flex-col"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <div className="absolute inset-0" style={{ background: 'rgba(2,2,8,0.92)', backdropFilter: 'blur(6px)' }} onClick={() => setPanel(null)} />
            <motion.div
            className="relative mx-4 mt-16 mb-20 flex-1 flex flex-col rounded-xl overflow-hidden"
            style={{ background: 'rgba(8,8,18,0.97)', border: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EXPO_OUT }}>

              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400/60" />
                  <span className="text-[10px] font-display tracking-[0.18em] text-amber-400/60 font-bold">ACHIEVEMENTS</span>
                  <span className="text-[9px] font-mono text-white/50">{totalUnlocked}/{totalAchievements}</span>
                </div>
                <button onClick={() => setPanel(null)} className="p-1 cursor-pointer">
                  <X className="w-4 h-4 text-white/30" />
                </button>
              </div>
              {/* Progress */}
              <div className="px-4 py-2 border-b border-white/[0.04]">
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500/70 to-amber-400/70 rounded-full transition-all duration-700" style={{ width: `${totalUnlocked / totalAchievements * 100}%` }} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
                {ACHIEVEMENTS.map((a) => {
                const earned = unlocked.has(a.id);
                return (
                  <div key={a.id} className={`flex items-center gap-3 px-4 py-2.5 ${earned ? '' : 'opacity-40'}`}>
                      <span className="text-lg w-8 text-center">{earned ? a.icon : a.secret ? '🔒' : '○'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-display tracking-[0.08em] text-white/70">
                          {earned ? a.title : a.secret ? '???' : a.title}
                        </div>
                        <div className="text-[9px] font-mono text-white/50 mt-0.5">
                          {earned ? a.description : a.secret ? 'Secret achievement' : a.description}
                        </div>
                      </div>
                      {earned && <span className="text-[8px] font-display tracking-[0.15em] text-green-400/50">✓</span>}
                    </div>);

              })}
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}

export default memo(MobileActionHub);