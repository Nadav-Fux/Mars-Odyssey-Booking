import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Award, Clock, Rocket, GraduationCap } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   CREW BIO OVERLAY

   Full-screen overlay showing a detailed crew member biography
   with a stylized SVG portrait, personal stats, mission history,
   and achievements. Rendered via Portal for correct z-stacking.
   ================================================================ */

export interface CrewBio {
  id: string;
  name: string;
  role: string;
  rank: string;
  color: string;
  initials: string;
  nationality: string;
  age: number;
  missions: number;
  flightHours: string;
  bio: string;
  achievements: string[];
  quote: string;
  specialization: string;
}

export const CREW_BIOS: Record<string, CrewBio> = {
  vasquez: {
    id: 'vasquez',
    name: 'KIRA VASQUEZ',
    role: 'Mission Commander',
    rank: 'CDR',
    color: '#FF4500',
    initials: 'KV',
    nationality: 'Mexico / USA',
    age: 42,
    missions: 4,
    flightHours: '12,840',
    specialization: 'Orbital Mechanics · EVA Lead',
    bio: 'Commander Vasquez is a former NASA test pilot with a PhD in Aerospace Engineering from MIT. She led the Artemis V lunar expedition and holds the record for longest continuous EVA (14h 22m). Known for her calm under pressure and decisive leadership, she was the unanimous choice for ARES-X mission command.',
    achievements: [
    'Artemis V Mission Commander',
    'Longest EVA record: 14h 22m',
    'NASA Distinguished Service Medal',
    'First Martian orbit insertion (sim)'],

    quote: '"Mars doesn\'t care about your plans. You adapt, or you don\'t come home."'
  },
  chen: {
    id: 'chen',
    name: 'MARCUS CHEN',
    role: 'Chief Pilot',
    rank: 'PLT',
    color: '#4ab8c4',
    initials: 'MC',
    nationality: 'Canada / China',
    age: 38,
    missions: 3,
    flightHours: '9,600',
    specialization: 'Atmospheric Entry · VTOL',
    bio: 'Lieutenant Chen transitioned from RCAF F-35 combat pilot to space operations in 2029. His exceptional spatial awareness and reaction time (top 0.1% globally) make him the ideal candidate for Mars atmospheric entry — a maneuver with zero margin for error. He designed the VTOL landing protocol used by ARES-X.',
    achievements: [
    'RCAF Top Gun graduate, Class 1',
    'Designed Mars VTOL landing protocol',
    'Gateway Station docking record: 47s',
    '3,200+ jet flight hours'],

    quote: '"Flying in space is easy. Landing on Mars in a crosswind — that\'s flying."'
  },
  okafor: {
    id: 'okafor',
    name: 'DR. AISHA OKAFOR',
    role: 'Flight Surgeon',
    rank: 'MSE',
    color: '#a855f7',
    initials: 'AO',
    nationality: 'Nigeria / UK',
    age: 45,
    missions: 2,
    flightHours: '6,200',
    specialization: 'Trauma Medicine · Radiology',
    bio: 'Dr. Okafor is a pioneering space medicine specialist who performed the first successful surgery in microgravity aboard the ISS in 2031. A graduate of Oxford and Johns Hopkins, she developed the Autonomous Surgical AI (ASAI) system that will serve as backup medical support during the 7-month transit to Mars.',
    achievements: [
    'First surgery in microgravity (ISS, 2031)',
    'Developed ASAI surgical AI',
    'Published 47 papers on space medicine',
    'Royal College of Surgeons Fellow'],

    quote: '"In space, the human body is the most complex system on board. My job is to keep it running."'
  },
  reyes: {
    id: 'reyes',
    name: 'TOMÁS REYES',
    role: 'Flight Engineer',
    rank: 'ENG',
    color: '#ff6b35',
    initials: 'TR',
    nationality: 'Spain',
    age: 36,
    missions: 2,
    flightHours: '5,800',
    specialization: 'NTP Propulsion · Power Grid',
    bio: 'Engineer Reyes is the youngest crew member and the lead architect of the Ares-7\'s Nuclear Thermal Propulsion system. A prodigy from Universidad Politécnica de Madrid, he solved the hydrogen fuel containment problem that had stalled NTP development for a decade. He personally assembled the reactor cores during orbital construction.',
    achievements: [
    'Lead architect: NTP propulsion system',
    'Solved H₂ fuel containment problem',
    'ESA Young Engineer of the Year (2×)',
    'Reactor assembly in zero-G: 72 hours'],

    quote: '"4.2 teranewtons. That\'s not just thrust — that\'s a promise to bring everyone home."'
  },
  tanaka: {
    id: 'tanaka',
    name: 'DR. YUKI TANAKA',
    role: 'Science Officer',
    rank: 'SCI',
    color: '#eab308',
    initials: 'YT',
    nationality: 'Japan',
    age: 40,
    missions: 1,
    flightHours: '2,100',
    specialization: 'Astrobiology · Spectroscopy',
    bio: 'Dr. Tanaka\'s discovery of extremophile organisms in the Atacama Desert subsurface (2028) revolutionized our understanding of potential Martian life. As Science Officer, she will lead all surface experiments at Jezero Crater, operating the MARS-BIO laboratory and managing sample collection for Earth return.',
    achievements: [
    'Atacama extremophile discovery (2028)',
    'JAXA Chief Astrobiologist',
    'Nature cover paper: "Life at the Edge"',
    'Designed MARS-BIO field laboratory'],

    quote: '"If Mars has life — even microbial — it changes everything we know about the universe."'
  },
  volkov: {
    id: 'volkov',
    name: 'ALEXEI VOLKOV',
    role: 'Navigation Officer',
    rank: 'NAV',
    color: '#6b8aed',
    initials: 'AV',
    nationality: 'Russia',
    age: 44,
    missions: 5,
    flightHours: '14,500',
    specialization: 'Quantum Nav · Orbital Plots',
    bio: 'Colonel Volkov is the most experienced crew member with five prior missions including two long-duration ISS deployments. A mathematician turned cosmonaut, he co-developed the QN-7000 quantum navigation system that gives ARES-X its unprecedented 0.001° positional accuracy across 55 million kilometers of deep space.',
    achievements: [
    'Co-developer: QN-7000 quantum nav',
    '5 orbital missions (ISS ×2, Lunar ×3)',
    'Most EVA hours: Russian program',
    'Roscosmos Hero of Space Exploration'],

    quote: '"55 million kilometers. One miscalculation. I don\'t make miscalculations."'
  }
};

