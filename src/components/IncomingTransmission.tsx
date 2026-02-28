import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, User } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   INCOMING TRANSMISSION

   A surprise notification that slides in ~60s after the main page
   loads, simulating a live message from the Mars crew.

   • Shows once per session (sessionStorage flag)
   • Pulsing "INCOMING" header
   • Random crew member + message
   • Typing effect on message body
   • Auto-dismiss after 15s or manual close
   ================================================================ */

const TRANSMISSIONS = [
{
  from: 'Dr. Elena Vasquez',
  role: 'Chief Science Officer',
  callsign: 'ARES-VII',
  message: 'Soil analysis from Jezero shows promising organics in the delta sediments. Requesting extended EVA schedule. The sunrise here is something else.',
  color: '#FF4500'
},
{
  from: 'Cmdr. James Chen',
  role: 'Mission Commander',
  callsign: 'ARES-V',
  message: 'All systems green. Wind picking up from the northeast at 45 km/h. We\'ve got dust on the horizon but nothing the hab can\'t handle. Crew morale is high.',
  color: '#eab308'
},
{
  from: 'Aisha Patel',
  role: 'Flight Engineer',
  callsign: 'ARES-IX',
  message: 'Rover Pathfinder-3 just crested the rim of a secondary crater. Sending images back now. You\'re going to want to see this.',
  color: '#4ab8c4'
},
{
  from: 'Prof. Marco Torres',
  role: 'Geologist',
  callsign: 'ARES-III',
  message: 'Confirming layered deposits in the canyon wall consistent with ancient lakebed. This is exactly what we came here for. Collecting core samples.',
  color: '#a855f7'
}];


const STORAGE_KEY = 'ares-x-transmission-seen';

function TypingMessage({ text, onDone }: {text: string;onDone: () => void;}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {clearInterval(id);onDone();}
    }, 25);
    return () => clearInterval(id);
  }, [text, onDone]);

  return (
    <span>
      {typed}
      {typed.length < text.length && <span className="animate-pulse text-white/40">█</span>}
    </span>);

}

export default function IncomingTransmission() {
  const [visible, setVisible] = useState(false);
  const [msgDone, setMsgDone] = useState(false);
  const [transmission] = useState(() =>
  TRANSMISSIONS[Math.floor(Math.random() * TRANSMISSIONS.length)]
  );

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const delay = 55000 + Math.random() * 15000; // 55-70s
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, '1');
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after 18s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 18000);
    return () => clearTimeout(t);
  }, [visible]);

  const handleDone = useCallback(() => setMsgDone(true), []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <AnimatePresence>
      {visible &&
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.6, ease: EXPO_OUT }}
        className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-[200] w-[320px] sm:w-[360px] max-w-[calc(100vw-2rem)]">

          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black/80 backdrop-blur-xl shadow-2xl">
            {/* Top accent */}
            <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${transmission.color}, transparent)` }} />


            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Radio className="w-3.5 h-3.5" style={{ color: transmission.color }} />
                  <div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: transmission.color }} />

                </div>
                <span className="text-[9px] font-display tracking-[0.25em] font-bold" style={{ color: transmission.color }}>
                  INCOMING TRANSMISSION
                </span>
              </div>
              <button
            onClick={close}
            className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors">

                <X className="w-3 h-3 text-white/30" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
              {/* From */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: transmission.color + '15', border: `1px solid ${transmission.color}25` }}>

                  <User className="w-3.5 h-3.5" style={{ color: transmission.color }} />
                </div>
                <div>
                  <div className="text-xs text-white/60 font-medium leading-tight">{transmission.from}</div>
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/50">
                    {transmission.role} · {transmission.callsign}
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-[11px] sm:text-xs text-white/35 leading-relaxed">
                <TypingMessage text={transmission.message} onDone={handleDone} />
              </p>

              {/* Signal info */}
              {msgDone &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">

                  <span className="text-[7px] font-display tracking-[0.2em] text-white/10">
                    SIGNAL DELAY: 14m 22s
                  </span>
                  <span className="text-[7px] font-display tracking-[0.2em] text-white/10">
                    ENCRYPTED · L2 RELAY
                  </span>
                </motion.div>
            }
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.005) 3px, rgba(255,255,255,0.005) 4px)'
          }} />
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}