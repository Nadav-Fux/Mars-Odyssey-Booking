import { useRef, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT, EXPO_IN_OUT } from '@/lib/easing';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import Lottie from 'lottie-react';
import { Users, Shield, Heart, Activity, Brain, Radiation } from 'lucide-react';
import RevealText from '@/components/RevealText';
import { biometricScanData } from '@/lib/biometric-lottie';
import CrewBioOverlay from '@/components/CrewBioOverlay';

/* ================================================================
   CREW ROSTER

   Six crew cards. On hover each card triggers:
     1. Lottie biometric-scan rings over the avatar
     2. An SVG ECG waveform that draws via GSAP strokeDashoffset
     3. Vital-sign counters that tick up from zero
     4. A horizontal scan-line sweep across the card
   ================================================================ */

// ── Data ──
interface CrewMember {
  id: string;
  rank: string;
  name: string;
  role: string;
  specialization: string;
  status: 'NOMINAL' | 'ACTIVE' | 'ELEVATED';
  vitals: {hr: number;o2: number;neural: number;};
  color: string;
  initials: string;
}

const CREW: CrewMember[] = [
{
  id: 'vasquez',
  rank: 'CDR',
  name: 'KIRA VASQUEZ',
  role: 'Mission Commander',
  specialization: 'Orbital Mechanics · EVA Lead',
  status: 'NOMINAL',
  vitals: { hr: 68, o2: 99, neural: 97 },
  color: '#FF4500',
  initials: 'KV'
},
{
  id: 'chen',
  rank: 'PLT',
  name: 'MARCUS CHEN',
  role: 'Chief Pilot',
  specialization: 'Atmospheric Entry · VTOL',
  status: 'ACTIVE',
  vitals: { hr: 74, o2: 98, neural: 95 },
  color: '#4ab8c4',
  initials: 'MC'
},
{
  id: 'okafor',
  rank: 'MSE',
  name: 'DR. AISHA OKAFOR',
  role: 'Flight Surgeon',
  specialization: 'Trauma Medicine · Radiology',
  status: 'NOMINAL',
  vitals: { hr: 62, o2: 99, neural: 98 },
  color: '#a855f7',
  initials: 'AO'
},
{
  id: 'reyes',
  rank: 'ENG',
  name: 'TOM\u00c1S REYES',
  role: 'Flight Engineer',
  specialization: 'NTP Propulsion · Power Grid',
  status: 'ACTIVE',
  vitals: { hr: 71, o2: 97, neural: 93 },
  color: '#ff6b35',
  initials: 'TR'
},
{
  id: 'tanaka',
  rank: 'SCI',
  name: 'DR. YUKI TANAKA',
  role: 'Science Officer',
  specialization: 'Astrobiology · Spectroscopy',
  status: 'NOMINAL',
  vitals: { hr: 65, o2: 99, neural: 96 },
  color: '#eab308',
  initials: 'YT'
},
{
  id: 'volkov',
  rank: 'NAV',
  name: 'ALEXEI VOLKOV',
  role: 'Navigation Officer',
  specialization: 'Quantum Nav · Orbital Plots',
  status: 'NOMINAL',
  vitals: { hr: 70, o2: 98, neural: 94 },
  color: '#6b8aed',
  initials: 'AV'
}];


// ── ECG waveform path (single heartbeat, viewBox 0 0 220 50) ──
const ECG_PATH =
'M0,25 L25,25 L35,23 L40,20 L45,23 L50,25 L60,25 L64,22 ' +
'L70,7 L76,43 L82,17 L88,25 L100,25 L106,22 L112,18 L118,22 ' +
'L124,25 L145,25 L155,23 L160,20 L165,23 L170,25 L180,25 ' +
'L184,22 L190,7 L196,43 L202,17 L208,25 L220,25';

const STATUS_COLOR: Record<string, string> = {
  NOMINAL: '#22c55e',
  ACTIVE: '#4ab8c4',
  ELEVATED: '#eab308'
};

