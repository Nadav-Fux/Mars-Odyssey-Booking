import { memo } from 'react';

/*
 * NebulaBackground — Pure CSS cosmic gas shader
 *
 * Multiple layered radial / conic gradients that pulse, drift and breathe
 * at different rates to simulate deep-space nebulae.
 *
 * Performance:
 *  • Only transform + opacity are animated (GPU-composited, zero layout)
 *  • will-change on animated layers
 *  • Reduced motion: respects prefers-reduced-motion
 */

interface CloudConfig {
  id: string;
  /** CSS gradient value */
  gradient: string;
  /** Position & size */
  top: string;
  left: string;
  width: string;
  height: string;
  /** Which keyframe set */
  animation: string;
  /** Extra rotation offset */
  rotate?: string;
  /** Blend mode */
  blend?: string;
}

const clouds: CloudConfig[] = [
// ---- Large primary nebula (Mars red / deep magenta) ----
{
  id: 'nebula-core',
  gradient: `radial-gradient(
      ellipse 70% 55% at 45% 50%,
      rgba(255,69,0,0.07) 0%,
      rgba(180,30,60,0.05) 25%,
      rgba(100,10,80,0.03) 50%,
      transparent 75%
    )`,
  top: '5%',
  left: '15%',
  width: '70vw',
  height: '60vh',
  animation: 'nebula-pulse-1 28s ease-in-out infinite'
},
// ---- Teal / cyan wisp (top-right) ----
{
  id: 'nebula-teal',
  gradient: `radial-gradient(
      ellipse 60% 80% at 60% 40%,
      rgba(74,184,196,0.04) 0%,
      rgba(40,100,160,0.025) 35%,
      transparent 70%
    )`,
  top: '-5%',
  left: '45%',
  width: '55vw',
  height: '50vh',
  animation: 'nebula-pulse-2 34s ease-in-out infinite',
  rotate: '15deg'
},
// ---- Deep purple sheet (mid-left) ----
{
  id: 'nebula-purple',
  gradient: `radial-gradient(
      ellipse 80% 50% at 30% 55%,
      rgba(88,28,135,0.05) 0%,
      rgba(60,20,100,0.03) 40%,
      transparent 70%
    )`,
  top: '30%',
  left: '-10%',
  width: '65vw',
  height: '55vh',
  animation: 'nebula-pulse-3 38s ease-in-out infinite',
  rotate: '-8deg'
},
// ---- Hot ember glow (center-bottom) ----
{
  id: 'nebula-ember',
  gradient: `radial-gradient(
      circle at 50% 50%,
      rgba(255,100,50,0.045) 0%,
      rgba(200,40,0,0.025) 30%,
      rgba(120,20,40,0.015) 55%,
      transparent 75%
    )`,
  top: '55%',
  left: '25%',
  width: '50vw',
  height: '50vh',
  animation: 'nebula-pulse-4 25s ease-in-out infinite'
},
// ---- Conic swirl overlay (subtle rotation) ----
{
  id: 'nebula-swirl',
  gradient: `conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgba(255,69,0,0.015) 60deg,
      transparent 120deg,
      rgba(74,184,196,0.012) 200deg,
      transparent 280deg,
      rgba(88,28,135,0.01) 340deg,
      transparent 360deg
    )`,
  top: '10%',
  left: '10%',
  width: '80vw',
  height: '80vh',
  animation: 'nebula-rotate 120s linear infinite',
  blend: 'screen'
},
// ---- Faint blue filament (right edge) ----
{
  id: 'nebula-filament',
  gradient: `radial-gradient(
      ellipse 40% 90% at 80% 50%,
      rgba(60,120,220,0.03) 0%,
      rgba(40,60,140,0.015) 45%,
      transparent 75%
    )`,
  top: '15%',
  left: '50%',
  width: '50vw',
  height: '70vh',
  animation: 'nebula-pulse-2 42s ease-in-out infinite reverse',
  rotate: '5deg'
}];


// CSS keyframes injected once — only transform + opacity for GPU compositing
const keyframesCSS = `
@keyframes nebula-pulse-1 {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1) translate(0, 0);
  }
  25% {
    opacity: 1;
    transform: scale(1.08) translate(1.5%, -1%);
  }
  50% {
    opacity: 0.75;
    transform: scale(1.02) translate(-0.5%, 1.5%);
  }
  75% {
    opacity: 0.95;
    transform: scale(1.06) translate(-1%, -0.5%);
  }
}

@keyframes nebula-pulse-2 {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1) translate(0, 0);
  }
  30% {
    opacity: 0.9;
    transform: scale(1.12) translate(-2%, 1%);
  }
  60% {
    opacity: 0.65;
    transform: scale(0.97) translate(1%, -1.5%);
  }
  85% {
    opacity: 0.85;
    transform: scale(1.05) translate(0.5%, 0.8%);
  }
}

@keyframes nebula-pulse-3 {
  0%, 100% {
    opacity: 0.55;
    transform: scale(1) translate(0, 0) rotate(-8deg);
  }
  35% {
    opacity: 0.9;
    transform: scale(1.1) translate(2%, 1.5%) rotate(-6deg);
  }
  65% {
    opacity: 0.7;
    transform: scale(1.04) translate(-1.5%, -0.5%) rotate(-10deg);
  }
}

@keyframes nebula-pulse-4 {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1) translate(0, 0);
  }
  20% {
    opacity: 0.85;
    transform: scale(1.07) translate(-1%, 2%);
  }
  45% {
    opacity: 0.6;
    transform: scale(0.95) translate(1.5%, -1%);
  }
  70% {
    opacity: 1;
    transform: scale(1.1) translate(-0.5%, 0.5%);
  }
}

@keyframes nebula-rotate {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-nebula-cloud] {
    animation: none !important;
  }
}

/* Battery saver: freeze animations, reduce blur for GPU savings */
.battery-saver [data-nebula-cloud] {
  animation: none !important;
  filter: blur(20px) !important;
  opacity: 0.4 !important;
  will-change: auto !important;
}
`;

function NebulaBackground() {
  return (
    <div
    className="fixed inset-0 pointer-events-none overflow-hidden"
    style={{ zIndex: 0 }}
    aria-hidden="true">

      {/* Inject keyframes */}
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      {clouds.map((c) =>
      <div
      key={c.id}
      data-nebula-cloud
      style={{
        position: 'absolute',
        top: c.top,
        left: c.left,
        width: c.width,
        height: c.height,
        backgroundImage: c.gradient,
        animation: c.animation,
        willChange: 'transform, opacity',
        transform: c.rotate ? `rotate(${c.rotate})` : undefined,
        mixBlendMode: c.blend as React.CSSProperties['mixBlendMode'] || 'normal',
        // Large blur to diffuse the gradients into soft gas clouds
        filter: 'blur(40px)'
      }} />

      )}

      {/* Extra large ambient haze — very faint overall tint */}
      <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
            radial-gradient(ellipse 120% 80% at 30% 40%, rgba(255,69,0,0.012) 0%, transparent 60%),
            radial-gradient(ellipse 100% 100% at 70% 70%, rgba(88,28,135,0.01) 0%, transparent 50%)
          `,
        animation: 'nebula-pulse-1 50s ease-in-out infinite reverse',
        willChange: 'opacity'
      }} />

    </div>);

}

export default memo(NebulaBackground);