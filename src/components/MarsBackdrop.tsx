import { useRef, memo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import RealisticMars from '@/components/RealisticMars';

/**
 * MarsBackdrop
 *
 * A FIXED-position Mars globe layer that sits behind all page content.
 * Starts centered in the hero and on scroll:
 *
 *   0-100vh:    visible, scales up slightly
 *   100-200vh:  bleeds behind glass cards, fades gently
 *   200vh+:     fades out completely
 *
 * Uses pixel-distance scroll triggers (not element selectors)
 * so it works regardless of lazy-loaded sections.
 */
function MarsBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Create a single timeline driven by scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: '+=250%', // 2.5x viewport height
        scrub: 1.5,
        invalidateOnRefresh: true
      }
    });

    // Phase 1 (0% → 40%): Hero — scale up, increase opacity
    tl.fromTo(
      wrap,
      { scale: 1, yPercent: 0, opacity: 0.55 },
      { scale: 1.45, yPercent: -6, opacity: 0.7, ease: 'none', duration: 0.4 }
    );

    // Phase 2 (40% → 70%): Destinations — keep scaling, fade gently
    tl.to(wrap, {
      scale: 1.65,
      yPercent: -10,
      opacity: 0.3,
      ease: 'none',
      duration: 0.3
    });

    // Phase 3 (70% → 100%): Exit — fade out
    tl.to(wrap, {
      scale: 1.4,
      opacity: 0,
      ease: 'none',
      duration: 0.3
    });

    // Glow intensifies independently
    gsap.fromTo(
      '.mars-backdrop-glow',
      { opacity: 0, scale: 1.8 },
      {
        opacity: 0.35,
        scale: 2.4,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: '+=180%',
          scrub: 2
        }
      }
    );
  });

  return (
    <div
    ref={containerRef}
    className="fixed inset-0 z-[3] pointer-events-none flex items-center justify-center"
    aria-hidden="true">

      <div
      ref={wrapRef}
      className="relative"
      style={{ willChange: 'transform, opacity', opacity: 0.55 }}>

        {/* Scroll-intensifying glow */}
        <div
        className="mars-backdrop-glow absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
          'radial-gradient(circle, rgba(255,69,0,0.2) 0%, transparent 55%)',
          filter: 'blur(60px)',
          transform: 'scale(1.8)',
          opacity: 0
        }} />

        <RealisticMars size={900} className="max-w-[90vw] sm:max-w-none" />
      </div>
    </div>);

}

export default memo(MarsBackdrop);