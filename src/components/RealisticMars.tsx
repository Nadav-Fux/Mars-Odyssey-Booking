import { memo, useState, useCallback } from 'react';
import { useBatterySaver } from '@/hooks/useBatterySaver';
import { useAchievements } from '@/hooks/useAchievements';
import marsTexture from '@/assets/generated/mars-texture.webp';

/**
 * RealisticMars
 *
 * A photorealistic rotating Mars globe built entirely with CSS.
 * 
 * EASTER EGG: Double-click the globe to toggle "Terraformed Mars"
 * — shifts the planet to a lush green/blue Earth-like world.
 */

interface RealisticMarsProps {
  /** Globe diameter in px */
  size?: number;
  className?: string;
}

/* ── Rotation keyframes injected once ── */
const rotationCSS = `
@keyframes mars-rotate {
  from { background-position-x: 0; }
  to   { background-position-x: -300%; }
}

.battery-saver .mars-surface {
  animation-play-state: paused !important;
}
`;

function RealisticMars({ size = 700, className = '' }: RealisticMarsProps) {
  const { isSaving } = useBatterySaver();
  const [terraformed, setTerraformed] = useState(false);
  const { unlock } = useAchievements();

  const handleDoubleClick = useCallback(() => {
    setTerraformed((v) => {
      if (!v) unlock('terraformed');
      return !v;
    });
  }, [unlock]);

  const globeSize = size;

  // Terraformed color overrides
  const atmoColor = terraformed ? 'rgba(60,140,255,0.12)' : 'rgba(255,69,0,0.12)';
  const atmoHaze = terraformed ? 'rgba(60,140,255,0.06)' : 'rgba(255,69,0,0.06)';
  const rimColor = terraformed ? 'rgba(60,160,255,0.08)' : 'rgba(255,120,60,0.08)';
  const rimShadow = terraformed ?
  'inset 0 0 40px rgba(60,140,255,0.06), inset -20px -10px 60px rgba(0,0,0,0.3)' :
  'inset 0 0 40px rgba(255,69,0,0.06), inset -20px -10px 60px rgba(0,0,0,0.3)';
  const shadowColor = terraformed ? 'rgba(60,140,255,0.08)' : 'rgba(255,69,0,0.08)';
  const outerGlow = terraformed ? 'rgba(60,140,255,0.03)' : 'rgba(255,69,0,0.03)';
  const outerGlow2 = terraformed ? 'rgba(60,140,255,0.06)' : 'rgba(255,69,0,0.06)';
  const atmoInner = terraformed ?
  'radial-gradient(circle at 42% 48%, transparent 45%, rgba(40,120,255,0.04) 58%, rgba(30,100,255,0.1) 72%, rgba(20,60,200,0.07) 85%, rgba(10,30,120,0.04) 100%)' :
  'radial-gradient(circle at 42% 48%, transparent 45%, rgba(255,80,20,0.04) 58%, rgba(255,60,10,0.1) 72%, rgba(200,40,0,0.07) 85%, rgba(120,20,0,0.04) 100%)';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: rotationCSS }} />

      <div
      className={`relative ${className}`}
      style={{
        width: globeSize,
        height: globeSize,
        cursor: 'pointer'
      }}
      role="img"
      aria-label={terraformed ? 'Terraformed Mars globe with oceans and vegetation' : 'Rotating Mars globe with realistic surface textures'}
      onDoubleClick={handleDoubleClick}>


        {/* ═══ ATMOSPHERIC GLOW — outer rim ═══ */}
        {!isSaving &&
        <div
        className="absolute inset-[-15%] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background:
          `radial-gradient(circle, transparent 38%, ${terraformed ? 'rgba(60,140,255,0.08)' : 'rgba(255,100,40,0.08)'} 48%, ${atmoColor} 52%, ${atmoHaze} 58%, transparent 68%)`,
          filter: 'blur(8px)'
        }} />
        }

        {/* ═══ OUTER HAZE — soft distant glow ═══ */}
        {!isSaving &&
        <div
        className="absolute inset-[-30%] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background:
          `radial-gradient(circle, transparent 30%, ${outerGlow} 45%, ${outerGlow2} 50%, transparent 65%)`,
          filter: 'blur(30px)'
        }} />
        }

        {/* ═══ THE GLOBE — clipped sphere with scrolling texture ═══ */}
        <div
        className="absolute inset-0 rounded-full overflow-hidden transition-shadow duration-1000"
        style={{ boxShadow: `0 0 80px ${atmoColor}` }}>

          {/* Texture layer — scrolls for rotation */}
          <div
          className="mars-surface absolute inset-0 transition-[filter] duration-[2000ms]"
          style={{
            backgroundImage: `url(${marsTexture})`,
            backgroundSize: '300% 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '0 center',
            animation: isSaving ? 'none' : 'mars-rotate 80s linear infinite',
            willChange: 'background-position',
            filter: terraformed ? 'hue-rotate(95deg) saturate(1.6) brightness(1.15)' : 'none'
          }} />

          {/* ── 3D lighting: Terminator shadow (right side in shadow) ── */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'linear-gradient(100deg, rgba(0,0,0,0.1) 5%, transparent 18%, transparent 38%, rgba(0,0,0,0.12) 48%, rgba(0,0,0,0.45) 58%, rgba(0,0,0,0.78) 70%, rgba(0,0,0,0.95) 82%)'
          }} />

          {/* ── 3D lighting: Specular highlight (upper-left) ── */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'radial-gradient(ellipse 50% 45% at 32% 28%, rgba(255,220,180,0.15) 0%, rgba(255,200,150,0.06) 40%, transparent 70%)'
          }} />

          {/* ── 3D lighting: Limb darkening (edge of sphere) ── */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'radial-gradient(circle at 42% 48%, transparent 38%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.85) 82%, rgba(0,0,0,0.95) 100%)'
          }} />

          {/* ── Atmosphere inner rim ── */}
          <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: atmoInner
          }} />

          {/* ── Terraformed: ocean shimmer ── */}
          {terraformed && !isSaving &&
          <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 38% 45%, rgba(60,160,255,0.06) 0%, transparent 60%)',
            animationDuration: '4s'
          }} />

          }
        </div>

        {/* ═══ POST-PROCESSING: Fresnel edge highlight ═══ */}
        {!isSaving &&
        <div
        className="absolute inset-0 rounded-full pointer-events-none transition-all duration-1000"
        style={{
          border: `1px solid ${rimColor}`,
          boxShadow: rimShadow
        }} />
        }

        {/* ═══ SHADOW beneath globe ═══ */}
        <div
        className="absolute pointer-events-none transition-all duration-1000"
        style={{
          width: '80%',
          height: '20px',
          bottom: '-10%',
          left: '10%',
          borderRadius: '50%',
          background:
          `radial-gradient(ellipse, ${shadowColor} 0%, transparent 70%)`,
          filter: 'blur(15px)'
        }} />

        {/* ═══ TERRAFORMED BADGE ═══ */}
        {terraformed &&
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse">
              <span className="text-[8px] font-display tracking-[0.2em] text-emerald-400/70">TERRAFORMED · YEAR 2340</span>
            </div>
          </div>
        }

      </div>
    </>);

}

export default memo(RealisticMars);