import { useEffect, useRef, memo } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * LaunchShake
 *
 * Triggers a brief, violent screen shake when the user scrolls
 * past the Hero section — simulating a rocket launch rumble.
 *
 * Uses GSAP ScrollTrigger to detect the transition point,
 * then fires a one-shot shake animation on a wrapper element
 * that contains ALL page content.
 *
 * The shake only fires ONCE (first time scrolling past).
 * Scrolling back up and down again won't re-trigger.
 */

const SHAKE_CSS = `
@keyframes launch-rumble {
  0%   { transform: translate(0, 0)       rotate(0deg); }
  8%   { transform: translate(-3px, 2px)  rotate(-0.3deg); }
  16%  { transform: translate(4px, -1px)  rotate(0.4deg); }
  24%  { transform: translate(-2px, 3px)  rotate(-0.2deg); }
  32%  { transform: translate(5px, -2px)  rotate(0.5deg); }
  40%  { transform: translate(-4px, 1px)  rotate(-0.4deg); }
  48%  { transform: translate(3px, -3px)  rotate(0.3deg); }
  56%  { transform: translate(-5px, 2px)  rotate(-0.5deg); }
  64%  { transform: translate(4px, -1px)  rotate(0.4deg); }
  72%  { transform: translate(-2px, 3px)  rotate(-0.2deg); }
  80%  { transform: translate(3px, -2px)  rotate(0.3deg); }
  88%  { transform: translate(-1px, 1px)  rotate(-0.1deg); }
  94%  { transform: translate(1px, -1px)  rotate(0.1deg); }
  100% { transform: translate(0, 0)       rotate(0deg); }
}

.launch-shaking {
  animation: launch-rumble 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards;
}

/* Red flash overlay during shake */
@keyframes launch-flash {
  0%   { opacity: 0; }
  15%  { opacity: 0.06; }
  40%  { opacity: 0.03; }
  100% { opacity: 0; }
}

.launch-flash-active {
  animation: launch-flash 0.8s ease-out forwards;
}
`;

function LaunchShake() {
  const firedRef = useRef(false);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for ScrollTrigger to be available
    const ST = gsap.core.globals().ScrollTrigger;
    if (!ST) return;

    const trigger = ST.create({
      trigger: '#hero',
      start: 'bottom 20%', // when hero bottom reaches 20% from viewport top
      onEnter: () => {
        if (firedRef.current) return;
        firedRef.current = true;

        // Shake the body
        document.body.classList.add('launch-shaking');
        setTimeout(() => {
          document.body.classList.remove('launch-shaking');
        }, 650);

        // Flash
        if (flashRef.current) {
          flashRef.current.classList.add('launch-flash-active');
          setTimeout(() => {
            flashRef.current?.classList.remove('launch-flash-active');
          }, 850);
        }
      }
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHAKE_CSS }} />

      {/* Orange/red flash overlay */}
      <div
      ref={flashRef}
      className="fixed inset-0 z-[998] pointer-events-none"
      style={{
        background:
        'radial-gradient(ellipse at center bottom, rgba(255,69,0,0.15) 0%, rgba(255,30,0,0.05) 40%, transparent 70%)',
        opacity: 0
      }}
      aria-hidden="true" />

    </>);

}

export default memo(LaunchShake);