/* ── Stylized SVG portrait ── */
function CrewPortrait({ bio }: {bio: CrewBio;}) {
  const c = bio.color;
  return (
    <svg viewBox="0 0 200 240" className="w-full h-full" fill="none">
      <defs>
        <radialGradient id={`cp-bg-${bio.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={c} stopOpacity="0.12" />
          <stop offset="100%" stopColor={c} stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id={`cp-visor-${bio.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.6" />
          <stop offset="100%" stopColor={c} stopOpacity="0.15" />
        </linearGradient>
        <filter id={`cp-glow-${bio.id}`}>
          <feGaussianBlur stdDeviation="3" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="110" r="90" fill={`url(#cp-bg-${bio.id})`} />

      {/* Helmet outline */}
      <ellipse cx="100" cy="95" rx="52" ry="58" stroke={c} strokeWidth="1.5" strokeOpacity="0.4" />
      <ellipse cx="100" cy="95" rx="48" ry="54" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" />

      {/* Visor */}
      <ellipse cx="100" cy="88" rx="36" ry="28" fill={`url(#cp-visor-${bio.id})`} stroke={c} strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Visor reflection */}
      <ellipse cx="88" cy="80" rx="14" ry="8" fill="white" fillOpacity="0.08" transform="rotate(-15 88 80)" />

      {/* Initials inside visor */}
      <text x="100" y="96" textAnchor="middle" fill={c} fillOpacity="0.9" fontSize="22" fontFamily="Orbitron, monospace" fontWeight="bold" filter={`url(#cp-glow-${bio.id})`}>
        {bio.initials}
      </text>

      {/* Suit collar / neck */}
      <path d="M60 145 Q65 130 100 128 Q135 130 140 145" stroke={c} strokeWidth="1" strokeOpacity="0.3" fill={c} fillOpacity="0.04" />
      <path d="M55 155 Q60 140 100 138 Q140 140 145 155" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" />

      {/* Shoulder sections */}
      <path d="M40 180 Q45 155 60 148" stroke={c} strokeWidth="0.8" strokeOpacity="0.25" />
      <path d="M160 180 Q155 155 140 148" stroke={c} strokeWidth="0.8" strokeOpacity="0.25" />

      {/* Suit chest panel */}
      <rect x="75" y="150" width="50" height="30" rx="4" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" fill={c} fillOpacity="0.03" />
      <line x1="100" y1="150" x2="100" y2="180" stroke={c} strokeWidth="0.3" strokeOpacity="0.1" />

      {/* Mission patch (circle) */}
      <circle cx="100" cy="165" r="8" stroke={c} strokeWidth="0.5" strokeOpacity="0.3" fill={c} fillOpacity="0.06" />
      <text x="100" y="168" textAnchor="middle" fill={c} fillOpacity="0.4" fontSize="6" fontFamily="Orbitron, monospace">{bio.rank}</text>

      {/* Comms antenna */}
      <line x1="55" y1="80" x2="42" y2="62" stroke={c} strokeWidth="0.8" strokeOpacity="0.3" />
      <circle cx="40" cy="60" r="2.5" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" fill={c} fillOpacity="0.15">
        <animate attributeName="fillOpacity" values="0.15;0.5;0.15" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Status lights on helmet */}
      <circle cx="145" cy="78" r="2" fill="#22c55e" fillOpacity="0.5">
        <animate attributeName="fillOpacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="145" cy="86" r="1.5" fill={c} fillOpacity="0.3">
        <animate attributeName="fillOpacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" begin="0.3s" />
      </circle>

      {/* Name plate */}
      <rect x="60" y="215" width="80" height="14" rx="3" fill={c} fillOpacity="0.06" stroke={c} strokeWidth="0.4" strokeOpacity="0.2" />
      <text x="100" y="225" textAnchor="middle" fill={c} fillOpacity="0.6" fontSize="6.5" fontFamily="Orbitron, monospace" letterSpacing="2">
        {bio.name.split(' ').pop()}
      </text>
    </svg>);

}

