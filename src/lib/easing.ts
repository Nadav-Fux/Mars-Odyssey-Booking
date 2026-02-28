/* ================================================================
   SHARED EASING CONSTANTS

   Expo curves give a fast initial burst that decelerates slowly,
   creating the "expensive software" feel across the entire UI.

   GSAP   → use the string tokens directly  (e.g. ease: GSAP_EXPO_OUT)
   Framer → use the cubic-bezier tuples     (e.g. ease: EXPO_OUT)
   ================================================================ */

// ── Framer Motion (cubic-bezier tuples) ──

/** Fast start, long gentle deceleration.  The go-to for 95 % of transitions. */
export const EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Symmetrical expo curve for reversible / looping moves. */
export const EXPO_IN_OUT: [number, number, number, number] = [0.87, 0, 0.13, 1];

/** Slow start, explosive finish — rocket launches, exits. */
export const EXPO_IN: [number, number, number, number] = [0.7, 0, 0.84, 0];

// ── GSAP string tokens ──

export const GSAP_EXPO_OUT = 'expo.out';
export const GSAP_EXPO_IN_OUT = 'expo.inOut';
export const GSAP_EXPO_IN = 'expo.in';
