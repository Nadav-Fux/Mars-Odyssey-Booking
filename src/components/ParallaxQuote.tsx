import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';

interface ParallaxQuoteProps {
  quote: string;
  author: string;
  role?: string;
  /** Signal-color accent */
  accentColor?: string;
  /** Show a typed transmission effect */
  transmission?: boolean;
}

/**
 * Dramatic full-width parallax quote/stat break.
 * The text types in letter-by-letter when scrolled into view,
 * with a subtle parallax offset and signal-interference flicker.
 */
export default function ParallaxQuote({
  quote,
  author,
  role,
  accentColor = '#FF4500',
  transmission = true
}: ParallaxQuoteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState('');
  const [cursor, setCursor] = useState(true);
  const [started, setStarted] = useState(false);

  // Parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y = useSpring(rawY, { stiffness: 80, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  // Start typing when in view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {if (e.isIntersecting && !started) setStarted(true);},
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  // Type writer effect
  useEffect(() => {
    if (!started || !transmission) {
      if (!transmission) setTyped(quote);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(quote.slice(0, i));
      if (i >= quote.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [started, quote, transmission]);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  const isComplete = typed.length >= quote.length;

  return (
    <div ref={ref} className="relative z-10 py-20 sm:py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at center, ${accentColor}06 0%, transparent 70%)`
      }} />


      {/* Horizontal signal lines */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
        <div
        className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}15, transparent)` }} />

        <div
        className="h-px w-full mt-[120px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}08, transparent)` }} />

        <div
        className="h-px w-full mt-[-240px]"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}08, transparent)` }} />

      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative max-w-4xl mx-auto text-center">

        {/* Transmission label */}
        {transmission &&
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EXPO_OUT }}
          className="flex items-center justify-center gap-2 mb-6">

            <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }} />

            <span
          className="text-[9px] font-display tracking-[0.3em]"
          style={{ color: `${accentColor}80` }}>

              INCOMING TRANSMISSION
            </span>
            <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }} />

          </motion.div>
        }

        {/* Quote text */}
        <blockquote className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.3] sm:leading-[1.35] text-white/80 mb-8">
          <span className="text-white/10">&ldquo;</span>
          {typed}
          {!isComplete &&
          <span
          className="inline-block w-[2px] h-[1em] ml-1 align-middle"
          style={{
            backgroundColor: cursor ? accentColor : 'transparent',
            transition: 'background-color 0.1s'
          }} />

          }
          {isComplete && <span className="text-white/10">&rdquo;</span>}
        </blockquote>

        {/* Author */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isComplete ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}>

          <div
          className="font-display text-sm font-semibold tracking-[0.15em]"
          style={{ color: accentColor }}>

            {author}
          </div>
          {role &&
          <div className="text-[10px] text-white/50 tracking-[0.2em] font-display mt-1">
              {role}
            </div>
          }
        </motion.div>

        {/* Signal strength bars */}
        <motion.div
          className="flex items-end justify-center gap-[3px] mt-8"
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}>

          {[0.3, 0.5, 0.7, 0.85, 1].map((h, i) =>
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ backgroundColor: `${accentColor}${i < 4 ? '60' : '30'}` }}
            initial={{ height: 0 }}
            animate={started ? { height: h * 18 } : {}}
            transition={{ delay: 0.6 + i * 0.1, duration: 0.4, ease: EXPO_OUT }} />

          )}
          <span
          className="text-[7px] font-display tracking-[0.15em] ml-2"
          style={{ color: `${accentColor}40` }}>

            SIGNAL STRONG
          </span>
        </motion.div>
      </motion.div>
    </div>);

}