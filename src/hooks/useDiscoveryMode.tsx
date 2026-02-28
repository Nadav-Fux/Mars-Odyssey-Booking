import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface DiscoveryCtx {
  isActive: boolean;
  toggle: () => void;
  /** Index of the currently highlighted concept (-1 = none) */
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  next: () => void;
  prev: () => void;
  totalConcepts: number;
}

const DiscoveryContext = createContext<DiscoveryCtx>({
  isActive: false,
  toggle: () => {},
  activeIndex: -1,
  setActiveIndex: () => {},
  next: () => {},
  prev: () => {},
  totalConcepts: 0,
});

export interface DiscoveryConcept {
  /** CSS selector to highlight */
  selector: string;
  /** Title of the concept */
  title: string;
  /** Explanation */
  description: string;
  /** Tech category */
  category: 'animation' | 'design' | 'interaction' | 'performance' | 'accessibility';
}

export const CONCEPTS: DiscoveryConcept[] = [
  {
    selector: '.mars-scroll-wrap',
    title: 'GSAP ScrollTrigger',
    description:
      'The Mars globe scales and rotates on scroll using GSAP\'s ScrollTrigger plugin with scrub, creating a parallax 3D effect without any scroll-jacking.',
    category: 'animation',
  },
  {
    selector: '.hero-cta-group',
    title: 'Magnetic Cursor',
    description:
      'These buttons use spring physics to follow your cursor within a magnetic radius. The text layer moves independently from the button shell for a layered, tactile feel.',
    category: 'interaction',
  },
  {
    selector: '#destinations',
    title: 'Intersection Observer Reveals',
    description:
      'Section content animates in only when scrolled into view, using IntersectionObserver-driven GSAP timelines. This avoids rendering off-screen animations.',
    category: 'performance',
  },
  {
    selector: '#experience',
    title: 'Staggered Motion',
    description:
      'Timeline items appear with calculated stagger delays and Expo easing curves ([0.16, 1, 0.3, 1]) for a cascading, editorial reveal effect.',
    category: 'animation',
  },
  {
    selector: '.cabin-deck',
    title: 'Card Stack Physics',
    description:
      'Cabin cards use spring-based dragging with velocity tracking. Flick gestures calculate momentum to snap to the next card — mimicking native iOS card physics.',
    category: 'interaction',
  },
  {
    selector: 'nav',
    title: 'Vertical Nav + Active Section',
    description:
      'The navigation tracks the active section using IntersectionObserver thresholds and highlights accordingly. It\'s fully keyboard-navigable with ARIA landmarks.',
    category: 'accessibility',
  },
  {
    selector: '.scanline-overlay',
    title: 'CRT Scanline Effect',
    description:
      'A pointer-events: none overlay renders 1px CSS repeating gradients and an animated sweep, simulating a retro CRT monitor. Zero JS cost — pure CSS.',
    category: 'design',
  },
  {
    selector: '#fleet',
    title: 'Token-Driven Design',
    description:
      'Every color, radius, and font references CSS custom properties from theme.css. Changing one token updates the entire site — no hardcoded values anywhere.',
    category: 'design',
  },
];

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const toggle = useCallback(() => {
    setIsActive((prev) => {
      if (prev) setActiveIndex(-1);
      else setActiveIndex(0);
      return !prev;
    });
  }, []);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % CONCEPTS.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + CONCEPTS.length) % CONCEPTS.length);
  }, []);

  return (
    <DiscoveryContext.Provider
      value={{
        isActive,
        toggle,
        activeIndex,
        setActiveIndex,
        next,
        prev,
        totalConcepts: CONCEPTS.length,
      }}
    >
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscoveryMode() {
  return useContext(DiscoveryContext);
}
