import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Clock, Eye, Gauge, X, ChevronUp, Wifi } from 'lucide-react';
import { EXPO_OUT } from '@/lib/easing';

/* ================================================================
   PERFORMANCE DASHBOARD

   A space-themed HUD displaying real Web Vitals & performance
   metrics. Sits as a small pill/badge in the corner; expands
   into a full panel when clicked.

   Tracks:
     • FCP  (First Contentful Paint)
     • LCP  (Largest Contentful Paint)
     • CLS  (Cumulative Layout Shift)
     • FID / INP (First Input Delay / Interaction to Next Paint)
     • TTFB (Time to First Byte)
     • DOM nodes, JS heap, FPS
   ================================================================ */

interface Metric {
  name: string;
  label: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  thresholds: [number, number]; // [good, needs-improvement] — above = poor
  description: string;
}

function getColor(value: number | null, thresholds: [number, number]): string {
  if (value === null) return 'rgba(255,255,255,0.15)';
  if (value <= thresholds[0]) return '#22c55e'; // green
  if (value <= thresholds[1]) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getLabel(value: number | null, thresholds: [number, number]): string {
  if (value === null) return 'PENDING';
  if (value <= thresholds[0]) return 'NOMINAL';
  if (value <= thresholds[1]) return 'CAUTION';
  return 'CRITICAL';
}

function PerformanceDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([
  { name: 'fcp', label: 'FCP', value: null, unit: 'ms', icon: <Zap className="w-3.5 h-3.5" />, thresholds: [1800, 3000], description: 'First Contentful Paint' },
  { name: 'lcp', label: 'LCP', value: null, unit: 'ms', icon: <Eye className="w-3.5 h-3.5" />, thresholds: [2500, 4000], description: 'Largest Contentful Paint' },
  { name: 'cls', label: 'CLS', value: null, unit: '', icon: <Activity className="w-3.5 h-3.5" />, thresholds: [0.1, 0.25], description: 'Cumulative Layout Shift' },
  { name: 'ttfb', label: 'TTFB', value: null, unit: 'ms', icon: <Wifi className="w-3.5 h-3.5" />, thresholds: [800, 1800], description: 'Time to First Byte' },
  { name: 'inp', label: 'INP', value: null, unit: 'ms', icon: <Clock className="w-3.5 h-3.5" />, thresholds: [200, 500], description: 'Interaction to Next Paint' }]
  );
  const [fps, setFps] = useState(0);
  const [domNodes, setDomNodes] = useState(0);
  const [heapMB, setHeapMB] = useState(0);
  const fpsFrames = useRef<number[]>([]);
  const rafRef = useRef(0);

  // Listen for toggle event from CommandPalette
  useEffect(() => {
    const handler = () => setIsOpen((v) => !v);
    window.addEventListener('toggle-perf-dashboard', handler);
    return () => window.removeEventListener('toggle-perf-dashboard', handler);
  }, []);

  // Collect Web Vitals via PerformanceObserver
  useEffect(() => {
    const updateMetric = (name: string, value: number) => {
      setMetrics((prev) =>
      prev.map((m) => m.name === name ? { ...m, value: Math.round(name === 'cls' ? value * 1000 : value) / (name === 'cls' ? 1000 : 1) } : m)
      );
    };

    // FCP from paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
    if (fcpEntry) updateMetric('fcp', fcpEntry.startTime);

    // TTFB from navigation
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      updateMetric('ttfb', navEntries[0].responseStart - navEntries[0].requestStart);
    }

    // LCP observer
    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) updateMetric('lcp', last.startTime);
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {/* not supported */}

    // CLS observer
    try {
      let clsValue = 0;
      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        updateMetric('cls', clsValue);
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
    } catch {/* not supported */}

    // INP / FID observer
    try {
      const inpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) updateMetric('inp', (last as any).processingStart - last.startTime);
      });
      inpObs.observe({ type: 'event', buffered: true });
    } catch {
      // Fallback to first-input
      try {
        const fidObs = new PerformanceObserver((list) => {
          const entry = list.getEntries()[0];
          if (entry) updateMetric('inp', (entry as any).processingStart - entry.startTime);
        });
        fidObs.observe({ type: 'first-input', buffered: true });
      } catch {/* not supported */}
    }
  }, []);

  // FPS counter & system metrics
  useEffect(() => {
    if (!isOpen) return;

    let lastTime = performance.now();
    function tick(now: number) {
      fpsFrames.current.push(now - lastTime);
      lastTime = now;
      if (fpsFrames.current.length > 60) fpsFrames.current.shift();

      const avgFrame = fpsFrames.current.reduce((a, b) => a + b, 0) / fpsFrames.current.length;
      setFps(Math.round(1000 / avgFrame));

      // DOM nodes
      setDomNodes(document.querySelectorAll('*').length);

      // JS heap
      const perf = performance as any;
      if (perf.memory) {
        setHeapMB(Math.round(perf.memory.usedJSHeapSize / 1024 / 1024));
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isOpen]);

  const overallScore = metrics.filter((m) => m.value !== null).length;
  const overallHealth = metrics.every((m) => m.value === null) ?
  'SCANNING' :
  metrics.filter((m) => m.value !== null).every((m) => m.value! <= m.thresholds[0]) ?
  'NOMINAL' :
  metrics.some((m) => m.value !== null && m.value! > m.thresholds[1]) ?
  'CRITICAL' :
  'CAUTION';

  const healthColor = overallHealth === 'NOMINAL' ? '#22c55e' : overallHealth === 'CAUTION' ? '#eab308' : overallHealth === 'CRITICAL' ? '#ef4444' : 'rgba(255,255,255,0.3)';

  return (
    <>
      {/* Toggle badge — below mobile nav, top-right on desktop */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed top-14 right-3 lg:top-5 lg:right-28 z-[140] flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm
          hover:bg-white/[0.06] transition-all group"


        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title="Performance Dashboard">

        <Gauge className="w-3.5 h-3.5 text-white/30 group-hover:text-white/50 transition-colors" />
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: healthColor }} />
        <span className="text-[8px] font-display tracking-[0.15em] hidden sm:inline" style={{ color: healthColor }}>
          {overallHealth}
        </span>
        {isOpen && <ChevronUp className="w-3 h-3 text-white/50" />}
      </motion.button>

      {/* Dashboard panel */}
      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.4, ease: EXPO_OUT }}
          className="fixed top-[4.5rem] right-3 lg:top-14 lg:right-4 z-[140] w-[calc(100vw-1.5rem)] sm:w-[380px] max-w-[400px] rounded-2xl bg-[#0a0a12]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto">

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${healthColor}, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: healthColor + '15', border: `1px solid ${healthColor}30` }}>
                  <Gauge className="w-3.5 h-3.5" style={{ color: healthColor }} />
                </div>
                <div>
                  <div className="text-[10px] font-display tracking-[0.12em] text-white/50 font-medium">PERFORMANCE TELEMETRY</div>
                  <div className="text-[7px] font-display tracking-[0.15em] text-white/50">REAL-TIME WEB VITALS MONITOR</div>
                </div>
              </div>
              <button
            onClick={() => setIsOpen(false)}
            className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors">

                <X className="w-3 h-3 text-white/30" />
              </button>
            </div>

            {/* Web Vitals grid */}
            <div className="p-3 sm:p-4 space-y-2">
              {metrics.map((m) => {
              const color = getColor(m.value, m.thresholds);
              const status = getLabel(m.value, m.thresholds);
              const pct = m.value !== null ? Math.min(100, m.value / m.thresholds[1] * 100) : 0;

              return (
                <div key={m.name} className="relative rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 sm:p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span style={{ color: color + '80' }}>{m.icon}</span>
                        <span className="text-[10px] font-display tracking-[0.1em] text-white/40">{m.label}</span>
                        <span className="text-[7px] font-mono text-white/50 hidden sm:inline">{m.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-medium" style={{ color }}>
                          {m.value !== null ? m.name === 'cls' ? m.value.toFixed(3) : Math.round(m.value) : '—'}
                          {m.value !== null && m.unit && <span className="text-[8px] text-white/50 ml-0.5">{m.unit}</span>}
                        </span>
                        <span
                      className="text-[6px] font-display tracking-[0.15em] px-1.5 py-0.5 rounded-full"
                      style={{ color, backgroundColor: color + '12', border: `1px solid ${color}20` }}>

                          {status}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: EXPO_OUT }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color + '60' }} />

                    </div>
                  </div>);

            })}
            </div>

            {/* System metrics footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-[14px] font-mono font-bold" style={{ color: fps >= 50 ? '#22c55e' : fps >= 30 ? '#eab308' : '#ef4444' }}>
                      {fps}
                    </div>
                    <div className="text-[6px] font-display tracking-[0.15em] text-white/50">FPS</div>
                  </div>
                  <div className="w-px h-6 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-[14px] font-mono font-bold text-white/40">
                      {domNodes.toLocaleString()}
                    </div>
                    <div className="text-[6px] font-display tracking-[0.15em] text-white/50">DOM NODES</div>
                  </div>
                  {heapMB > 0 &&
                <>
                      <div className="w-px h-6 bg-white/[0.06]" />
                      <div className="text-center">
                        <div className="text-[14px] font-mono font-bold text-white/40">
                          {heapMB}<span className="text-[8px] text-white/50">MB</span>
                        </div>
                        <div className="text-[6px] font-display tracking-[0.15em] text-white/50">JS HEAP</div>
                      </div>
                    </>
                }
                </div>
                <div className="text-right">
                  <div className="text-[7px] font-display tracking-[0.12em] text-white/50">
                    {overallScore}/{metrics.length} VITALS CAPTURED
                  </div>
                  <div className="text-[6px] font-mono text-white/10 mt-0.5">
                    {new Date().toISOString().replace('T', ' ').split('.')[0]} UTC
                  </div>
                </div>
              </div>
            </div>

            {/* Scanlines */}
            <div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.004) 3px, rgba(255,255,255,0.004) 4px)' }} />

          </motion.div>
        }
      </AnimatePresence>
    </>);

}

export default memo(PerformanceDashboard);