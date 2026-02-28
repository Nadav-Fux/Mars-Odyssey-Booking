import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useSatelliteMode } from '@/hooks/useSatelliteMode';

/**
 * SatelliteOverlay
 *
 * When satellite mode is active this renders:
 *  1. Global CSS overrides that swap glassmorphism → high-contrast dark panels
 *  2. A coordinate grid overlay
 *  3. HUD corner readouts
 *  4. Scan-line and vignette effects
 */

// ─── Satellite-mode global CSS overrides ────────────────────────
// Targets elements inside .satellite-mode to swap the visual language
// from artistic glassmorphism → tactical satellite imagery.
const overrideCSS = `
/* ══ BASE ══ */
.satellite-mode {
  --sat-panel: rgba(6,8,14,0.92);
  --sat-border: rgba(0,220,255,0.12);
  --sat-accent: #00dcff;
  --sat-accent-dim: rgba(0,220,255,0.35);
  --sat-text: #c8f0ff;
  --sat-text-dim: rgba(160,210,230,0.4);
  --sat-grid: rgba(0,200,240,0.04);
}

/* ══ GLASSMORPHISM → OPAQUE DARK PANELS ══ */
.satellite-mode [class*="backdrop-blur"] {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

/* Glass card backgrounds → solid dark */
.satellite-mode .absolute.inset-0[class*="bg-white"][class*="border"][class*="rounded"] {
  background: var(--sat-panel) !important;
  border-color: var(--sat-border) !important;
  box-shadow: inset 0 1px 0 rgba(0,220,255,0.06), 0 0 20px rgba(0,220,255,0.03) !important;
}

/* ══ TYPOGRAPHY ══ */
.satellite-mode .text-primary,
.satellite-mode .text-primary\/90 {
  color: var(--sat-accent) !important;
}
.satellite-mode [class*="text-white"][class*="/"] {
  filter: brightness(1.15) saturate(0.3);
}

/* Gradient text → solid cyan */
.satellite-mode .bg-clip-text {
  -webkit-text-fill-color: var(--sat-accent) !important;
  background: none !important;
}

/* ══ BORDERS ══ */
.satellite-mode [class*="border-white"] {
  border-color: var(--sat-border) !important;
}
.satellite-mode [class*="border-primary"] {
  border-color: var(--sat-accent-dim) !important;
}

/* ══ GLOWS / AMBIENT → suppressed ══ */
.satellite-mode [class*="blur-\\[120px\\]"],
.satellite-mode [class*="blur-\\[100px\\]"] {
  opacity: 0 !important;
}

/* ══ BUTTONS ══ */
.satellite-mode [class*="bg-gradient-to-r"][class*="from-primary"] {
  background: var(--sat-accent) !important;
  opacity: 0.9;
}
.satellite-mode button[class*="bg-white"] {
  background: rgba(0,220,255,0.06) !important;
  border-color: var(--sat-border) !important;
}

/* ══ NEBULA → hidden ══ */
.satellite-mode [data-nebula-cloud] {
  opacity: 0 !important;
  transition: opacity 0.8s ease;
}

/* ══ FONTS → monospace feel ══ */
.satellite-mode .font-display {
  letter-spacing: 0.08em;
}

/* ══ Primary color badge/overline ══ */
.satellite-mode [class*="bg-primary"] {
  background-color: rgba(0,220,255,0.08) !important;
  border-color: rgba(0,220,255,0.2) !important;
}

/* ══ Transition everything smoothly ══ */
.satellite-mode *,
.satellite-mode *::before,
.satellite-mode *::after {
  transition-property: background-color, border-color, color, opacity, box-shadow, filter;
  transition-duration: 0.6s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
`;

