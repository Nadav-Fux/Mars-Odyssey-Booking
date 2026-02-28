import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import PageShell from '@/layouts/PageShell';
import { Link } from 'react-router';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';

const SimulatorExperience = lazy(() => import('@/components/simulator/SimulatorExperience'));

export default function SimulatorPage() {
  return (
    <PageShell>
      {/* Intro section */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto lg:pl-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EXPO_OUT }}
            className="flex items-center gap-3 mb-6">

            <Link
              to="/"
              className="flex items-center gap-2 text-[10px] font-display tracking-[0.2em] text-white/50 hover:text-white/50 transition-colors">

              <ArrowLeft className="w-3 h-3" />
              MISSION CONTROL
            </Link>
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EXPO_OUT }}
            className="inline-block px-4 py-1.5 rounded-full bg-red-500/[0.08] border border-red-500/20 text-[11px] sm:text-xs font-display tracking-[0.25em] text-red-400/80 mb-5">

            ⚠ SIMULATOR
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EXPO_OUT }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-5">

            MARS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              LANDING
            </span>
            <br />
            <span className="text-white/60">SIMULATOR</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EXPO_OUT }}
            className="text-white/30 text-sm sm:text-base max-w-lg leading-relaxed mb-8">

            Experience the Entry, Descent, and Landing sequence from orbit to surface.
            Scroll through 6 phases of the most dangerous 7 minutes in space exploration.
          </motion.p>

          {/* Briefing stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EXPO_OUT }}
            className="flex flex-wrap gap-4 mb-8">

            {[
            { label: 'DURATION', value: '7 MIN', color: '#FF4500' },
            { label: 'ENTRY SPEED', value: 'MACH 25', color: '#ff6b35' },
            { label: 'PEAK G-FORCE', value: '12G', color: '#ef4444' },
            { label: 'HEAT SHIELD', value: '2,100°C', color: '#eab308' }].
            map((stat) =>
            <div
            key={stat.label}
            className="flex flex-col gap-0.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">

                <span className="text-[7px] font-display tracking-[0.2em] text-white/50">{stat.label}</span>
                <span className="text-sm font-display font-bold" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            )}
          </motion.div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EXPO_OUT }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/15 max-w-lg mb-8">

            <AlertTriangle className="w-4 h-4 text-yellow-400/60 shrink-0" />
            <p className="text-[10px] sm:text-xs text-yellow-400/40 font-display leading-relaxed">
              This simulation uses scroll-driven effects. Best experienced on desktop.
              Scroll slowly for maximum immersion.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EXPO_OUT }}
            className="flex items-center gap-2 text-[10px] font-display tracking-[0.2em] text-white/50 animate-pulse">

            <Play className="w-3 h-3" />
            SCROLL DOWN TO BEGIN DESCENT SEQUENCE
          </motion.div>
        </div>
      </section>

      {/* The Simulator */}
      <Suspense
        fallback={
        <div className="h-screen flex items-center justify-center">
            <div className="text-[10px] font-display tracking-[0.3em] text-white/50 animate-pulse">
              LOADING SIMULATOR...
            </div>
          </div>
        }>

        <SimulatorExperience />
      </Suspense>

      {/* Post-landing section */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            YOU MADE IT
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8">
            Only {(Math.random() * 500 + 2300).toFixed(0)} people have experienced this descent.
            Ready to make it real?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/15 border border-primary/25 text-primary font-display text-sm tracking-wider hover:bg-primary/25 transition-all">

              BOOK YOUR FLIGHT
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 font-display text-sm tracking-wider hover:text-white/60 hover:bg-white/[0.08] transition-all">

              EXPLORE MARS
            </Link>
          </div>
        </div>
      </section>
    </PageShell>);

}