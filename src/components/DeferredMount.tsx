import { useState, useEffect, type ReactNode, memo } from 'react';

interface DeferredMountProps {
  children: ReactNode;
  /** Delay in ms before mounting. Default 1500 (1.5s after page load). */
  delay?: number;
  /** Use requestIdleCallback if available (better for low-priority work). */
  useIdle?: boolean;
}

/**
 * DeferredMount
 *
 * Delays mounting of non-critical UI (overlays, audio engines,
 * decorative effects) until after initial paint + a configurable
 * delay.  Uses requestIdleCallback when available for
 * lowest-priority scheduling.
 *
 * This keeps the critical render path fast.
 */
function DeferredMount({
  children,
  delay = 1500,
  useIdle = true,
}: DeferredMountProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const mount = () => {
      if (!cancelled) setMounted(true);
    };

    // After delay, use idle callback if possible
    const timer = setTimeout(() => {
      if (useIdle && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(mount, { timeout: 500 });
      } else {
        mount();
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [delay, useIdle]);

  return mounted ? <>{children}</> : null;
}

export default memo(DeferredMount);
