import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface SatelliteModeCtx {
  satellite: boolean;
  toggle: () => void;
}

const Ctx = createContext<SatelliteModeCtx>({ satellite: false, toggle: () => {} });

export function SatelliteModeProvider({ children }: { children: ReactNode }) {
  const [satellite, setSatellite] = useState(false);
  const toggle = useCallback(() => setSatellite((s) => !s), []);

  // Apply class + data attribute on <html> for global CSS targeting
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('satellite-mode', satellite);
    root.setAttribute('data-view', satellite ? 'satellite' : 'artistic');
    return () => {
      root.classList.remove('satellite-mode');
      root.setAttribute('data-view', 'artistic');
    };
  }, [satellite]);

  return <Ctx.Provider value={{ satellite, toggle }}>{children}</Ctx.Provider>;
}

export function useSatelliteMode() {
  return useContext(Ctx);
}
