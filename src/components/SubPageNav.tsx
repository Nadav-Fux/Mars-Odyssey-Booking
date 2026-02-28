import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Rocket, Ship, Users, ClipboardList, Globe, Menu, X, Crosshair } from 'lucide-react';
import GlitchText from '@/components/GlitchText';
import { EXPO_OUT } from '@/lib/easing';

const NAV_LINKS = [
{ path: '/', icon: Rocket, label: 'Home' },
{ path: '/ship', icon: Ship, label: 'The Ship' },
{ path: '/crew', icon: Users, label: 'The Crew' },
{ path: '/mission', icon: ClipboardList, label: 'Mission Info' },
{ path: '/explore', icon: Globe, label: 'Explore Mars' },
{ path: '/simulate', icon: Crosshair, label: 'Simulator' }];


export default function SubPageNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EXPO_OUT }}
        className="fixed top-0 left-0 right-0 z-50 hidden lg:block">

        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Back home */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group">

              <div className="w-10 h-10 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/[0.06] transition-all">
                <Rocket className="w-5 h-5 text-primary -rotate-45" />
              </div>
              <span className="font-display text-sm font-bold text-white tracking-[0.15em]">
                ARES<span className="text-primary">-X</span>
              </span>
            </Link>

            <div className="h-6 w-px bg-white/[0.06]" />

            {/* Nav links */}
            <div className="flex items-center gap-1">
              {NAV_LINKS.filter((l) => l.path !== '/').map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display font-medium tracking-wider transition-all ${
                    isActive ?
                    'bg-primary/10 text-primary border border-primary/20' :
                    'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'}`
                    }>

                    <Icon className="w-3.5 h-3.5" />
                    {link.label.toUpperCase()}
                  </Link>);

              })}
            </div>
          </div>

          {/* Back to home CTA */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white/30 text-xs font-display tracking-wider hover:text-primary transition-colors">

            <ArrowLeft className="w-3.5 h-3.5" />
            BACK TO HOME
          </Link>
        </div>

        {/* Bottom border glow */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl -z-10" />
      </motion.nav>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-2xl border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary -rotate-45" />
            <span className="font-display text-sm font-bold text-white tracking-wider">
              ARES<span className="text-primary">-X</span>
            </span>
          </Link>
          <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-white/70">

            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen &&
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-black/80 backdrop-blur-2xl border-b border-white/[0.06] px-4 pb-4 pt-2">

              {NAV_LINKS.map((link, i) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>

                    <Link
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive ?
                    'bg-primary/10 text-primary' :
                    'text-white/50 hover:text-white/80'}`
                    }>

                      <Icon className="w-4 h-4" />
                      <GlitchText text={link.label} className="text-sm font-medium" />
                    </Link>
                  </motion.div>);

            })}
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </>);

}