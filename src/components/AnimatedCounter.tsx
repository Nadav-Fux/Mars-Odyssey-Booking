import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  /** Target number (e.g. 54.6, 7, 2847) */
  target: number;
  /** Number of decimals to show */
  decimals?: number;
  /** Prefix (e.g. "") or suffix text */
  suffix?: string;
  /** Duration in ms */
  duration?: number;
  /** Custom formatting (e.g. add commas) */
  format?: (n: number) => string;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function AnimatedCounter({
  target,
  decimals = 0,
  duration = 2200,
  format,
  suffix,
  className = ''
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState('0');
  const hasRun = useRef(false);

  const formatNumber = useCallback(
    (n: number) => {
      if (format) return format(n);
      const fixed = n.toFixed(decimals);
      // Add commas to integer part
      const [int, dec] = fixed.split('.');
      const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return dec ? `${withCommas}.${dec}` : withCommas;
    },
    [format, decimals]
  );

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * target;
      setDisplay(formatNumber(current));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, target, duration, formatNumber]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix &&
      <span className="text-[10px] sm:text-xs text-primary/80 ml-1 font-medium">
          {suffix}
        </span>
      }
    </span>);

}