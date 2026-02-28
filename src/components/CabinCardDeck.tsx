import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import {
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Shield } from
'lucide-react';

/* ================================================================
   3D CABIN CARD DECK

   A perspective-stacked deck of three ticket classes.
   • Flick left / right (onPan) to browse
   • Click side cards to bring forward
   • Arrow / dot navigation + keyboard arrows
   • Active card shows shimmer highlight & glow
   ================================================================ */

// ── Cabin data ──
export interface Cabin {
  name: string;
  tier: string;
  price: string;
  color: string;
  features: string[];
  tagline: string;
  popular?: boolean;
}

export const CABINS: Cabin[] = [
{
  name: 'Explorer',
  tier: 'Economy Class',
  price: '250K',
  color: '#4ab8c4',
  features: [
  'Shared cabin · 4 passengers',
  'Standard Mars dining',
  '1 EVA spacewalk included',
  'Observation deck access',
  '24/7 communication link'],

  tagline: 'YOUR JOURNEY BEGINS'
},
{
  name: 'Pioneer',
  tier: 'Business Class',
  price: '500K',
  color: '#FF4500',
  features: [
  'Private suite · panoramic view',
  'Premium chef-curated dining',
  '3 EVA spacewalks included',
  'Priority launch boarding',
  'Personal AI concierge'],

  tagline: 'THE PREFERRED CHOICE',
  popular: true
},
{
  name: 'Odyssey',
  tier: 'First Class',
  price: '1.2M',
  color: '#eab308',
  features: [
  'Royal suite · zero-G jacuzzi',
  "Chef's table · molecular menu",
  'Unlimited EVA program',
  'Private launch window',
  'Lifetime mission membership'],

  tagline: 'THE ULTIMATE VOYAGE'
}];


// ── Per-cabin decorative SVG ──

const ICONS = [Rocket, Sparkles, Crown] as const;

function CardDecoration({ index, color }: {index: number;color: string;}) {
  if (index === 0) {
    // Explorer — structured dot grid
    return (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
        {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) =>
        <circle
        key={`${r}-${c}`}
        cx={16 + c * 24}
        cy={12 + r * 24}
        r="1.5"
        fill={color}
        opacity={0.12 - r * 0.015} />

        )
        )}
      </svg>);

  }
  if (index === 1) {
    // Pioneer — concentric orbital rings
    return (
      <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
        <ellipse cx="100" cy="60" rx="85" ry="42" stroke={color} strokeWidth="0.6" opacity={0.1} />
        <ellipse cx="100" cy="60" rx="62" ry="30" stroke={color} strokeWidth="0.6" opacity={0.12} />
        <ellipse cx="100" cy="60" rx="38" ry="18" stroke={color} strokeWidth="0.6" opacity={0.14} />
        <circle cx="100" cy="60" r="3.5" fill={color} opacity={0.2} />
        {/* small satellite */}
        <circle cx="160" cy="38" r="2" fill={color} opacity={0.18}>
          <animateTransform attributeName="transform" type="rotate" from="0 100 60" to="360 100 60" dur="12s" repeatCount="indefinite" />
        </circle>
      </svg>);

  }
  // Odyssey — starburst
  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
      {Array.from({ length: 14 }, (_, i) => {
        const a = i * (360 / 14) * Math.PI / 180;
        return (
          <line
          key={i}
          x1={100}
          y1={60}
          x2={100 + Math.cos(a) * 85}
          y2={60 + Math.sin(a) * 52}
          stroke={color}
          strokeWidth="0.4"
          opacity={0.08} />);


      })}
      <circle cx="100" cy="60" r="3" fill={color} opacity={0.15} />
    </svg>);

}

// ── Individual card ──

interface CardProps {
  cabin: Cabin;
  index: number;
  isActive: boolean;
  onBook: () => void;
  onFocus: () => void;
}

