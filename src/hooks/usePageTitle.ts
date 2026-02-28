import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/* ================================================================
   DYNAMIC PAGE TITLE + TAB-AWAY EASTER EGG

   • Sets contextual title per route
   • When user leaves the tab  → "Come back, Commander!"
   • When user returns          → restores title + optional callback
   • Uses the Page Visibility API
   ================================================================ */

const TITLES: Record<string, string> = {
  '/':         'ARES-X · Mars Mission',
  '/ship':     'ARES-X · The Ship',
  '/crew':     'ARES-X · The Crew',
  '/mission':  'ARES-X · Mission Intel',
  '/explore':  'ARES-X · Explore Mars',
  '/simulate': 'ARES-X · Landing Simulator',
};

const AWAY_MESSAGES = [
  'Come back, Commander!',
  'Mission Control awaits…',
  'Commander? · ARES-X',
  'Don\'t leave us out here!',
  'Mars is waiting…',
];

export function usePageTitle(onReturn?: () => void) {
  const { pathname } = useLocation();
  const activeTitle = useRef(TITLES[pathname] || 'ARES-X');
  const wasHidden = useRef(false);

  // Set title on route change
  useEffect(() => {
    const title = TITLES[pathname] || 'ARES-X · Signal Lost';
    activeTitle.current = title;
    document.title = title;
  }, [pathname]);

  // Tab visibility
  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        // User left
        wasHidden.current = true;
        const msg = AWAY_MESSAGES[Math.floor(Math.random() * AWAY_MESSAGES.length)];
        document.title = msg;
      } else if (wasHidden.current) {
        // User returned
        wasHidden.current = false;
        document.title = activeTitle.current;
        onReturn?.();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [onReturn]);
}
