import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import PageShell from '@/layouts/PageShell';
import LazySection from '@/components/LazySection';
import ParallaxQuote from '@/components/ParallaxQuote';

const WindowToMars = lazy(() => import('@/components/WindowToMars'));
const FleetSection = lazy(() => import('@/components/FleetSection'));
const TechSpecsSection = lazy(() => import('@/components/TechSpecsSection'));

const Blank = <div className="flex items-center justify-center min-h-[200px]"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

export default function ShipPage() {
  return (
    <PageShell>
      {/* Page header */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EXPO_OUT }}>

          <span className="inline-block text-[10px] font-display font-bold tracking-[0.3em] text-primary/60 uppercase mb-3">
            ARES-7 SPACECRAFT
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
              The Ship
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/30 max-w-lg mx-auto leading-relaxed">
            Nuclear thermal propulsion. Magnetic radiation shielding. 
            360° observation dome. Every system engineered for the 7-month journey to Mars.
          </p>
        </motion.div>
      </section>

      {/* Fleet / Ship showcase */}
      <LazySection id="fleet" minHeight="80vh">
        <Suspense fallback={Blank}>
          <FleetSection />
        </Suspense>
      </LazySection>

      <ParallaxQuote
        quote="The Earth is the cradle of humanity, but mankind cannot stay in the cradle forever."
        author="KONSTANTIN TSIOLKOVSKY"
        role="FATHER OF ASTRONAUTICS · 1911"
        accentColor="#4ab8c4" />


      {/* Window to Mars */}
      <LazySection id="window" minHeight="60vh">
        <Suspense fallback={Blank}>
          <WindowToMars />
        </Suspense>
      </LazySection>

      {/* Tech Specs + Blueprint */}
      <LazySection id="techspecs" minHeight="70vh">
        <Suspense fallback={Blank}>
          <TechSpecsSection />
        </Suspense>
      </LazySection>
    </PageShell>);

}