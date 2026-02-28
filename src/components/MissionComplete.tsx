import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useAchievements, ACHIEVEMENTS } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';
import { X } from 'lucide-react';

/* ================================================================
   MISSION COMPLETE CEREMONY

   Triggered when user unlocks ALL 10 achievements.
   Cinematic full-screen overlay with:
     • Canvas confetti particles
     • Dramatic reveal: "MISSION COMPLETE"
     • Commander name + callsign
     • ALPHA-1 clearance badge
     • All 10 earned achievement badges
     • Auto-entry to Mission Log
   Shows once per session.
   ================================================================ */

const SESSION_KEY = 'ares-mission-complete-shown';

// ── Confetti particle system ──
interface Particle {
  x: number;y: number;vx: number;vy: number;
  size: number;color: string;rotation: number;rotSpeed: number;
  life: number;shape: 'rect' | 'circle';
}

const COLORS = ['#FF4500', '#fbbf24', '#f97316', '#a855f7', '#3b82f6', '#22c55e', '#ec4899', '#fff'];

function spawnConfetti(w: number, h: number): Particle[] {
  return Array.from({ length: 120 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    const speed = 4 + Math.random() * 8;
    return {
      x: w / 2 + (Math.random() - 0.5) * w * 0.4,
      y: h + 10,
      vx: Math.cos(angle) * speed * (Math.random() - 0.5) * 3,
      vy: -speed - Math.random() * 4,
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      life: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    };
  });
}

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const waveRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Spawn waves
    particles.current = spawnConfetti(canvas.width, canvas.height);
    const waveTimer = setInterval(() => {
      waveRef.current++;
      if (waveRef.current < 4) {
        particles.current.push(...spawnConfetti(canvas.width, canvas.height));
      }
    }, 800);

    function frame() {
      rafRef.current = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.vy += 0.12; // gravity
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.life -= 0.004;

        if (p.life <= 0 || p.y > canvas!.height + 20) {
          particles.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(waveTimer);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

// ── Main Component ──
function MissionComplete() {
  const { totalUnlocked, totalAchievements, unlocked } = useAchievements();
  const { logEvent } = useMissionLog();
  const [show, setShow] = useState(false);
  const triggeredRef = useRef(false);

  const commanderName = localStorage.getItem('ares_commander_name') || 'COMMANDER';
  const callsign = localStorage.getItem('ares_callsign') || 'ARES-001';

  // Trigger when all achievements unlocked
  useEffect(() => {
    if (totalUnlocked >= totalAchievements && !triggeredRef.current) {
      // Check session flag
      if (sessionStorage.getItem(SESSION_KEY)) return;
      triggeredRef.current = true;
      sessionStorage.setItem(SESSION_KEY, '1');
      // Small delay for the last achievement toast to show first
      setTimeout(() => {
        setShow(true);
        logEvent('ALL ACHIEVEMENTS UNLOCKED. Mission status: COMPLETE.');
      }, 2500);
    }
  }, [totalUnlocked, totalAchievements, logEvent]);

  const close = useCallback(() => setShow(false), []);

  return (
    <AnimatePresence>
      {show &&
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}>

          {/* Backdrop */}
          <motion.div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,69,0,0.15) 0%, rgba(2,2,8,0.95) 70%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }} />


          {/* Confetti */}
          <ConfettiCanvas />

          {/* Close */}
          <button
        onClick={close}
        className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-white/5 border border-white/10
              flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">


            <X className="w-5 h-5 text-white/50" />
          </button>

          {/* Content */}
          <div className="relative z-20 text-center px-6 max-w-lg">
            {/* Top badge */}
            <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EXPO_OUT }}
            className="inline-block mb-4">

              <div className="text-[10px] font-display tracking-[0.3em] text-amber-400/60 border border-amber-400/20 rounded-full px-4 py-1">
                ★ CLEARANCE: ALPHA-1 ★
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: EXPO_OUT }}
            className="text-4xl sm:text-5xl font-display font-bold tracking-[0.15em] text-white/95 mb-2">

              MISSION<br />
              <span className="text-primary">COMPLETE</span>
            </motion.h1>

            {/* Commander info */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: EXPO_OUT }}
            className="mb-6">

              <div className="text-lg font-display tracking-[0.12em] text-white/70">
                {commanderName}
              </div>
              <div className="text-[10px] font-mono text-primary/50 mt-0.5">
                {callsign}
              </div>
            </motion.div>

            {/* Stats line */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex items-center justify-center gap-6 mb-6">

              <div className="text-center">
                <div className="text-2xl font-display font-bold text-amber-400/90">{totalUnlocked}</div>
                <div className="text-[8px] font-display tracking-[0.18em] text-white/50">ACHIEVEMENTS</div>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-green-400/90">100%</div>
                <div className="text-[8px] font-display tracking-[0.18em] text-white/50">COMPLETION</div>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary/90">
                  {localStorage.getItem('ares_asteroid_hs') || '0'}
                </div>
                <div className="text-[8px] font-display tracking-[0.18em] text-white/50">HI-SCORE</div>
              </div>
            </motion.div>

            {/* Achievement badges grid */}
            <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6, ease: EXPO_OUT }}
            className="flex flex-wrap justify-center gap-2 mb-8">

              {ACHIEVEMENTS.map((a, i) =>
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 + i * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
              className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20
                    flex items-center justify-center text-lg"

              title={a.title}>

                  {a.icon}
                </motion.div>
            )}
            </motion.div>

            {/* Certificate text */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.8 }}>

              <div className="text-[9px] font-display tracking-[0.2em] text-white/50 mb-3">
                INTERPLANETARY TRANSIT AUTHORITY · CERTIFICATE OF COMPLETION
              </div>
              <p className="text-[11px] font-mono text-white/35 leading-relaxed max-w-sm mx-auto">
                This certifies that {commanderName || 'the Commander'} ({callsign}) has demonstrated
                exceptional aptitude in all aspects of the ARES-7 Mars mission programme
                and is hereby granted full clearance for interplanetary travel.
              </p>
            </motion.div>

            {/* Dismiss */}
            <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            onClick={close}
            className="mt-6 px-6 py-2 rounded-full border border-primary/30 text-[10px] font-display
                tracking-[0.15em] text-primary/70 hover:bg-primary/10 transition-colors cursor-pointer">


              RETURN TO MISSION CONTROL
            </motion.button>
          </div>

          {/* Scanlines */}
          <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }} />

        </motion.div>
      }
    </AnimatePresence>);

}

export default memo(MissionComplete);