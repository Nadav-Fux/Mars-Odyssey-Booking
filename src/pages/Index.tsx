import { lazy, Suspense, useEffect } from 'react';
import StarField from '@/components/StarField';
import VerticalNav from '@/components/VerticalNav';
import HeroSection from '@/components/HeroSection';
import NebulaBackground from '@/components/NebulaBackground';
import LazySection from '@/components/LazySection';
import DeferredMount from '@/components/DeferredMount';
import Divider from '@/components/Divider';
import { useAlertMode } from '@/hooks/useAlertMode';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import { useAchievements } from '@/hooks/useAchievements';
import { useMissionLog } from '@/hooks/useMissionLog';
import { useCinemaMode } from '@/hooks/useCinemaMode';

/* ── Deferred HUD controls (not needed at first paint) ── */
const CustomCursor = lazy(() => import('@/components/CustomCursor'));
const ScanlineOverlay = lazy(() => import('@/components/ScanlineOverlay'));
const BatterySaverToggle = lazy(() => import('@/components/BatterySaverToggle'));
const LocaleToggle = lazy(() => import('@/components/LocaleToggle'));
const DiscoveryToggle = lazy(() => import('@/components/DiscoveryToggle'));
const DiscoveryMode = lazy(() => import('@/components/DiscoveryMode'));
const LaunchShake = lazy(() => import('@/components/LaunchShake'));
const ScrollProgress = lazy(() => import('@/components/ScrollProgress'));
const BackToTop = lazy(() => import('@/components/BackToTop'));
const TelemetryBar = lazy(() => import('@/components/TelemetryBar'));
const CrewChat = lazy(() => import('@/components/CrewChat'));
const AchievementPanel = lazy(() => import('@/components/AchievementPanel'));
const BoardingPassButton = lazy(() => import('@/components/BoardingPassButton'));
const MissionLog = lazy(() => import('@/components/MissionLog'));
const MobileActionHub = lazy(() => import('@/components/MobileActionHub'));
const MissionComplete = lazy(() => import('@/components/MissionComplete'));
const PerformanceDashboard = lazy(() => import('@/components/PerformanceDashboard'));
const AsteroidGameModal = lazy(() => import('@/components/AsteroidGameModal'));

/* ── Below-fold sections (lazy-loaded + code-split) ── */
const DestinationsSection = lazy(() => import('@/components/DestinationsSection'));
const SolarFlythrough = lazy(() => import('@/components/SolarFlythrough'));
const ExperienceTimeline = lazy(() => import('@/components/ExperienceTimeline'));
const MissionStats = lazy(() => import('@/components/MissionStats'));
const ReviewSection = lazy(() => import('@/components/ReviewSection'));
const BookingPanel = lazy(() => import('@/components/BookingPanel'));
const Footer = lazy(() => import('@/components/Footer'));
const FinalTransmission = lazy(() => import('@/components/FinalTransmission'));
const ParallaxQuote = lazy(() => import('@/components/ParallaxQuote'));
const ExploreCards = lazy(() => import('@/components/ExploreCards'));
const MarsGallery = lazy(() => import('@/components/MarsGallery'));

/* ── Deferred overlays (load 500ms after first paint) ── */
const AlertOverlay = lazy(() => import('@/components/AlertOverlay'));
const SatelliteOverlay = lazy(() => import('@/components/SatelliteOverlay'));
const SatelliteToggle = lazy(() => import('@/components/SatelliteToggle'));
const DustStorm = lazy(() => import('@/components/DustStorm'));
const MarsClock = lazy(() => import('@/components/MarsClock'));
const SpaceAudio = lazy(() => import('@/components/SpaceAudio'));
const SoundscapeEngine = lazy(() => import('@/components/SoundscapeEngine'));
const CommandTerminal = lazy(() => import('@/components/CommandTerminal'));
const EmergencyButton = lazy(() => import('@/components/EmergencyButton'));
const IncomingTransmission = lazy(() => import('@/components/IncomingTransmission'));
const ClassifiedOverlay = lazy(() => import('@/components/ClassifiedOverlay'));
const ShipAI = lazy(() => import('@/components/ShipAI'));
const CommandPalette = lazy(() => import('@/components/CommandPalette'));
const DiscoveryHints = lazy(() => import('@/components/DiscoveryHints'));

/* ── Suspense fallback (invisible — no layout shift) ── */
const Blank = <div className="flex items-center justify-center min-h-[200px]"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