function CabinCard({ cabin, index, isActive, onBook, onFocus }: CardProps) {
  const Icon = ICONS[index] ?? Shield;

  return (
    <div
    className={`relative rounded-2xl overflow-hidden select-none transition-shadow duration-500 ${
    isActive ? 'cursor-default' : 'cursor-pointer'}`
    }
    style={{
      boxShadow: isActive ?
      `0 24px 80px ${cabin.color}18, 0 0 60px ${cabin.color}0c` :
      '0 12px 40px rgba(0,0,0,0.35)'
    }}
    onClick={isActive ? undefined : onFocus}>

      {/* Glass bg */}
      <div className="absolute inset-0 bg-[#0b0b18]/92 backdrop-blur-2xl" />

      {/* Border */}
      <div
      className="absolute inset-0 rounded-2xl transition-colors duration-500"
      style={{ border: `1px solid ${isActive ? cabin.color + '28' : 'rgba(255,255,255,0.05)'}` }} />


      {/* Top accent line */}
      <div
      className="absolute top-0 inset-x-0 h-px"
      style={{
        background: `linear-gradient(90deg, transparent 5%, ${cabin.color}${isActive ? '70' : '30'} 50%, transparent 95%)`
      }} />


      {/* Bottom accent line (subtle) */}
      <div
      className="absolute bottom-0 inset-x-0 h-px"
      style={{
        background: `linear-gradient(90deg, transparent 20%, ${cabin.color}10 50%, transparent 80%)`
      }} />


      {/* Popular badge */}
      {cabin.popular &&
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <span
        className="px-3 py-[3px] rounded-b-lg text-[7px] font-display tracking-[0.22em] font-bold text-white"
        style={{ backgroundColor: cabin.color }}>

            MOST POPULAR
          </span>
        </div>
      }

      {/* Shimmer highlight on active card */}
      {isActive &&
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <motion.div
          className="absolute inset-y-0 w-28 -skew-x-12"
          style={{
            background: `linear-gradient(90deg, transparent, ${cabin.color}06, transparent)`
          }}
          animate={{ x: [-160, 400] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }} />

        </div>
      }

      <div className="relative p-5 sm:p-6 pt-6 sm:pt-7">
        {/* Background deco SVG */}
        <div className="absolute -top-1 -right-2 w-36 h-24 pointer-events-none opacity-80">
          <CardDecoration index={index} color={cabin.color} />
        </div>

        {/* Icon */}
        <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: cabin.color + '12', border: `1px solid ${cabin.color}18` }}>

          <Icon className="w-4 h-4" style={{ color: cabin.color }} />
        </div>

        {/* Tier label */}
        <span
        className="text-[8px] sm:text-[9px] font-display tracking-[0.25em] uppercase"
        style={{ color: cabin.color + '80' }}>

          {cabin.tier}
        </span>

        {/* Name */}
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5 mb-0.5">
          {cabin.name}
        </h3>

        {/* Tagline */}
        <p
        className="text-[8px] font-display tracking-[0.14em] mb-3 sm:mb-4"
        style={{ color: cabin.color + '45' }}>

          {cabin.tagline}
        </p>

        {/* Price */}
        <div className="mb-4 sm:mb-5">
          <span className="font-display text-3xl sm:text-4xl font-bold" style={{ color: cabin.color }}>
            ${cabin.price}
          </span>
          <span className="text-white/50 text-[10px] ml-1.5">/person</span>
        </div>

        {/* Divider */}
        <div
        className="h-px mb-3 sm:mb-4"
        style={{ background: `linear-gradient(90deg, ${cabin.color}18, transparent)` }} />


        {/* Features */}
        <ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6">
          {cabin.features.map((f) =>
          <li key={f} className="flex items-start gap-2 text-white/35 text-[10px] sm:text-[11px] leading-tight">
              <Check className="w-3 h-3 flex-shrink-0 mt-px" style={{ color: cabin.color }} />
              {f}
            </li>
          )}
        </ul>

        {/* CTA */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (isActive) onBook();else
            onFocus();
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className={`w-full py-2.5 sm:py-3 rounded-xl font-display text-[10px] sm:text-xs font-semibold tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
          isActive ?
          'text-white' :
          'bg-white/[0.03] border border-white/[0.06] text-white/30'}`
          }
          style={
          isActive ?
          { backgroundColor: cabin.color, boxShadow: `0 8px 32px ${cabin.color}35` } :
          undefined
          }>

          <Rocket className="w-3.5 h-3.5" />
          {isActive ? 'BOOK THIS CLASS' : 'SELECT'}
        </motion.button>
      </div>
    </div>);

}

// ── Main deck ──

