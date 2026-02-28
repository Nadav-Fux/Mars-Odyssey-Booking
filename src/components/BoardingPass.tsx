import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Star, Fingerprint, Zap, Globe, ChevronRight } from 'lucide-react';
import { useAchievements, ACHIEVEMENTS } from '@/hooks/useAchievements';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   COMMANDER'S BOARDING PASS
   
   A cinematic, interactive boarding card that summarises the user's
   journey through the ARES-X site: achievements, high-score,
   pages visited, time on mission.  Designed to look like a real
   spacecraft boarding pass / security credential.
   ================================================================ */

interface Props {
  open: boolean;
  onClose: () => void;
}

// ── Helpers ──
const CALLSIGNS = [
'PHOENIX', 'HORIZON', 'VANGUARD', 'ECLIPSE', 'NOVA', 'ZENITH',
'AURORA', 'TITAN', 'STELLAR', 'NEBULA', 'QUASAR', 'PULSAR',
'COMET', 'ORBIT', 'COSMO', 'ASTRAL', 'LUNAR', 'SOLARIS'];


function getCallsign(): string {
  let cs = localStorage.getItem('ares_callsign');
  if (!cs) {
    const name = CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];
    const num = String(Math.floor(100 + Math.random() * 900));
    cs = `${name}-${num}`;
    localStorage.setItem('ares_callsign', cs);
  }
  return cs;
}

function getFirstVisitDate(): string {
  let d = localStorage.getItem('ares_first_visit');
  if (!d) {
    d = new Date().toISOString();
    localStorage.setItem('ares_first_visit', d);
  }
  return d;
}

function getClearanceLevel(total: number): {label: string;color: string;} {
  if (total >= 9) return { label: 'ALPHA-1', color: '#fbbf24' };
  if (total >= 7) return { label: 'ALPHA', color: '#f97316' };
  if (total >= 5) return { label: 'BETA', color: '#3b82f6' };
  if (total >= 3) return { label: 'GAMMA', color: '#22c55e' };
  return { label: 'DELTA', color: '#94a3b8' };
}

function formatMET(): string {
  const first = getFirstVisitDate();
  const ms = Date.now() - new Date(first).getTime();
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms % 86400000 / 3600000);
  const mins = Math.floor(ms % 3600000 / 60000);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Decorative barcode
function Barcode() {
  const bars = useRef(
    Array.from({ length: 40 }, () => ({
      w: Math.random() > 0.5 ? 2 : 1,
      h: 28 + Math.random() * 12,
      opacity: 0.3 + Math.random() * 0.5
    }))
  );
  return (
    <div className="flex items-end gap-[1px] h-10">
      {bars.current.map((b, i) =>
      <div
      key={i}
      className="bg-white rounded-[0.5px]"
      style={{ width: b.w, height: b.h, opacity: b.opacity }} />

      )}
    </div>);

}

// Perforated edge
function PerfEdge({ side }: {side: 'left' | 'right';}) {
  return (
    <div className={`absolute top-0 ${side}-0 h-full flex flex-col justify-between py-4`}>
      {Array.from({ length: 18 }, (_, i) =>
      <div
      key={i}
      className="w-2 h-2 rounded-full bg-black/80"
      style={{ marginLeft: side === 'left' ? -4 : 0, marginRight: side === 'right' ? -4 : 0 }} />

      )}
    </div>);

}

