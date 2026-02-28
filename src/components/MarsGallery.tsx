import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, Camera, MapPin, Calendar, Layers } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';
import { useAchievements } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';

/* ================================================================
   MARS GALLERY

   Cinematic carousel showcasing real Mars surface imagery.
   Features:
     • Full-bleed lightbox with keyboard nav
     • Smooth crossfade transitions
     • Auto-play with pause on hover
     • Image metadata overlay (location, date, camera)
     • Thumbnail strip at bottom
     • Touch/swipe support
     • Unlocks "Stargazer" achievement on night image view
   ================================================================ */

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  location: string;
  date: string;
  camera: string;
  description: string;
  gradient: string; // overlay gradient for text legibility
}

const IMAGES: GalleryImage[] = [
{
  id: 'olympus',
  src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=1400&q=85&auto=format',
  title: 'Olympus Mons Summit',
  location: '18.65°N, 226.2°E',
  date: 'SOL 847',
  camera: 'HiRISE Orbital',
  description: 'The tallest volcano in the solar system, rising 21.9 km above the datum level.',
  gradient: 'from-black/80 via-black/40 to-transparent'
},
{
  id: 'valles',
  src: 'https://images.unsplash.com/photo-1630694093867-4b947d812bf0?w=1400&q=85&auto=format',
  title: 'Valles Marineris',
  location: '14°S, 296°E',
  date: 'SOL 1203',
  camera: 'CTX Wide-angle',
  description: 'A system of canyons stretching 4,000 km — the Grand Canyon of Mars.',
  gradient: 'from-black/80 via-black/40 to-transparent'
},
{
  id: 'polar',
  src: 'https://images.unsplash.com/photo-1545156521-77bd85671d30?w=1400&q=85&auto=format',
  title: 'North Polar Ice Cap',
  location: '90°N',
  date: 'SOL 2031',
  camera: 'THEMIS IR',
  description: 'Layers of water ice and dust at the Martian north pole, 3 km thick.',
  gradient: 'from-black/80 via-black/40 to-transparent'
},
{
  id: 'gale',
  src: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1400&q=85&auto=format',
  title: 'Gale Crater Floor',
  location: '5.4°S, 137.8°E',
  date: 'SOL 3149',
  camera: 'Mastcam-Z',
  description: 'Ancient lakebed sediments photographed by Curiosity at Mount Sharp.',
  gradient: 'from-black/80 via-black/40 to-transparent'
},
{
  id: 'dust-devil',
  src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=85&auto=format',
  title: 'Dust Devil Column',
  location: '23°S, 207°E',
  date: 'SOL 4502',
  camera: 'NavCam Stereo',
  description: 'A 700-meter-tall dust devil tracked across Amazonis Planitia.',
  gradient: 'from-black/80 via-black/40 to-transparent'
},
{
  id: 'sunset',
  src: 'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=1400&q=85&auto=format',
  title: 'Martian Sunset',
  location: 'Jezero Crater Rim',
  date: 'SOL 5001',
  camera: 'SuperCam RMI',
  description: 'The blue sunset of Mars — scattered light through fine Martian dust.',
  gradient: 'from-black/80 via-black/40 to-transparent'
}];


const AUTO_INTERVAL = 6000;

function MarsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const { unlock } = useAchievements();
  const { logEvent } = useMissionLog();
  const viewedImages = useRef(new Set<string>());

  const current = IMAGES[currentIndex];

  const goTo = useCallback((index: number, dir?: number) => {
    setDirection(dir ?? (index > currentIndex ? 1 : -1));
    setCurrentIndex(index);
  }, [currentIndex]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % IMAGES.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => (i - 1 + IMAGES.length) % IMAGES.length);
  }, []);

  // Track viewed images for achievement
  useEffect(() => {
    viewedImages.current.add(current.id);
    if (current.id === 'sunset') {
      unlock('night_sky');
      logEvent('Observed Martian sunset from Jezero Crater Rim.');
    }
    if (viewedImages.current.size === IMAGES.length) {
      unlock('cartographer');
      logEvent('Completed full Mars reconnaissance imagery review.');
    }
  }, [currentIndex, current.id, unlock, logEvent]);

  // Auto-play
  useEffect(() => {
    if (isPaused || lightboxOpen) return;
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, lightboxOpen, next]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();else
      if (e.key === 'ArrowLeft') prev();else
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, next, prev]);

  // Touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '8%' : '-8%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-8%' : '8%', opacity: 0 })
  };

  return (
    <section
    id="gallery"
    className="relative py-20 sm:py-28 overflow-hidden"
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}>

      {/* Section header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Camera className="w-4 h-4 text-primary/50" />
          <span className="text-[10px] font-display tracking-[0.25em] text-primary/40 uppercase">
            Reconnaissance Archive
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-white/90">
          Mars <span className="text-primary/80">Surface</span> Imagery
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/30 max-w-lg">
          High-resolution photographs captured during orbital surveys and surface operations.
        </p>
      </div>

      {/* Main carousel */}
      <div
      className="relative z-10 max-w-6xl mx-auto px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>

        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06] shadow-2xl group">
          {/* Image with crossfade */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease: EXPO_OUT }}
              className="absolute inset-0">

              <img
              src={current.src}
              alt={current.title}
              className="w-full h-full object-cover"
              loading="lazy" />

              {/* Gradient overlay for text */}
              <div className={`absolute inset-0 bg-gradient-to-t ${current.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Image info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10">
            <motion.div
              key={`info-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: EXPO_OUT }}>

              <h3 className="text-lg sm:text-2xl font-display font-bold tracking-wide text-white/90 mb-2">
                {current.title}
              </h3>
              <p className="text-[11px] sm:text-sm text-white/40 max-w-md mb-3 leading-relaxed">
                {current.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary/50" />
                  <span className="text-[9px] sm:text-[10px] font-mono text-white/30">{current.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-primary/50" />
                  <span className="text-[9px] sm:text-[10px] font-mono text-white/30">{current.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-primary/50" />
                  <span className="text-[9px] sm:text-[10px] font-mono text-white/30">{current.camera}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Nav buttons — always visible on mobile, hover-reveal on desktop */}
          <button
          onClick={prev}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 sm:bg-black/30 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 sm:text-white/50 hover:text-white/80 hover:bg-black/50 transition-all sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Previous image">

            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
          onClick={next}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 sm:bg-black/30 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 sm:text-white/50 hover:text-white/80 hover:bg-black/50 transition-all sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Next image">

            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Expand button */}
          <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-black/30 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Expand image">

            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06] z-20">
            <motion.div
              key={`progress-${currentIndex}`}
              className="h-full bg-primary/50"
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? `${Date.now() % AUTO_INTERVAL / AUTO_INTERVAL * 100}%` : '100%' }}
              transition={isPaused ? { duration: 0 } : { duration: AUTO_INTERVAL / 1000, ease: 'linear' }} />

          </div>

          {/* Scanline overlay */}
          <div
          className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)' }} />

        </div>

        {/* Thumbnail strip — horizontally scrollable on mobile */}
        <div className="mt-4 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
          {IMAGES.map((img, i) =>
          <button
          key={img.id}
          onClick={() => goTo(i)}
          className={`relative rounded-lg overflow-hidden transition-all duration-300 border ${
          i === currentIndex ?
          'w-14 h-9 sm:w-16 sm:h-10 border-primary/40 shadow-[0_0_12px_rgba(255,69,0,0.15)]' :
          'w-10 h-7 sm:w-12 sm:h-8 border-white/[0.06] opacity-40 hover:opacity-70'}`
          }
          aria-label={`View ${img.title}`}>

              <img
            src={img.src}
            alt={img.title}
            className="w-full h-full object-cover"
            loading="lazy" />

              {i === currentIndex &&
            <div className="absolute inset-0 border-2 border-primary/30 rounded-lg" />
            }
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="mt-3 text-center">
          <span className="text-[9px] font-display tracking-[0.2em] text-white/50">
            {String(currentIndex + 1).padStart(2, '0')} / {String(IMAGES.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      <AnimatePresence>
        {lightboxOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-0"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}>

            {/* Close */}
            <button
          onClick={() => setLightboxOpen(false)}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors">

              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EXPO_OUT }}
              src={current.src}
              alt={current.title}
              className="max-w-[95vw] sm:max-w-[90vw] max-h-[70vh] sm:max-h-[85vh] object-contain rounded-lg sm:rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} />

            </AnimatePresence>

            {/* Lightbox nav */}
            <button
          onClick={(e) => {e.stopPropagation();prev();}}
          className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors">

              <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
            <button
          onClick={(e) => {e.stopPropagation();next();}}
          className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors">

              <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>

            {/* Lightbox info */}
            <div className="absolute bottom-4 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base sm:text-lg font-display font-bold tracking-wide text-white/80">{current.title}</h3>
              <p className="text-[11px] sm:text-xs text-white/30 mt-1 line-clamp-2">{current.description}</p>
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-mono text-white/50">{current.location}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-white/50">{current.date}</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-white/50">{current.camera}</span>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </section>);

}

export default memo(MarsGallery);