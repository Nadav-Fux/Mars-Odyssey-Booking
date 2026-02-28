import { useRef, useCallback, useMemo } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * KineticTitle
 *
 * Renders each letter of the hero H1 as an individually-animated
 * inline-block span. When the user hovers over the title:
 *
 *  1. Every letter **scatters** — flies to a random offset with
 *     random rotation and scale, radiating outward from cursor.
 *  2. After a brief hang, letters **regroup** with a springy
 *     elastic ease back to their origin.
 *
 * "FRONTIER" letters get per-letter gradient colours so the
 * fire-gradient persists even when scattered.
 */

// Gradient stops: from-primary (#FF4500) → via-accent (#ff6b35) → to-primary (#FF4500)
function lerpColor(t: number): string {
  // 0→0.5: #FF4500 → #ff6b35   0.5→1: #ff6b35 → #FF4500
  const r1 = 255,g1 = 69,b1 = 0;
  const r2 = 255,g2 = 107,b2 = 53;
  const tt = t <= 0.5 ? t * 2 : (1 - t) * 2;
  const r = Math.round(r1 + (r2 - r1) * tt);
  const g = Math.round(g1 + (g2 - g1) * tt);
  const b = Math.round(b1 + (b2 - b1) * tt);
  return `rgb(${r},${g},${b})`;
}

interface WordDef {
  text: string;
  gradient: boolean;
  /** extra space after word */
  spaceAfter?: boolean;
}

const WORDS: WordDef[] = [
{ text: "HUMANITY'S", gradient: false },
{ text: '\n', gradient: false }, // line break
{ text: 'NEXT', gradient: false, spaceAfter: true },
{ text: 'FRONTIER', gradient: true }];


function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function KineticTitle() {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const scatteredRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Build the flat list of letters with metadata
  const letters = useMemo(() => {
    const result: {char: string;color: string;isBreak: boolean;wordIdx: number;letterIdx: number;spaceAfter: boolean;}[] = [];
    WORDS.forEach((w, wi) => {
      if (w.text === '\n') {
        result.push({ char: '\n', color: '', isBreak: true, wordIdx: wi, letterIdx: 0, spaceAfter: false });
        return;
      }
      const chars = w.text.split('');
      chars.forEach((c, ci) => {
        const color = w.gradient ?
        lerpColor(ci / Math.max(chars.length - 1, 1)) :
        'white';
        result.push({
          char: c,
          color,
          isBreak: false,
          wordIdx: wi,
          letterIdx: ci,
          spaceAfter: w.spaceAfter === true && ci === chars.length - 1
        });
      });
    });
    return result;
  }, []);

  // Assign ref slots
  const setRef = useCallback(
    (el: HTMLSpanElement | null, i: number) => {
      lettersRef.current[i] = el;
    },
    []
  );

  // --- SCATTER ---
  const scatter = useCallback(
    (e: React.MouseEvent) => {
      if (scatteredRef.current) return;
      scatteredRef.current = true;

      // Kill any running timeline
      tlRef.current?.kill();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const els = lettersRef.current.filter(Boolean) as HTMLSpanElement[];

      // Scatter phase
      const tl = gsap.timeline();
      tlRef.current = tl;

      els.forEach((el) => {
        const elRect = el.getBoundingClientRect();
        const elCx = elRect.left + elRect.width / 2 - rect.left;
        const elCy = elRect.top + elRect.height / 2 - rect.top;

        // Direction away from cursor
        let dx = elCx - cx;
        let dy = elCy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Normalise and add randomness
        const force = rand(50, 120);
        dx = dx / dist * force + rand(-30, 30);
        dy = dy / dist * force + rand(-25, 25);
        const rot = rand(-35, 35);
        const sc = rand(0.6, 0.9);

        tl.to(
          el,
          {
            x: dx,
            y: dy,
            rotation: rot,
            scale: sc,
            opacity: rand(0.4, 0.8),
            duration: 0.45,
            ease: 'expo.out'
          },
          0
        );
      });

      // Regroup phase (starts after short hang)
      tl.addLabel('regroup', '+=0.12');

      els.forEach((el, i) => {
        tl.to(
          el,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.9,
            ease: 'elastic.out(1, 0.4)'
          },
          `regroup+=${i * 0.018}`
        );
      });

      tl.eventCallback('onComplete', () => {
        scatteredRef.current = false;
      });
    },
    []
  );

  // Build line idx for rendering
  let lineIdx = 0;

  return (
    <h1
    ref={containerRef}
    onMouseEnter={scatter}
    className="font-display font-bold tracking-tight mb-5 sm:mb-6 cursor-default select-none"
    style={{ lineHeight: 1.05 }}>

      {letters.map((l, i) => {
        if (l.isBreak) {
          lineIdx++;
          return (
            <span key={`br-${i}`} className="block h-0" aria-hidden="true" />);

        }

        const isGradientLetter = l.color !== 'white';

        return (
          <span
          key={`${l.char}-${i}`}
          ref={(el) => setRef(el, i)}
          className={`hero-line inline-block text-[clamp(2rem,6vw,4.5rem)] will-change-transform ${
          l.char === ' ' ? 'w-[0.3em]' : ''}`
          }
          style={{
            color: isGradientLetter ? l.color : 'white',
            filter: isGradientLetter ?
            'drop-shadow(0 0 18px rgba(255,69,0,0.3))' :
            undefined,
            display: 'inline-block',
            // Prevent layout reflow during GSAP transforms
            transformOrigin: 'center center'
          }}
          aria-hidden={l.char === ' ' ? 'true' : undefined}>

            {l.char === ' ' ? '\u00A0' : l.char}
            {/* Add a trailing space if this letter ends a word-with-space */}
            {l.spaceAfter &&
            <span className="inline-block w-[0.35em]" aria-hidden="true">
                &nbsp;
              </span>
            }
          </span>);

      })}
    </h1>);

}