/* ── Main overlay ── */
interface Props {
  crewId: string | null;
  onClose: () => void;
}

function CrewBioOverlay({ crewId, onClose }: Props) {
  const bio = crewId ? CREW_BIOS[crewId] : null;

  useEffect(() => {
    if (!crewId) return;
    const handler = (e: KeyboardEvent) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [crewId, onClose]);

  useEffect(() => {
    if (crewId) {
      document.body.style.overflow = 'hidden';
      return () => {document.body.style.overflow = '';};
    }
  }, [crewId]);

  return createPortal(
    <AnimatePresence>
      {bio &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">

          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

          {/* Card */}
          <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.45, ease: EXPO_OUT }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'rgba(10,10,18,0.97)',
            border: `1px solid ${bio.color}20`,
            boxShadow: `0 0 80px ${bio.color}08, 0 25px 60px rgba(0,0,0,0.5)`
          }}>

            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${bio.color}50, transparent)` }} />

            {/* Close */}
            <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all cursor-pointer">

              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Two-column: portrait + info */}
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 mb-6">
                {/* Portrait */}
                <div className="flex flex-col items-center">
                  <div
                className="w-40 h-48 sm:w-full sm:h-56 rounded-xl overflow-hidden mb-3"
                style={{ background: `${bio.color}06`, border: `1px solid ${bio.color}12` }}>

                    <CrewPortrait bio={bio} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
                    <span className="text-[8px] font-display tracking-[0.15em] text-green-400/50">VITALS NOMINAL</span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-display tracking-[0.2em]" style={{ color: `${bio.color}60` }}>{bio.rank}</span>
                    <span className="text-[8px] font-display tracking-[0.12em] px-1.5 py-0.5 rounded-full" style={{ color: bio.color, background: `${bio.color}12`, border: `1px solid ${bio.color}20` }}>
                      ARES-X CREW
                    </span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-bold mb-1" style={{ color: bio.color }}>
                    {bio.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-1">{bio.role}</p>
                  <p className="text-white/50 text-xs mb-4">{bio.specialization}</p>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                  { icon: MapPin, label: 'ORIGIN', value: bio.nationality },
                  { icon: Clock, label: 'AGE', value: `${bio.age} yrs` },
                  { icon: Rocket, label: 'MISSIONS', value: String(bio.missions) },
                  { icon: GraduationCap, label: 'FLIGHT HRS', value: bio.flightHours }].
                  map((stat, i) =>
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: EXPO_OUT }}
                    className="p-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>

                        <stat.icon className="w-3 h-3 mb-1" style={{ color: `${bio.color}50` }} />
                        <div className="text-[7px] font-display tracking-[0.12em] text-white/50 mb-0.5">{stat.label}</div>
                        <div className="text-xs font-display font-medium text-white/60">{stat.value}</div>
                      </motion.div>
                  )}
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${bio.color}20, transparent)` }} />
                  <span className="text-[8px] font-display tracking-[0.2em]" style={{ color: `${bio.color}40` }}>BIOGRAPHY</span>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${bio.color}20)` }} />
                </div>
                <p className="text-white/35 text-sm leading-relaxed">{bio.bio}</p>
              </div>

              {/* Quote */}
              <div
            className="mb-6 p-4 rounded-xl"
            style={{ background: `${bio.color}04`, borderLeft: `2px solid ${bio.color}30` }}>

                <p className="text-white/40 text-sm italic leading-relaxed">{bio.quote}</p>
              </div>

              {/* Achievements */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-3.5 h-3.5" style={{ color: `${bio.color}50` }} />
                  <span className="text-[8px] font-display tracking-[0.2em]" style={{ color: `${bio.color}40` }}>KEY ACHIEVEMENTS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bio.achievements.map((a, i) =>
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: EXPO_OUT }}
                  className="flex items-start gap-2 py-2 px-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>

                      <span className="text-[10px] mt-0.5" style={{ color: bio.color }}>▸</span>
                      <span className="text-xs text-white/40 leading-relaxed">{a}</span>
                    </motion.div>
                )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${bio.color}10` }}>
                <span className="text-[8px] font-display tracking-[0.12em] text-white/10">
                  ARES-X CREW MANIFEST · CLASSIFIED LEVEL ALPHA
                </span>
                <span className="text-[8px] font-display tracking-[0.12em]" style={{ color: `${bio.color}30` }}>
                  ESC TO CLOSE
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}

export default memo(CrewBioOverlay);