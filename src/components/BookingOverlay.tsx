import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Rocket,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Loader2,
  CheckCircle,
  ShieldCheck } from
'lucide-react';
import SeatMap from '@/components/SeatMap';
import CabinCardDeck, { CABINS } from '@/components/CabinCardDeck';
import TrajectoryMap from '@/components/TrajectoryMap';
import LaunchSequence from '@/components/LaunchSequence';
import type { LaunchBooking } from '@/components/LaunchSequence';
import { EXPO_OUT } from '@/lib/easing';

const DESTS = ['Olympus Mons', 'Valles Marineris', 'Jezero Crater', 'Polar Ice Caps'];
const DATES = ['March 2026', 'June 2026', 'September 2026', 'January 2027'];

interface BookingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: number;
}

// ── Pay button phases ──
type PayPhase = 'idle' | 'processing' | 'confirmed' | 'launching';

export default function BookingOverlay({ isOpen, onClose, initialTier = 1 }: BookingOverlayProps) {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState(initialTier);
  const [seat, setSeat] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', dest: '', date: '' });
  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [launching, setLaunching] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; dest?: string; date?: string }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen || launching) return;
    const element = containerRef.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstEl?.focus();
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, launching, step]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.dest) newErrors.dest = 'Please select a destination';
    if (!form.date) newErrors.date = 'Please select a launch date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const reset = useCallback(() => {
    setStep(0);
    setSeat(null);
    setForm({ name: '', email: '', dest: '', date: '' });
    setPayPhase('idle');
    setLaunching(false);
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Pay button transformation sequence
  const handlePay = useCallback(() => {
    if (payPhase !== 'idle') return;
    setPayPhase('processing');
    setTimeout(() => setPayPhase('confirmed'), 1200);
    setTimeout(() => {
      setPayPhase('launching');
      setLaunching(true);
    }, 2200);
  }, [payPhase]);

  // After the full-screen rocket sequence finishes
  const handleLaunchComplete = useCallback(() => {
    setLaunching(false);
    reset();
    onClose();
  }, [reset, onClose]);

  const inputCls =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/15 transition-all';
  const inputErrorCls =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-red-500/40 text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/15 transition-all';
  const selectCls =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer';
  const selectErrorCls =
  'w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-red-500/40 text-white text-sm focus:outline-none focus:border-red-500/60 transition-all appearance-none cursor-pointer';

  const STEPS = ['Class', 'Seat', 'Details', 'Checkout'];
  const tierColor = CABINS[tier].color;

  const launchBooking: LaunchBooking = {
    cabin: CABINS[tier].name,
    cabinColor: tierColor,
    seat: seat || '\u2014',
    passenger: form.name || 'Traveler',
    destination: form.dest || '\u2014',
    date: form.date || '\u2014',
    price: CABINS[tier].price
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !launching &&
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>

            {/* Backdrop */}
            <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} />


            {/* Panel */}
            <motion.div
            layoutId="booking-panel"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}>

              {/* Glass bg */}
              <div className="absolute inset-0 bg-[#0a0a16]/95 backdrop-blur-3xl border border-white/[0.08] rounded-3xl" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-3xl" />

              <div className="relative p-5 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
                      BOOK PASSAGE
                    </h3>
                    <p className="text-[10px] text-white/50 font-display tracking-[0.2em] mt-0.5">
                      ARES-X INTERPLANETARY
                    </p>
                  </div>
                  <button
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all">

                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1.5 mb-8">
                  {STEPS.map((label, i) =>
                <div key={label} className="flex items-center gap-1.5 flex-1">
                      <button
                  onClick={() => i < step && payPhase === 'idle' && setStep(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-display tracking-wider transition-all flex-shrink-0 ${
                  i === step ?
                  'bg-primary/10 border border-primary/25 text-primary' :
                  i < step ?
                  'bg-white/[0.04] border border-white/[0.06] text-white/40 cursor-pointer' :
                  'bg-white/[0.02] border border-white/[0.04] text-white/50'}`
                  }>

                        <span className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold">
                          {i < step ? '\u2713' : i + 1}
                        </span>
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                      {i < STEPS.length - 1 &&
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  }
                    </div>
                )}
                </div>

                <AnimatePresence mode="wait">
                  {/* STEP 0 — Class */}
                  {step === 0 && (
                    <motion.div
                      key="s0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: EXPO_OUT }}>
                      <CabinCardDeck
                    compact
                    initialIndex={tier}
                    onSelect={(i) => {
                      setTier(i);
                      setStep(1);
                    }} />
                    </motion.div>
                )}

                  {/* STEP 1 — Seat */}
                  {step === 1 && (
                    <motion.div
                      key="s1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: EXPO_OUT }}>
                      <div className="text-center mb-4">
                        <span className="text-[10px] font-display tracking-[0.2em] text-white/30">
                          SELECT YOUR SEAT &mdash;{' '}
                        </span>
                        <span
                    className="text-[10px] font-display tracking-[0.2em] font-bold"
                    style={{ color: tierColor }}>

                          {CABINS[tier].name.toUpperCase()} CLASS
                        </span>
                      </div>
                      <SeatMap selectedTier={tier} selectedSeat={seat} onSelect={setSeat} />
                      {seat &&
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center">

                          <span className="text-xs text-white/40">Selected: </span>
                          <span className="font-display text-sm font-bold" style={{ color: tierColor }}>
                            SEAT {seat}
                          </span>
                        </motion.div>
                  }
                      <div className="flex gap-3 mt-6">
                        <button
                    onClick={() => setStep(0)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs hover:bg-white/[0.06] transition-all flex items-center gap-1.5">

                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <motion.button
                      onClick={() => seat && setStep(2)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!seat}
                      className={`flex-1 py-2.5 rounded-xl font-display text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      seat ?
                      'bg-primary text-white shadow-lg shadow-primary/20' :
                      'bg-white/[0.03] text-white/50 cursor-not-allowed'}`
                      }>

                          Continue <ArrowRight className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </motion.div>
                )}

                  {/* STEP 2 — Details */}
                  {step === 2 && (
                    <motion.div
                      key="s2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: EXPO_OUT }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] text-white/50 font-display tracking-[0.2em] uppercase mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                            <input
                        type="text"
                        value={form.name}
                        onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors((prev) => ({ ...prev, name: undefined })); }}
                        placeholder="Commander..."
                        className={errors.name ? inputErrorCls : inputCls} />

                          </div>
                          {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-[9px] text-white/50 font-display tracking-[0.2em] uppercase mb-1.5">
                            Email
                          </label>
                          <div className="relative">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                            <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors((prev) => ({ ...prev, email: undefined })); }}
                        placeholder="you@earth.com"
                        className={errors.email ? inputErrorCls : inputCls} />

                          </div>
                          {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] text-white/50 font-display tracking-[0.2em] uppercase mb-1.5">
                              Destination
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                              <select
                          value={form.dest}
                          onChange={(e) => { setForm({ ...form, dest: e.target.value }); if (errors.dest) setErrors((prev) => ({ ...prev, dest: undefined })); }}
                          className={errors.dest ? selectErrorCls : selectCls}>

                                <option value="" className="bg-[#0a0a14]">
                                  Select...
                                </option>
                                {DESTS.map((d) =>
                            <option key={d} value={d} className="bg-[#0a0a14]">
                                    {d}
                                  </option>
                            )}
                              </select>
                            </div>
                            {errors.dest && <p className="text-red-400 text-[10px] mt-1">{errors.dest}</p>}
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/50 font-display tracking-[0.2em] uppercase mb-1.5">
                              Launch
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                              <select
                          value={form.date}
                          onChange={(e) => { setForm({ ...form, date: e.target.value }); if (errors.date) setErrors((prev) => ({ ...prev, date: undefined })); }}
                          className={errors.date ? selectErrorCls : selectCls}>

                                <option value="" className="bg-[#0a0a14]">
                                  Select...
                                </option>
                                {DATES.map((d) =>
                            <option key={d} value={d} className="bg-[#0a0a14]">
                                    {d}
                                  </option>
                            )}
                              </select>
                            </div>
                            {errors.date && <p className="text-red-400 text-[10px] mt-1">{errors.date}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Trajectory map */}
                      <AnimatePresence mode="wait">
                        {form.date && <TrajectoryMap key={form.date} selectedDate={form.date} />}
                      </AnimatePresence>

                      <div className="flex gap-3 mt-6">
                        <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs hover:bg-white/[0.06] transition-all flex items-center gap-1.5">

                          <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <motion.button
                      onClick={() => { if (validateForm()) setStep(3); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-white font-display text-xs font-semibold tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5">

                          Review &amp; Pay <ArrowRight className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </motion.div>
                )}

                  {/* STEP 3 — Checkout */}
                  {step === 3 && (
                    <motion.div
                      key="s3"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: EXPO_OUT }}>
                      {/* Order summary */}
                      <div className="space-y-2 mb-5">
                        {[
                    { k: 'Class', v: CABINS[tier].name, c: tierColor },
                    { k: 'Seat', v: seat || '\u2014', c: tierColor },
                    { k: 'Passenger', v: form.name || '\u2014' },
                    { k: 'Destination', v: form.dest || '\u2014' },
                    { k: 'Launch', v: form.date || '\u2014' }].
                    map((r) =>
                    <div
                    key={r.k}
                    className="flex justify-between py-1.5 border-b border-white/[0.04]">

                            <span className="text-white/50 text-xs">{r.k}</span>
                            <span
                      className="text-xs font-medium"
                      style={{ color: r.c || 'rgba(255,255,255,0.6)' }}>

                              {r.v}
                            </span>
                          </div>
                    )}
                      </div>

                      {/* Payment card */}
                      <div className="rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.07] p-4 mb-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-white/50" />
                            <span className="text-[9px] font-display tracking-[0.18em] text-white/30">
                              PAYMENT METHOD
                            </span>
                          </div>
                          <ShieldCheck className="w-3.5 h-3.5 text-green-500/40" />
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Card chip */}
                          <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border border-yellow-500/20" />
                          <div>
                            <p className="text-white/50 text-xs font-mono tracking-wider">
                              &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
                            </p>
                            <p className="text-[9px] text-white/50 font-display tracking-wider mt-0.5">
                              ARES-X CARD &middot; EXP 12/28
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex items-baseline justify-between mb-6">
                        <span className="text-[10px] font-display tracking-[0.15em] text-white/30">
                          TOTAL
                        </span>
                        <div>
                          <span
                      className="font-display text-2xl font-bold"
                      style={{ color: tierColor }}>

                            ${CABINS[tier].price}
                          </span>
                          <span className="text-white/50 text-[10px] ml-1">/person</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        {/* Back (hidden once pay starts) */}
                        <AnimatePresence>
                          {payPhase === 'idle' && (
                      <motion.button
                        exit={{ width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0, marginRight: 0 }}
                        transition={{ duration: 0.3, ease: EXPO_OUT }}
                        onClick={() => {setStep(2);setPayPhase('idle');}}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs hover:bg-white/[0.06] transition-all flex items-center gap-1.5 overflow-hidden">

                              <ArrowLeft className="w-3 h-3 flex-shrink-0" />
                              <span className="flex-shrink-0">Back</span>
                            </motion.button>
                      )
                      }
                        </AnimatePresence>

                        {/* Pay / Launch button */}
                        <motion.button
                      onClick={handlePay}
                      disabled={payPhase !== 'idle'}
                      layout
                      className={`flex-1 py-3 rounded-xl font-display text-sm font-semibold tracking-wider flex items-center justify-center gap-2 transition-shadow overflow-hidden ${
                      payPhase === 'confirmed' ?
                      'bg-green-500 text-white shadow-lg shadow-green-500/25' :
                      payPhase === 'processing' ?
                      'bg-white/[0.06] border border-white/[0.1] text-white/50' :
                      'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 cursor-pointer'}`
                      }
                      animate={{
                        boxShadow:
                        payPhase === 'processing' ?
                        [
                        '0 0 0px rgba(255,69,0,0)',
                        '0 0 30px rgba(255,69,0,0.15)',
                        '0 0 0px rgba(255,69,0,0)'] :

                        undefined
                      }}
                      transition={{
                        boxShadow: { duration: 1.2, repeat: Infinity },
                        layout: { type: 'spring', stiffness: 300, damping: 25 }
                      }}
                      whileHover={payPhase === 'idle' ? { scale: 1.02 } : undefined}
                      whileTap={payPhase === 'idle' ? { scale: 0.98 } : undefined}>

                          <AnimatePresence mode="wait">
                            {payPhase === 'idle' && (
                              <motion.span
                                key="idle"
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: EXPO_OUT }}
                              >
                                <Rocket className="w-4 h-4" />
                                PAY ${CABINS[tier].price}
                              </motion.span>
                            )}

                            {payPhase === 'processing' && (
                              <motion.span
                                key="proc"
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: EXPO_OUT }}
                              >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                PROCESSING\u2026
                              </motion.span>
                            )}

                            {(payPhase === 'confirmed' || payPhase === 'launching') && (
                              <motion.span
                                key="conf"
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              >
                                <CheckCircle className="w-4 h-4" />
                                CONFIRMED
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>

                      {/* Fine print */}
                      <p className="text-[9px] text-white/10 text-center mt-4 font-display tracking-wider">
                        ENCRYPTED &middot; FULLY REFUNDABLE T-30 &middot; ARES-X SECURE PAY
                      </p>
                    </motion.div>
                )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* \u2500\u2500 Full-screen rocket launch \u2500\u2500 */}
      <LaunchSequence
        active={launching}
        onComplete={handleLaunchComplete}
        booking={launchBooking} />

    </>);

}
