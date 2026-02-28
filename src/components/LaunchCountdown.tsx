import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';

// Launch date: March 15, 2026
const LAUNCH = new Date('2027-03-15T09:00:00Z').getTime();

interface TimeUnit {
  value: number;
  label: string;
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function FlipDigit({ value, label }: {value: string;label: string;}) {
  const prev = useRef(value);
  const changed = prev.current !== value;
  prev.current = value;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={changed ? { y: -14, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.35, ease: EXPO_OUT }}
            className="block font-mono text-[11px] sm:text-xs font-bold text-white tabular-nums">

            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[7px] sm:text-[8px] text-white/50 tracking-[0.15em] font-display uppercase">
        {label}
      </span>
    </div>);

}

export default function LaunchCountdown() {
  const [diff, setDiff] = useState(() => Math.max(0, LAUNCH - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, LAUNCH - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const secs = Math.floor(diff / 1000);
  const days = Math.floor(secs / 86400);
  const hrs = Math.floor(secs % 86400 / 3600);
  const mins = Math.floor(secs % 3600 / 60);
  const s = secs % 60;

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2">
      <FlipDigit value={String(days)} label="DAYS" />
      <span className="text-primary/40 text-[10px] font-mono mt-[-8px]">:</span>
      <FlipDigit value={pad(hrs)} label="HRS" />
      <span className="text-primary/40 text-[10px] font-mono mt-[-8px]">:</span>
      <FlipDigit value={pad(mins)} label="MIN" />
      <span className="text-primary/40 text-[10px] font-mono mt-[-8px]">:</span>
      <FlipDigit value={pad(s)} label="SEC" />
    </div>);

}