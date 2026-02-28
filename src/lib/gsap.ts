import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Performance defaults
gsap.defaults({
  ease: 'expo.out',
  duration: 0.8,
});

// Configure ScrollTrigger for performance
ScrollTrigger.config({
  // Limit recalculations
  ignoreMobileResize: true,
});

// Set global ticker for consistent frame pacing
gsap.ticker.lagSmoothing(500, 33); // Cap lag compensation at 500ms, target 30fps min

export { gsap, ScrollTrigger };
