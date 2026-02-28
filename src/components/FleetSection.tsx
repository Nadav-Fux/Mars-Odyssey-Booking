import { useRef } from 'react';
import { motion } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Users, Gauge, Shield, Wifi, ChefHat, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import RevealText from '@/components/RevealText';
import AresShipSVG from '@/components/AresShipSVG';

/* ================================================================
   FLEET SECTION — Horizontal Scroll Strip

   Ship SVG at top, then specs displayed as a horizontally-
   scrolling strip of tall narrow panels instead of a grid.
   Each panel has a distinct accent color bar on the left edge.
   User can drag-scroll or use arrow buttons.
   ================================================================ */

const SPECS = [
{ icon: Users, label: 'Capacity', value: '120', sub: 'luxury cabins across 3 decks. Each cabin features personal viewports and climate control.', color: '#FF4500' },
{ icon: Gauge, label: 'Speed', value: '40K', sub: 'km/h max velocity via Nuclear Thermal Propulsion. Cruising speed: 28,000 km/h.', color: '#ff6b35' },
{ icon: Shield, label: 'Shield', value: 'LV5+', sub: 'magnetic field generator blocking 99.97% of cosmic radiation during deep-space transit.', color: '#4ab8c4' },
{ icon: Wifi, label: 'Comms', value: 'LASER', sub: 'optical relay network enabling 12 Gbps real-time data link to Earth via L2 satellite chain.', color: '#6b8aed' },
{ icon: ChefHat, label: 'Dining', value: '3★', sub: 'Michelin-starred restaurants including zero-G sushi bar and hydroponic farm-to-table kitchen.', color: '#a855f7' },
{ icon: Eye, label: 'Views', value: '360°', sub: 'panoramic observation dome on the top deck. Floor-to-ceiling viewports in every cabin.', color: '#eab308' }];


export default function FleetSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.fleet-head', {
      y: 50, opacity: 0, stagger: 0.12, duration: 0.9,
      scrollTrigger: { trigger: '.fleet-header', start: 'top 85%' }
    });
    // Horizontal strip entrance
    gsap.from('.fleet-strip', {
      x: 80, opacity: 0, duration: 1,
      scrollTrigger: { trigger: '.fleet-strip', start: 'top 90%' }
    });
  }, { scope: ref });

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section id="fleet" ref={ref} className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        <div className="fleet-header mb-14 sm:mb-20">
          <span className="fleet-head inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-accent/80 mb-5">
            THE FLEET
          </span>
          <h2 className="fleet-head font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
            ARES-7<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">CRUISER</span>
          </h2>
          <RevealText
            text="The most advanced interplanetary vessel ever constructed. Drag to explore her systems."
            className="fleet-head text-white/30 text-sm sm:text-base max-w-md leading-relaxed" />

        </div>

        {/* Ship visual */}
        <div className="ship-svg relative mb-14 sm:mb-20">
          {/* Ambient glow layers */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 sm:w-[500px] sm:h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-44 h-44 sm:w-64 sm:h-52 rounded-full bg-accent/[0.06] blur-[60px] translate-x-[-20%]" />
          </div>

          {/* Ship container with subtle hover float */}
          <motion.div
            className="relative flex items-center justify-center py-8 sm:py-12"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}>

            {/* Stars behind ship */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {Array.from({ length: 40 }, (_, i) =>
              <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${(i * 37 + 13) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                width: 0.8 + i % 3 * 0.5,
                height: 0.8 + i % 3 * 0.5,
                opacity: 0.08 + i % 5 * 0.04
              }} />

              )}
            </div>

            {/* The ARES-7 ship */}
            <AresShipSVG size={580} thrust={0.85} className="relative z-[2] max-w-full drop-shadow-[0_0_40px_rgba(255,69,0,0.15)]" />

            {/* Subsystem callout labels */}
            <div className="absolute inset-0 pointer-events-none z-[3] hidden sm:block">
              {/* Command Module */}
              <div className="absolute" style={{ right: '8%', top: '28%' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-px bg-[#4ab8c4]/30" />
                  <span className="text-[7px] font-display tracking-[0.15em] text-[#4ab8c4]/50">COMMAND</span>
                </div>
              </div>
              {/* Engines */}
              <div className="absolute" style={{ left: '10%', top: '32%' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-display tracking-[0.15em] text-[#ff6b35]/50">NTP ENGINES</span>
                  <div className="w-8 h-px bg-[#ff6b35]/30" />
                </div>
              </div>
              {/* Habitat */}
              <div className="absolute" style={{ left: '42%', top: '18%' }}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[7px] font-display tracking-[0.15em] text-[#a855f7]/40">HABITAT RING</span>
                  <div className="w-px h-4 bg-[#a855f7]/20" />
                </div>
              </div>
              {/* Dorsal fin */}
              <div className="absolute" style={{ left: '30%', top: '8%' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-display tracking-[0.15em] text-white/50">DORSAL FIN</span>
                  <div className="w-6 h-px bg-white/10" />
                </div>
              </div>
              {/* Solar */}
              <div className="absolute" style={{ right: '25%', bottom: '22%' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-px bg-[#eab308]/25" />
                  <span className="text-[7px] font-display tracking-[0.15em] text-[#eab308]/40">SOLAR ARRAY</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ship designation bar */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-white/[0.06]" />
            <span className="text-[8px] font-display tracking-[0.25em] text-white/50">
              ARES-7 INTERPLANETARY CRUISER · PROFILE VIEW
            </span>
            <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-white/[0.06]" />
          </div>
        </div>

        {/* ── HORIZONTAL SCROLL STRIP ── */}
        <div className="fleet-strip relative">
          {/* Scroll buttons */}
          <div className="hidden sm:flex items-center justify-end gap-2 mb-4">
            <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/[0.15] transition-all cursor-pointer">

              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/[0.15] transition-all cursor-pointer">

              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable container */}
          <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>

            {SPECS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  className="group relative flex-shrink-0 w-[280px] sm:w-[300px] snap-start rounded-2xl overflow-hidden"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}>

                  {/* Glass bg */}
                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl group-hover:border-white/[0.12] transition-all" />

                  {/* Left accent bar */}
                  <div
                  className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                  style={{ background: `linear-gradient(180deg, ${s.color}60, ${s.color}10)` }} />


                  <div className="relative p-6 pl-7">
                    {/* Spec number — big, dramatic */}
                    <div
                    className="font-display text-5xl sm:text-6xl font-bold leading-none mb-4"
                    style={{ color: s.color, textShadow: `0 0 30px ${s.color}20` }}>

                      {s.value}
                    </div>

                    {/* Icon + label */}
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4" style={{ color: `${s.color}80` }} />
                      <span className="text-[10px] font-display tracking-[0.2em] text-white/40 uppercase">
                        {s.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-white/25 text-[12px] leading-relaxed">
                      {s.sub}
                    </p>

                    {/* Index number */}
                    <div
                    className="absolute top-5 right-5 text-[10px] font-display font-bold tabular-nums"
                    style={{ color: `${s.color}20` }}>

                      0{i + 1}
                    </div>
                  </div>
                </motion.div>);

            })}

            {/* End spacer for scroll padding */}
            <div className="flex-shrink-0 w-4" />
          </div>

          {/* Scroll hint */}
          <div className="flex items-center justify-center gap-2 mt-4 sm:hidden">
            <div className="flex gap-1">
              {SPECS.map((_, i) =>
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/[0.08]" />
              )}
            </div>
            <span className="text-[8px] font-display tracking-[0.15em] text-white/50 ml-2">
              SWIPE →
            </span>
          </div>
        </div>
      </div>
    </section>);

}