interface CabinCardDeckProps {
  onSelect: (index: number) => void;
  initialIndex?: number;
  /** Compact variant for overlay panels */
  compact?: boolean;
}

function CabinCardDeck({ onSelect, initialIndex = 1, compact = false }: CabinCardDeckProps) {
  const [active, setActive] = useState(initialIndex);
  const deckRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const goTo = useCallback(
    (i: number) => setActive(Math.max(0, Math.min(CABINS.length - 1, i))),
    []
  );

  // Pan-to-flick gesture
  const handlePanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const OFFSET = 50;
      const VEL = 250;
      if (info.offset.x < -OFFSET || info.velocity.x < -VEL) goTo(active + 1);else
      if (info.offset.x > OFFSET || info.velocity.x > VEL) goTo(active - 1);
    },
    [active, goTo]
  );

  // Keyboard arrows (only when section is in viewport)
  useEffect(() => {
    if (!deckRef.current) return;
    const el = deckRef.current;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {e.preventDefault();goTo(active - 1);}
      if (e.key === 'ArrowRight') {e.preventDefault();goTo(active + 1);}
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, active, goTo]);

  // 3D positioning per card
  const getAnim = (index: number) => {
    const off = index - active;
    const spread = compact ? 170 : 240;
    const depth = compact ? 100 : 150;
    return {
      x: off * spread,
      z: -Math.abs(off) * depth,
      rotateY: -off * 18,
      scale: 1 - Math.abs(off) * 0.13,
      opacity: Math.max(0.12, 1 - Math.abs(off) * 0.42)
    };
  };

  // Render far-to-near so active card paints last (on top)
  const sorted = CABINS.map((_, i) => i).sort(
    (a, b) => Math.abs(b - active) - Math.abs(a - active)
  );

  const cardW = compact ? 260 : 290;
  const areaH = compact ? 420 : 500;

  return (
    <div ref={deckRef} className="relative" role="listbox" aria-label="Cabin classes">
      {/* 3D perspective container — captures pan gestures */}
      <motion.div
        className="relative mx-auto overflow-visible"
        style={{
          perspective: 1200,
          perspectiveOrigin: '50% 50%',
          touchAction: 'pan-y',
          height: areaH
        }}
        onPanEnd={handlePanEnd}>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence initial={false}>
            {sorted.map((i) => {
              const cabin = CABINS[i];
              const isActive = i === active;
              const off = i - active;
              const anim = getAnim(i);

              return (
                <motion.div
                  key={cabin.name}
                  role="option"
                  aria-selected={isActive}
                  className="absolute"
                  style={{
                    width: cardW,
                    transformStyle: 'preserve-3d',
                    zIndex: CABINS.length - Math.abs(off),
                    willChange: 'transform, opacity'
                  }}
                  animate={anim}
                  transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}>

                  <CabinCard
                    cabin={cabin}
                    index={i}
                    isActive={isActive}
                    onBook={() => onSelect(i)}
                    onFocus={() => goTo(i)} />

                </motion.div>);

            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation row */}
      <div className="flex items-center justify-center gap-5 mt-1">
        {/* Prev */}
        <button
        onClick={() => goTo(active - 1)}
        disabled={active === 0}
        aria-label="Previous class"
        className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-15 disabled:cursor-not-allowed">

          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Indicator bars */}
        <div className="flex items-center gap-1.5">
          {CABINS.map((c, i) =>
          <button
          key={c.name}
          onClick={() => goTo(i)}
          aria-label={`Select ${c.name}`}
          className="relative w-9 h-[3px] rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>

              <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              animate={{
                width: i === active ? '100%' : '0%',
                backgroundColor: CABINS[active].color
              }}
              transition={{ duration: 0.4, ease: EXPO_OUT }} />

            </button>
          )}
        </div>

        {/* Next */}
        <button
        onClick={() => goTo(active + 1)}
        disabled={active === CABINS.length - 1}
        aria-label="Next class"
        className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white/60 hover:bg-white/[0.06] transition-all disabled:opacity-15 disabled:cursor-not-allowed">

          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-[8px] text-white/[0.08] font-display tracking-[0.25em] mt-2.5 select-none">
        SWIPE OR USE ARROWS TO BROWSE CLASSES
      </p>
    </div>);

}

export default memo(CabinCardDeck);