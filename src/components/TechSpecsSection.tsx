import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Cpu, Atom, ShieldCheck, Zap, Satellite, Radio } from 'lucide-react';
import OuraRing from '@/components/OuraRing';
import SpacecraftBlueprint from '@/components/SpacecraftBlueprint';
import RevealText from '@/components/RevealText';
import MarsWeather from '@/components/MarsWeather';

const SYSTEMS = [
{
  icon: Cpu,
  title: 'QUANTUM NAV',
  value: 'QN-7000',
  desc: 'Quantum-entangled navigation array. 0.001° positional accuracy across 55M km.',
  color: '#FF4500'
},
{
  icon: Atom,
  title: 'NTP DRIVE',
  value: '4.2 TN',
  desc: 'Nuclear Thermal Propulsion. Bi-modal reactor producing 4.2 teranewtons thrust.',
  color: '#ff6b35'
},
{
  icon: ShieldCheck,
  title: 'RAD SHIELD',
  value: 'CLASS V+',
  desc: 'Superconducting magnetic field generator. Blocks 99.97% cosmic radiation.',
  color: '#4ab8c4'
},
{
  icon: Zap,
  title: 'POWER GRID',
  value: '840 MW',
  desc: 'Compact fusion reactor supplemented by deployable photovoltaic arrays.',
  color: '#eab308'
},
{
  icon: Satellite,
  title: 'COMMS ARRAY',
  value: '12 Gbps',
  desc: 'Optical laser relay network. Real-time HD link to Earth via L2 satellite chain.',
  color: '#6b8aed'
},
{
  icon: Radio,
  title: 'LIDAR SUITE',
  value: '360° FOV',
  desc: 'Multi-spectrum LIDAR with AI-powered debris tracking. 200km detection range.',
  color: '#a855f7'
}];


const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
};

const cardItem = {
  hidden: { opacity: 0, y: 50, scale: 0.94, filter: 'blur(6px)' },
  show: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EXPO_OUT }
  }
};

// Bento grid layout config: each item gets a size class
const BENTO_SIZES: Record<number, string> = {
  0: 'sm:col-span-1 sm:row-span-2', // tall
  1: 'sm:col-span-1 sm:row-span-2', // tall
  2: 'sm:col-span-1 sm:row-span-1', // regular
  3: 'sm:col-span-1 sm:row-span-1', // regular
  4: 'sm:col-span-1 sm:row-span-1', // regular
  5: 'sm:col-span-1 sm:row-span-1' // regular
};

export default function TechSpecsSection() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.tech-head', {
      y: 50, opacity: 0, stagger: 0.12, duration: 0.9,
      scrollTrigger: { trigger: '.tech-header', start: 'top 85%' }
    });
  }, { scope: ref });

  return (
    <section id="techspecs" ref={ref} className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="tech-header mb-14 sm:mb-20">
          <span className="tech-head inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            TECHNICAL SPECS
          </span>
          <h2 className="tech-head font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
            ENGINEERING
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">BLUEPRINT</span>
          </h2>
          <RevealText
            text="Every component of the Ares-7 drawn to precision. Watch it assemble before your eyes."
            className="tech-head text-white/30 text-sm sm:text-base max-w-lg leading-relaxed" />

        </div>

        {/* Blueprint */}
        <div className="mb-16 sm:mb-24 relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.015] backdrop-blur-xl border border-white/[0.05] rounded-2xl" />
          <div className="relative p-4 sm:p-8">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-display tracking-[0.2em] text-white/50">SCHEMATIC VIEW</span>
              </div>
              <div className="flex items-center gap-3">
                {['PROFILE', 'TOP', 'FRONT'].map((v, i) =>
                <span
                key={v}
                className={`text-[9px] font-display tracking-[0.15em] px-2 py-0.5 rounded ${
                i === 0 ?
                'bg-primary/10 text-primary border border-primary/20' :
                'text-white/50 hover:text-white/60 cursor-pointer transition-colors'}`
                }>

                    {v}
                  </span>
                )}
              </div>
            </div>

            <SpacecraftBlueprint />
          </div>
        </div>

        {/* Systems Grid with OuraRing Icons */}
        <div className="mb-16 sm:mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
            <span className="text-[10px] font-display tracking-[0.3em] text-white/50 uppercase">ONBOARD SYSTEMS</span>
            <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:auto-rows-[minmax(140px,auto)] gap-4"
            variants={cardStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}>

            {SYSTEMS.map((sys, idx) => {
              const Icon = sys.icon;
              const isTall = idx < 2;
              return (
                <motion.div
                  key={sys.title}
                  variants={cardItem}
                  className={`group relative rounded-2xl overflow-hidden cursor-default ${BENTO_SIZES[idx] || ''}`}>

                  <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md lg:backdrop-blur-2xl border border-white/[0.06] rounded-2xl group-hover:border-white/[0.12] transition-all" />
                  <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${sys.color}25, transparent)` }} />

                  <div className={`relative ${isTall ? 'p-6 sm:p-8 flex flex-col h-full' : 'p-5 sm:p-6'}`}>
                    <div className={isTall ? 'flex-1' : ''}>
                      <div className="flex items-start gap-4">
                        <OuraRing size={isTall ? 56 : 48} color={sys.color} strokeWidth={1.2} speed={12}>
                          <Icon className={isTall ? 'w-5 h-5' : 'w-[18px] h-[18px]'} style={{ color: sys.color }} />
                        </OuraRing>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-display tracking-[0.2em] text-white/50 uppercase">{sys.title}</span>
                          </div>
                          <div className={`font-display font-bold text-white ${isTall ? 'text-2xl sm:text-3xl mb-3' : 'text-lg mb-1.5'}`} style={{ color: sys.color }}>
                            {sys.value}
                          </div>
                          <p className={`text-white/30 leading-relaxed ${isTall ? 'text-sm' : 'text-xs'}`}>{sys.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tall cards get an extra data readout at the bottom */}
                    {isTall &&
                    <div className="mt-auto pt-5 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-[8px] font-display tracking-[0.15em] text-white/50">STATUS</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500/70 animate-pulse" />
                          <span className="text-[8px] font-display tracking-[0.12em] text-green-400/50">OPERATIONAL</span>
                        </div>
                      </div>
                    }
                  </div>

                  {/* Hover glow */}
                  <div
                  className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ backgroundColor: `${sys.color}10` }} />

                </motion.div>);

            })}
          </motion.div>
        </div>

        {/* Mars Weather */}
        <MarsWeather />
      </div>
    </section>);

}