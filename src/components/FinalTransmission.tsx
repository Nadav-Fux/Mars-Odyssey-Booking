import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Radio, Rocket, ArrowRight } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/**
 * Full-screen dramatic CTA before footer.
 * Features:
 *  - Animated "signal sending to Mars" pulse rings
 *  - Typing terminal line "ESTABLISHING UPLINK…"
 *  - Big glowing CTA button
 *  - Particle drift background
 */

const TERMINAL_LINES = [
{ text: '> ESTABLISHING DEEP-SPACE UPLINK...', delay: 0 },
{ text: '> SIGNAL ROUTED VIA L2 RELAY CHAIN', delay: 1200 },
{ text: '> MARS GROUND STATION: ONLINE', delay: 2200 },
{ text: '> SEAT ALLOCATION SYSTEM: READY', delay: 3000 },
{ text: '> AWAITING YOUR CONFIRMATION_', delay: 3800 }];


function TerminalLine({ text, delay, started }: {text: string;delay: number;started: boolean;}) {
  const [typed, setTyped] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(timer);
  }, [started, delay]);

  useEffect(() => {
    if (!active) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [active, text]);

  if (!active) return null;

  const isComplete = typed.length >= text.length;
  const isStatus = text.includes('ONLINE') || text.includes('READY');

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="font-mono text-[11px] sm:text-xs leading-relaxed">

      <span className={isStatus && isComplete ? 'text-green-400/70' : 'text-white/30'}>
        {typed}
      </span>
      {!isComplete &&
      <span className="inline-block w-[6px] h-[13px] ml-0.5 bg-primary/70 animate-pulse align-middle" />
      }
    </motion.div>);

}

function PulseRing({ delay, size }: {delay: number;size: number;}) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 rounded-full border border-primary/20 pointer-events-none"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2
      }}
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{
        scale: [0.3, 1.2],
        opacity: [0.6, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeOut'
      }} />);


}

export default function FinalTransmission() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Start terminal when scrolled into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {if (e.isIntersecting) setStarted(true);},
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // GSAP entrance
  useGSAP(() => {
    gsap.from('.ft-element', {
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 0.9,
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
    ref={ref}
    className="relative z-10 py-28 sm:py-40 px-6 overflow-hidden">

      {/* Background radial */}
      <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(255,69,0,0.04) 0%, transparent 60%)'
      }} />


      {/* Pulse rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <PulseRing delay={0} size={300} />
        <PulseRing delay={0.8} size={500} />
        <PulseRing delay={1.6} size={700} />
        <PulseRing delay={2.4} size={900} />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Signal icon */}
        <div className="ft-element flex justify-center mb-8">
          <motion.div
            className="relative w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,69,0,0.06)',
              border: '1px solid rgba(255,69,0,0.15)',
              boxShadow: '0 0 40px rgba(255,69,0,0.1)'
            }}
            animate={{ boxShadow: [
              '0 0 40px rgba(255,69,0,0.1)',
              '0 0 60px rgba(255,69,0,0.2)',
              '0 0 40px rgba(255,69,0,0.1)']
            }}
            transition={{ duration: 3, repeat: Infinity }}>

            <Radio className="w-7 h-7 text-primary" />
          </motion.div>
        </div>

        {/* Heading */}
        <h2 className="ft-element font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] text-center mb-3">
          DON'T LET THIS
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            SIGNAL FADE
          </span>
        </h2>

        <p className="ft-element text-white/50 text-sm sm:text-base text-center max-w-lg mx-auto mb-10 leading-relaxed">
          Only 47 seats remain for the March 2026 launch window.
          Every second you wait, the signal gets weaker.
        </p>

        {/* Terminal block */}
        <div
        className="ft-element rounded-2xl overflow-hidden mb-10 mx-auto max-w-xl"
        style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>

          {/* Terminal header */}
          <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>

            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[9px] font-mono text-white/50 tracking-wider ml-2">
              ARES-X UPLINK TERMINAL
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-4 sm:p-5 space-y-1.5 min-h-[110px]">
            {TERMINAL_LINES.map((line) =>
            <TerminalLine
              key={line.text}
              text={line.text}
              delay={line.delay}
              started={started} />

            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="ft-element flex justify-center">
          <motion.button
            onClick={scrollToBooking}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-10 py-4 sm:py-5 rounded-2xl font-display text-sm sm:text-base font-bold tracking-[0.15em] text-white cursor-pointer overflow-hidden">

            {/* Glow bg */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 rounded-2xl" />
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ width: '50%' }} />

            <span className="relative flex items-center gap-3">
              <Rocket className="w-4 h-4 -rotate-45" />
              SECURE MY SEAT NOW
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
        </div>

        {/* Urgency note */}
        <motion.p
          className="text-center mt-6 text-[10px] font-display tracking-[0.15em] text-white/50"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}>

          ⚡ 3 SEATS BOOKED IN THE LAST HOUR
        </motion.p>
      </div>
    </section>);

}