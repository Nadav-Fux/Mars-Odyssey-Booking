import { memo } from 'react';
import { useBatterySaver } from '@/hooks/useBatterySaver';
import marsTexture from '@/assets/generated/mars-texture.webp';

/**
 * MiniMars
 *
 * A small, proportional rotating Mars sphere for inline use.
 * Stronger 3D lighting overlays than RealisticMars to compensate
 * for the small size — ensures no washed-out / white areas.
 */

interface MiniMarsProps {
  size?: number;
  className?: string;
}

const miniCSS = `
@keyframes mini-mars-rotate {
  from { background-position-x: 0; }
  to   { background-position-x: -300%; }
}
.battery-saver .mini-mars-surface {
  animation-play-state: paused !important;
}
`;

function MiniMars({ size = 80, className = '' }: MiniMarsProps) {
  const { isSaving } = useBatterySaver();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: miniCSS }} />
      <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Small rotating Mars">

        {/* Soft outer glow */}
        {!isSaving &&
        <div
        className="absolute inset-[-20%] rounded-full pointer-events-none"
        style={{
          background:
          'radial-gradient(circle, rgba(255,69,0,0.08) 30%, transparent 65%)',
          filter: 'blur(4px)'
        }} />

        }

        {/* Globe */}
        <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ boxShadow: '0 0 15px rgba(255,69,0,0.08)' }}>

          {/* Texture — slightly darkened with brightness filter */}
          <div
          className="mini-mars-surface absolute inset-0"
          style={{
            backgroundImage: `url(${marsTexture})`,
            backgroundSize: '300% 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '0 center',
            animation: isSaving ? 'none' : 'mini-mars-rotate 40s linear infinite',
            filter: 'brightness(0.75) saturate(1.2)'
          }} />


          {/* Terminator shadow — stronger for small size */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'linear-gradient(105deg, rgba(0,0,0,0.15) 0%, transparent 15%, transparent 35%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.6) 58%, rgba(0,0,0,0.92) 75%)'
          }} />


          {/* Specular highlight — very subtle, warm tint only */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'radial-gradient(ellipse 35% 30% at 30% 30%, rgba(255,180,140,0.06) 0%, transparent 60%)'
          }} />


          {/* Limb darkening — aggressive */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'radial-gradient(circle at 40% 45%, transparent 28%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.95) 85%)'
          }} />


          {/* Atmosphere rim — warm orange at edge */}
          <div
          className="absolute inset-0"
          style={{
            background:
            'radial-gradient(circle at 40% 45%, transparent 45%, rgba(255,60,10,0.06) 60%, rgba(200,40,0,0.08) 75%, rgba(100,20,0,0.04) 100%)'
          }} />

        </div>

        {/* Edge shadow */}
        <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset -3px -2px 10px rgba(0,0,0,0.5)'
        }} />

      </div>
    </>);

}

export default memo(MiniMars);