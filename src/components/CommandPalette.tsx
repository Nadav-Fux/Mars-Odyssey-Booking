import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { useCinemaMode } from '@/hooks/useCinemaMode';
import {
  Search, ArrowRight, Rocket, Users, ClipboardList, Globe, Crosshair,
  TerminalSquare, Ticket, Gamepad2, Palette, RotateCcw, Music,
  AlertTriangle, Zap, Command, Moon, CornerDownLeft, Camera, Gauge, Image,
} from
'lucide-react';

/* ================================================================
   COMMAND PALETTE  (Ctrl+K  or  ?)

   Modern spotlight-search style command palette.
   Navigate, run actions, discover shortcuts, search — all from
   one unified interface.
   ================================================================ */

// ── Types ──
interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  category: 'navigate' | 'action' | 'shortcut' | 'easter-egg';
  action: () => void;
  keywords?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  navigate: 'NAVIGATE',
  action: 'ACTIONS',
  shortcut: 'SHORTCUTS',
  'easter-egg': 'SECRETS'
};

interface Props {
  onOpenTerminal?: () => void;
  onOpenBoardingPass?: () => void;
}

function CommandPalette({ onOpenTerminal, onOpenBoardingPass }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { enable: enableCinema } = useCinemaMode();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIdx(0);
  }, []);

  // All palette items
  const items: PaletteItem[] = useMemo(() => [
  // ── Navigate ──
  {
    id: 'nav-home', label: 'Home', hint: 'Landing page',
    icon: <Rocket className="w-4 h-4" />, category: 'navigate',
    action: () => {navigate('/');close();},
    keywords: 'home landing main hero'
  },
  {
    id: 'nav-ship', label: 'The Ship', hint: '/ship',
    icon: <Rocket className="w-4 h-4" />, category: 'navigate',
    action: () => {navigate('/ship');close();},
    keywords: 'ship fleet spacecraft ares'
  },
  {
    id: 'nav-crew', label: 'The Crew', hint: '/crew',
    icon: <Users className="w-4 h-4" />, category: 'navigate',
    action: () => {navigate('/crew');close();},
    keywords: 'crew roster astronaut team'
  },
  {
    id: 'nav-mission', label: 'Mission Info', hint: '/mission',
    icon: <ClipboardList className="w-4 h-4" />, category: 'navigate',
    action: () => {navigate('/mission');close();},
    keywords: 'mission logistics faq weight'
  },
  {
    id: 'nav-explore', label: 'Explore Mars', hint: '/explore',
    icon: <Globe className="w-4 h-4" />, category: 'navigate',
    action: () => {navigate('/explore');close();},
    keywords: 'explore mars globe panorama geology zones'
  },
  {
    id: 'nav-sim', label: 'Landing Simulator', hint: '/simulate',
    icon: <Crosshair className="w-4 h-4" />, category: 'navigate',
    action: () => {navigate('/simulate');close();},
    keywords: 'simulator landing edl parachute touchdown'
  },
  // ── Scroll sections ──
  {
    id: 'scroll-dest', label: 'Go to Destinations', hint: 'Section',
    icon: <ArrowRight className="w-4 h-4" />, category: 'navigate',
    action: () => {close();setTimeout(() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' }), 100);},
    keywords: 'destinations section scroll'
  },
  {
    id: 'scroll-booking', label: 'Go to Booking', hint: 'Section',
    icon: <Ticket className="w-4 h-4" />, category: 'navigate',
    action: () => {close();setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 100);},
    keywords: 'booking book flight ticket section scroll'
  },
  // ── Actions ──
  {
    id: 'act-terminal', label: 'Open Terminal', hint: '~',
    icon: <TerminalSquare className="w-4 h-4" />, category: 'action',
    action: () => {
      close();
      if (onOpenTerminal) {onOpenTerminal();return;}
      // Fallback: simulate key press
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
    },
    keywords: 'terminal console cmd command'
  },
  {
    id: 'act-passport', label: 'Boarding Pass', hint: 'Credentials',
    icon: <Ticket className="w-4 h-4" />, category: 'action',
    action: () => {
      close();
      if (onOpenBoardingPass) {onOpenBoardingPass();return;}
    },
    keywords: 'boarding pass passport id card credentials'
  },
  {
    id: 'act-game', label: 'Asteroid Dodge', hint: 'Ctrl+G',
    icon: <Gamepad2 className="w-4 h-4" />, category: 'action',
    action: () => {
      close();
      setTimeout(() => window.dispatchEvent(new CustomEvent('open-asteroid-game')), 150);
    },
    keywords: 'game asteroid dodge play minigame'
  },
  {
    id: 'act-theme', label: 'Change Theme', hint: 'Terminal → set-theme',
    icon: <Palette className="w-4 h-4" />, category: 'action',
    action: () => {
      close();
      if (onOpenTerminal) onOpenTerminal();else
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));
    },
    keywords: 'theme color colour accent palette'
  },
  {
    id: 'act-reset-theme', label: 'Reset Theme', hint: 'Restore Mars Red',
    icon: <RotateCcw className="w-4 h-4" />, category: 'action',
    action: () => {
      const s = document.documentElement.style;
      ['--color-primary', '--color-accent', '--color-ring', '--color-border'].forEach((p) => s.removeProperty(p));
      close();
    },
    keywords: 'reset theme default mars red restore'
  },
  {
    id: 'act-cinema', label: 'Cinema Mode', hint: 'P',
    icon: <Camera className="w-4 h-4" />, category: 'action',
    action: () => { close(); setTimeout(enableCinema, 200); },
    keywords: 'cinema photo screenshot zen mode hide ui clean',
  },
  {
    id: 'act-gallery', label: 'Mars Gallery', hint: 'Section',
    icon: <Image className="w-4 h-4" />, category: 'action',
    action: () => { close(); setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 100); },
    keywords: 'gallery photos images mars surface reconnaissance pictures carousel',
  },
  {
    id: 'act-perf', label: 'Performance Dashboard', hint: 'Web Vitals',
    icon: <Gauge className="w-4 h-4" />, category: 'action',
    action: () => { close(); setTimeout(() => window.dispatchEvent(new CustomEvent('toggle-perf-dashboard')), 150); },
    keywords: 'performance dashboard vitals fps speed metrics telemetry',
  },
  // ── Shortcuts info ──
  {
    id: 'sc-terminal', label: 'Toggle Terminal', hint: '` or ~',
    icon: <TerminalSquare className="w-4 h-4" />, category: 'shortcut',
    action: () => {close();window.dispatchEvent(new KeyboardEvent('keydown', { key: '`' }));},
    keywords: 'shortcut terminal backtick tilde'
  },
  {
    id: 'sc-palette', label: 'Command Palette', hint: 'Ctrl+K or ?',
    icon: <Command className="w-4 h-4" />, category: 'shortcut',
    action: close,
    keywords: 'shortcut palette search command'
  },
  {
    id: 'sc-cinema', label: 'Cinema Mode', hint: 'P',
    icon: <Camera className="w-4 h-4" />, category: 'shortcut',
    action: () => { close(); setTimeout(enableCinema, 200); },
    keywords: 'shortcut cinema photo screenshot',
  },
  // ── Easter eggs ──
  {
    id: 'ee-konami', label: 'Classified Data', hint: '↑↑↓↓←→←→BA',
    icon: <Zap className="w-4 h-4" />, category: 'easter-egg',
    action: close,
    keywords: 'konami code cheat secret classified'
  },
  {
    id: 'ee-terraformed', label: 'Terraformed Mars', hint: 'Double-click Mars globe',
    icon: <Globe className="w-4 h-4" />, category: 'easter-egg',
    action: close,
    keywords: 'terraformed mars green earth double click easter egg'
  },
  {
    id: 'ee-404', label: 'Signal Lost', hint: 'Visit /anything',
    icon: <AlertTriangle className="w-4 h-4" />, category: 'easter-egg',
    action: () => {navigate('/signal-lost');close();},
    keywords: '404 not found signal lost astronaut easter egg'
  },
  {
    id: 'ee-night', label: 'Stargazer', hint: 'Mars panorama → night mode',
    icon: <Moon className="w-4 h-4" />, category: 'easter-egg',
    action: close,
    keywords: 'night sky stars panorama stargazer moon'
  },
  {
    id: 'ee-audio', label: 'Space Ambience', hint: 'Click 🔊 button',
    icon: <Music className="w-4 h-4" />, category: 'easter-egg',
    action: close,
    keywords: 'audio sound music ambience space'
  }],
  [navigate, close, onOpenTerminal, onOpenBoardingPass]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => {
      const haystack = `${item.label} ${item.hint || ''} ${item.keywords || ''}`.toLowerCase();
      // Simple fuzzy: every query word must appear
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [items, query]);

  // ── Grouped by category ──
  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  // Clamp active index
  useEffect(() => {
    setActiveIdx((prev) => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  // ── Global shortcut ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // ? key (only when not in input/textarea)
      if (e.key === '?' && !open) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setOpen(true);
      }
      // Escape closes
      if (e.key === 'Escape' && open) {
        close();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  // Keyboard navigation
  const onInputKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIdx]) filtered[activeIdx].action();
    }
  }, [filtered, activeIdx]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-[220] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}>

          {/* Backdrop */}
          <div
        className="absolute inset-0"
        style={{ background: 'rgba(2,2,8,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={close} />


          {/* Panel */}
          <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-xl"
          style={{
            background: 'rgba(10,10,22,0.97)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 2px rgba(255,69,0,0.12)'
          }}
          initial={{ y: -20, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: -10, scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2, ease: EXPO_OUT }}>

            {/* Search input */}
            <div className="flex items-center px-4 py-3 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-white/25 flex-shrink-0" />
              <input
            ref={inputRef}
            value={query}
            onChange={(e) => {setQuery(e.target.value);setActiveIdx(0);}}
            onKeyDown={onInputKey}
            className="flex-1 bg-transparent text-sm text-white/90 font-mono ml-3 outline-none placeholder:text-white/50"
            placeholder="Search commands, pages, shortcuts…"
            spellCheck={false}
            autoComplete="off" />

              <kbd className="text-[9px] font-display tracking-[0.1em] text-white/50 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto py-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>

              {filtered.length === 0 &&
            <div className="px-4 py-8 text-center">
                  <div className="text-white/50 text-sm font-mono">No results found</div>
                  <div className="text-white/10 text-xs font-mono mt-1">Try different keywords</div>
                </div>
            }

              {(() => {
              let globalIdx = 0;
              const sections: React.ReactNode[] = [];

              for (const [cat, catItems] of grouped) {
                sections.push(
                  <div key={cat}>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-[8px] font-display tracking-[0.2em] text-white/50">
                          {CATEGORY_LABELS[cat] || cat.toUpperCase()}
                        </span>
                      </div>
                      {catItems.map((item) => {
                      const idx = globalIdx++;
                      const isActive = idx === activeIdx;
                      return (
                        <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => item.action()}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors cursor-pointer ${
                        isActive ?
                        'bg-primary/10 text-white/90' :
                        'text-white/50 hover:bg-white/[0.03]'}`
                        }>

                            <span className={`flex-shrink-0 ${isActive ? 'text-primary/70' : 'text-white/50'}`}>
                              {item.icon}
                            </span>
                            <span className="flex-1 text-sm font-mono truncate">
                              {item.label}
                            </span>
                            {item.hint &&
                          <span className={`text-[10px] font-display tracking-[0.1em] flex-shrink-0 ${
                          isActive ? 'text-primary/40' : 'text-white/50'}`
                          }>
                                {item.hint}
                              </span>
                          }
                            {isActive &&
                          <CornerDownLeft className="w-3 h-3 text-primary/30 flex-shrink-0" />
                          }
                          </button>);

                    })}
                    </div>
                );
              }
              return sections;
            })()}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[8px] font-display tracking-[0.1em] text-white/50">
                  <kbd className="bg-white/[0.04] border border-white/[0.06] px-1 py-0.5 rounded text-[8px]">↑↓</kbd>
                  navigate
                </div>
                <div className="flex items-center gap-1 text-[8px] font-display tracking-[0.1em] text-white/50">
                  <kbd className="bg-white/[0.04] border border-white/[0.06] px-1 py-0.5 rounded text-[8px]">⏎</kbd>
                  select
                </div>
              </div>
              <span className="text-[8px] font-display tracking-[0.12em] text-white/10">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}

export default memo(CommandPalette);