import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { Copy, Check } from 'lucide-react';

/**
 * CopyCoordinates
 *
 * A tactical button that displays Mars landing coordinates.
 * On click:
 *  1. Copies the coordinate string to the clipboard
 *  2. Spawns 30-40 "data stream" character particles that converge
 *     from a scattered field INTO the button (like data being captured)
 *  3. Each particle is a random hex/numeric glyph that flies inward
 *     with staggered timing, fading as it reaches the center
 *  4. A brief "COPIED" confirmation state with a check icon
 */

const COORDS = '4.5024°N  137.4477°E';
const CLIPBOARD_TEXT = 'Mars Landing Zone \u2014 4.5024\u00b0N 137.4477\u00b0E \u2014 Jezero Crater, Syrtis Major Quadrangle';

// Characters for the data stream
const GLYPHS = '0123456789ABCDEF°.’NESW█░▒▓■○●×→↻ΔΣΩ';
function randGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}
function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface Particle {
  id: number;
  char: string;
  /** Start position relative to button center */
  startX: number;
  startY: number;
  /** Animation duration */
  dur: number;
  /** Delay before starting */
  delay: number;
  /** Font size */
  size: number;
  /** Colour intensity (brighter = closer) */
  hue: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    // Spawn in a ring around the button, biased upward for the "streaming in" feel
    const angle = Math.random() * Math.PI * 2;
    const radius = rand(80, 220);
    return {
      id: i,
      char: randGlyph(),
      startX: Math.cos(angle) * radius,
      startY: Math.sin(angle) * radius - rand(0, 40), // slight upward bias
      dur: rand(0.5, 1.0),
      delay: rand(0, 0.35),
      size: rand(7, 13),
      hue: rand(15, 35) // orange hue range
    };
  });
}

function CopyCoordinates() {
  const [copied, setCopied] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [streaming, setStreaming] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCopy = useCallback(async () => {
    if (streaming) return;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(CLIPBOARD_TEXT);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = CLIPBOARD_TEXT;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // Trigger data stream
    const count = Math.floor(rand(30, 42));
    setParticles(generateParticles(count));
    setStreaming(true);

    // After particles converge, show "copied" state
    timeoutRef.current = setTimeout(() => {
      setCopied(true);
      setStreaming(false);
      setParticles([]);

      // Reset after 2s
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }, 1200);
  }, [streaming]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="relative inline-flex">
      {/* Data stream particles */}
      <AnimatePresence>
        {streaming &&
        <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
            {particles.map((p) =>
          <motion.span
            key={p.id}
            className="absolute font-display font-bold pointer-events-none select-none"
            style={{
              left: '50%',
              top: '50%',
              fontSize: p.size,
              color: `hsl(${p.hue}, 100%, 60%)`,
              textShadow: `0 0 6px hsl(${p.hue}, 100%, 50%, 0.6)`,
              willChange: 'transform, opacity'
            }}
            initial={{
              x: p.startX,
              y: p.startY,
              opacity: 0.9,
              scale: 1
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0.3
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              ease: EXPO_OUT // custom cubic-bezier for "pulled in" feel
            }}>

                {p.char}
              </motion.span>
          )}

            {/* Central flash on convergence */}
            <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{
              width: [0, 80, 0],
              height: [0, 80, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{ duration: 0.8, delay: 0.6, ease: EXPO_OUT }}
            style={{
              background: 'radial-gradient(circle, rgba(255,120,40,0.4), transparent 70%)',
              filter: 'blur(8px)'
            }} />

          </div>
        }
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        ref={btnRef}
        onClick={handleCopy}
        className={`hero-metric relative group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
        copied ?
        'bg-primary/10 border-primary/30' :
        'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'}`
        }
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}>

        {/* Glow on hover */}
        <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,69,0,0.06), transparent 70%)'
        }} />


        {/* Streaming border glow */}
        <AnimatePresence>
          {streaming &&
          <motion.div
            className="absolute inset-0 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: 'inset 0 0 20px rgba(255,100,30,0.15), 0 0 30px rgba(255,69,0,0.1)',
              border: '1px solid rgba(255,100,30,0.25)',
              borderRadius: 'inherit'
            }} />

          }
        </AnimatePresence>

        <div className="relative flex items-center gap-2.5">
          {/* Coordinate display */}
          <div className="text-left">
            <div className="text-[8px] font-display text-white/50 tracking-[0.2em] mb-0.5">
              LANDING ZONE
            </div>
            <div className="font-display text-xs sm:text-sm font-bold tracking-wider">
              <AnimatePresence mode="wait">
                {copied ?
                <motion.span
                  key="copied"
                  className="text-primary"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EXPO_OUT }}>

                    DATA CAPTURED
                  </motion.span> :
                streaming ?
                <motion.span
                  key="streaming"
                  className="text-orange-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.4, repeat: Infinity }}>

                    STREAMING…
                  </motion.span> :

                <motion.span
                  key="coords"
                  className="text-white/70 group-hover:text-white/90 transition-colors"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EXPO_OUT }}>

                    {COORDS}
                  </motion.span>
                }
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-white/[0.06]" />

          {/* Icon */}
          <div className="relative w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {copied ?
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}>

                  <Check className="w-3.5 h-3.5 text-primary" />
                </motion.div> :

              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}>

                  <Copy className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </motion.button>
    </div>);

}

export default memo(CopyCoordinates);