function BoardingPass({ open, onClose }: Props) {
  const { unlocked, totalUnlocked, totalAchievements } = useAchievements();
  const [callsign] = useState(getCallsign);
  const [commanderName, setCommanderName] = useState(
    () => localStorage.getItem('ares_commander_name') || ''
  );
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const highScore = Number(localStorage.getItem('ares_asteroid_hs') || '0');
  const clearance = getClearanceLevel(totalUnlocked);
  const pagesVisited = (() => {
    try {
      const v = JSON.parse(localStorage.getItem('ares-visited-pages') || '[]');
      return Array.isArray(v) ? v.length : 0;
    } catch {return 0;}
  })();

  // MET updates
  const [met, setMet] = useState(formatMET);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setMet(formatMET()), 10000);
    return () => clearInterval(id);
  }, [open]);

  // Save name
  const saveName = useCallback(() => {
    const trimmed = commanderName.trim().toUpperCase();
    setCommanderName(trimmed);
    if (trimmed) localStorage.setItem('ares_commander_name', trimmed);
    setEditingName(false);
  }, [commanderName]);

  useEffect(() => {
    if (editingName) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [editingName]);

  // Board date
  const boardDate = new Date(getFirstVisitDate());
  const dateStr = boardDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-[210] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EXPO_OUT }}>

          {/* Backdrop */}
          <div
        className="absolute inset-0"
        style={{ background: 'rgba(2,2,8,0.88)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />


          {/* Card */}
          <motion.div
          className="relative w-full max-w-md"
          initial={{ y: 60, scale: 0.92, rotateX: 8 }}
          animate={{ y: 0, scale: 1, rotateX: 0 }}
          exit={{ y: 40, scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ perspective: '800px' }}>

            {/* Close button */}
            <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">

              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* ── CARD BODY ── */}
            <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #0c0c1e 0%, #111127 40%, #0a0a1a 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 80px rgba(255,69,0,0.08), 0 25px 50px rgba(0,0,0,0.5)'
          }}>

              <PerfEdge side="left" />
              <PerfEdge side="right" />

              {/* Subtle grid pattern */}
              <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />


              {/* ── Header ── */}
              <div className="relative px-6 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[8px] font-display tracking-[0.25em] text-white/50 mb-1">
                      INTERPLANETARY TRANSIT AUTHORITY
                    </div>
                    <div className="text-lg font-display tracking-[0.12em] text-white/90 font-bold">
                      BOARDING PASS
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-display tracking-[0.15em] text-white/50">FLIGHT</div>
                    <div className="text-base font-display tracking-[0.1em] text-primary/80 font-bold">ARES-7</div>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-white/90">ERT</div>
                    <div className="text-[8px] font-display tracking-[0.12em] text-white/50">EARTH</div>
                  </div>
                  <div className="flex-1 flex items-center gap-1.5">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                    <div className="relative">
                      <ChevronRight className="w-3.5 h-3.5 text-primary/50" />
                    </div>
                    <div className="text-[7px] font-display tracking-[0.15em] text-white/50">225M KM</div>
                    <div className="relative">
                      <ChevronRight className="w-3.5 h-3.5 text-primary/50" />
                    </div>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-white/20 to-transparent" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-primary/90">MRS</div>
                    <div className="text-[8px] font-display tracking-[0.12em] text-white/50">MARS</div>
                  </div>
                </div>
              </div>

              {/* ── Commander Details ── */}
              <div className="relative px-6 py-4 border-b border-dashed border-white/[0.06]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Name */}
                  <div className="col-span-2">
                    <div className="text-[8px] font-display tracking-[0.2em] text-white/50 mb-0.5 flex items-center gap-1.5">
                      <Fingerprint className="w-2.5 h-2.5" />
                      COMMANDER
                    </div>
                    {editingName ?
                  <form
                  onSubmit={(e) => {e.preventDefault();saveName();}}
                  className="flex gap-2">

                        <input
                    ref={nameInputRef}
                    value={commanderName}
                    onChange={(e) => setCommanderName(e.target.value.slice(0, 24))}
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded px-2 py-0.5 text-sm font-display tracking-[0.1em] text-white/90 uppercase outline-none focus:border-primary/40"
                    placeholder="ENTER YOUR NAME"
                    maxLength={24}
                    spellCheck={false} />

                        <button
                    type="submit"
                    className="text-[9px] font-display tracking-[0.12em] text-primary/70 hover:text-primary transition-colors px-2 cursor-pointer">

                          SAVE
                        </button>
                      </form> :

                  <button
                  onClick={() => setEditingName(true)}
                  className="text-sm font-display tracking-[0.1em] text-white/80 hover:text-white transition-colors cursor-pointer text-left">

                        {commanderName ||
                    <span className="text-white/50 animate-pulse">TAP TO SET NAME</span>
                    }
                      </button>
                  }
                  </div>

                  {/* Callsign */}
                  <div>
                    <div className="text-[8px] font-display tracking-[0.2em] text-white/50 mb-0.5">CALLSIGN</div>
                    <div className="text-[11px] font-mono text-primary/70 font-semibold">{callsign}</div>
                  </div>

                  {/* Clearance */}
                  <div>
                    <div className="text-[8px] font-display tracking-[0.2em] text-white/50 mb-0.5 flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" />
                      CLEARANCE
                    </div>
                    <div
                  className="text-[11px] font-display tracking-[0.12em] font-bold"
                  style={{ color: clearance.color }}>

                      {clearance.label}
                    </div>
                  </div>

                  {/* Board date */}
                  <div>
                    <div className="text-[8px] font-display tracking-[0.2em] text-white/50 mb-0.5">BOARD DATE</div>
                    <div className="text-[11px] font-mono text-white/60">{dateStr}</div>
                  </div>

                  {/* MET */}
                  <div>
                    <div className="text-[8px] font-display tracking-[0.2em] text-white/50 mb-0.5 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      MISSION TIME
                    </div>
                    <div className="text-[11px] font-mono text-white/60">{met}</div>
                  </div>
                </div>
              </div>

              {/* ── Stats Row ── */}
              <div className="relative px-6 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="text-center">
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/50">PAGES</div>
                  <div className="text-lg font-display font-bold text-white/80">{pagesVisited}<span className="text-white/50 text-sm">/6</span></div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center">
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/50 flex items-center justify-center gap-1">
                    <Star className="w-2.5 h-2.5" />
                    ACHIEVEMENTS
                  </div>
                  <div className="text-lg font-display font-bold text-primary/80">{totalUnlocked}<span className="text-white/50 text-sm">/{totalAchievements}</span></div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center">
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/50 flex items-center justify-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    HI-SCORE
                  </div>
                  <div className="text-lg font-display font-bold text-yellow-400/80">{highScore}</div>
                </div>
              </div>

              {/* ── Achievement Badges ── */}
              <div className="relative px-6 py-3 border-b border-white/[0.06]">
                <div className="text-[8px] font-display tracking-[0.2em] text-white/50 mb-2">EARNED CREDENTIALS</div>
                <div className="flex flex-wrap gap-2">
                  {ACHIEVEMENTS.map((a) => {
                  const earned = unlocked.has(a.id);
                  return (
                    <div
                    key={a.id}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-display tracking-[0.1em] border transition-all ${
                    earned ?
                    'bg-primary/10 border-primary/20 text-primary/80' :
                    'bg-white/[0.02] border-white/[0.04] text-white/50'}`
                    }
                    title={earned ? `${a.title}: ${a.description}` : a.secret ? '???' : a.description}>

                        <span className="text-xs">{earned ? a.icon : a.secret ? '🔒' : '○'}</span>
                        <span>{earned ? a.title.toUpperCase() : a.secret ? '???' : a.title.toUpperCase()}</span>
                      </div>);

                })}
                </div>
              </div>

              {/* ── Footer / Barcode ── */}
              <div className="relative px-6 py-4 flex items-end justify-between">
                <div>
                  <Barcode />
                  <div className="text-[7px] font-mono text-white/50 mt-1 tracking-[0.12em]">
                    ITA-{callsign}-{dateStr.replace(/\s/g, '')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-display tracking-[0.15em] text-white/50">CABIN</div>
                  <div className="text-sm font-display tracking-[0.1em] text-white/60 font-bold">
                    {totalUnlocked >= 8 ? 'PIONEER SUITE' : totalUnlocked >= 5 ? 'EXPLORER POD' : 'STANDARD'}
                  </div>
                  <div className="text-[7px] font-display tracking-[0.1em] text-white/50 mt-0.5">
                    SEAT {String.fromCharCode(65 + callsign.charCodeAt(0) % 6)}-{String(callsign.charCodeAt(callsign.length - 1) % 40 + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Corner accent */}
              <div
            className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 100% 0%, rgba(255,69,0,0.08) 0%, transparent 70%)'
            }} />

              <div
            className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 0% 100%, rgba(255,69,0,0.05) 0%, transparent 70%)'
            }} />

            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}

export default memo(BoardingPass);