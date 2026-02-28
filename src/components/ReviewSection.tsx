import { useRef, useState, useCallback, memo } from 'react';
import { motion, PanInfo, useInView } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Quote, RotateCcw, BadgeCheck, Star, Rocket } from 'lucide-react';
import RevealText from '@/components/RevealText';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   REVIEW SECTION — UPGRADED

   Traveller reviews with:
     • Draggable physics-enabled Rating Orbs
     • Animated avatar with orbit ring
     • "Verified Mars Traveler" badge
     • Star rating display
     • Summary stats header (avg rating, total reviews)
     • Enhanced card hover effects
     • Scroll progress dots
   ================================================================ */

interface Review {
  name: string;
  mission: string;
  text: string;
  rating: number;
  color: string;
  initials: string;
  verified: boolean;
  cabin: string;
}

const REVIEWS: Review[] = [
{
  name: 'Dr. Elena Vasquez',
  mission: 'Ares-VII \u00b7 Pioneer',
  text: 'The Martian sunrise from the observation deck was transcendent. Worth every second of the seven-month journey.',
  rating: 5, color: '#FF4500', initials: 'EV', verified: true, cabin: 'Pioneer Suite'
},
{
  name: 'Cmdr. James Chen',
  mission: 'Ares-V \u00b7 Odyssey',
  text: "The zero-G jacuzzi alone justifies the upgrade. My AI concierge anticipated needs I didn't know I had.",
  rating: 5, color: '#eab308', initials: 'JC', verified: true, cabin: 'Odyssey Class'
},
{
  name: 'Aisha Patel',
  mission: 'Ares-IX \u00b7 Explorer',
  text: 'Incredible value. The shared cabin felt spacious, and the EVA walk permanently altered my perspective on life.',
  rating: 4, color: '#4ab8c4', initials: 'AP', verified: true, cabin: 'Explorer Pod'
},
{
  name: 'Prof. Marco Torres',
  mission: 'Ares-III \u00b7 Pioneer',
  text: 'Standing on Mars bedrock was a lifelong dream fulfilled. The science crew\u2019s expertise was truly outstanding.',
  rating: 5, color: '#FF4500', initials: 'MT', verified: true, cabin: 'Pioneer Suite'
},
{
  name: 'Yuki Tanaka',
  mission: 'Ares-VI \u00b7 Explorer',
  text: 'Seven months flew by. The onboard lab, film screenings, and surprisingly fantastic food kept everyone happy.',
  rating: 4, color: '#4ab8c4', initials: 'YT', verified: false, cabin: 'Explorer Pod'
},
{
  name: 'Col. Sarah Wright',
  mission: 'Ares-II \u00b7 Odyssey',
  text: "I've orbited Earth 3,000 times. Nothing compares to watching Phobos rise through the Royal Suite skylight.",
  rating: 5, color: '#eab308', initials: 'SW', verified: true, cabin: 'Odyssey Class'
}];


const AVG_RATING = (REVIEWS.reduce((a, r) => a + r.rating, 0) / REVIEWS.length).toFixed(1);

/* ── Rating Orb (draggable) ── */
function RatingOrb({ color, constraintsRef, index, onThrow




}: {color: string;constraintsRef: React.RefObject<HTMLElement | null>;index: number;onThrow: () => void;}) {
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (Math.hypot(info.velocity.x, info.velocity.y) > 120) onThrow();
    },
    [onThrow]
  );

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.14}
      dragMomentum
      dragTransition={{ bounceStiffness: 300, bounceDamping: 18, power: 0.5, timeConstant: 350 }}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.3,
        boxShadow: `0 0 28px ${color}70, 0 0 56px ${color}30, inset 0 -3px 8px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.22)`,
        zIndex: 60
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="w-[34px] h-[34px] sm:w-9 sm:h-9 rounded-full cursor-grab active:cursor-grabbing relative flex-shrink-0 select-none"
      style={{
        touchAction: 'none',
        background: `radial-gradient(circle at 30% 26%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 18%, ${color} 52%, rgba(0,0,0,0.42) 100%)`,
        boxShadow: `0 0 14px ${color}40, 0 0 30px ${color}18, inset 0 -3px 8px rgba(0,0,0,0.28), inset 0 2px 5px rgba(255,255,255,0.1)`,
        border: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10 + index
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.06 * index, type: 'spring', stiffness: 420, damping: 14 }}>

      <div className="absolute top-[4px] left-[5px] w-[10px] h-[7px] rounded-full bg-white/[0.22] blur-[1.5px] pointer-events-none" />
    </motion.div>);

}

/* ── Animated Avatar ── */
function AnimatedAvatar({ initials, color, verified }: {initials: string;color: string;verified: boolean;}) {
  return (
    <div className="relative">
      {/* Orbit ring */}
      <svg width="44" height="44" className="absolute -inset-1" viewBox="0 0 44 44">
        <circle
        cx="22" cy="22" r="20"
        fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.2"
        strokeDasharray="3 5">

          <animateTransform
          attributeName="transform" type="rotate"
          from="0 22 22" to="360 22 22" dur="8s" repeatCount="indefinite" />

        </circle>
      </svg>
      {/* Avatar */}
      <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-display font-bold relative"
      style={{
        backgroundColor: color + '15',
        color: color,
        border: `1.5px solid ${color}30`
      }}>

        {initials}
      </div>
      {/* Verified badge */}
      {verified &&
      <div
      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
      style={{ backgroundColor: '#050508' }}>

          <BadgeCheck className="w-3.5 h-3.5 text-green-400/80" />
        </div>
      }
    </div>);

}

