import { useEffect } from 'react';
import { useLocation } from 'react-router';

/* ================================================================
   useFavicon — Dynamic page-specific favicon

   Changes the browser tab icon based on the current route:
     /         → 🚀 (rocket)
     /ship     → 🛸 (spaceship)
     /crew     → 👨‍🚀 (astronaut)
     /mission  → 📋 (clipboard)
     /explore  → 🌍 (globe)
     /simulate → 🎯 (crosshair)
     *         → 📡 (satellite)

   Creates an emoji-based SVG favicon dynamically.
   ================================================================ */

const ROUTE_EMOJI: Record<string, string> = {
  '/': '🚀',
  '/ship': '🛸',
  '/crew': '👨‍🚀',
  '/mission': '📋',
  '/explore': '🌍',
  '/simulate': '🎯',
};

const DEFAULT_EMOJI = '📡';

function createEmojiFavicon(emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="80">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function useFavicon() {
  const { pathname } = useLocation();

  useEffect(() => {
    const emoji = ROUTE_EMOJI[pathname] || DEFAULT_EMOJI;
    const href = createEmojiFavicon(emoji);

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [pathname]);
}
