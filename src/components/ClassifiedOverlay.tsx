import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Lock, Eye, Signal, Zap } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   CLASSIFIED INTEL OVERLAY

   Triggered by the Konami Code (↑↑↓↓←→←→BA).
   Shows a dramatic classified-files overlay with:
     • Glitch reveal animation
     • "CLASSIFIED" watermarks
     • Redacted text sections
     • Fake alien signal waveform
     • Secret mission coordinates
     • Auto-typing decrypt animation
   ================================================================ */

interface Props {
  open: boolean;
  onClose: () => void;
}

const REDACTED_LINES = [
{ label: 'MISSION DESIGNATION', value: 'ARES-X / DEEP-HORIZON', classified: false },
{ label: 'TRUE OBJECTIVE', value: '██████████ ████████ ███████', classified: true },
{ label: 'ANOMALY COORDINATES', value: '4.5895°S, 137.4417°E (Gale Crater sub-surface)', classified: false },
{ label: 'SIGNAL ORIGIN', value: '████████████ (NON-TERRESTRIAL)', classified: true },
{ label: 'FIRST DETECTED', value: 'SOL 1042 — Curiosity Extended Mission', classified: false },
{ label: 'SIGNAL PATTERN', value: '1.42 GHz — 37-PRIME SEQUENCE REPEATING', classified: false },
{ label: 'BIO-SIGNATURE MATCH', value: '████████ ██████ (PROBABILITY: ██.█%)', classified: true },
{ label: 'CREW CLEARANCE', value: 'LEVEL 7 — NEED-TO-KNOW ONLY', classified: false },
{ label: 'RETURN PROTOCOL', value: '████████████ ████ QUARANTINE ████████', classified: true }];


function SignalWaveform() {
  const [points, setPoints] = useState<string>('');

  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const w = 300;
      const pts: string[] = [];
      for (let x = 0; x < w; x += 2) {
        const noise = Math.sin(x * 0.08 + frame * 0.15) * 12 +
        Math.sin(x * 0.22 + frame * 0.08) * 6 +
        (Math.random() - 0.5) * 4;
        // Add periodic "burst" patterns
        const burst = Math.sin(x * 0.01 + frame * 0.05) > 0.7 ? Math.sin(x * 0.5) * 15 : 0;
        pts.push(`${x},${30 + noise + burst}`);
      }
      setPoints(pts.join(' '));
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <svg viewBox="0 0 300 60" className="w-full h-12 sm:h-16">
      <polyline
      points={points}
      fill="none"
      stroke="#22c55e"
      strokeWidth="1"
      strokeOpacity="0.6" />

      <polyline
      points={points}
      fill="none"
      stroke="#22c55e"
      strokeWidth="2"
      strokeOpacity="0.15"
      filter="url(#glow)" />

      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
    </svg>);

}

function TypingReveal({ text, delay = 0 }: {text: string;delay?: number;}) {
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [started, text]);

  if (!started) return <span className="text-white/5">DECRYPTING...</span>;
  return (
    <span>
      {typed}
      {typed.length < text.length && <span className="animate-pulse text-green-400/50">█</span>}
    </span>);

}

export default function ClassifiedOverlay({ open, onClose }: Props) {
  const [phase, setPhase] = useState<'flash' | 'content' | 'idle'>('flash');

  useEffect(() => {
    if (!open) {setPhase('flash');return;}
    const t1 = setTimeout(() => setPhase('content'), 300);
    const t2 = setTimeout(() => setPhase('idle'), 600);
    return () => {clearTimeout(t1);clearTimeout(t2);};
  }, [open]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Initial glitch flash */}
          {phase === 'flash' &&
        <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
        }

          {/* Content */}
          <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.5, ease: EXPO_OUT }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-[#0a0a12] border border-green-500/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}>

            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-green-500/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-[10px] font-display tracking-[0.3em] text-green-400/80 font-bold">ACCESS GRANTED</div>
                  <div className="text-[8px] font-display tracking-[0.2em] text-green-400/30">KONAMI CLEARANCE · LEVEL 10</div>
                </div>
              </div>
              <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-colors">

                <X className="w-3.5 h-3.5 text-white/30" />
              </button>
            </div>

            {/* CLASSIFIED watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none -rotate-12">
              <div className="font-display text-6xl sm:text-8xl font-bold tracking-[0.2em] text-red-500/[0.04]">
                CLASSIFIED
              </div>
            </div>

            {/* Body */}
            <div className="relative px-5 sm:px-6 py-5 space-y-5">
              {/* Title block */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/[0.08] border border-red-500/20 mb-3">
                  <Lock className="w-3 h-3 text-red-400/70" />
                  <span className="text-[8px] font-display tracking-[0.25em] text-red-400/70">TOP SECRET // SCI // NOFORN</span>
                </div>
                <h2 className="font-display text-lg sm:text-xl text-green-400/80 tracking-wider font-bold">
                  PROJECT DEEP-HORIZON
                </h2>
                <p className="text-[10px] font-display tracking-[0.15em] text-white/50 mt-1">
                  EYES ONLY — UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
                </p>
              </div>

              {/* Intel rows */}
              <div className="space-y-2.5">
                {REDACTED_LINES.map((line, i) =>
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-white/[0.03]">
                    <div className="shrink-0 flex items-center gap-1.5">
                      {line.classified ?
                  <Eye className="w-3 h-3 text-red-400/50" /> :

                  <Zap className="w-3 h-3 text-green-400/40" />
                  }
                      <span className="text-[9px] font-display tracking-[0.15em] text-white/50 font-medium">
                        {line.label}
                      </span>
                    </div>
                    <span className={`text-xs font-mono ${line.classified ? 'text-red-400/30 bg-red-500/[0.05] px-2 py-0.5 rounded' : 'text-green-400/50'}`}>
                      <TypingReveal text={line.value} delay={800 + i * 300} />
                    </span>
                  </div>
              )}
              </div>

              {/* Signal analysis */}
              <div className="mt-6 rounded-xl bg-green-500/[0.03] border border-green-500/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Signal className="w-3.5 h-3.5 text-green-400/60" />
                  <span className="text-[9px] font-display tracking-[0.2em] text-green-400/60 font-bold">INTERCEPTED SIGNAL — LIVE ANALYSIS</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-auto" />
                </div>
                <SignalWaveform />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[7px] font-display tracking-[0.2em] text-green-400/25">
                    FREQUENCY: 1.42 GHz (HYDROGEN LINE)
                  </span>
                  <span className="text-[7px] font-display tracking-[0.2em] text-green-400/25">
                    PATTERN: NON-RANDOM · 99.7% CONFIDENCE
                  </span>
                </div>
              </div>

              {/* Footer warning */}
              <div className="text-center pt-4 border-t border-white/[0.04]">
                <p className="text-[8px] font-display tracking-[0.2em] text-red-400/20">
                  THIS DOCUMENT IS THE PROPERTY OF ARES DEEP SPACE ADMINISTRATION
                </p>
                <p className="text-[7px] font-display tracking-[0.15em] text-white/8 mt-1">
                  REPRODUCTION OR DISTRIBUTION WITHOUT AUTHORIZATION IS PROHIBITED UNDER SPACE ACT §47.3
                </p>
              </div>
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.008) 2px, rgba(34,197,94,0.008) 4px)'
          }} />
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}