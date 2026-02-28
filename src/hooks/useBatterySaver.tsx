import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface BatterySaverCtx {
  /** true when animations should be reduced */
  isSaving: boolean;
  /** user explicitly toggled */
  toggle: () => void;
  /** auto-detected mobile device */
  isMobile: boolean;
  /** battery level (0-1) if available */
  batteryLevel: number | null;
}

const BatterySaverContext = createContext<BatterySaverCtx>({
  isSaving: false,
  toggle: () => {},
  isMobile: false,
  batteryLevel: null,
});

export function BatterySaverProvider({ children }: { children: ReactNode }) {
  const [userOverride, setUserOverride] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Detect mobile via viewport + touch
  useEffect(() => {
    const check = () => {
      const mobile =
        window.innerWidth < 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Battery API (if available)
  useEffect(() => {
    let mounted = true;
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((batt: any) => {
        if (!mounted) return;
        setBatteryLevel(batt.level);
        const update = () => mounted && setBatteryLevel(batt.level);
        batt.addEventListener('levelchange', update);
      });
    }
    return () => { mounted = false; };
  }, []);

  // Auto-detect: save if mobile, low battery (<20%), or prefers-reduced
  const autoSave =
    prefersReduced ||
    (isMobile && (batteryLevel === null || batteryLevel < 0.3)) ||
    (batteryLevel !== null && batteryLevel < 0.2);

  const isSaving = userOverride !== null ? userOverride : autoSave;

  const toggle = useCallback(() => {
    setUserOverride((prev) => (prev !== null ? !prev : !autoSave));
  }, [autoSave]);

  // Apply CSS class on <html> for global animation reduction
  useEffect(() => {
    const html = document.documentElement;
    if (isSaving) {
      html.classList.add('battery-saver');
      html.style.setProperty('--anim-duration-scale', '0');
    } else {
      html.classList.remove('battery-saver');
      html.style.setProperty('--anim-duration-scale', '1');
    }
  }, [isSaving]);

  return (
    <BatterySaverContext.Provider value={{ isSaving, toggle, isMobile, batteryLevel }}>
      {children}
    </BatterySaverContext.Provider>
  );
}

export function useBatterySaver() {
  return useContext(BatterySaverContext);
}
