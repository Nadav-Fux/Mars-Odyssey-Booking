import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { Volume2, VolumeX } from 'lucide-react';

const BAR_COUNT = 52;

function createSpaceSoundscape(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Deep sub-bass drone
  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 42;
  const droneG = ctx.createGain();
  droneG.gain.value = 0.14;
  drone.connect(droneG).connect(master);
  drone.start();

  // LFO on drone
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 3;
  lfo.connect(lfoG).connect(drone.frequency);
  lfo.start();

  // Cosmic hiss (filtered noise)
  const bufLen = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const nf = ctx.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.value = 220;
  nf.Q.value = 0.8;
  const ng = ctx.createGain();
  ng.gain.value = 0.07;
  noise.connect(nf).connect(ng).connect(master);
  noise.start();

  // LFO on noise filter
  const nfLfo = ctx.createOscillator();
  nfLfo.type = 'sine';
  nfLfo.frequency.value = 0.03;
  const nfLfoG = ctx.createGain();
  nfLfoG.gain.value = 80;
  nfLfo.connect(nfLfoG).connect(nf.frequency);
  nfLfo.start();

  // Ethereal pad (two detuned sines)
  const pad1 = ctx.createOscillator();
  pad1.type = 'sine';
  pad1.frequency.value = 110;
  const pad2 = ctx.createOscillator();
  pad2.type = 'sine';
  pad2.frequency.value = 112.5;
  const pg = ctx.createGain();
  pg.gain.value = 0.035;
  pad1.connect(pg);
  pad2.connect(pg);
  pg.connect(master);
  pad1.start();
  pad2.start();

  // Pad sweep
  const pLfo = ctx.createOscillator();
  pLfo.type = 'triangle';
  pLfo.frequency.value = 0.02;
  const pLfoG = ctx.createGain();
  pLfoG.gain.value = 8;
  pLfo.connect(pLfoG).connect(pad1.frequency);
  pLfo.connect(pLfoG).connect(pad2.frequency);
  pLfo.start();

  // High shimmer
  const shim = ctx.createOscillator();
  shim.type = 'sine';
  shim.frequency.value = 880;
  const shimG = ctx.createGain();
  shimG.gain.value = 0.008;
  shim.connect(shimG).connect(master);
  shim.start();
  const shimLfo = ctx.createOscillator();
  shimLfo.type = 'sine';
  shimLfo.frequency.value = 0.15;
  const shimLfoG = ctx.createGain();
  shimLfoG.gain.value = 0.006;
  shimLfo.connect(shimLfoG).connect(shimG.gain);
  shimLfo.start();

  // Analyser for visualizer
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.82;
  master.connect(analyser);

  return { master, analyser, stop: () => {
      [drone, lfo, noise, pad1, pad2, nfLfo, pLfo, shim, shimLfo].forEach((n) => {
        try {n.stop();} catch {}
      });
    } };
}

export default function SpaceAudio() {
  const [active, setActive] = useState(false);
  const [showVis, setShowVis] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const soundRef = useRef<ReturnType<typeof createSpaceSoundscape> | null>(null);
  const frameRef = useRef(0);
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(0));

  const toggle = useCallback(() => {
    if (!active) {
      // Start audio
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const sound = createSpaceSoundscape(ctx);
      soundRef.current = sound;

      // Fade in
      sound.master.gain.setValueAtTime(0, ctx.currentTime);
      sound.master.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 2);

      setActive(true);
      setShowVis(true);

      // Visualizer loop
      const dataArray = new Uint8Array(sound.analyser.frequencyBinCount);
      const tick = () => {
        sound.analyser.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / BAR_COUNT);
        const newBars: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          // Average nearby bins
          let sum = 0;
          for (let j = 0; j < step; j++) sum += dataArray[i * step + j] || 0;
          newBars.push(sum / step / 255);
        }
        barsRef.current = newBars;
        setBars([...newBars]);
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } else {
      // Fade out
      const ctx = ctxRef.current;
      const sound = soundRef.current;
      if (ctx && sound) {
        sound.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(() => {
          cancelAnimationFrame(frameRef.current);
          sound.stop();
          ctx.close();
          ctxRef.current = null;
          soundRef.current = null;
          setShowVis(false);
          setBars(new Array(BAR_COUNT).fill(0));
        }, 1600);
      }
      setActive(false);
    }
  }, [active]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      soundRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={toggle}
        className={`fixed bottom-5 right-5 lg:bottom-16 lg:right-5 z-50 w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
        active ?
        'bg-primary/15 border-primary/30 text-primary shadow-lg shadow-primary/20' :
        'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08]'}`
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title={active ? 'Mute Deep Space Audio' : 'Enable Deep Space Audio'}>

        {active ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        {active &&
        <motion.div
          className="absolute inset-0 rounded-xl border border-primary/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }} />

        }
      </motion.button>

      {/* Frequency visualizer bar */}
      <AnimatePresence>
        {showVis &&
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: EXPO_OUT }}>

            <svg
          viewBox={`0 0 ${BAR_COUNT * 8} 60`}
          className="w-full h-10 sm:h-12"
          preserveAspectRatio="none">

              <defs>
                <linearGradient id="vis-grad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#FF4500" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF4500" stopOpacity="0.05" />
                </linearGradient>
                <filter id="vis-glow">
                  <feGaussianBlur stdDeviation="1.5" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {bars.map((val, i) => {
              const barH = Math.max(val * 50, 1);
              const x = i * 8;
              const mirror = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
              const opacity = 0.4 + (1 - mirror) * 0.6;
              return (
                <rect
                key={i}
                x={x + 1}
                y={60 - barH}
                width={5}
                height={barH}
                rx={2}
                fill="url(#vis-grad)"
                opacity={opacity}
                filter={val > 0.5 ? 'url(#vis-glow)' : undefined} />);


            })}
              {/* Horizontal glow line at base */}
              <line
            x1="0" y1="59" x2={BAR_COUNT * 8} y2="59"
            stroke="#FF4500" strokeWidth="0.5" strokeOpacity="0.2" />

            </svg>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}