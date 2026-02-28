import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scrolls to top whenever the route changes.
 * Place once inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
