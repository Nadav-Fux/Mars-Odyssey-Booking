import { useRef, useState, useEffect, type ReactNode, memo } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** How far before the viewport to start rendering (px). Default 800px desktop, 1200px mobile. */
  rootMargin?: string;
  /** Minimum height placeholder while not yet mounted */
  minHeight?: string;
  /** Unique key for debugging */
  id?: string;
  className?: string;
}

/**
 * LazySection
 *
 * Uses IntersectionObserver to mount children only when
 * the placeholder approaches the viewport.  Once mounted
 * the children stay rendered (no unmounting on scroll-away).
 *
 * On mobile, uses a larger rootMargin (1200px) to prefetch
 * content earlier during fast scrolling.
 *
 * Falls back to immediate mount if IntersectionObserver
 * is not supported.
 *
 * After mounting, triggers a debounced ScrollTrigger.refresh()
 * so GSAP recalculates scroll positions for any newly added content.
 */

// Debounce ScrollTrigger.refresh() — multiple LazySections may mount
// in quick succession; we only need one refresh at the end.
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleScrollTriggerRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    import('@/lib/gsap').then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
    }).catch(() => {});
    refreshTimer = null;
  }, 200);
}

function LazySection({
  children,
  rootMargin,
  minHeight = '60vh',
  id,
  className = ''
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: if IntersectionObserver is not supported, mount immediately
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }

    // Determine responsive rootMargin if not explicitly provided
    const effectiveMargin = rootMargin ??
      (window.matchMedia('(max-width: 768px)').matches ? '1200px 0px' : '800px 0px');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: effectiveMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // After content mounts, schedule a ScrollTrigger refresh
  // so GSAP recalculates positions for the new content.
  useEffect(() => {
    if (mounted) {
      scheduleScrollTriggerRefresh();
    }
  }, [mounted]);

  return (
    <div
    ref={ref}
    data-lazy={id}
    className={className}
    style={{ minHeight: mounted ? undefined : minHeight }}>
      {mounted ? children : null}
    </div>);
}

export default memo(LazySection);
