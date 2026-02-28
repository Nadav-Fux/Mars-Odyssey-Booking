import { useEffect, useRef, useCallback, useState, memo } from 'react';
import { useAchievements } from '@/hooks/useAchievements';

/* ================================================================
   ASTEROID DODGE  –  Terminal Mini-Game
   
   Arrow keys / touch to move ship.
   Survive as long as possible.
   Every 5s speed increases.
   Hit an asteroid = game over.
   ================================================================ */

interface Props {
  onExit: (score: number) => void;
}

// ── Constants ──
const SHIP_W = 28;
const SHIP_H = 20;
const ASTEROID_MIN = 12;
const ASTEROID_MAX = 30;
const STAR_COUNT = 80;
const SPAWN_BASE_INTERVAL = 900; // ms
const SPEED_BASE = 2.5;

// ── Types ──
interface Star {x: number;y: number;r: number;speed: number;opacity: number;}
interface Rock {x: number;y: number;r: number;speed: number;rotation: number;rotSpeed: number;}
interface Particle {x: number;y: number;vx: number;vy: number;life: number;maxLife: number;color: string;r: number;}

function AsteroidGame({ onExit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const { unlock } = useAchievements();

  // Game state held in refs for perf
  const shipY = useRef(0);
  const shipTargetY = useRef(0);
  const score = useRef(0);
  const highScore = useRef(Number(localStorage.getItem('ares_asteroid_hs') || '0'));
  const alive = useRef(true);
  const started = useRef(false);
  const speedMul = useRef(1);
  const rocks = useRef<Rock[]>([]);
  const stars = useRef<Star[]>([]);
  const particles = useRef<Particle[]>([]);
  const keysDown = useRef(new Set<string>());
  const startTime = useRef(0);
  const lastFrame = useRef(0);
  const touchY = useRef<number | null>(null);
  const flashRef = useRef(0);

  const [phase, setPhase] = useState<'ready' | 'playing' | 'dead'>('ready');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayHS, setDisplayHS] = useState(highScore.current);

  // ── Init stars ──
  const initStars = useCallback((w: number, h: number) => {
    stars.current = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, []);

  // ── Spawn explosion ──
  const explode = useCallback((x: number, y: number) => {
    const colors = ['#FF4500', '#ff6b35', '#fbbf24', '#f87171', '#fff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 4 + 1;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 1,
        maxLife: Math.random() * 40 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        r: Math.random() * 3 + 1
      });
    }
  }, []);

  // ── Start game ──
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const h = canvas.height;
    shipY.current = h / 2;
    shipTargetY.current = h / 2;
    score.current = 0;
    alive.current = true;
    started.current = true;
    speedMul.current = 1;
    rocks.current = [];
    particles.current = [];
    flashRef.current = 0;
    startTime.current = performance.now();
    lastFrame.current = performance.now();
    setPhase('playing');
  }, []);

  // ── Die ──
  const die = useCallback((x: number, y: number) => {
    alive.current = false;
    started.current = false;
    explode(x, y);
    flashRef.current = 1;
    const s = score.current;
    if (s > highScore.current) {
      highScore.current = s;
      localStorage.setItem('ares_asteroid_hs', String(s));
    }
    // Unlock achievement for surviving a decent run
    if (s >= 50) {
      unlock('simulator');
    }
    if (s >= 100) {
      unlock('speed_demon');
    }
    setDisplayScore(s);
    setDisplayHS(highScore.current);
    setPhase('dead');
  }, [explode, unlock]);

  // ── Main game loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    let w = 0,h = 0;

    function resize() {
      const rect = container!.getBoundingClientRect();
      w = Math.floor(rect.width);
      h = Math.floor(rect.height);
      canvas!.width = w;
      canvas!.height = h;
      if (stars.current.length === 0) initStars(w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── Draw ship ──
    function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number) {
      ctx.save();
      // engine glow
      const glow = ctx.createRadialGradient(x - 8, y, 2, x - 8, y, 14);
      glow.addColorStop(0, 'rgba(255, 120, 30, 0.8)');
      glow.addColorStop(0.5, 'rgba(255, 69, 0, 0.3)');
      glow.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 22, y - 14, 20, 28);

      // body
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(x + SHIP_W / 2, y);
      ctx.lineTo(x - SHIP_W / 2, y - SHIP_H / 2);
      ctx.lineTo(x - SHIP_W / 2 + 6, y);
      ctx.lineTo(x - SHIP_W / 2, y + SHIP_H / 2);
      ctx.closePath();
      ctx.fill();

      // cockpit
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x + 2, y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // wing stripes
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 7);
      ctx.lineTo(x - 12, y - 7);
      ctx.moveTo(x - 6, y + 7);
      ctx.lineTo(x - 12, y + 7);
      ctx.stroke();

      ctx.restore();
    }

    // ── Draw asteroid ──
    function drawAsteroid(ctx: CanvasRenderingContext2D, rock: Rock) {
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.rotation);
      // jagged circle
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = i / points * Math.PI * 2;
        const jitter = rock.r * (0.75 + Math.sin(i * 7.3) * 0.25);
        const px = Math.cos(angle) * jitter;
        const py = Math.sin(angle) * jitter;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // crater
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(rock.r * 0.2, -rock.r * 0.15, rock.r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ── Frame ──
    function frame(time: number) {
      rafRef.current = requestAnimationFrame(frame);
      const dt = Math.min(time - lastFrame.current, 32) / 16.67; // normalize to 60fps
      lastFrame.current = time;

      // ── Clear ──
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, w, h);

      // ── Stars ──
      for (const s of stars.current) {
        s.x -= s.speed * dt;
        if (s.x < 0) {s.x = w;s.y = Math.random() * h;}
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Playing logic ──
      if (alive.current && started.current) {
        // Score
        score.current = Math.floor((time - startTime.current) / 100);

        // Speed ramp every 5s
        const elapsed = (time - startTime.current) / 1000;
        speedMul.current = 1 + elapsed * 0.04;

        // Ship movement
        const moveSpeed = 5 * dt;
        if (keysDown.current.has('ArrowUp') || keysDown.current.has('w')) {
          shipTargetY.current = Math.max(SHIP_H / 2, shipTargetY.current - moveSpeed);
        }
        if (keysDown.current.has('ArrowDown') || keysDown.current.has('s')) {
          shipTargetY.current = Math.min(h - SHIP_H / 2, shipTargetY.current + moveSpeed);
        }
        // Touch
        if (touchY.current !== null) {
          shipTargetY.current = Math.max(SHIP_H / 2, Math.min(h - SHIP_H / 2, touchY.current));
        }

        // Smooth interpolate
        shipY.current += (shipTargetY.current - shipY.current) * 0.18 * dt;

        // Spawn asteroids
        const interval = SPAWN_BASE_INTERVAL / speedMul.current;
        if (time - spawnTimerRef.current > interval) {
          spawnTimerRef.current = time;
          const r = ASTEROID_MIN + Math.random() * (ASTEROID_MAX - ASTEROID_MIN);
          rocks.current.push({
            x: w + r,
            y: Math.random() * (h - r * 2) + r,
            r,
            speed: (SPEED_BASE + Math.random() * 2) * speedMul.current,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.06
          });
        }

        // Update asteroids
        const shipX = 60;
        for (let i = rocks.current.length - 1; i >= 0; i--) {
          const rock = rocks.current[i];
          rock.x -= rock.speed * dt;
          rock.rotation += rock.rotSpeed * dt;

          // Off screen
          if (rock.x + rock.r < 0) {
            rocks.current.splice(i, 1);
            continue;
          }

          // Collision (circle vs circle)
          const dx = rock.x - shipX;
          const dy = rock.y - shipY.current;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < rock.r + SHIP_H / 2 - 3) {
            die(shipX, shipY.current);
            break;
          }
        }
      }

      // ── Draw asteroids ──
      for (const rock of rocks.current) {
        drawAsteroid(ctx, rock);
      }

      // ── Draw ship ──
      if (alive.current && started.current) {
        drawShip(ctx, 60, shipY.current);
      }

      // ── Particles ──
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 1 / p.maxLife * dt;
        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Flash on death ──
      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 69, 0, ${flashRef.current * 0.35})`;
        ctx.fillRect(0, 0, w, h);
        flashRef.current = Math.max(0, flashRef.current - 0.03 * dt);
      }

      // ── HUD ──
      if (started.current && alive.current) {
        // Score
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '600 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${score.current}`, w - 12, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillText(`HI: ${highScore.current}`, w - 12, 38);
        ctx.textAlign = 'left';

        // Speed indicator
        ctx.fillStyle = 'rgba(255,69,0,0.5)';
        ctx.fillText(`WARP ×${speedMul.current.toFixed(1)}`, 12, 22);
      }
    }

    rafRef.current = requestAnimationFrame(frame);

    // ── Key handlers ──
    function keyDown(e: KeyboardEvent) {
      // Prevent terminal toggling while in game
      if (e.key === '`' || e.key === '~') {e.preventDefault();e.stopPropagation();return;}
      keysDown.current.add(e.key);
      if ((e.key === ' ' || e.key === 'Enter') && !started.current) {
        e.preventDefault();
        if (phase === 'dead' || !started.current) startGame();
      }
      if (e.key === 'Escape') {
        onExit(score.current);
      }
      if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
    }
    function keyUp(e: KeyboardEvent) {
      keysDown.current.delete(e.key);
    }
    // Touch
    function onTouchStart(e: TouchEvent) {
      if (!started.current) {startGame();return;}
      const rect = canvas!.getBoundingClientRect();
      touchY.current = e.touches[0].clientY - rect.top;
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      touchY.current = e.touches[0].clientY - rect.top;
    }
    function onTouchEnd() {touchY.current = null;}

    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('keyup', keyUp, true);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('keydown', keyDown, true);
      window.removeEventListener('keyup', keyUp, true);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase-aware restart (for click/touch after dead)
  const handleRestart = useCallback(() => {
    if (phase === 'dead') startGame();
    if (phase === 'ready') startGame();
  }, [phase, startGame]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[200px]">
      <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full rounded-b-lg"
      style={{ imageRendering: 'pixelated' }} />


      {/* Ready overlay */}
      {phase === 'ready' &&
      <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 cursor-pointer"
      onClick={handleRestart}>

          <div className="text-center">
            <div className="text-[10px] font-display tracking-[0.2em] text-primary/50 mb-2">
              ARES-7 TACTICAL SIMULATION
            </div>
            <div className="text-xl font-display tracking-[0.15em] text-white/90 font-bold mb-1">
              ASTEROID DODGE
            </div>
            <div className="text-[11px] font-mono text-white/30 mb-4">
              Navigate through the asteroid field
            </div>
            <div className="inline-block px-4 py-2 border border-primary/30 rounded-lg">
              <span className="text-[11px] font-display tracking-[0.15em] text-primary/70 animate-pulse">
                PRESS SPACE / TAP TO LAUNCH
              </span>
            </div>
            <div className="mt-4 flex gap-6 justify-center text-[9px] font-mono text-white/50">
              <span>↑↓ or W/S to steer</span>
              <span>ESC to abort</span>
            </div>
            {highScore.current > 0 &&
          <div className="mt-3 text-[10px] font-mono text-yellow-400/40">
                HIGH SCORE: {highScore.current}
              </div>
          }
          </div>
        </div>
      }

      {/* Game Over overlay */}
      {phase === 'dead' &&
      <div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 cursor-pointer"
      onClick={handleRestart}>

          <div className="text-center">
            <div className="text-[10px] font-display tracking-[0.2em] text-red-400/60 mb-2">
              ⚠ COLLISION DETECTED
            </div>
            <div className="text-xl font-display tracking-[0.15em] text-white/90 font-bold mb-3">
              MISSION FAILED
            </div>
            <div className="flex gap-8 justify-center mb-4">
              <div className="text-center">
                <div className="text-[9px] font-display tracking-[0.15em] text-white/50">SCORE</div>
                <div className="text-2xl font-display font-bold text-primary/90">{displayScore}</div>
              </div>
              <div className="text-center">
                <div className="text-[9px] font-display tracking-[0.15em] text-white/50">BEST</div>
                <div className="text-2xl font-display font-bold text-yellow-400/80">{displayHS}</div>
              </div>
            </div>
            {displayScore >= displayHS && displayScore > 0 &&
          <div className="text-[10px] font-display tracking-[0.15em] text-yellow-400/70 mb-3 animate-pulse">
                ★ NEW HIGH SCORE ★
              </div>
          }
            <div className="inline-block px-4 py-2 border border-primary/30 rounded-lg">
              <span className="text-[11px] font-display tracking-[0.15em] text-primary/70 animate-pulse">
                PRESS SPACE / TAP TO RETRY
              </span>
            </div>
            <div className="mt-3 text-[9px] font-mono text-white/50">
              ESC to return to terminal
            </div>
          </div>
        </div>
      }
    </div>);

}

export default memo(AsteroidGame);