// ── Single crew card ──
function CrewCard({ member, onSelect }: {member: CrewMember;onSelect: (id: string) => void;}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ecgRef = useRef<SVGPathElement>(null);
  const lottieRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // Prepare ECG stroke on mount
  useGSAP(() => {
    const ecg = ecgRef.current;
    if (!ecg) return;
    const len = ecg.getTotalLength();
    ecg.style.strokeDasharray = `${len}`;
    ecg.style.strokeDashoffset = `${len}`;
  }, { scope: cardRef });

  const handleEnter = useCallback(() => {
    setHovered(true);
    // Play Lottie scan from start
    lottieRef.current?.goToAndPlay(0, true);
    // Draw ECG waveform
    const ecg = ecgRef.current;
    if (ecg) {
      const len = ecg.getTotalLength();
      gsap.fromTo(ecg,
      { strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.4, ease: 'expo.inOut' }
      );
    }
  }, []);

  const handleLeave = useCallback(() => {
    setHovered(false);
    lottieRef.current?.goToAndStop(0, true);
    // Reset ECG
    const ecg = ecgRef.current;
    if (ecg) {
      gsap.to(ecg, {
        strokeDashoffset: ecg.getTotalLength(),
        duration: 0.4,
        ease: 'expo.in'
      });
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => onSelect(member.id)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}>

      {/* Glass background */}
      <div
      className="absolute inset-0 rounded-2xl backdrop-blur-md lg:backdrop-blur-2xl transition-all duration-500"
      style={{
        background: hovered ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.015)',
        border: `1px solid ${hovered ? `${member.color}30` : 'rgba(255,255,255,0.05)'}`
      }} />


      {/* Top accent line */}
      <div
      className="absolute top-0 inset-x-0 h-px transition-opacity duration-500"
      style={{
        background: `linear-gradient(90deg, transparent, ${member.color}40, transparent)`,
        opacity: hovered ? 1 : 0.3
      }} />


      {/* Scan line sweep on hover */}
      <AnimatePresence>
        {hovered &&
        <motion.div
          className="absolute inset-y-0 w-px z-20 pointer-events-none"
          style={{ background: `linear-gradient(180deg, transparent, ${member.color}60, transparent)` }}
          initial={{ left: 0, opacity: 0 }}
          animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EXPO_IN_OUT }} />

        }
      </AnimatePresence>

      <div className="relative p-5 sm:p-6">
        {/* Top row: Avatar + info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar with Lottie overlay */}
          <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
            {/* Base circle */}
            <div
            className="w-full h-full rounded-full flex items-center justify-center transition-all duration-500"
            style={{
              background: `${member.color}${hovered ? '18' : '0a'}`,
              border: `1.5px solid ${member.color}${hovered ? '50' : '20'}`,
              boxShadow: hovered ? `0 0 20px ${member.color}20` : 'none'
            }}>

              <span
              className="font-display text-sm font-bold tracking-wider transition-colors duration-300"
              style={{ color: hovered ? member.color : `${member.color}80` }}>

                {member.initials}
              </span>
            </div>

            {/* Lottie scan rings — overlaid on avatar */}
            <div className="absolute inset-[-40%] pointer-events-none z-10">
              <Lottie
                lottieRef={lottieRef}
                animationData={biometricScanData}
                loop={false}
                autoplay={false}
                style={{ width: '100%', height: '100%', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }} />

            </div>
          </div>

          {/* Name, role, status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[8px] font-display tracking-[0.2em] text-white/50">{member.rank}</span>
              <span
              className="text-[7px] font-display tracking-[0.15em] px-1.5 py-0.5 rounded-full"
              style={{
                color: STATUS_COLOR[member.status],
                background: `${STATUS_COLOR[member.status]}12`,
                border: `1px solid ${STATUS_COLOR[member.status]}20`
              }}>

                ● {member.status}
              </span>
            </div>
            <h3
            className="font-display text-sm sm:text-base font-bold text-white truncate leading-tight mb-1 transition-colors duration-300"
            style={{ color: hovered ? member.color : 'white' }}>

              {member.name}
            </h3>
            <p className="text-white/30 text-xs leading-tight">{member.role}</p>
            <p className="text-white/50 text-[10px] mt-0.5">{member.specialization}</p>
          </div>
        </div>

        {/* ECG waveform */}
        <div
        className="relative h-10 rounded-lg overflow-hidden mb-3 transition-all duration-500"
        style={{
          background: hovered ? `${member.color}06` : 'rgba(255,255,255,0.015)',
          border: `1px solid ${hovered ? `${member.color}15` : 'rgba(255,255,255,0.03)'}`
        }}>

          {/* Grid lines */}
          <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '10px 10px'
          }} />


          <svg viewBox="0 0 220 50" className="w-full h-full" preserveAspectRatio="none">
            {/* Glow layer */}
            <path
            d={ECG_PATH}
            fill="none"
            stroke={member.color}
            strokeWidth="3"
            strokeOpacity="0.15"
            style={{ filter: 'blur(2px)' }} />

            {/* Main animated line */}
            <path
            ref={ecgRef}
            d={ECG_PATH}
            fill="none"
            stroke={member.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ willChange: 'stroke-dashoffset' }} />

          </svg>

          {/* "SCANNING" label */}
          <AnimatePresence>
            {hovered &&
            <motion.span
              className="absolute top-1 right-2 text-[7px] font-display tracking-[0.15em]"
              style={{ color: `${member.color}60` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: EXPO_IN_OUT }}>

                BIOMETRIC SCAN
              </motion.span>
            }
          </AnimatePresence>
        </div>

        {/* Vital stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
          { label: 'HR', value: member.vitals.hr, unit: 'bpm', icon: Heart },
          { label: 'SpO\u2082', value: member.vitals.o2, unit: '%', icon: Activity },
          { label: 'NEURAL', value: member.vitals.neural, unit: '%', icon: Brain }].
          map((stat) => {
            const Icon = stat.icon;
            return (
              <div
              key={stat.label}
              className="flex items-center gap-1.5 transition-opacity duration-500"
              style={{ opacity: hovered ? 1 : 0.35 }}>

                <Icon className="w-3 h-3 flex-shrink-0" style={{ color: `${member.color}80` }} />
                <div>
                  <div className="text-[7px] font-display tracking-[0.12em] text-white/50">{stat.label}</div>
                  <div className="text-xs font-display font-bold text-white tabular-nums">
                    <AnimatedValue target={stat.value} active={hovered} />
                    <span className="text-[8px] text-white/50 ml-0.5">{stat.unit}</span>
                  </div>
                </div>
              </div>);

          })}
        </div>

        {/* Click hint */}
        <div
        className="mt-3 pt-3 flex items-center justify-center gap-1.5 transition-opacity duration-300"
        style={{
          borderTop: `1px solid ${hovered ? `${member.color}15` : 'rgba(255,255,255,0.03)'}`,
          opacity: hovered ? 0.8 : 0.25
        }}>

          <span
          className="text-[8px] font-display tracking-[0.15em]"
          style={{ color: hovered ? member.color : 'rgba(255,255,255,0.3)' }}>

            {hovered ? '▸ VIEW FULL DOSSIER' : 'TAP FOR BIO'}
          </span>
        </div>
      </div>
    </motion.div>);

}

