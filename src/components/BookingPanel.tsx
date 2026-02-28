import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import BookingOverlay from '@/components/BookingOverlay';
import RevealText from '@/components/RevealText';
import CabinCardDeck from '@/components/CabinCardDeck';
import { useAchievements } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';

export default function BookingPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(1);
  const { unlock } = useAchievements();
  const { logEvent } = useMissionLog();

  useGSAP(() => {
    gsap.from('.book-head', {
      y: 50, opacity: 0, stagger: 0.12, duration: 0.9,
      scrollTrigger: { trigger: '.book-header', start: 'top 85%' }
    });
  }, { scope: ref });

  const openBooking = (tierIdx: number) => {
    setSelectedTier(tierIdx);
    setOverlayOpen(true);
    unlock('booking');
    logEvent('Initiated booking sequence.');
  };

  return (
    <>
      <section id="booking" ref={ref} className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto lg:pl-10">
          <div className="book-header mb-10 sm:mb-14">
            <span className="book-head inline-block px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] sm:text-xs font-display tracking-[0.25em] text-primary/80 mb-5">
              RESERVE YOUR SEAT
            </span>
            <h2 className="book-head font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-4">
              BOOK YOUR
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">PASSAGE</span>
            </h2>
            <RevealText
              text="Limited seats per launch window. Flick through the classes, pick your seat, and launch."
              className="book-head text-white/30 text-sm sm:text-base max-w-md leading-relaxed" />

          </div>

          {/* 3D cabin card deck */}
          <CabinCardDeck onSelect={openBooking} initialIndex={1} />

          {/* Fine print */}
          <div className="text-center mt-8">
            <p className="text-[10px] text-white/50 font-display tracking-wider">
              All prices in USD • Fully refundable up to T-30 days • Includes training program
            </p>
          </div>
        </div>
      </section>

      {/* Full-screen booking overlay */}
      <BookingOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        initialTier={selectedTier} />
    </>);

}