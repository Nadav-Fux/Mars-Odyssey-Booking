import { memo } from 'react';

/**
 * GlitchText
 *
 * Wraps text with CSS-only glitch-on-hover using ::before / ::after
 * pseudo-elements. Each pseudo copies the text via `attr(data-text)`,
 * applies a colour-channel shift (cyan + red), and jitters on a
 * 0.2 s keyframe loop.
 *
 * Usage:
 *   <GlitchText text="Home" className="text-sm" />
 */

const glitchCSS = `
/* ========================
   GLITCH-ON-HOVER
   0.2 s jitter · RGB split
   ======================== */

@keyframes glitch-jitter-1 {
  0%   { transform: translate(0);            clip-path: inset(15% 0 60% 0); }
  10%  { transform: translate(-2px, 1px);    clip-path: inset(72% 0 5%  0); }
  20%  { transform: translate(2px, -1px);    clip-path: inset(8%  0 55% 0); }
  30%  { transform: translate(-1px, 2px);    clip-path: inset(42% 0 28% 0); }
  40%  { transform: translate(1px, -2px);    clip-path: inset(68% 0 12% 0); }
  50%  { transform: translate(-2px, 0);      clip-path: inset(20% 0 48% 0); }
  60%  { transform: translate(2px, 1px);     clip-path: inset(55% 0 18% 0); }
  70%  { transform: translate(-1px, -1px);   clip-path: inset(5%  0 70% 0); }
  80%  { transform: translate(1px, 0);       clip-path: inset(38% 0 35% 0); }
  90%  { transform: translate(-2px, -1px);   clip-path: inset(62% 0 10% 0); }
  100% { transform: translate(0);            clip-path: inset(15% 0 60% 0); }
}

@keyframes glitch-jitter-2 {
  0%   { transform: translate(0);            clip-path: inset(50% 0 20% 0); }
  10%  { transform: translate(2px, -1px);    clip-path: inset(10% 0 65% 0); }
  20%  { transform: translate(-2px, 1px);    clip-path: inset(80% 0 2%  0); }
  30%  { transform: translate(1px, 2px);     clip-path: inset(25% 0 50% 0); }
  40%  { transform: translate(-1px, -2px);   clip-path: inset(60% 0 15% 0); }
  50%  { transform: translate(2px, 0);       clip-path: inset(35% 0 40% 0); }
  60%  { transform: translate(-2px, -1px);   clip-path: inset(70% 0 8%  0); }
  70%  { transform: translate(1px, 1px);     clip-path: inset(45% 0 30% 0); }
  80%  { transform: translate(-1px, 0);      clip-path: inset(12% 0 58% 0); }
  90%  { transform: translate(2px, 1px);     clip-path: inset(55% 0 22% 0); }
  100% { transform: translate(0);            clip-path: inset(50% 0 20% 0); }
}

@keyframes glitch-icon-shake {
  0%, 100% { transform: translate(0); }
  20%  { transform: translate(-1.5px, 0.5px); }
  40%  { transform: translate(1.5px, -0.5px); }
  60%  { transform: translate(-1px, -0.5px); }
  80%  { transform: translate(1px, 0.5px); }
}

@keyframes glitch-flash {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.06; }
}

.glitch-text {
  position: relative;
  display: inline-block;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  transition: opacity 0.08s;
}

.glitch-text::before {
  color: #00e5ff;
  text-shadow: 0 0 4px rgba(0,229,255,0.4);
}

.glitch-text::after {
  color: #ff2040;
  text-shadow: 0 0 4px rgba(255,32,64,0.4);
}

.glitch-text:hover::before {
  opacity: 0.75;
  animation: glitch-jitter-1 0.2s steps(2, jump-none) infinite;
}

.glitch-text:hover::after {
  opacity: 0.65;
  animation: glitch-jitter-2 0.2s steps(2, jump-none) infinite;
}

/* Subtle white flash on the real text */
.glitch-text:hover {
  text-shadow:
    0 0 2px rgba(255,255,255,0.15),
    0 0 8px rgba(255,69,0,0.1);
}

/* Icon jitter helper: add .glitch-icon to any parent */
.glitch-icon:hover svg,
.glitch-icon:hover .lucide {
  animation: glitch-icon-shake 0.2s steps(3, jump-none) infinite;
}

/* Full-width flash bar (optional, add inside hover containers) */
.glitch-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,69,0,0.06), transparent);
  opacity: 0;
  pointer-events: none;
}
.glitch-bar:hover::after {
  animation: glitch-flash 0.2s steps(1) infinite;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .glitch-text::before,
  .glitch-text::after,
  .glitch-icon:hover svg {
    animation: none !important;
    opacity: 0 !important;
  }
}
`;

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div';
}

function GlitchText({ text, className = '', as: Tag = 'span' }: GlitchTextProps) {
  return (
    <>
      {/* Inject keyframes (de-duped by browser — same id is fine) */}
      <style dangerouslySetInnerHTML={{ __html: glitchCSS }} />
      <Tag className={`glitch-text ${className}`} data-text={text}>
        {text}
      </Tag>
    </>);

}

export default memo(GlitchText);