// ── Animated counter that ticks from 0 → target on hover ──
function AnimatedValue({ target, active }: {target: number;active: boolean;}) {
  const ref = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const objRef = useRef({ val: 0 });

  useGSAP(() => {
    if (active) {
      objRef.current.val = 0;
      tweenRef.current?.kill();
      tweenRef.current = gsap.to(objRef.current, {
        val: target,
        duration: 1,
        ease: 'expo.out',
        onUpdate: () => {
          if (ref.current) ref.current.textContent = String(Math.round(objRef.current.val));
        }
      });
    } else {
      tweenRef.current?.kill();
      objRef.current.val = 0;
      if (ref.current) ref.current.textContent = '--';
    }
  }, [active, target]);

  return <span ref={ref}>--</span>;
}

// ── Stagger container animation ──
const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
};
const cardAnim = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: EXPO_OUT }
  }
};

// ── Section ──
function CrewRoster() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);

  useGSAP(() => {
    gsap.from('.crew-head', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: { trigger: '.crew-header', start: 'top 85%', once: true }
    });
  }, { scope: sectionRef });

  return (
    <section
    id="crew"
    ref={sectionRef}
    className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">

      <div className="max-w-6xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="crew-header mb-12 sm:mb-16">
          <span className="crew-head inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/[0.04] mb-4">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] text-primary/70">CREW MANIFEST</span>
          </span>

          <h2 className="crew-head font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
            CREW
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">ROSTER</span>
          </h2>

          <RevealText
            text="Hover to initiate biometric verification. All crew vitals monitored in real-time via the Ares-7 medical telemetry network."
            className="crew-head text-white/30 text-sm sm:text-base max-w-lg leading-relaxed" />

        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
          <Shield className="w-3.5 h-3.5 text-white/10" />
          <span className="text-[9px] font-display tracking-[0.25em] text-white/50">CLEARANCE LEVEL ALPHA</span>
          <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          variants={gridStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}>

          {CREW.map((member) =>
          <motion.div key={member.id} variants={cardAnim}>
              <CrewCard member={member} onSelect={setSelectedCrew} />
            </motion.div>
          )}
        </motion.div>

        {/* Footer note */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Radiation className="w-3 h-3 text-white/10" />
          <span className="text-[8px] font-display tracking-[0.15em] text-white/10">
            ALL BIOMETRIC DATA ENCRYPTED · HIPAA-MARS COMPLIANT · SOL 247
          </span>
        </div>
      </div>

      {/* Bio overlay */}
      <CrewBioOverlay crewId={selectedCrew} onClose={() => setSelectedCrew(null)} />
    </section>);

}

export default memo(CrewRoster);