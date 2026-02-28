import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { Waves } from 'lucide-react';

/* ================================================================
   SOUNDSCAPE ENGINE

   Toggle on / off via the floating button (bottom-left).

   When active:
     • Plays a persistent low-frequency "engine hum" built from
       layered oscillators + filtered noise  (Web Audio API).
     • Every interactive element (button, a, [role=button], etc.)
       gets a sci-fi "click" sound on mousedown.
     • Hovering those same elements triggers a subtle high-freq blip.
   ================================================================ */

// ================================================================
// 1. ENGINE HUM  — multi-harmonic rumble with slow LFO breathing
// ================================================================

interface HumNodes {
  master: GainNode;
  stop(): void;
}

function createEngineHum(ctx: AudioContext): HumNodes {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Compressor for cohesion
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  comp.knee.value = 10;
  comp.connect(master);

  // ── Fundamental — 36 Hz sine (deep rumble)
  const fund = ctx.createOscillator();
  fund.type = 'sine';
  fund.frequency.value = 36;
  const fundG = ctx.createGain();
  fundG.gain.value = 0.22;
  fund.connect(fundG).connect(comp);
  fund.start();

  // ── 2nd harmonic — 72 Hz triangle (body)
  const h2 = ctx.createOscillator();
  h2.type = 'triangle';
  h2.frequency.value = 72;
  const h2G = ctx.createGain();
  h2G.gain.value = 0.10;
  h2.connect(h2G).connect(comp);
  h2.start();

  // ── 3rd harmonic — 108 Hz sawtooth (mechanical edge)
  const h3 = ctx.createOscillator();
  h3.type = 'sawtooth';
  h3.frequency.value = 108;
  const h3G = ctx.createGain();
  h3G.gain.value = 0.03;
  h3.connect(h3G).connect(comp);
  h3.start();

  // ── Sub-bass throb — 24 Hz sine for chest-rattle
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 24;
  const subG = ctx.createGain();
  subG.gain.value = 0.13;
  sub.connect(subG).connect(comp);
  sub.start();

  // ── Turbine noise — bandpass-filtered white noise
  const bufLen = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 90;
  bp.Q.value = 2.5;
  const nG = ctx.createGain();
  nG.gain.value = 0.055;
  noise.connect(bp).connect(nG).connect(comp);
  noise.start();

  // ── Amplitude LFO — slow breathing (0.12 Hz)
  const ampLfo = ctx.createOscillator();
  ampLfo.type = 'sine';
  ampLfo.frequency.value = 0.12;
  const ampLfoG = ctx.createGain();
  ampLfoG.gain.value = 0.04;
  ampLfo.connect(ampLfoG).connect(master.gain);
  ampLfo.start();

  // ── Frequency wobble on fundamental (0.07 Hz)
  const freqLfo = ctx.createOscillator();
  freqLfo.type = 'sine';
  freqLfo.frequency.value = 0.07;
  const freqLfoG = ctx.createGain();
  freqLfoG.gain.value = 1.8;
  freqLfo.connect(freqLfoG).connect(fund.frequency);
  freqLfo.start();

  // ── Noise filter sweep (0.04 Hz)
  const nLfo = ctx.createOscillator();
  nLfo.type = 'triangle';
  nLfo.frequency.value = 0.04;
  const nLfoG = ctx.createGain();
  nLfoG.gain.value = 30;
  nLfo.connect(nLfoG).connect(bp.frequency);
  nLfo.start();

  return {
    master,
    stop: () => {
      [fund, h2, h3, sub, noise, ampLfo, freqLfo, nLfo].forEach((n) => {
        try {n.stop();} catch {/* already stopped */}
      });
    }
  };
}

// ================================================================
// 2. CLICK SOUND  — Star-Trek-LCARS-style sci-fi click
// ================================================================

function playClick(ctx: AudioContext) {
  const t = ctx.currentTime;

  // Layer 1 — main tone sweep 1800 → 650 Hz
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1800, t);
  osc1.frequency.exponentialRampToValueAtTime(650, t + 0.06);
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0.13, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc1.connect(g1).connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + 0.1);

  // Layer 2 — sharp hi-freq transient 4500 Hz
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 4500;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.06, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  osc2.connect(g2).connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + 0.04);

  // Layer 3 — filtered noise burst (crackle)
  const bufLen = Math.ceil(ctx.sampleRate * 0.04);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3500;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.07, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
  noise.connect(hp).connect(ng).connect(ctx.destination);
  noise.start(t);
}

