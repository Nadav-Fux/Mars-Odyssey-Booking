import { useEffect, useRef, memo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  pulse: number;
  layer: number;
  coreColor: string;
  glowColor: string;
}

// Scroll parallax per layer
const LAYER_SCROLL_PARALLAX = [0.02, 0.06, 0.14];
// Mouse parallax per layer
const LAYER_MOUSE_PARALLAX = [8, 28, 60];
const LAYER_SIZE = [0.6, 1.0, 1.8];
const LAYER_ALPHA = [0.25, 0.45, 0.7];
const MOUSE_LERP = 0.06;

// Check if battery-saver mode is active
const isSaving = () => document.documentElement.classList.contains('battery-saver');

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);
  const lastShootRef = useRef(0);
  const scrollRef = useRef(0);
  const viewH = useRef(0);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  // Frame-skip for battery saver: draw every Nth frame
  const frameCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    const resize = () => {
      // Cap DPR at 1 on mobile for massive perf gain
      const isMobile = window.innerWidth < 768;
      const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5);
      const w = window.innerWidth;
      // Only size canvas to viewport, not full scroll height
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewH.current = h;
      initStars(w, h);
    };

    const initStars = (w: number, h: number) => {
      const isMobile = w < 768;
      // Significantly reduced counts
      const maxCount = isMobile ? 100 : 250;
      const count = Math.min(Math.floor((w * h) / 6000), maxCount);

      starsRef.current = Array.from({ length: count }, () => {
        const layer = Math.random() < 0.4 ? 0 : Math.random() < 0.65 ? 1 : 2;
        const hue = Math.random() > 0.88 ? 15 + Math.random() * 20 : 220 + Math.random() * 30;
        return {
          x: Math.random() * w,
          y: Math.random() * h * 3, // spread across scrollable area
          size: (Math.random() * 1.5 + 0.3) * LAYER_SIZE[layer],
          alpha: (Math.random() * 0.4 + 0.15) * LAYER_ALPHA[layer],
          speed: (Math.random() * 0.15 + 0.02) * (layer + 1),
          pulse: Math.random() * 0.004 + 0.001,
          layer,
          coreColor: `hsla(${hue | 0}, 40%, 92%, `,
          glowColor: `hsla(${hue | 0}, 60%, 85%, `,
        };
      });
    };

    /* Scroll tracking */
    let scrollTicking = false;
    const onScroll = () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          scrollRef.current = window.scrollY;
          scrollTicking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Mouse tracking */
    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseTarget.current.x = (e.clientX - cx) / cx;
      mouseTarget.current.y = (e.clientY - cy) / cy;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onMouseLeave = () => {
      mouseTarget.current.x = 0;
      mouseTarget.current.y = 0;
    };
    document.addEventListener('mouseleave', onMouseLeave);

    resize();
    window.addEventListener('resize', resize);

    const w = () => window.innerWidth;
    const vh = () => viewH.current;

    /* Draw loop */
    const draw = (t: number) => {
      frameCount.current++;

      // In battery-saver mode, only draw every 3rd frame (~20fps)
      if (isSaving() && frameCount.current % 3 !== 0) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const cw = w();
      const cvh = vh();
      ctx.clearRect(0, 0, cw, cvh);
      const scroll = scrollRef.current;

      // Smooth-lerp mouse
      const mc = mouseCurrent.current;
      const mt = mouseTarget.current;
      mc.x += (mt.x - mc.x) * MOUSE_LERP;
      mc.y += (mt.y - mc.y) * MOUSE_LERP;

      const mouseOffX = LAYER_MOUSE_PARALLAX.map((p) => mc.x * p);
      const mouseOffY = LAYER_MOUSE_PARALLAX.map((p) => mc.y * p);

      const saving = isSaving();

      for (const s of starsRef.current) {
        const scrollOffset = scroll * LAYER_SCROLL_PARALLAX[s.layer];
        const drawX = s.x + mouseOffX[s.layer];
        // Viewport-relative Y: wrap star positions around scroll
        const rawY = ((s.y - scrollOffset) % (cvh * 3) + cvh * 3) % (cvh * 3) - cvh;
        const drawY = rawY;

        // Viewport culling — canvas is viewport-sized now
        if (drawY < -20 || drawY > cvh + 20) {
          s.y += s.speed * 0.1;
          continue;
        }

        const flicker = saving ? 0.85 : Math.sin(t * s.pulse + s.x) * 0.3 + 0.7;
        const a = s.alpha * flicker;

        // Glow only for big stars AND not in battery-saver
        if (!saving && s.size > 1.8) {
          const r = s.size * 3;
          const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, r);
          g.addColorStop(0, s.glowColor + (a * 0.18).toFixed(3) + ')');
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(drawX, drawY, r, 0, 6.2832);
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(drawX, drawY, s.size, 0, 6.2832);
        ctx.fillStyle = s.coreColor + a.toFixed(3) + ')';
        ctx.fill();

        // Cross-flare — only on desktop, not saving, big near-layer stars
        if (!saving && s.layer === 2 && s.size > 2.2 && cw >= 768) {
          ctx.globalAlpha = a * 0.18;
          ctx.strokeStyle = s.coreColor + '1)';
          ctx.lineWidth = 0.5;
          const fL = s.size * 5;
          ctx.beginPath();
          ctx.moveTo(drawX - fL, drawY);
          ctx.lineTo(drawX + fL, drawY);
          ctx.moveTo(drawX, drawY - fL);
          ctx.lineTo(drawX, drawY + fL);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Drift
        s.y += s.speed * 0.1;
        s.x -= s.speed * 0.03;
        if (s.x < 0) s.x = cw;
      }

      /* Shooting stars — skip in battery-saver */
      if (!saving) {
        if (t - lastShootRef.current > 5000 + Math.random() * 7000) {
          lastShootRef.current = t;
          const angle = Math.PI / 5 + Math.random() * 0.5;
          const spd = 14 + Math.random() * 8;
          shootingRef.current.push({
            x: Math.random() * cw * 0.6 + cw * 0.1,
            y: Math.random() * cvh * 0.4,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 1,
          });
        }

        shootingRef.current = shootingRef.current.filter((sh) => sh.life > 0);
        for (const sh of shootingRef.current) {
          const len = 120 * sh.life;
          const tX = sh.x - (sh.vx * len) / 14;
          const tY = sh.y - (sh.vy * len) / 14;
          const g = ctx.createLinearGradient(sh.x, sh.y, tX, tY);
          g.addColorStop(0, `rgba(255,200,140,${sh.life})`);
          g.addColorStop(0.4, `rgba(255,69,0,${sh.life * 0.5})`);
          g.addColorStop(1, 'transparent');
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(tX, tY);
          ctx.stroke();

          const hg = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 5);
          hg.addColorStop(0, `rgba(255,255,255,${sh.life})`);
          hg.addColorStop(1, 'transparent');
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(sh.x, sh.y, 5, 0, 6.2832);
          ctx.fill();

          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.life -= 0.009;
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
     
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

export default memo(StarField);
