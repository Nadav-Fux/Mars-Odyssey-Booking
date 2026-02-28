import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { ChevronDown, Zap } from 'lucide-react';
import RealisticMars from '@/components/RealisticMars';
import MagneticButton from '@/components/MagneticButton';
import KineticTitle from '@/components/KineticTitle';
import RevealText from '@/components/RevealText';
import CopyCoordinates from '@/components/CopyCoordinates';
import LaunchCountdown from '@/components/LaunchCountdown';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Entrance timeline
      const tl = gsap.timeline();
      tl.from('.hero-overline', { y: 20, opacity: 0, duration: 0.6, delay: 0.6 }).
      from('.hero-line', { y: 60, opacity: 0, stagger: 0.18, duration: 0.9 }, '-=0.3').
      from('.hero-desc', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4').
      from('.hero-cta-group', { y: 20, opacity: 0, duration: 0.7 }, '-=0.3').
      from('.hero-metric', { y: 30, opacity: 0, stagger: 0.12, duration: 0.6 }, '-=0.3');

      // === MARS — single timeline, single ScrollTrigger ===
      const marsTl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=180%',
          scrub: 1.5,
          invalidateOnRefresh: true
        }
      });

      // 0% → 55%: scale up + rotate (Mars fully visible)
      marsTl.fromTo(
        '.mars-scroll-wrap',
        { scale: 1, rotation: 0, yPercent: 0, opacity: 1 },
        { scale: 1.6, rotation: 10, yPercent: -12, opacity: 1, ease: 'none', duration: 0.55 }
      );

      // 55% → 100%: fade out while still scaling
      marsTl.to('.mars-scroll-wrap', {
        opacity: 0,
        scale: 1.9,
        ease: 'none',
        duration: 0.45
      });

      // Glow ring — own timeline
      const glowTl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=150%',
          scrub: 2,
          invalidateOnRefresh: true
        }
      });
      glowTl.fromTo(
        '.mars-glow-ring',
        { opacity: 0, scale: 1 },
        { opacity: 0.5, scale: 1.3, ease: 'none', duration: 0.6 }
      );
      glowTl.to('.mars-glow-ring', {
        opacity: 0,
        ease: 'none',
        duration: 0.4
      });

      // Text parallax out (faster than Mars)
      gsap.fromTo(
        '.hero-text-wrap',
        { yPercent: 0, opacity: 1 },
        {
          yPercent: -30,
          opacity: 0,
          scrollTrigger: {
            trigger: ref.current,
            start: '20% top',
            end: '60% top',
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );
    },
    { scope: ref }
  );

  return (
    <section
    id="hero"
    ref={ref}
    className="relative min-h-screen flex items-end pt-16 pb-12 sm:pt-0 sm:pb-0">

      {/* Mars globe — fixed so it persists through scroll */}
      <div
      className="mars-scroll-wrap fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] pointer-events-none"
      style={{ opacity: 1 }}>

        {/* Intensifying glow ring */}
        <div
        className="mars-glow-ring absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
          'radial-gradient(circle, rgba(255,69,0,0.25) 0%, transparent 55%)',
          transform: 'scale(2.4)',
          filter: 'blur(60px)',
          opacity: 0
        }} />


        <RealisticMars size={900} className="max-w-[90vw] sm:max-w-none" />
      </div>

      {/* Radial vignette — transparent center reveals Mars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050508_75%)] z-[4]" />

      {/* Content */}
      <div className="hero-text-wrap relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:pl-28">
        <div className="max-w-2xl">
          {/* Overline */}
          <motion.div
            className="hero-overline inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] backdrop-blur-sm mb-6 sm:mb-8 flex-wrap sm:flex-nowrap"
            whileHover={{ backgroundColor: 'rgba(255,69,0,0.12)' }}
            style={{ filter: 'drop-shadow(0 0 12px rgba(255,69,0,0.15))' }}>

            <Zap className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-display tracking-[0.2em] text-primary/90 flex-shrink-0">
              T-MINUS
            </span>
            <LaunchCountdown />
          </motion.div>

          {/* Title */}
          <KineticTitle />

          {/* Description */}
          <RevealText
            text="ARES-X is the world's first luxury interplanetary tourism program. Book your seat on the inaugural commercial voyage to the Red Planet."
            className="hero-desc text-white/35 text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg mb-8 sm:mb-10"
            start="top 95%" />


          {/* CTAs */}
          <div className="hero-cta-group flex flex-col sm:flex-row gap-3 sm:gap-4 mb-14 sm:mb-16">
            <MagneticButton
              onClick={() =>
              document.
              getElementById('booking')?.
              scrollIntoView({ behavior: 'smooth' })
              }
              className="group relative px-8 py-3.5 sm:py-4 rounded-xl font-display text-sm font-semibold tracking-widest text-white overflow-hidden"
              strength={0.3}
              textStrength={0.5}>

              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-xl" />
              <span className="relative">RESERVE PASSAGE</span>
            </MagneticButton>

            <MagneticButton
              onClick={() =>
              document.
              getElementById('experience')?.
              scrollIntoView({ behavior: 'smooth' })
              }
              className="px-8 py-3.5 sm:py-4 rounded-xl font-display text-sm font-medium tracking-widest text-white/60 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:text-white hover:bg-white/[0.08] transition-all"
              strength={0.25}
              textStrength={0.45}>

              THE EXPERIENCE
            </MagneticButton>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <div className="hero-metric">
              <div className="font-display text-xl sm:text-2xl font-bold text-white">
                <AnimatedCounter target={54.6} decimals={1} suffix="km" duration={2500} />
                <span className="text-[10px] sm:text-xs text-primary/80 ml-0.5 font-medium">M</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/50 tracking-[0.2em] font-display mt-0.5">
                DISTANCE
              </div>
            </div>

            <div className="hero-metric">
              <div className="font-display text-xl sm:text-2xl font-bold text-white">
                <AnimatedCounter target={7} suffix="months" duration={1800} />
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/50 tracking-[0.2em] font-display mt-0.5">
                TRANSIT
              </div>
            </div>

            <div className="hero-metric">
              <div className="font-display text-xl sm:text-2xl font-bold text-white">
                <AnimatedCounter target={2847} suffix="booked" duration={2800} format={(n) => Math.round(n).toLocaleString()} />
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/50 tracking-[0.2em] font-display mt-0.5">
                PASSENGERS
              </div>
            </div>

            <CopyCoordinates />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 lg:left-[calc(50%+2.5rem)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>

        <span className="text-[9px] font-display text-white/50 tracking-[0.3em]">
          EXPLORE
        </span>
        <ChevronDown className="w-4 h-4 text-white/50" />
      </motion.div>
    </section>);

}