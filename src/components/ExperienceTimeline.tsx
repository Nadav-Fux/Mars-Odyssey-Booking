import { useRef } from 'react';
import { motion } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Rocket, GraduationCap, Orbit, Telescope, Mountain, Flag, ArrowUpRight } from 'lucide-react';
import RevealText from '@/components/RevealText';
import MiniMars from '@/components/MiniMars';

const PHASES = [
{
  phase: '01',
  icon: GraduationCap,
  title: 'PRE-FLIGHT ACADEMY',
  time: 'T-90 DAYS',
  description: '12-week immersive program. Zero-gravity simulation, Martian suit fitting, emergency protocols, and psychological preparation for deep space.',
  details: ['Zero-G Pool Training', 'EVA Suit Certification', 'Radiation Safety', 'Team Formation'],
  color: '#4ab8c4'
},
{
  phase: '02',
  icon: Rocket,
  title: 'LAUNCH',
  time: 'T-0',
  description: 'Depart SpacePort Nova aboard the Ares-7 Heavy Lifter. Experience 3.2G as you pierce through Earth\'s atmosphere in under 8 minutes.',
  details: ['Ares-7 Heavy Lifter', '3.2G Max Acceleration', 'LEO in 8 Minutes', 'Live Earth Views'],
  color: '#FF4500'
},
{
  phase: '03',
  icon: Orbit,
  title: 'TRANS-MARS CRUISE',
  time: '7 MONTHS',
  description: 'Luxury interplanetary transit. Artificial gravity habitats, observation domes, hydroponic gardens, and onboard entertainment.',
  details: ['Rotating Gravity Ring', '360° Star Lounge', 'Hydroponic Spa', 'Zero-G Sports'],
  color: '#a855f7'
},
{
  phase: '04',
  icon: Telescope,
  title: 'MARS ORBIT',
  time: 'T+210 DAYS',
  description: 'Orbital insertion and aerobraking. Spend 48 hours in Mars orbit before descent — the planet fills every viewport.',
  details: ['Aerobraking Sequence', 'Orbital Photography', 'Descent Briefing', 'Phobos Flyby'],
  color: '#6b8aed'
},
{
  phase: '05',
  icon: Mountain,
  title: 'SURFACE EXPEDITIONS',
  time: '14-21 DAYS',
  description: 'Rover treks to Olympus Mons, Valles Marineris canyon hikes, and Jezero Crater fossil hunts. Each day a new horizon.',
  details: ['Olympus Mons Summit', 'Canyon Rappelling', 'Fossil Excavation', 'Sunset Sessions'],
  color: '#ff6b35'
},
{
  phase: '06',
  icon: Flag,
  title: 'LEGACY',
  time: 'ETERNAL',
  description: 'Leave your mark. Plant your flag, record your message for Earth, and join the permanent roster of Mars Pioneers.',
  details: ['Personal Flag Plant', 'Time Capsule Entry', 'Mars Citizen NFT', 'Pioneer Certificate'],
  color: '#eab308'
}];


