import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { EXPO_OUT } from '@/lib/easing';
import { useState } from 'react';

export default function LocaleToggle() {
  const { locale, toggleLocale, isRTL } = useLocale();
  const [showLabel, setShowLabel] = useState(false);

  return (
    <div
    className={`fixed top-[56px] lg:top-5 z-[200] ${isRTL ? 'left-3 lg:left-6' : 'right-3 lg:right-5'}`}
    style={{ direction: 'ltr' }}>

      <motion.button
        onClick={toggleLocale}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onFocus={() => setShowLabel(true)}
        onBlur={() => setShowLabel(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.3, ease: EXPO_OUT }}
        className="
          group relative flex items-center gap-2
          h-10 rounded-full backdrop-blur-md border
          bg-white/[0.04] border-white/[0.08]
          text-white/50 hover:text-white/80
          transition-colors duration-300 overflow-hidden
          px-3
        "







        aria-label={locale === 'en' ? 'Switch to Hebrew' : 'Switch to English'}>

        <Globe className="w-4 h-4 shrink-0" />

        {/* Current locale label */}
        <AnimatePresence mode="wait">
          <motion.span
            key={locale}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.25, ease: EXPO_OUT }}
            className="text-[11px] font-display tracking-[0.15em] font-medium">

            {locale === 'en' ? 'EN' : 'עב'}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {showLabel &&
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.2, ease: EXPO_OUT }}
          className="absolute top-full mt-2 right-0 px-3 py-1.5 rounded-lg bg-secondary/95 backdrop-blur-md border border-white/[0.08] shadow-xl whitespace-nowrap"
          role="tooltip">

            <span className="text-[10px] font-display text-white/60 tracking-wider">
              {locale === 'en' ? 'עברית' : 'English'}
            </span>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}