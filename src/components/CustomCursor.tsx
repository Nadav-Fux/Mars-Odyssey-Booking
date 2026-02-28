import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';

/**
 * CustomCursor — Tactical HUD Reticle
 *
 * Default:  Crosshair + rotating segmented ring + cardinal ticks + coordinate readout
 * Hover:   Expanding square-bracket [ ] target lock with Mars Red glow
 * Click:   Impact flash + compressed brackets
 */

type CursorVariant = 'default' | 'hover' | 'click';

const SPRING = { damping: 28, stiffness: 450, mass: 0.4 };

export default function CustomCursor() {
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [coords, setCoords] = useState({ cx: 0, cy: 0 });

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const x = useSpring(cursorX, SPRING);
  const y = useSpring(cursorY, SPRING);
  const rafRef = useRef(0);

  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const spinRef = useRef(0);

  useEffect(() => {
    if (isTouchDevice) return;
    const tick = () => {
      angleRef.current = (angleRef.current + 0.15) % 360;
      setAngle(angleRef.current);
      spinRef.current = requestAnimationFrame(tick);
    };
    spinRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(spinRef.current);
  }, [isTouchDevice]);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    document.documentElement.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        setCoords({ cx: e.clientX, cy: e.clientY });
        if (!visible) setVisible(true);
      });
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setVariant('click');
    const onUp = () => setVariant((v) => v === 'click' ? 'default' : v);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    const setupTracking = () => {
      const sel = 'a, button, [role="button"], input, select, textarea, .cursor-hover';
      const els = document.querySelectorAll(sel);
      const enter = () => setVariant('hover');
      const leave = () => setVariant('default');
      els.forEach((el) => {
        (el as HTMLElement).style.cursor = 'none';
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
      });
      return () => {
        els.forEach((el) => {
          el.removeEventListener('mouseenter', enter);
          el.removeEventListener('mouseleave', leave);
        });
      };
    };

    let cleanup = setupTracking();
    const obs = new MutationObserver(() => {
      cleanup();
      cleanup = setupTracking();
    });
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.documentElement.style.cursor = '';
      obs.disconnect();
      cleanup();
    };
  }, [visible, cursorX, cursorY]);

  if (isTouchDevice) return null;

  const sizes: Record<CursorVariant, number> = { default: 44, hover: 60, click: 36 };
  const sz = sizes[variant];
  const half = sz / 2;

  // Coordinate label
  const cxLabel = String(coords.cx).padStart(4, '0');
  const cyLabel = String(coords.cy).padStart(4, '0');

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none"
      style={{ x, y, zIndex: 9999, mixBlendMode: 'difference' }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ opacity: { duration: 0.12 } }}>

      <motion.div
        className="relative"
        style={{ marginLeft: -half, marginTop: -half }}
        animate={{ width: sz, height: sz }}
        transition={{ type: 'spring', damping: 22, stiffness: 350 }}>

        <svg
        width={sz}
        height={sz}
        viewBox="0 0 100 100"
        fill="none"
        className="w-full h-full overflow-visible">

          <AnimatePresence mode="wait">
            {/* ═══ DEFAULT — Tactical Reticle ═══ */}
            {variant === 'default' &&
            <motion.g
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>

                {/* Center dot */}
                <circle cx="50" cy="50" r="1.8" fill="white" />

                {/* Crosshair lines (gap in center) */}
                <line x1="50" y1="16" x2="50" y2="38" stroke="white" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
                <line x1="50" y1="62" x2="50" y2="84" stroke="white" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
                <line x1="16" y1="50" x2="38" y2="50" stroke="white" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
                <line x1="62" y1="50" x2="84" y2="50" stroke="white" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />

                {/* Distance ticks on crosshairs */}
                {[24, 30].map((d) =>
              <g key={`tick-d-${d}`}>
                    <line x1={50 - 2} y1={d} x2={50 + 2} y2={d} stroke="white" strokeWidth="0.4" strokeOpacity="0.3" />
                    <line x1={50 - 2} y1={100 - d} x2={50 + 2} y2={100 - d} stroke="white" strokeWidth="0.4" strokeOpacity="0.3" />
                    <line x1={d} y1={50 - 2} x2={d} y2={50 + 2} stroke="white" strokeWidth="0.4" strokeOpacity="0.3" />
                    <line x1={100 - d} y1={50 - 2} x2={100 - d} y2={50 + 2} stroke="white" strokeWidth="0.4" strokeOpacity="0.3" />
                  </g>
              )}

                {/* Inner ring */}
                <circle cx="50" cy="50" r="14" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />

                {/* Rotating segmented outer ring */}
                <g transform={`rotate(${angle} 50 50)`}>
                  {[0, 90, 180, 270].map((a) =>
                <path
                key={a}
                d={describeArc(50, 50, 26, a + 8, a + 72)}
                stroke="white"
                strokeWidth="0.7"
                strokeOpacity="0.3"
                strokeLinecap="round"
                fill="none" />

                )}
                </g>

                {/* Counter-rotating thin ring */}
                <g transform={`rotate(${-angle * 0.6} 50 50)`}>
                  {[0, 120, 240].map((a) =>
                <path
                key={`inner-${a}`}
                d={describeArc(50, 50, 20, a + 5, a + 35)}
                stroke="white"
                strokeWidth="0.3"
                strokeOpacity="0.15"
                fill="none" />

                )}
                </g>

                {/* Cardinal tick marks */}
                {[0, 90, 180, 270].map((a) =>
              <line key={`tick-${a}`} x1="50" y1="4" x2="50" y2="10" stroke="white" strokeWidth="0.6" strokeOpacity="0.2" transform={`rotate(${a} 50 50)`} />
              )}
                {[45, 135, 225, 315].map((a) =>
              <line key={`dtick-${a}`} x1="50" y1="7" x2="50" y2="11" stroke="white" strokeWidth="0.3" strokeOpacity="0.1" transform={`rotate(${a} 50 50)`} />
              )}

                {/* Coordinate readout */}
                <text x="94" y="96" fill="white" fillOpacity="0.18" fontSize="5" fontFamily="Orbitron, monospace" textAnchor="end">
                  {cxLabel},{cyLabel}
                </text>
              </motion.g>
            }

            {/* ═══ HOVER — Square-Bracket Target Lock ═══ */}
            {variant === 'hover' &&
            <motion.g
              key="hover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}>

                {/* Glow backdrop */}
                <motion.circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#FF4500"
                strokeWidth="0.4"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 0.12, scale: 1 }}
                transition={{ duration: 0.2 }} />


                {/* Breathing ring */}
                <motion.circle
                cx="50" cy="50" r="38"
                fill="none" stroke="#FF4500" strokeWidth="0.3"
                animate={{ r: [38, 42, 38], opacity: [0.08, 0.02, 0.08] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />


                {/* Center dot (pulsing) */}
                <motion.circle
                cx="50" cy="50" r="2.5" fill="#FF4500"
                animate={{ r: [2.5, 3.2, 2.5], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} />


                {/* Connecting cross */}
                <line x1="50" y1="34" x2="50" y2="43" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="50" y1="57" x2="50" y2="66" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="34" y1="50" x2="43" y2="50" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="57" y1="50" x2="66" y2="50" stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.2" />

                {/* ── SQUARE BRACKETS ── */}
                {/* Each bracket corner draws in with pathLength animation */}
                {[
              { d: 'M32 14 L14 14 L14 32', delay: 0 },
              { d: 'M68 14 L86 14 L86 32', delay: 0.03 },
              { d: 'M14 68 L14 86 L32 86', delay: 0.06 },
              { d: 'M86 68 L86 86 L68 86', delay: 0.09 }].
              map((b, i) =>
              <motion.path
                key={`bracket-${i}`}
                d={b.d}
                stroke="#FF4500"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: EXPO_OUT, delay: b.delay }} />

              )}

                {/* Corner glow pips */}
                {[
              [14, 14], [86, 14], [14, 86], [86, 86]].
              map(([cx, cy], i) =>
              <motion.circle
                key={`pip-${i}`}
                cx={cx} cy={cy} r="1.8"
                fill="#FF4500"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.9, 0.35, 0.9] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }} />

              )}

                {/* Inner bracket edge glow lines */}
                <line x1="14" y1="22" x2="14" y2="28" stroke="#FF4500" strokeWidth="0.6" strokeOpacity="0.15" />
                <line x1="86" y1="22" x2="86" y2="28" stroke="#FF4500" strokeWidth="0.6" strokeOpacity="0.15" />
                <line x1="14" y1="72" x2="14" y2="78" stroke="#FF4500" strokeWidth="0.6" strokeOpacity="0.15" />
                <line x1="86" y1="72" x2="86" y2="78" stroke="#FF4500" strokeWidth="0.6" strokeOpacity="0.15" />

                {/* LOCK ON label */}
                <text x="50" y="96" fill="#FF4500" fillOpacity="0.3" fontSize="4.5" fontFamily="Orbitron, monospace" textAnchor="middle" letterSpacing="2">
                  LOCK
                </text>
              </motion.g>
            }

            {/* ═══ CLICK — Impact Flash ═══ */}
            {variant === 'click' &&
            <motion.g
              key="click"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}>

                <motion.circle
                cx="50" cy="50" r="28"
                stroke="white" strokeWidth="2.5"
                fill="rgba(255,69,0,0.06)"
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 400 }} />

                <motion.circle
                cx="50" cy="50" r="14"
                stroke="white" strokeWidth="0.8" fill="none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 20 }} />

                <motion.circle
                cx="50" cy="50" r="3" fill="white"
                initial={{ scale: 2.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }} />

                {[
              'M38 38 L30 38 L30 44',
              'M62 38 L70 38 L70 44',
              'M30 56 L30 62 L38 62',
              'M70 56 L70 62 L62 62'].
              map((d, i) =>
              <motion.path
                key={`cb-${i}`}
                d={d}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.08, delay: i * 0.02 }} />

              )}
              </motion.g>
            }
          </AnimatePresence>
        </svg>
      </motion.div>
    </motion.div>);

}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}