/* ── Star Rating ── */
function StarRating({ rating, color }: {rating: number;color: string;}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) =>
      <Star
        key={i}
        className="w-3 h-3"
        style={{
          color: i <= rating ? color : 'rgba(255,255,255,0.08)',
          fill: i <= rating ? color : 'transparent'
        }} />

      )}
    </div>);

}

/* ── Review Card ── */
function ReviewCard({ review, constraintsRef, onThrow, resetKey




}: {review: Review;constraintsRef: React.RefObject<HTMLElement | null>;onThrow: () => void;resetKey: number;}) {
  return (
    <div className="relative rounded-2xl overflow-visible group">
      {/* Glass bg */}
      <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl group-hover:border-white/[0.12] group-hover:bg-white/[0.04] transition-all duration-500" />

      {/* Top accent line */}
      <div
      className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl transition-opacity duration-500 opacity-30 group-hover:opacity-100"
      style={{ background: `linear-gradient(90deg, transparent, ${review.color}40, transparent)` }} />


      {/* Hover glow */}
      <div
      className="absolute -top-10 right-0 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
      style={{ backgroundColor: review.color }} />


      <div className="relative p-5 sm:p-6">
        {/* Star rating + cabin class */}
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={review.rating} color={review.color} />
          <span
          className="text-[7px] font-display tracking-[0.15em] px-2 py-0.5 rounded-full"
          style={{ color: review.color + 'aa', backgroundColor: review.color + '10', border: `1px solid ${review.color}15` }}>

            {review.cabin.toUpperCase()}
          </span>
        </div>

        {/* Quote icon */}
        <Quote className="w-5 h-5 mb-3" style={{ color: review.color + '15' }} />

        {/* Review text */}
        <p className="text-white/35 text-[12px] sm:text-[13px] leading-relaxed mb-6 min-h-[56px]">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mb-5">
          <AnimatedAvatar initials={review.initials} color={review.color} verified={review.verified} />
          <div className="min-w-0">
            <div className="text-white/65 text-xs font-medium leading-tight truncate flex items-center gap-1.5">
              {review.name}
            </div>
            <div className="text-[9px] font-display tracking-[0.12em] text-white/50 mt-0.5">
              {review.mission.toUpperCase()}
            </div>
            {review.verified &&
            <div className="text-[7px] font-display tracking-[0.15em] text-green-400/40 mt-0.5">
                VERIFIED MARS TRAVELER
              </div>
            }
          </div>
        </div>

        {/* Rating orbs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[7px] sm:text-[8px] font-display tracking-[0.18em] text-white/12 mr-0.5 flex-shrink-0">
            DRAG
          </span>
          <div key={resetKey} className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: review.rating }, (_, i) =>
            <RatingOrb
              key={i}
              color={review.color}
              constraintsRef={constraintsRef}
              index={i}
              onThrow={onThrow} />

            )}
          </div>
        </div>
      </div>
    </div>);

}

/* ── Section ── */
function ReviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [throwCount, setThrowCount] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const handleThrow = useCallback(() => setThrowCount((c) => c + 1), []);
  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1);
    setThrowCount(0);
  }, []);

  useGSAP(() => {
    gsap.from('.rv-head', {
      y: 50, opacity: 0, stagger: 0.12, duration: 0.9,
      scrollTrigger: { trigger: '.rv-header', start: 'top 85%' }
    });
    gsap.from('.rv-card', {
      x: 80, opacity: 0, stagger: 0.09, duration: 0.75,
      scrollTrigger: { trigger: '.rv-grid', start: 'top 88%' }
    });
  }, { scope: sectionRef });

  return (
    <section id="reviews" ref={sectionRef} className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="rv-header mb-12 sm:mb-16">
          <span className="rv-head inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
            TRAVELER REVIEWS
          </span>
          <h2 className="rv-head font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
            VOICES FROM
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              THE RED PLANET
            </span>
          </h2>
          <RevealText
            text="Drag the rating orbs anywhere — fling them across the screen and watch the physics. Scroll sideways to see more reviews."
            className="rv-head text-white/30 text-sm sm:text-base max-w-lg leading-relaxed" />


          {/* Summary stats */}
          <div className="rv-head flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-display font-bold text-white/70">{AVG_RATING}</span>
              <span className="text-[8px] font-display tracking-wider text-white/50">AVG RATING</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Rocket className="w-3.5 h-3.5 text-primary/50" />
              <span className="text-sm font-display font-bold text-white/70">{REVIEWS.length}</span>
              <span className="text-[8px] font-display tracking-wider text-white/50">REVIEWS</span>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div
        className="rv-grid flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>

          {REVIEWS.map((r) =>
          <div key={r.name} className="rv-card flex-shrink-0 w-[85vw] sm:w-[340px] lg:w-[360px] snap-start">
              <ReviewCard
              review={r}
              constraintsRef={sectionRef}
              onThrow={handleThrow}
              resetKey={resetKey} />

            </div>
          )}
          <div className="flex-shrink-0 w-4" />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-8">
          <span className="text-[9px] font-display tracking-[0.15em] text-white/[0.08] select-none">
            {throwCount > 0 ?
            `${throwCount} ORB${throwCount !== 1 ? 'S' : ''} LAUNCHED` :
            'GRAB AN ORB AND FLING IT \u2192'}
          </span>

          {throwCount > 0 &&
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/50 text-[9px] font-display tracking-[0.15em] hover:text-white/60 hover:bg-white/[0.05] transition-all cursor-pointer">

              <RotateCcw className="w-3 h-3" />
              RESET ORBS
            </motion.button>
          }
        </div>
      </div>
    </section>);

}

export default memo(ReviewSection);