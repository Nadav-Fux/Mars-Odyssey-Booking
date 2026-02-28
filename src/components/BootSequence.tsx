import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   BOOT SEQUENCE

   Cinematic spacecraft computer startup animation.
   Shows ONCE per browser session (sessionStorage flag).

   Phases:
     1. Black screen → cursor blink
     2. Terminal lines type out (system diagnostics)
     3. ARES-X ASCII logo reveal
     4. Progress bar fills
     5. "ALL SYSTEMS NOMINAL" flash
     6. Dramatic scale-down reveal of the actual site
   ================================================================ */

const BOOT_LINES: {text: string;delay: number;color?: string;}[] = [
{ text: '> ARES-X FLIGHT COMPUTER v7.4.1', delay: 0, color: '#FF4500' },
{ text: '> INITIALIZING CORE SYSTEMS...', delay: 400 },
{ text: '', delay: 600 },
{ text: '  [NAV]      Navigation Module      ......... OK', delay: 800, color: '#22c55e' },
{ text: '  [COMMS]    Deep-Space Relay       ......... OK', delay: 1000, color: '#22c55e' },
{ text: '  [LIFE-SUP] Life Support Array     ......... OK', delay: 1200, color: '#22c55e' },
{ text: '  [NTP-DRV]  Nuclear Thermal Drive  ......... OK', delay: 1400, color: '#22c55e' },
{ text: '  [RAD-SHLD] Radiation Shielding    ......... OK', delay: 1600, color: '#22c55e' },
{ text: '  [DOCKING]  Docking Interface      ......... OK', delay: 1800, color: '#22c55e' },
{ text: '', delay: 2000 },
{ text: '> LOADING MISSION PROFILE: MARS-SURFACE-OPS', delay: 2100 },
{ text: '> CREW MANIFEST: 6 SPECIALISTS VERIFIED', delay: 2400 },
{ text: '> TARGET: JEZERO CRATER · 18.38°N 77.58°E', delay: 2700 },
{ text: '', delay: 2900 },
{ text: '> ALL SYSTEMS NOMINAL', delay: 3000, color: '#22c55e' },
{ text: '> AWAITING OPERATOR...', delay: 3300, color: '#FF4500' }];


const STORAGE_KEY = 'ares-x-booted';

function TypingLine({ text, color, started }: {text: string;color?: string;started: boolean;}) {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || !text) {setTyped(text);setDone(true);return;}
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {clearInterval(id);setDone(true);}
    }, 15);
    return () => clearInterval(id);
  }, [started, text]);

  return (
    <div className="font-mono text-[10px] sm:text-xs leading-relaxed h-[1.4em] whitespace-pre" style={{ color: color || 'rgba(255,255,255,0.4)' }}>
      {typed}
      {started && !done && <span className="animate-pulse">█</span>}
    </div>);

}

export default function BootSequence({ children }: {children: React.ReactNode;}) {
  // Synchronous check — returning visitors skip the overlay entirely on first render
  const [phase, setPhase] = useState<'boot' | 'progress' | 'reveal' | 'done'>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY)) {
      return 'done';
    }
    return 'boot';
  });
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const didBoot = useRef(phase === 'done'); // true if skipped from sessionStorage

  // Drive the boot line reveals
  useEffect(() => {
    if (phase !== 'boot' || didBoot.current) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });
    // After last line, go to progress phase
    timers.push(setTimeout(() => setPhase('progress'), BOOT_LINES[BOOT_LINES.length - 1].delay + 600));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Drive the progress bar
  useEffect(() => {
    if (phase !== 'progress') return;
    let p = 0;
    const id = setInterval(() => {
      p += 2 + Math.random() * 4;
      if (p >= 100) {p = 100;clearInterval(id);setTimeout(() => setPhase('reveal'), 400);}
      setProgress(p);
    }, 40);
    return () => clearInterval(id);
  }, [phase]);

  // Reveal → done
  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(STORAGE_KEY, '1');
    }, 1200);
    return () => clearTimeout(t);
  }, [phase]);

  // ★ Critical: After boot completes, refresh GSAP ScrollTrigger.
  //   During the boot, children are in position:fixed which gives GSAP
  //   wrong layout measurements. We need to recalculate after children
  //   return to normal document flow.
  useEffect(() => {
    if (phase !== 'done' || didBoot.current) return;
    // Wait for layout to stabilize + exit animation to finish
    const t = setTimeout(() => {
      import('@/lib/gsap').then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, 300);
    return () => clearTimeout(t);
  }, [phase]);

  // Skip handler
  const handleSkip = useCallback(() => {
    if (phase === 'done') return;
    setPhase('done');
    sessionStorage.setItem(STORAGE_KEY, '1');
  }, [phase]);

  const showOverlay = phase !== 'done';

  // If already booted (from sessionStorage), skip the wrapper entirely
  if (didBoot.current) return <>{children}</>;

  return (
    <>
      {/* Children always mounted — hidden behind overlay until boot completes */}
      <div style={showOverlay ? { visibility: 'hidden', position: 'fixed', inset: 0, pointerEvents: 'none' } : undefined}>
        {children}
      </div>

      {/* Boot overlay — AnimatePresence handles exit animation properly */}
      <AnimatePresence>
        {showOverlay &&
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: EXPO_OUT }}
          className="fixed inset-0 z-[9999] bg-[#020204] flex items-center justify-center cursor-pointer"
          onClick={handleSkip}>

            <div className="w-full max-w-xl px-6">
              {/* ASCII-style logo */}
              {phase === 'boot' && visibleLines === 0 &&
            <div className="text-center mb-8">
                  <div className="w-1.5 h-5 bg-primary/60 mx-auto animate-pulse" />
                </div>
            }

              {/* Terminal lines */}
              {(phase === 'boot' || phase === 'progress') &&
            <div className="mb-6">
                  {BOOT_LINES.slice(0, visibleLines).map((line, i) =>
              <TypingLine key={i} text={line.text} color={line.color} started={true} />
              )}
                </div>
            }

              {/* Progress bar */}
              {phase === 'progress' &&
            <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/50">LOADING MISSION DATA</span>
                    <span className="font-mono text-[9px] tracking-wider text-primary/60">{Math.floor(progress)}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #FF4500, #ff6b35)',
                  boxShadow: '0 0 10px rgba(255,69,0,0.4)'
                }} />

                  </div>
                </div>
            }

              {/* Reveal flash */}
              {phase === 'reveal' &&
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center">

                  <div className="font-display text-2xl sm:text-3xl font-bold text-white tracking-[0.15em] mb-2" style={{ textShadow: '0 0 30px rgba(255,69,0,0.4)' }}>
                    ARES<span className="text-primary">-X</span>
                  </div>
                  <div className="text-[9px] font-display tracking-[0.3em] text-green-400/60">ALL SYSTEMS ONLINE</div>
                </motion.div>
            }

              {/* Skip hint */}
              {phase === 'boot' && visibleLines >= 3 &&
            <div className="text-center mt-8">
                  <span className="text-[8px] font-display tracking-[0.2em] text-white/10 animate-pulse">CLICK ANYWHERE TO SKIP</span>
                </div>
            }
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)'
          }} />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)'
          }} />
          </motion.div>
        }
      </AnimatePresence>
    </>);

}