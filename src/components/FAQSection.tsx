import { useRef, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { HelpCircle, ChevronDown, Terminal } from 'lucide-react';
import RevealText from '@/components/RevealText';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   FAQ SECTION — Terminal-style accordion

   Each FAQ item opens like a terminal query/response, with:
   • Typing effect on answer reveal
   • Glowing accent line when open
   • Command-prompt styling ("> QUERY:", "< RESPONSE:")
   • GSAP stagger entrance
   ================================================================ */

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
{
  category: 'MISSION',
  q: 'How long is the complete Mars mission?',
  a: 'The full round-trip takes approximately 14–18 months: 7 months transit each way, plus 14–21 days of surface exploration. During transit, you\'ll enjoy luxury habitats with artificial gravity, zero-G recreation, and panoramic observation decks.'
},
{
  category: 'SAFETY',
  q: 'What radiation protection is provided?',
  a: 'The Ares-7 features a Class V+ superconducting magnetic shield that deflects 99.97% of cosmic radiation. Combined with advanced hull composites and a water-layer buffer zone, your cumulative exposure stays well within safe limits — comparable to 2–3 CT scans over the entire mission.'
},
{
  category: 'BOOKING',
  q: 'Is my booking fully refundable?',
  a: 'Yes. All bookings are 100% refundable up to T-30 days before launch. After that, a 15% administrative fee applies. Your deposit secures your specific cabin and seat assignment. We also offer complimentary rebooking to any future launch window.'
},
{
  category: 'TRAINING',
  q: 'Do I need prior space experience?',
  a: 'No prior experience required. Every passenger completes our 12-week Pre-Flight Academy: zero-G pool training, EVA suit certification, radiation safety, emergency protocols, and psychological preparation. Our instructors have a 100% certification rate.'
},
{
  category: 'COMFORT',
  q: 'What are the cabin classes like?',
  a: 'Explorer class features shared luxury pods with personal viewports. Odyssey class offers private suites with AI concierge, queen beds, and en-suite facilities. Pioneer class delivers the ultimate: penthouse deck with 270\u00b0 panoramic dome, private observatory, and chef\'s table dining.'
},
{
  category: 'MEDICAL',
  q: 'Are there medical facilities on board?',
  a: 'The Ares-7 houses a full medical bay with surgical capability, AI-assisted diagnostics, telemedicine link to Earth, a pharmacy, and a dedicated flight surgeon. Passenger vitals are continuously monitored via biometric wearables throughout the mission.'
}];


// Category colors
const CAT_COLORS: Record<string, string> = {
  MISSION: '#FF4500',
  SAFETY: '#4ab8c4',
  BOOKING: '#a855f7',
  TRAINING: '#ff6b35',
  COMFORT: '#eab308',
  MEDICAL: '#22c55e'
};

// ── Single FAQ Item ──
function FAQAccordion({ item, index }: {item: FAQItem;index: number;}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const typingRef = useRef<ReturnType<typeof setInterval>>();

  const toggle = useCallback(() => {
    if (open) {
      // Close
      setOpen(false);
      setTyped('');
      if (typingRef.current) clearInterval(typingRef.current);
    } else {
      // Open and start typing
      setOpen(true);
      setTyped('');
      let i = 0;
      typingRef.current = setInterval(() => {
        i++;
        setTyped(item.a.slice(0, i));
        if (i >= item.a.length) {
          if (typingRef.current) clearInterval(typingRef.current);
        }
      }, 8);
    }
  }, [open, item.a]);

  const color = CAT_COLORS[item.category] || '#FF4500';
  const isComplete = typed.length >= item.a.length;

  return (
    <div
    className="relative rounded-xl overflow-hidden transition-all duration-300"
    style={{
      background: open ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.012)',
      border: `1px solid ${open ? `${color}20` : 'rgba(255,255,255,0.05)'}`
    }}>

      {/* Accent line top */}
      <div
      className="absolute top-0 inset-x-0 h-px transition-opacity duration-500"
      style={{
        background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        opacity: open ? 1 : 0
      }} />


      {/* Question button */}
      <button
      onClick={toggle}
      className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer group">

        {/* Category badge */}
        <span
        className="flex-shrink-0 mt-0.5 text-[7px] font-display font-bold tracking-[0.15em] px-2 py-0.5 rounded"
        style={{
          color,
          background: `${color}10`,
          border: `1px solid ${color}15`
        }}>

          {item.category}
        </span>

        {/* Question text */}
        <span className="flex-1 text-white/60 text-sm font-medium group-hover:text-white/80 transition-colors leading-relaxed">
          {item.q}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EXPO_OUT }}
          className="flex-shrink-0 mt-0.5">

          <ChevronDown className="w-4 h-4 text-white/50" />
        </motion.div>
      </button>

      {/* Answer */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: EXPO_OUT }}
          className="overflow-hidden">

            <div className="px-5 pb-5">
              {/* Terminal-style prompt */}
              <div
            className="rounded-lg p-4"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>

                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-3 h-3" style={{ color: `${color}60` }} />
                  <span
                className="text-[8px] font-display tracking-[0.15em]"
                style={{ color: `${color}50` }}>

                    ARES-X KNOWLEDGE BASE
                  </span>
                </div>
                <p className="text-white/40 text-[12px] sm:text-[13px] leading-relaxed font-mono">
                  {typed}
                  {!isComplete &&
                <span
                className="inline-block w-[5px] h-[13px] ml-0.5 align-middle animate-pulse"
                style={{ backgroundColor: `${color}80` }} />

                }
                </p>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

// ── Section ──
function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.faq-head', {
      y: 40, opacity: 0, stagger: 0.1, duration: 0.8,
      scrollTrigger: { trigger: '.faq-header', start: 'top 85%' }
    });
    gsap.from('.faq-item', {
      y: 30, opacity: 0, stagger: 0.08, duration: 0.6,
      scrollTrigger: { trigger: '.faq-list', start: 'top 88%' }
    });
  }, { scope: sectionRef });

  return (
    <section
    id="faq"
    ref={sectionRef}
    className="relative z-10 py-24 sm:py-36 px-4 sm:px-6">

      <div className="max-w-3xl mx-auto lg:pl-10">
        {/* Header */}
        <div className="faq-header mb-12 sm:mb-16 text-center">
          <span className="faq-head inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/[0.04] mb-4">
            <HelpCircle className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-display tracking-[0.2em] text-primary/70">
              KNOWLEDGE BASE
            </span>
          </span>

          <h2 className="faq-head font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
            FREQUENTLY
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              ASKED
            </span>
          </h2>

          <RevealText
            text="Everything you need to know before booking your passage. Click a question to query the ARES-X knowledge base."
            className="faq-head text-white/30 text-sm sm:text-base max-w-md mx-auto leading-relaxed" />

        </div>

        {/* FAQ list */}
        <div className="faq-list space-y-3">
          {FAQS.map((item, i) =>
          <div key={i} className="faq-item">
              <FAQAccordion item={item} index={i} />
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-[9px] font-display tracking-[0.15em] text-white/[0.08]">
            STILL HAVE QUESTIONS? OPEN THE COMMAND TERMINAL (`) OR CONTACT MISSION SUPPORT
          </p>
        </div>
      </div>
    </section>);

}

export default memo(FAQSection);