export default function ExperienceTimeline() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.exp-header-el', {
      y: 50, opacity: 0, stagger: 0.15, duration: 0.9,
      scrollTrigger: { trigger: '.exp-header', start: 'top 85%' }
    });

    // Animate center line
    gsap.from('.exp-line-fill', {
      scaleY: 0, transformOrigin: 'top',
      scrollTrigger: { trigger: '.exp-timeline', start: 'top 75%', end: 'bottom 40%', scrub: 1 }
    });
  }, { scope: ref });

  return (
    <section id="experience" ref={ref} className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="exp-header mb-16 sm:mb-24">
          <span className="exp-header-el inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            THE EXPERIENCE
          </span>

          {/* Heading with inline MiniMars */}
          <div className="exp-header-el flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1]">
              YOUR MISSION
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">TIMELINE</span>
            </h2>
            <div className="hidden sm:block shrink-0 self-end mb-1 sm:mb-2">
              <MiniMars size={60} className="sm:hidden" />
              <MiniMars size={70} className="hidden sm:block md:hidden" />
              <MiniMars size={90} className="hidden md:block lg:hidden" />
              <MiniMars size={110} className="hidden lg:block" />
            </div>
          </div>

          <RevealText
            text="From first training day to planting your flag on Mars — every phase meticulously crafted."
            className="exp-header-el text-white/30 text-sm sm:text-base max-w-md leading-relaxed" />
        </div>

        {/* Timeline */}
        <div className="exp-timeline relative">
          {/* Center line */}
          <div className="absolute left-6 sm:left-8 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-px">
            <div className="w-full h-full bg-white/[0.04]" />
            <div className="exp-line-fill absolute inset-0 bg-gradient-to-b from-primary via-purple-500 to-accent" />
          </div>

          <div className="space-y-12 sm:space-y-20">
            {PHASES.map((phase, i) => {
              const Icon = phase.icon;
              const isRight = i % 2 !== 0;

              return (
                <div
                key={phase.phase}
                className={`exp-card relative flex items-start gap-6 sm:gap-0 ${
                isRight ? 'lg:flex-row-reverse' : 'lg:flex-row'}`
                }>

                  {/* Card */}
                  <div className={`flex-1 ml-12 sm:ml-16 lg:ml-0 ${
                  isRight ? 'lg:pl-14 lg:text-left' : 'lg:pr-14 lg:text-left'}`
                  }>
                    <motion.div
                      className="group relative rounded-2xl overflow-hidden cursor-default"
                      initial={{
                        opacity: 0,
                        x: isRight ? 60 : -60,
                        y: 30,
                        filter: 'blur(10px)'
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        filter: 'blur(0px)'
                      }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{
                        duration: 0.8,
                        ease: EXPO_OUT,
                        delay: 0.05
                      }}
                      whileHover={{ y: -4 }}>

                      {/* Glass background */}
                      <div className="absolute inset-0 bg-white/[0.025] backdrop-blur-md lg:backdrop-blur-2xl border border-white/[0.07] rounded-2xl" />

                      {/* Top color bar */}
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${phase.color}40, transparent)` }} />

                      <div className="relative p-5 sm:p-7">
                        {/* Phase number + time */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-display text-[10px] tracking-[0.3em] font-bold" style={{ color: phase.color }}>
                              PHASE {phase.phase}
                            </span>
                            <span className="text-[10px] text-white/50 font-display tracking-wider">{phase.time}</span>
                          </div>
                          <motion.div
                            whileHover={{ rotate: 45 }}
                            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

                            <ArrowUpRight className="w-3 h-3 text-white/40" />
                          </motion.div>
                        </div>

                        <h3 className="font-display text-base sm:text-lg font-bold text-white mb-2.5 tracking-wide">
                          {phase.title}
                        </h3>

                        <p className="text-white/30 text-xs sm:text-sm leading-relaxed mb-5">
                          {phase.description}
                        </p>

                        {/* Detail chips */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {phase.details.map((d) =>
                          <span
                          key={d}
                          className="px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium border transition-colors"
                          style={{
                            color: `${phase.color}cc`,
                            borderColor: `${phase.color}18`,
                            backgroundColor: `${phase.color}08`
                          }}>

                              {d}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover glow */}
                      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      style={{ backgroundColor: `${phase.color}10` }} />

                    </motion.div>
                  </div>

                  {/* Node */}
                  <div className="absolute left-6 sm:left-8 lg:left-1/2 -translate-x-1/2 mt-5 z-10">
                    <motion.div
                      whileInView={{ scale: [0, 1.15, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: EXPO_OUT }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center backdrop-blur-xl"
                      style={{
                        border: `1.5px solid ${phase.color}40`,
                        backgroundColor: `${phase.color}10`,
                        boxShadow: `0 0 20px ${phase.color}15`
                      }}>

                      <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" style={{ color: phase.color }} />
                    </motion.div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden lg:block flex-1" />
                </div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}