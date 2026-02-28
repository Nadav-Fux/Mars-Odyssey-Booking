import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useBatterySaver } from '@/hooks/useBatterySaver';

/* ================================================================
   ARIA  —  Ship AI Ambient System

   After ~40s of user inactivity, shows subtle ambient messages
   from the spacecraft's onboard AI ("ARIA").  Creates a living,
   breathing sci-fi atmosphere.

   • Non-blocking: tiny toast at bottom-center
   • Self-dismisses after 6s
   • Won't repeat same message twice in a row
   • Resets idle timer on any interaction
   • Disabled by Battery Saver
   • Once per ~45-70s (randomised gap)
   ================================================================ */

// ── Message pools ──

const AMBIENT: string[] = [
'All systems nominal, Commander.',
'Holding course. Mars approach on schedule.',
'Micro-meteorite deflected. Shields at 100%.',
'Solar array efficiency: 97.3%. Optimal.',
'Crew vitals nominal. All six members resting.',
'Deep space relay uplink stable.',
'Cabin pressure: 101.3 kPa. Comfortable.',
'Running routine reactor diagnostics…',
'Star field calibration complete.',
'Next course correction in 4 hours 22 minutes.',
'Oxygen recyclers operating at full capacity.',
'Cosmic radiation levels within safe limits.',
'Fuel reserves at 88%. Well within margins.',
'External hull temperature: −167 °C.',
'Communication latency to Earth: 14 min 22 s.',
'Automated telescope survey in progress.',
'Water reclamation cycle completed successfully.',
'Mars is now the brightest object in our forward view.',
'Gravitational assist trajectory confirmed nominal.',
'Running memory integrity check… all banks clear.'];


const IDLE_LONG: string[] = [
'Commander, are you still with us?',
'Awaiting your orders, Commander.',
'Standing by for instructions.',
'I\'m here whenever you need me, Commander.',
'Mission continues on autopilot.'];


const IDLE_THRESHOLD = 40_000; // 40s before first message
const MSG_GAP_MIN = 45_000; // min gap between messages
const MSG_GAP_MAX = 70_000; // max gap
const DISPLAY_TIME = 6_500; // how long toast stays visible
const LONG_IDLE = 120_000; // 2min idle → switch to IDLE_LONG pool

function ShipAI() {
  const { isSaving: isBatterySaver } = useBatterySaver();
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const lastActivity = useRef(Date.now());
  const lastMsgIdx = useRef(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleSince = useRef(Date.now());
  const shownCount = useRef(0); // total shown this session

  // Reset idle timer on interaction
  useEffect(() => {
    function onActivity() {
      lastActivity.current = Date.now();
      if (shownCount.current === 0) {
        idleSince.current = Date.now(); // reset "first idle" tracker too
      }
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, []);

  // Pick a message (no repeats)
  const pickMessage = useCallback(() => {
    const idleTime = Date.now() - lastActivity.current;
    const pool = idleTime > LONG_IDLE ? IDLE_LONG : AMBIENT;
    let idx: number;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (idx === lastMsgIdx.current && pool.length > 1);
    lastMsgIdx.current = idx;
    return pool[idx];
  }, []);

  // Show a message
  const showMessage = useCallback(() => {
    const msg = pickMessage();
    setMessage(msg);
    setVisible(true);
    shownCount.current++;

    // Auto-dismiss
    if (dismissRef.current) clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(() => setVisible(false), DISPLAY_TIME);
  }, [pickMessage]);

  // Schedule next check
  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const gap = MSG_GAP_MIN + Math.random() * (MSG_GAP_MAX - MSG_GAP_MIN);
    timerRef.current = setTimeout(() => {
      const idleTime = Date.now() - lastActivity.current;
      if (idleTime >= IDLE_THRESHOLD && !isBatterySaver) {
        showMessage();
      }
      scheduleNext();
    }, gap);
  }, [isBatterySaver, showMessage]);

  // Initial idle check + scheduling
  useEffect(() => {
    // First message after IDLE_THRESHOLD
    const initialTimer = setTimeout(() => {
      const idleTime = Date.now() - lastActivity.current;
      if (idleTime >= IDLE_THRESHOLD && !isBatterySaver) {
        showMessage();
      }
      scheduleNext();
    }, IDLE_THRESHOLD);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissRef.current) clearTimeout(dismissRef.current);
    };
  }, [isBatterySaver, showMessage, scheduleNext]);

  // Don't render during battery saver
  if (isBatterySaver) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] pointer-events-none">
      <AnimatePresence>
        {visible && message &&
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full
              bg-white/[0.04] border border-white/[0.06] backdrop-blur-md
              shadow-[0_0_30px_rgba(0,0,0,0.3)]">



            {/* AI indicator dot */}
            <div className="relative flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-ping" />
            </div>

            {/* Label */}
            <span className="text-[8px] font-display tracking-[0.18em] text-cyan-400/40 font-bold flex-shrink-0">
              ARIA
            </span>

            {/* Divider */}
            <div className="w-px h-3 bg-white/[0.06]" />

            {/* Message */}
            <span className="text-[11px] font-mono text-white/40 whitespace-nowrap">
              {message}
            </span>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

export default memo(ShipAI);