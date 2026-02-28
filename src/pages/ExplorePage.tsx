import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import PageShell from '@/layouts/PageShell';
import LazySection from '@/components/LazySection';
import { Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const MarsExplorerHero = lazy(() => import('@/components/MarsExplorerHero'));
const LandingZonesGrid = lazy(() => import('@/components/LandingZonesGrid'));
const MarsPanorama = lazy(() => import('@/components/MarsPanorama'));
const GeologicalScale = lazy(() => import('@/components/GeologicalScale'));

const Blank = <div className="flex items-center justify-center min-h-[200px]"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

/* ── Section divider ── */
function SectionDivider({ label }: {label: string;}) {
  return (
    <div className="relative z-10 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto lg:pl-10 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <span className="text-[8px] font-display tracking-[0.3em] text-white/10 shrink-0">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    </div>);

}

export default function ExplorePage() {
  return (
    <PageShell>
      {/* Page header */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto lg:pl-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EXPO_OUT }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">

            SURFACE OPERATIONS
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EXPO_OUT }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5">

            EXPLORE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">MARS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EXPO_OUT }}
            className="text-white/30 text-sm sm:text-base max-w-lg leading-relaxed">

            Navigate the Red Planet's most spectacular sites. From the tallest volcano in the solar system to ancient riverbeds hiding signs of life — your expedition starts here.
          </motion.p>
        </div>
      </section>

      {/* Interactive Mars Globe */}
      <Suspense fallback={Blank}>
        <MarsExplorerHero />
      </Suspense>

      <SectionDivider label="LANDING ZONES" />

      {/* Landing zones deep-dive */}
      <LazySection id="zones" minHeight="80vh">
        <Suspense fallback={Blank}>
          <LandingZonesGrid />
        </Suspense>
      </LazySection>

      <SectionDivider label="SURFACE IMAGERY" />

      {/* Surface panorama viewer */}
      <LazySection id="panorama" minHeight="80vh">
        <Suspense fallback={Blank}>
          <MarsPanorama />
        </Suspense>
      </LazySection>

      <SectionDivider label="GEOLOGICAL DATA" />

      {/* Geological scale comparisons */}
      <LazySection id="geology" minHeight="70vh">
        <Suspense fallback={Blank}>
          <GeologicalScale />
        </Suspense>
      </LazySection>

      {/* Closing CTA */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            READY TO LAUNCH?
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
            The Red Planet awaits. Return to mission control to begin your journey.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/15 border border-primary/25 text-primary font-display text-sm tracking-wider hover:bg-primary/25 transition-all duration-300 group">

            MISSION CONTROL
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </PageShell>);

}