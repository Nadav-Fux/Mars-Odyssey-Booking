import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { SatelliteModeProvider } from '@/hooks/useSatelliteMode';
import { BatterySaverProvider } from '@/hooks/useBatterySaver';
import { LocaleProvider } from '@/hooks/useLocale';
import { DiscoveryProvider } from '@/hooks/useDiscoveryMode';
import PageTransition from '@/components/PageTransition';
import ScrollToTop from '@/components/ScrollToTop';
import BootSequence from '@/components/BootSequence';
import { useFavicon } from '@/hooks/useFavicon';
import { AchievementProvider, useAchievements } from '@/hooks/useAchievements';
import AchievementToast from '@/components/AchievementToast';
import { MissionLogProvider, useMissionLog } from '@/hooks/useMissionLog';
import { usePageTitle } from '@/hooks/usePageTitle';
import { CinemaModeProvider } from '@/hooks/useCinemaMode';
import LazyLoadErrorBoundary from '@/components/LazyLoadErrorBoundary';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/* ââ All pages lazy-loaded for optimal code-splitting ââ */
const Index = lazy(() => import('@/pages/Index'));
const ShipPage = lazy(() => import('@/pages/ShipPage'));
const CrewPage = lazy(() => import('@/pages/CrewPage'));
const MissionPage = lazy(() => import('@/pages/MissionPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function AppRoutes() {
  const location = useLocation();
  useFavicon();
  usePageAchievements();
  usePageLogging();
  useTabAway();
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded">
        Skip to content
      </a>
      <div id="main-content">
      <ScrollToTop />
      <PageTransition>
        <LazyLoadErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/ship" element={<ErrorBoundary><ShipPage /></ErrorBoundary>} />
              <Route path="/crew" element={<ErrorBoundary><CrewPage /></ErrorBoundary>} />
              <Route path="/mission" element={<ErrorBoundary><MissionPage /></ErrorBoundary>} />
              <Route path="/explore" element={<ErrorBoundary><ExplorePage /></ErrorBoundary>} />
              <Route path="/simulate" element={<ErrorBoundary><SimulatorPage /></ErrorBoundary>} />
              <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
            </Routes>
          </Suspense>
        </LazyLoadErrorBoundary>
      </PageTransition>
      </div>
    </>
  );
}

/* Track page visits for achievements */
function usePageAchievements() {
  const { pathname } = useLocation();
  const { unlock, isUnlocked } = useAchievements();

  useEffect(() => {
    // Track visited pages
    const key = 'ares-x-visited-pages';
    const visited = new Set(JSON.parse(sessionStorage.getItem(key) || '[]'));
    visited.add(pathname);
    sessionStorage.setItem(key, JSON.stringify([...visited]));

    // Individual page achievements
    if (pathname === '/simulate') unlock('simulator');
    if (pathname.startsWith('/') && !['/', '/ship', '/crew', '/mission', '/explore', '/simulate'].includes(pathname)) {
      unlock('signal_lost');
    }

    // Explorer: visited all 6 pages
    const allPages = ['/', '/ship', '/crew', '/mission', '/explore', '/simulate'];
    if (allPages.every((p) => visited.has(p))) {
      unlock('explorer');
    }
  }, [pathname, unlock, isUnlocked]);
}

/* Welcome-back when user returns to the tab */
function useTabAway() {
  const { logEvent } = useMissionLog();

  usePageTitle(() => {
    // User returned to tab â log it
    logEvent('Commander returned to Mission Control.');
  });
}

/* Auto-log page navigations to mission log */
function usePageLogging() {
  const { pathname } = useLocation();
  const { logNav } = useMissionLog();

  useEffect(() => {
    const names: Record<string, string> = {
      '/': 'Mission Control',
      '/ship': 'The Ship',
      '/crew': 'Crew Quarters',
      '/mission': 'Mission Intel',
      '/explore': 'Mars Surface Ops',
      '/simulate': 'Landing Simulator',
    };
    const name = names[pathname] || 'Unknown Sector';
    logNav(name);
  }, [pathname, logNav]);
}

function App() {
  return (
    <AchievementProvider>
      <BootSequence>
        <BatterySaverProvider>
          <LocaleProvider>
            <DiscoveryProvider>
              <SatelliteModeProvider>
                <MissionLogProvider>
                  <CinemaModeProvider>
                    <AppRoutes />
                    <AchievementToast />
                  </CinemaModeProvider>
                </MissionLogProvider>
              </SatelliteModeProvider>
            </DiscoveryProvider>
          </LocaleProvider>
        </BatterySaverProvider>
      </BootSequence>
    </AchievementProvider>
  );
}

export default App;
","encoding":"utf8