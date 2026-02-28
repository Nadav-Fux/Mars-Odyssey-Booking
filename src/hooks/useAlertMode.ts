import { useState, useEffect, useCallback } from 'react';

export function useAlertMode() {
  const [active, setActive] = useState(false);

  const toggle = useCallback(() => setActive((a) => !a), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        // Ignore if typing in input
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  // Toggle body class for global CSS targeting
  useEffect(() => {
    document.documentElement.classList.toggle('alert-mode', active);
    return () => document.documentElement.classList.remove('alert-mode');
  }, [active]);

  return { alertMode: active, toggleAlert: toggle };
}