export default function Index() {
  const { alertMode, toggleAlert } = useAlertMode();
  const { activated: konamiActive, reset: konamiReset } = useKonamiCode();
  const { unlock } = useAchievements();
  const { logEvent } = useMissionLog();
  const { isCinemaMode } = useCinemaMode();

  // Unlock achievement when Konami Code is activated
  useEffect(() => {
    if (konamiActive) {
      unlock('konami');
      logEvent('Classified data accessed via secure protocol.');
    }
  }, [konamiActive, unlock, logEvent]);

  return (
    <div className="relative min-h-screen bg-[#050508] text-white font-sans overflow-x-hidden">

      {/* ═══ CRITICAL PATH — renders immediately ═══ */}
      <NebulaBackground />
      <StarField />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-[120px]" />
        <div className="absolute bottom-[30%] right-[15%] w-[400px] h-[400px] rounded-full bg-accent/[0.015] blur-[120px]" />
        <div className="absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full bg-secondary/[0.02] blur-[100px]" />
      </div>

      {/* Navigation */}
      <div
      className="transition-opacity duration-500"
      style={{ opacity: isCinemaMode ? 0 : 1, pointerEvents: isCinemaMode ? 'none' : 'auto' }}>

        <VerticalNav />
      </div>

      {/* ═══ HUD CONTROLS — load after 100ms (not needed at first paint) ═══ */}
      <div
      className="transition-opacity duration-500"
      style={{ opacity: isCinemaMode ? 0 : 1, pointerEvents: isCinemaMode ? 'none' : 'auto' }}>

      <DeferredMount delay={100}>
        <Suspense fallback={Blank}>
          <ScrollProgress />
          <CustomCursor />
          <ScanlineOverlay />
          <BatterySaverToggle />
          <LocaleToggle />
          <DiscoveryToggle />
          <DiscoveryMode />
          <LaunchShake />
          <BackToTop />
          <TelemetryBar />
          <CrewChat />
          <AchievementPanel />
          <BoardingPassButton />
          <MissionLog />
          <MobileActionHub />
          <MissionComplete />
          <PerformanceDashboard />
          <AsteroidGameModal />
        </Suspense>
      </DeferredMount>

      {/* ═══ DEFERRED OVERLAYS — load 500ms after first paint ═══ */}
      <DeferredMount delay={500}>
        <Suspense fallback={Blank}>
          <CommandTerminal />
          <CommandPalette />
          <EmergencyButton />
          <SpaceAudio />
          <SoundscapeEngine />
          <AlertOverlay active={alertMode} onToggle={toggleAlert} />
          <SatelliteOverlay />
          <SatelliteToggle />
          <MarsClock />
        </Suspense>
      </DeferredMount>

      {/* Even later — dust storm (auto-triggers at ~2min anyway) */}
      <DeferredMount delay={1500}>
        <Suspense fallback={Blank}>
          <DustStorm />
          <IncomingTransmission />
          <ShipAI />
          <DiscoveryHints />
        </Suspense>
      </DeferredMount>

      {/* Konami Code Easter Egg */}
      <Suspense fallback={Blank}>
        <ClassifiedOverlay open={konamiActive} onClose={konamiReset} />
      </Suspense>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="relative pt-14 lg:pt-0">

        {/* Hero loads eagerly — it's above-the-fold */}
        <HeroSection />

        <Divider />

        {/* Destinations */}
        <LazySection id="destinations" minHeight="80vh">
          <Suspense fallback={Blank}>
            <DestinationsSection />
          </Suspense>
        </LazySection>

        {/* Transition bridge: into flythrough */}
        <div className="relative z-10 h-24 sm:h-36 -mb-1" style={{ background: 'linear-gradient(to bottom, transparent, #020206)' }} />

        <Suspense fallback={<div style={{ height: '100vh' }} />}>
          <SolarFlythrough />
        </Suspense>

        {/* Transition bridge: out of flythrough */}
        <div className="relative z-10 h-24 sm:h-36 -mt-1" style={{ background: 'linear-gradient(to bottom, #050508, transparent)' }} />

        {/* Experience Timeline */}
        <LazySection id="experience" minHeight="80vh">
          <Suspense fallback={Blank}>
            <ExperienceTimeline />
          </Suspense>
        </LazySection>

        {/* Mission Stats */}
        <LazySection id="stats" minHeight="50vh">
          <Suspense fallback={Blank}>
            <MissionStats />
          </Suspense>
        </LazySection>

        <Divider />

        {/* Mars Gallery */}
        <LazySection id="gallery" minHeight="60vh">
          <Suspense fallback={Blank}>
            <MarsGallery />
          </Suspense>
        </LazySection>

        <Divider />

        {/* ═══ EXPLORE CARDS — gateway to sub-pages (lazy, below fold) ═══ */}
        <LazySection id="explore" minHeight="40vh">
          <Suspense fallback={Blank}>
            <ExploreCards />
          </Suspense>
        </LazySection>

        <Divider />

        {/* Reviews */}
        <LazySection id="reviews" minHeight="60vh">
          <Suspense fallback={Blank}>
            <ReviewSection />
          </Suspense>
        </LazySection>

        <LazySection id="quote" minHeight="30vh">
          <Suspense fallback={Blank}>
            <ParallaxQuote
              quote="I looked and looked but I didn't see God. I saw the thin blue line of atmosphere protecting Earth, and I realized how fragile our home is."
              author="YURI GAGARIN"
              role="FIRST HUMAN IN SPACE · 1961"
              accentColor="#a855f7" />

          </Suspense>
        </LazySection>

        <Suspense fallback={Blank}>
          <FinalTransmission />
        </Suspense>

        <LazySection id="booking" minHeight="70vh">
          <Suspense fallback={Blank}>
            <BookingPanel />
          </Suspense>
        </LazySection>
      </main>

      <LazySection id="footer" minHeight="20vh">
        <Suspense fallback={Blank}>
          <Footer />
        </Suspense>
      </LazySection>
    </div>);

}