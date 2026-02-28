import { useState, useEffect, useCallback, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   useKonamiCode — ↑↑↓↓←→←→BA

   Returns `activated` boolean that flips to true once
   the classic Konami code is entered via keyboard.
   Also exposes `reset` to dismiss.
   ═══════════════════════════════════════════════════════ */

const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const index = useRef(0);

  useEffect(() => {
    if (activated) return; // stop listening once activated

    const onKey = (e: KeyboardEvent) => {
      const expected = KONAMI[index.current];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        index.current++;
        if (index.current >= KONAMI.length) {
          setActivated(true);
          index.current = 0;
        }
      } else {
        index.current = 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activated]);

  const reset = useCallback(() => {
    setActivated(false);
    index.current = 0;
  }, []);

  return { activated, reset };
}
