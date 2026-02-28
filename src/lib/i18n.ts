/* ================================================================
   i18n — Lightweight localization for ARES-X

   Two locales: English (LTR) and Hebrew (RTL).
   Strings are organized by section for easy maintenance.
   ================================================================ */

export type Locale = 'en' | 'he';

export interface Strings {
  /* ── Navigation ── */
  nav: {
    hero: string;
    destinations: string;
    experience: string;
    fleet: string;
    specs: string;
    booking: string;
  };

  /* ── Hero ── */
  hero: {
    overline: string;
    title1: string;
    title2: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    distance: string;
    transit: string;
    passengers: string;
  };

  /* ── Destinations ── */
  destinations: {
    badge: string;
    heading: string;
    headingAccent: string;
    description: string;
  };

  /* ── Experience ── */
  experience: {
    badge: string;
    heading: string;
    headingAccent: string;
    description: string;
  };

  /* ── Fleet ── */
  fleet: {
    badge: string;
    heading: string;
    headingAccent: string;
  };

  /* ── Booking ── */
  booking: {
    badge: string;
    heading: string;
    headingAccent: string;
    description: string;
    finePrint: string;
  };

  /* ── Footer ── */
  footer: {
    tagline: string;
    copyright: string;
  };

  /* ── Misc ── */
  misc: {
    explore: string;
    batterySaverOn: string;
    batterySaverOff: string;
    animationsReduced: string;
    fullAnimations: string;
    mobileDetected: string;
    discoveryMode: string;
    discoveryOn: string;
    discoveryOff: string;
  };
}

export const translations: Record<Locale, Strings> = {
  en: {
    nav: {
      hero: 'HOME',
      destinations: 'DESTINATIONS',
      experience: 'EXPERIENCE',
      fleet: 'FLEET',
      specs: 'SPECS',
      booking: 'BOOK',
    },
    hero: {
      overline: 'NEXT LAUNCH WINDOW — MARCH 2026',
      title1: 'YOUR JOURNEY',
      title2: 'TO MARS',
      description:
        'ARES-X is the world\'s first luxury interplanetary tourism program. Book your seat on the inaugural commercial voyage to the Red Planet.',
      ctaPrimary: 'RESERVE PASSAGE',
      ctaSecondary: 'THE EXPERIENCE',
      distance: 'DISTANCE',
      transit: 'TRANSIT',
      passengers: 'PASSENGERS',
    },
    destinations: {
      badge: 'LANDING SITES',
      heading: 'EXPLORE',
      headingAccent: 'MARS',
      description:
        'Four meticulously prepared landing sites, each offering a unique Martian experience.',
    },
    experience: {
      badge: 'THE JOURNEY',
      heading: 'MISSION',
      headingAccent: 'TIMELINE',
      description:
        'From launch to landing — every phase of your interplanetary voyage, planned to the second.',
    },
    fleet: {
      badge: 'SPACECRAFT',
      heading: 'THE',
      headingAccent: 'FLEET',
    },
    booking: {
      badge: 'RESERVE YOUR SEAT',
      heading: 'BOOK YOUR',
      headingAccent: 'PASSAGE',
      description:
        'Limited seats per launch window. Flick through the classes, pick your seat, and launch.',
      finePrint:
        'All prices in USD • Fully refundable up to T-30 days • Includes training program',
    },
    footer: {
      tagline: 'Making Mars accessible to humanity',
      copyright: '© 2026 ARES-X Corporation. All rights reserved.',
    },
    misc: {
      explore: 'EXPLORE',
      batterySaverOn: 'BATTERY SAVER ON',
      batterySaverOff: 'BATTERY SAVER OFF',
      animationsReduced: 'Animations reduced for performance',
      fullAnimations: 'Full animations active',
      mobileDetected: 'Mobile detected',
      discoveryMode: 'DISCOVERY MODE',
      discoveryOn: 'Learning tooltips active',
      discoveryOff: 'Tap to explore tech concepts',
    },
  },

  he: {
    nav: {
      hero: 'בית',
      destinations: 'יעדים',
      experience: 'חוויה',
      fleet: 'צי',
      specs: 'מפרט',
      booking: 'הזמנה',
    },
    hero: {
      overline: 'חלון השיגור הבא — מרץ 2026',
      title1: 'המסע שלך',
      title2: 'למאדים',
      description:
        'ARES-X היא תוכנית התיירות הבין-כוכבית הפאר הראשונה בעולם. הזמינו מקום בטיסה המסחרית הראשונה לכוכב האדום.',
      ctaPrimary: 'הזמן מעבר',
      ctaSecondary: 'החוויה',
      distance: 'מרחק',
      transit: 'מעבר',
      passengers: 'נוסעים',
    },
    destinations: {
      badge: 'אתרי נחיתה',
      heading: 'חקרו את',
      headingAccent: 'מאדים',
      description:
        'ארבעה אתרי נחיתה שהוכנו בקפידה, כל אחד מציע חוויה מאדימית ייחודית.',
    },
    experience: {
      badge: 'המסע',
      heading: 'לוח זמנים',
      headingAccent: 'המשימה',
      description:
        'משיגור ועד נחיתה — כל שלב במסע הבין-כוכבי שלכם, מתוכנן עד השנייה.',
    },
    fleet: {
      badge: 'חלליות',
      heading: 'הצי',
      headingAccent: 'שלנו',
    },
    booking: {
      badge: 'הזמינו את מקומכם',
      heading: 'הזמינו את',
      headingAccent: 'המעבר',
      description:
        'מקומות מוגבלים בכל חלון שיגור. דפדפו בין המחלקות, בחרו מושב, והמריאו.',
      finePrint:
        'כל המחירים בדולרים • החזר מלא עד T-30 יום • כולל תוכנית הכשרה',
    },
    footer: {
      tagline: 'הופכים את מאדים לנגיש לאנושות',
      copyright: '© 2026 ARES-X Corporation. כל הזכויות שמורות.',
    },
    misc: {
      explore: 'חקרו',
      batterySaverOn: 'חיסכון בסוללה פעיל',
      batterySaverOff: 'חיסכון בסוללה כבוי',
      animationsReduced: 'אנימציות מופחתות לביצועים',
      fullAnimations: 'אנימציות מלאות פעילות',
      mobileDetected: 'זוהה מכשיר נייד',
      discoveryMode: 'מצב גילוי',
      discoveryOn: 'תוויות למידה פעילות',
      discoveryOff: 'לחצו לחקור מושגים טכנולוגיים',
    },
  },
};