function SatelliteOverlay() {
  const { satellite } = useSatelliteMode();

  return (
    <>
      {/* Inject override CSS (always present, only targets .satellite-mode) */}
      <style dangerouslySetInnerHTML={{ __html: overrideCSS }} />

      <AnimatePresence>
        {satellite &&
        <>
            {/* ── Coordinate grid ── */}
            <motion.div
            className="fixed inset-0 pointer-events-none z-[2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
            aria-hidden="true">

              {/* Grid lines */}
              <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                    linear-gradient(rgba(0,220,255,0.035) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,220,255,0.035) 1px, transparent 1px)
                  `,
              backgroundSize: '80px 80px'
            }} />

              {/* Finer sub-grid */}
              <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                    linear-gradient(rgba(0,220,255,0.012) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,220,255,0.012) 1px, transparent 1px)
                  `,
              backgroundSize: '20px 20px'
            }} />

            </motion.div>

            {/* ── Dark vignette ── */}
            <motion.div
            className="fixed inset-0 pointer-events-none z-[2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EXPO_OUT }}
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
            }} />


            {/* ── Scan line ── */}
            <motion.div
            className="fixed inset-0 pointer-events-none z-[3] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EXPO_OUT }}>

              <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent 5%, rgba(0,220,255,0.12) 30%, rgba(0,220,255,0.2) 50%, rgba(0,220,255,0.12) 70%, transparent 95%)',
                boxShadow: '0 0 30px rgba(0,220,255,0.1)'
              }}
              animate={{ top: ['-2px', '100vh', '-2px'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />

            </motion.div>

            {/* ── CRT faint scanlines ── */}
            <motion.div
            className="fixed inset-0 pointer-events-none z-[2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.015 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,220,255,0.08) 3px, rgba(0,220,255,0.08) 4px)'
            }} />


            {/* ── HUD corner markers ── */}
            <motion.div
            className="fixed inset-0 pointer-events-none z-[4]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EXPO_OUT }}>

              {/* Top-left */}
              <div className="absolute top-4 left-4 lg:left-20">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M2 16 L2 2 L16 2" stroke="rgba(0,220,255,0.4)" strokeWidth="1" />
                </svg>
                <div className="mt-1 text-[8px] font-display tracking-[0.2em]" style={{ color: 'rgba(0,220,255,0.3)' }}>
                  ORBITAL VIEW
                </div>
              </div>
              {/* Top-right */}
              <div className="absolute top-4 right-4">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="ml-auto">
                  <path d="M46 16 L46 2 L32 2" stroke="rgba(0,220,255,0.4)" strokeWidth="1" />
                </svg>
                <div className="mt-1 text-[8px] font-display tracking-[0.2em] text-right" style={{ color: 'rgba(0,220,255,0.3)' }}>
                  SAT-7 FEED
                </div>
              </div>
              {/* Bottom-left */}
              <div className="absolute bottom-4 left-4 lg:left-20">
                <div className="mb-1 text-[8px] font-display tracking-[0.2em]" style={{ color: 'rgba(0,220,255,0.3)' }}>
                  4.6°N 137.4°E
                </div>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M2 32 L2 46 L16 46" stroke="rgba(0,220,255,0.4)" strokeWidth="1" />
                </svg>
              </div>
              {/* Bottom-right */}
              <div className="absolute bottom-4 right-4">
                <div className="mb-1 text-[8px] font-display tracking-[0.2em] text-right" style={{ color: 'rgba(0,220,255,0.3)' }}>
                  ALT 410km
                </div>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="ml-auto">
                  <path d="M46 32 L46 46 L32 46" stroke="rgba(0,220,255,0.4)" strokeWidth="1" />
                </svg>
              </div>

              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="16" stroke="rgba(0,220,255,0.08)" strokeWidth="0.5" />
                  <circle cx="32" cy="32" r="4" stroke="rgba(0,220,255,0.15)" strokeWidth="0.5" />
                  <line x1="32" y1="0" x2="32" y2="24" stroke="rgba(0,220,255,0.06)" strokeWidth="0.5" />
                  <line x1="32" y1="40" x2="32" y2="64" stroke="rgba(0,220,255,0.06)" strokeWidth="0.5" />
                  <line x1="0" y1="32" x2="24" y2="32" stroke="rgba(0,220,255,0.06)" strokeWidth="0.5" />
                  <line x1="40" y1="32" x2="64" y2="32" stroke="rgba(0,220,255,0.06)" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Side telemetry strip */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-4 hidden lg:block">
                {[
              { label: 'INCLINATION', value: '25.19°' },
              { label: 'GROUND SPEED', value: '7.66 km/s' },
              { label: 'RESOLUTION', value: '0.5m/px' },
              { label: 'BAND', value: 'VNIR+SWIR' },
              { label: 'LOCAL TIME', value: '14:32 MST' }].
              map((d) =>
              <div key={d.label} className="text-right">
                    <div className="text-[7px] font-display tracking-[0.15em]" style={{ color: 'rgba(0,220,255,0.2)' }}>
                      {d.label}
                    </div>
                    <div className="text-[10px] font-display font-bold" style={{ color: 'rgba(0,220,255,0.5)' }}>
                      {d.value}
                    </div>
                  </div>
              )}
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </>);

}

export default memo(SatelliteOverlay);