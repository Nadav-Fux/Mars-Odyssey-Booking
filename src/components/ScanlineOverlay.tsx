import { memo } from 'react';
import { motion } from 'framer-motion';
import { EXPO_IN_OUT } from '@/lib/easing';
import { useBatterySaver } from '@/hooks/useBatterySaver';

/**
 * Full-viewport CRT / monitor scanline overlay.
 *
 * Two layers:
 *   1. Static repeating 1 px horizontal lines (very low opacity).
 *   2. A single "refresh sweep" highlight that crawls top → bottom
 *      on an infinite loop, mimicking a CRT electron-gun refresh.
 *
 * pointer-events: none — completely non-interactive.
 * Battery saver: disables animated sweep, keeps minimal static lines.
 */
function ScanlineOverlay() {
  const { isSaving } = useBatterySaver();

  return (
    <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-[9999] select-none scanline-overlay">

      {/* ── Static scanlines ── */}
      <div
      className="absolute inset-0 mix-blend-multiply"
      style={{
        backgroundImage:
        'repeating-linear-gradient(to bottom, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)'
      }} />


      {/* ── Faint phosphor glow between lines (additive) ── */}
      {!isSaving &&
      <div
      className="absolute inset-0 mix-blend-screen"
      style={{
        backgroundImage:
        'repeating-linear-gradient(to bottom, transparent 0px, transparent 1px, rgba(255,255,255,0.012) 1px, rgba(255,255,255,0.012) 3px)'
      }} />

      }

      {/* ── CRT refresh sweep — skip in battery saver ── */}
      {!isSaving &&
      <motion.div
        className="absolute left-0 right-0 h-[120px]"
        style={{
          backgroundImage:
          'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.012) 30%, rgba(255,255,255,0.025) 50%, rgba(255,255,255,0.012) 70%, transparent 100%)'
        }}
        initial={{ top: '-120px' }}
        animate={{ top: '100vh' }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: EXPO_IN_OUT,
          repeatDelay: 1.5
        }} />

      }
    </div>);

}

export default memo(ScanlineOverlay);