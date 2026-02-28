import { useRef, useEffect, useMemo, memo } from 'react';
import { gsap } from '@/lib/gsap';
import { ScrollTrigger } from '@/lib/gsap';

/**
 * RevealText
 *
 * Splits children text into individual <span>-wrapped words.
 * Each word fades in (0 → 1 opacity) with a slight upward slide
 * (12px → 0) triggered by GSAP ScrollTrigger when the paragraph
 * enters the viewport.
 *
 * Props:
 *  • text        — the paragraph string
 *  • className   — styling on the outer <p> wrapper
 *  • stagger     — delay between each word (default 0.045s)
 *  • duration    — per-word animation duration (default 0.5s)
 *  • y           — upward slide distance (default 12)
 *  • start       — ScrollTrigger start (default 'top 88%')
 *  • as          — HTML tag (default 'p')
 */

interface RevealTextProps {
  text: string;
  className?: string;
  stagger?: number;
  duration?: number;
  y?: number;
  start?: string;
  as?: 'p' | 'span' | 'div';
}

function RevealText({
  text,
  className = '',
  stagger = 0.045,
  duration = 0.5,
  y: slideY = 12,
  start = 'top 88%',
  as: Tag = 'p'
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  // Split into words once
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasAnimated.current) return;

    const wordEls = el.querySelectorAll<HTMLSpanElement>('.rv-word');
    if (!wordEls.length) return;

    // Set initial state
    gsap.set(wordEls, { opacity: 0, y: slideY });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        hasAnimated.current = true;
        gsap.to(wordEls, {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'expo.out'
        });
      }
    });

    return () => {
      trigger.kill();
    };
  }, [words, stagger, duration, slideY, start]);

  return (
    // @ts-ignore — Tag is a valid HTML element
    <Tag ref={containerRef as any} className={className}>
      {words.map((word, i) =>
      <span
      key={`${word}-${i}`}
      className="rv-word inline-block"
      style={{ opacity: 0, marginRight: '0.3em' }}>

          {word}
        </span>
      )}
    </Tag>);

}

export default memo(RevealText);