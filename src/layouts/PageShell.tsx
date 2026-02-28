import { lazy, Suspense, type ReactNode } from 'react';
import StarField from '@/components/StarField';
import CustomCursor from '@/components/CustomCursor';
import NebulaBackground from '@/components/NebulaBackground';
import ScanlineOverlay from '@/components/ScanlineOverlay';
import SubPageNav from '@/components/SubPageNav';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import LazySection from '@/components/LazySection';

const Footer = lazy(() => import('@/components/Footer'));

const Blank = <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>;

interface PageShellProps {
  children: ReactNode;
}

/**
 * Shared layout shell for secondary pages.
 * Provides the space-themed background, nav, cursor, footer.
 */
export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white font-sans overflow-x-hidden">
      {/* Background layers */}
      <ScrollProgress />
      <CustomCursor />
      <NebulaBackground />
      <StarField />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-[120px]" />
        <div className="absolute bottom-[30%] right-[15%] w-[400px] h-[400px] rounded-full bg-accent/[0.015] blur-[120px]" />
      </div>

      {/* Navigation */}
      <SubPageNav />
      <BackToTop />

      {/* Page content */}
      <main className="relative pt-20 lg:pt-24">
        {children}
      </main>

      {/* Footer */}
      <LazySection id="footer" minHeight="20vh">
        <Suspense fallback={Blank}>
          <Footer />
        </Suspense>
      </LazySection>

      <ScanlineOverlay />
    </div>);

}