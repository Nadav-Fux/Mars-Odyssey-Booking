import { useRef } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Ship, Users, ClipboardList, ArrowRight, Cpu, Shield, Brain, Globe, Mountain, Crosshair, Flame } from 'lucide-react';
import RevealText from '@/components/RevealText';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   EXPLORE CARDS — Gateway to Sub-Pages

   Three cinematic cards that link to /ship, /crew, /mission.
   Each card has a glowing accent, icon, description, and hover
   effects that pull the user into exploring deeper.
   ================================================================ */

const CARDS = [
{
  to: '/ship',
  icon: Ship,
  accent: '#FF4500',
  label: 'THE SHIP',
  title: 'ARES-7 Spacecraft',
  description: 'Nuclear thermal propulsion, magnetic shielding, and the most advanced observation dome ever built.',
  stats: [
  { icon: Cpu, text: 'Full Blueprint' },
  { icon: Shield, text: 'Tech Specs' }]

},
{
  to: '/crew',
  icon: Users,
  accent: '#a855f7',
  label: 'THE CREW',
  title: 'Mission Personnel',
  description: 'Six elite specialists with thousands of hours of deep-space training. Meet the people behind the mission.',
  stats: [
  { icon: Brain, text: '6 Specialists' },
  { icon: Shield, text: 'Full Bios' }]

},
{
  to: '/mission',
  icon: ClipboardList,
  accent: '#4ab8c4',
  label: 'MISSION INFO',
  title: 'Briefing & Logistics',
  description: 'O₂ reserves, fuel telemetry, weight calculator, and answers to every question about the journey.',
  stats: [
  { icon: Cpu, text: 'Live Telemetry' },
  { icon: Shield, text: 'FAQ Terminal' }]

},
{
  to: '/explore',
  icon: Globe,
  accent: '#6b8aed',
  label: 'EXPLORE MARS',
  title: 'Surface Exploration',
  description: 'Interactive globe, landing zones, panoramic surface views, and geological wonders of the Red Planet.',
  stats: [
  { icon: Mountain, text: 'Geology Data' },
  { icon: Globe, text: '6 Landing Zones' }]

},
{
  to: '/simulate',
  icon: Crosshair,
  accent: '#ef4444',
  label: 'SIMULATOR',
  title: 'Landing Simulator',
  description: 'Experience the 7 minutes of terror. Scroll-driven EDL from orbit to touchdown at Jezero Crater.',
  stats: [
  { icon: Flame, text: 'Mach 25 Entry' },
  { icon: Crosshair, text: '6 Phases' }]
}];


export default function ExploreCards() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.explore-card', {
      y: 60,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%' }
    });
  }, { scope: ref });

  return (
    <section
    ref={ref}
    id="explore"
    className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 sm:py-32">

      <div className="max-w-6xl mx-auto lg:pl-20">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[10px] font-display font-bold tracking-[0.3em] text-primary/50 uppercase mb-3">
            GO DEEPER
          </span>
          <RevealText
            text="Explore the Mission"
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight" />

          <p className="mt-4 text-sm sm:text-base text-white/50 max-w-md mx-auto">
            Dive into the details. Each section is a world of its own.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="explore-card group relative block">

                <div
                className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 h-full transition-all duration-500 group-hover:border-white/[0.12] group-hover:bg-white/[0.04]">

                  {/* Accent glow on hover */}
                  <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                  style={{ backgroundColor: card.accent }} />


                  {/* Top bar accent */}
                  <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to right, transparent, ${card.accent}40, transparent)` }} />


                  {/* Icon */}
                  <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: `${card.accent}10`,
                    border: `1px solid ${card.accent}20`
                  }}>

                    <Icon
                      className="w-5 h-5 transition-colors duration-300"
                      style={{ color: card.accent }} />

                  </div>

                  {/* Label */}
                  <span
                  className="text-[9px] font-display font-bold tracking-[0.25em] uppercase block mb-2"
                  style={{ color: `${card.accent}80` }}>

                    {card.label}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-3 tracking-tight">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-6">
                    {card.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-6">
                    {card.stats.map((stat) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={stat.text} className="flex items-center gap-1.5">
                          <StatIcon className="w-3 h-3 text-white/15" />
                          <span className="text-[10px] font-display text-white/50 tracking-wider">
                            {stat.text}
                          </span>
                        </div>);

                    })}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-xs font-display font-medium tracking-wider transition-all duration-300 group-hover:gap-3">
                    <span style={{ color: `${card.accent}90` }}>EXPLORE</span>
                    <ArrowRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: card.accent }} />

                  </div>
                </div>
              </Link>);

          })}
        </div>
      </div>
    </section>);

}