// ================================================================
// 3. HOVER BLIP  — very subtle high-freq micro-beep
// ================================================================

function playHover(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2400, t);
  osc.frequency.exponentialRampToValueAtTime(1800, t + 0.025);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.035, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.045);
}

// ================================================================
// 4. INTERACTIVE-ELEMENT DETECTOR
// ================================================================

const INTERACTIVE_SELECTOR = 'button, a, [role="button"], [tabindex], select, label, summary';

function isInteractive(target: EventTarget | null): boolean {
  const el = target as HTMLElement;
  if (!el?.closest) return false;
  return !!el.closest(INTERACTIVE_SELECTOR);
}

// ================================================================
// 5. COMPONENT
// ================================================================

function SoundscapeEngine() {
  const [active, setActive] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const humRef = useRef<HumNodes | null>(null);
  const lastHoveredRef = useRef<Element | null>(null);

  // ── Toggle ──
  const toggle = useCallback(() => {
    if (!active) {
      const ctx = new AudioContext();
      ctx.resume();
      ctxRef.current = ctx;

      const hum = createEngineHum(ctx);
      humRef.current = hum;

      // Fade in over 2.5 s
      hum.master.gain.setValueAtTime(0, ctx.currentTime);
      hum.master.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.5);

      setActive(true);
    } else {
      const ctx = ctxRef.current;
      const hum = humRef.current;
      if (ctx && hum) {
        hum.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(() => {
          hum.stop();
          ctx.close();
          ctxRef.current = null;
          humRef.current = null;
        }, 1600);
      }
      setActive(false);
    }
  }, [active]);

  // ── Global click + hover listeners ──
  useEffect(() => {
    if (!active) return;

    const onClick = (e: MouseEvent) => {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state === 'closed') return;
      if (isInteractive(e.target)) playClick(ctx);
    };

    const onMouseOver = (e: MouseEvent) => {
      const ctx = ctxRef.current;
      if (!ctx || ctx.state === 'closed') return;
      const el = (e.target as HTMLElement)?.closest?.(INTERACTIVE_SELECTOR);
      if (el && el !== lastHoveredRef.current) {
        lastHoveredRef.current = el;
        playHover(ctx);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(INTERACTIVE_SELECTOR);
      if (el === lastHoveredRef.current) lastHoveredRef.current = null;
    };

    document.addEventListener('mousedown', onClick, true);
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);

    return () => {
      document.removeEventListener('mousedown', onClick, true);
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('mouseout', onMouseOut, true);
    };
  }, [active]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      humRef.current?.stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed bottom-5 left-5 lg:left-24 z-50 select-none">
      {/* Toggle button */}
      <motion.button
        onClick={toggle}
        className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border cursor-pointer ${
        active ?
        'bg-primary/15 border-primary/30 text-primary shadow-lg shadow-primary/20' :
        'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08]'}`
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title={active ? 'Disable Engine Soundscape' : 'Enable Engine Soundscape'}>

        <Waves className="w-4 h-4" />

        {/* Pulse ring when active */}
        <AnimatePresence>
          {active &&
          <motion.div
            className="absolute inset-0 rounded-xl border border-primary/40"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />

          }
        </AnimatePresence>
      </motion.button>

      {/* Label tooltip */}
      <AnimatePresence>
        {active &&
        <motion.div
          className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(8,8,18,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.3, ease: EXPO_OUT }}>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {/* Tiny animated waveform bars */}
                {[0, 1, 2, 3, 4].map((i) =>
              <motion.div
                key={i}
                className="w-[2px] rounded-full bg-primary/60"
                animate={{ height: [3, 6 + Math.random() * 6, 3] }}
                transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }} />

              )}
              </div>
              <span className="text-[8px] font-display tracking-[0.15em] text-primary/60">ENGINE HUM</span>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

export default memo(SoundscapeEngine);