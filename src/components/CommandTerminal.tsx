import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPO_OUT } from '@/lib/easing';
import { TerminalSquare } from 'lucide-react';
import AsteroidGame from '@/components/AsteroidGame';
import { lazy, Suspense } from 'react';
import { useCinemaMode } from '@/hooks/useCinemaMode';

const BoardingPass = lazy(() => import('@/components/BoardingPass'));

/* ================================================================
   ARES-7 COMMAND TERMINAL

   Press ` or ~ to toggle.

   Commands:
     help                          List commands
     set-theme <name|#hex>         Change primary + accent colour
     reset-theme                   Restore Mars Red default
     status                        System diagnostics
     crew                          Crew manifest
     navigate <section>            Scroll to section
     clear                         Clear history
     exit | close | quit           Dismiss terminal
   ================================================================ */

// ── Types ──
type LineKind = 'input' | 'output' | 'error' | 'success' | 'system' | 'heading';
interface Line {id: number;kind: LineKind;text: string;}
function makeLn(idRef: React.MutableRefObject<number>) {
  return (kind: LineKind, text: string): Line => ({ id: ++idRef.current, kind, text });
}

// ── Theme presets ──
interface ThemePreset {primary: string;accent: string;name: string;}
const THEMES: Record<string, ThemePreset> = {
  red: { primary: '#FF4500', accent: '#ff6b35', name: 'Mars Red' },
  mars: { primary: '#FF4500', accent: '#ff6b35', name: 'Mars Red' },
  blue: { primary: '#2563eb', accent: '#3b82f6', name: 'Ocean Blue' },
  ocean: { primary: '#2563eb', accent: '#3b82f6', name: 'Ocean Blue' },
  green: { primary: '#16a34a', accent: '#22c55e', name: 'Terra Green' },
  terra: { primary: '#16a34a', accent: '#22c55e', name: 'Terra Green' },
  purple: { primary: '#9333ea', accent: '#a855f7', name: 'Nebula Purple' },
  nebula: { primary: '#9333ea', accent: '#a855f7', name: 'Nebula Purple' },
  cyan: { primary: '#0891b2', accent: '#06b6d4', name: 'Ice Cyan' },
  ice: { primary: '#0891b2', accent: '#06b6d4', name: 'Ice Cyan' },
  gold: { primary: '#ca8a04', accent: '#eab308', name: 'Solar Gold' },
  solar: { primary: '#ca8a04', accent: '#eab308', name: 'Solar Gold' },
  pink: { primary: '#db2777', accent: '#ec4899', name: 'Nova Pink' },
  nova: { primary: '#db2777', accent: '#ec4899', name: 'Nova Pink' },
  white: { primary: '#94a3b8', accent: '#cbd5e1', name: 'Starlight' },
  amber: { primary: '#d97706', accent: '#f59e0b', name: 'Amber Alert' }
};

// Validate hex colour
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
function normaliseHex(h: string): string {
  if (h.length === 4) return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  return h;
}

function lighten(hex: string, amt: number): string {
  const n = normaliseHex(hex);
  const r = Math.min(255, parseInt(n.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(n.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(n.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── Apply / reset theme via inline styles on :root ──
function applyTheme(primary: string, accent: string) {
  const s = document.documentElement.style;
  s.setProperty('--color-primary', primary);
  s.setProperty('--color-accent', accent);
  s.setProperty('--color-ring', primary);
  const r = parseInt(normaliseHex(primary).slice(1, 3), 16);
  const g = parseInt(normaliseHex(primary).slice(3, 5), 16);
  const b = parseInt(normaliseHex(primary).slice(5, 7), 16);
  s.setProperty('--color-border', `rgba(${r},${g},${b},0.12)`);
}

function resetTheme() {
  const s = document.documentElement.style;
  ['--color-primary', '--color-accent', '--color-ring', '--color-border'].forEach((p) => s.removeProperty(p));
}

// ── Navigate sections ──
const SECTIONS: Record<string, string> = {
  hero: 'hero', top: 'hero',
  destinations: 'destinations', dest: 'destinations',
  fleet: 'fleet', ships: 'fleet',
  crew: 'crew', roster: 'crew',
  tech: 'techspecs', techspecs: 'techspecs', specs: 'techspecs',
  booking: 'booking', book: 'booking',
  logistics: 'logistics', telemetry: 'logistics'
};

// ── Progress bar helper ──
function bar(pct: number, len = 20): string {
  const filled = Math.round(pct / 100 * len);
  return '\u2588'.repeat(filled) + '\u2591'.repeat(len - filled) + `  ${pct}%`;
}

// ── Boot lines ──
function makeBoot(ln: (kind: LineKind, text: string) => Line): Line[] {
  return [
    ln('system', '[SYS] Initializing ARES-7 secure command interface\u2026'),
    ln('system', '[SYS] Encryption: AES-256-QUANTUM \u00b7 Link: NOMINAL'),
    ln('system', '[SYS] Welcome, Commander. Type \u2018help\u2019 for commands.'),
    ln('system', ''),
  ];
}


// ── Command processor ──
function processCommand(raw: string, ln: (kind: LineKind, text: string) => Line): {lines: Line[];action?: 'clear' | 'close';} {
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [] };
  const lower = trimmed.toLowerCase();
  const [cmd, ...args] = lower.split(/\s+/);
  const arg = args.join(' ');

  // Special
  if (cmd === 'clear') return { lines: [], action: 'clear' };
  if (['exit', 'close', 'quit'].includes(cmd)) return { lines: [], action: 'close' };

  // Help
  if (cmd === 'help') {
    return {
      lines: [
      ln('heading', '\u2500\u2500 AVAILABLE COMMANDS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'),
      ln('output', '  set-theme <name|#hex>   Change accent colour'),
      ln('output', '  reset-theme             Restore default Mars Red'),
      ln('output', '  themes                  List available presets'),
      ln('output', '  status                  System diagnostics'),
      ln('output', '  crew                    Crew manifest'),
      ln('output', '  navigate <section>      Scroll to section'),
      ln('output', '  game                    Asteroid Dodge \ud83c\udfae'),
      ln('output', '  passport                Commander Boarding Pass \ud83c\udfab'),
      ln('output', '  log                     Open Mission Log \ud83d\udcdc'),
      ln('output', '  cinema                  Cinema Mode \ud83c\udfac'),
      ln('output', '  clear                   Clear terminal'),
      ln('output', '  exit                    Close terminal  (or ~)'),
      ln('system', ''),
      ln('system', '  Sections: hero, destinations, fleet, crew,'),
      ln('system', '            techspecs, logistics, booking')]

    };
  }

  // Themes list
  if (cmd === 'themes' || cmd === 'theme-list') {
    const seen = new Set<string>();
    const presetLines: Line[] = [ln('heading', '\u2500\u2500 THEME PRESETS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')];
    for (const [key, t] of Object.entries(THEMES)) {
      if (seen.has(t.name)) continue;
      seen.add(t.name);
      presetLines.push(ln('output', `  ${key.padEnd(8)} ${t.primary}  ${t.name}`));
    }
    presetLines.push(ln('system', ''));
    presetLines.push(ln('system', '  Or use any hex: set-theme #ff00ff'));
    return { lines: presetLines };
  }

  // Set theme
  if (cmd === 'set-theme' || cmd === 'settheme' || cmd === 'theme') {
    if (!arg) return { lines: [ln('error', '  Usage: set-theme <name|#hex>')] };
    // Preset?
    const preset = THEMES[arg];
    if (preset) {
      applyTheme(preset.primary, preset.accent);
      return {
        lines: [
        ln('success', `  \u2713 Theme updated: ${preset.name} (${preset.primary})`),
        ln('system', '    Primary, accent, border & ring tokens applied.')]

      };
    }
    // Custom hex?
    if (HEX_RE.test(arg)) {
      const primary = normaliseHex(arg);
      const accent = lighten(primary, 35);
      applyTheme(primary, accent);
      return {
        lines: [
        ln('success', `  \u2713 Theme updated: Custom (${primary})`),
        ln('system', `    Accent auto-derived: ${accent}`)]

      };
    }
    return { lines: [ln('error', `  Unknown theme '${arg}'. Type 'themes' for presets or use #hex.`)] };
  }

  // Reset theme
  if (cmd === 'reset-theme' || cmd === 'resettheme' || cmd === 'reset') {
    resetTheme();
    return {
      lines: [
      ln('success', '  \u2713 Theme restored to Mars Red (#FF4500)'),
      ln('system', '    All inline overrides removed.')]

    };
  }

  // Status
  if (cmd === 'status' || cmd === 'diagnostics' || cmd === 'diag') {
    return {
      lines: [
      ln('heading', '\u2500\u2500 SYSTEM DIAGNOSTICS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'),
      ln('output', `  REACTOR CORE    ${bar(82)}`),
      ln('output', `  HULL INTEGRITY  ${bar(100)}`),
      ln('output', `  O\u2082 RESERVES    ${bar(74)}`),
      ln('output', `  FUEL LEVEL      ${bar(88)}`),
      ln('output', `  COMMS LINK      ${bar(96)}`),
      ln('output', `  NAV COMPUTER    ${bar(99)}`),
      ln('output', `  LIFE SUPPORT    ${bar(91)}`),
      ln('system', ''),
      ln('success', '  All systems within operational parameters.')]

    };
  }

  // Crew
  if (cmd === 'crew' || cmd === 'roster') {
    return {
      lines: [
      ln('heading', '\u2500\u2500 CREW MANIFEST \u00b7 SOL 247 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'),
      ln('output', '  CDR  KIRA VASQUEZ      Mission Commander   \u25cf NOM'),
      ln('output', '  PLT  MARCUS CHEN       Chief Pilot         \u25cf ACT'),
      ln('output', '  MSE  DR. AISHA OKAFOR  Flight Surgeon      \u25cf NOM'),
      ln('output', '  ENG  TOM\u00c1S REYES      Flight Engineer     \u25cf ACT'),
      ln('output', '  SCI  DR. YUKI TANAKA   Science Officer     \u25cf NOM'),
      ln('output', '  NAV  ALEXEI VOLKOV     Navigation Officer  \u25cf NOM'),
      ln('system', ''),
      ln('system', '  6 active crew \u00b7 All biometrics nominal')]

    };
  }

  // Navigate
  if (cmd === 'navigate' || cmd === 'nav' || cmd === 'goto' || cmd === 'go') {
    if (!arg) return { lines: [ln('error', '  Usage: navigate <section>'), ln('system', '  Sections: hero, destinations, fleet, crew, techspecs, logistics, booking')] };
    const sectionId = SECTIONS[arg];
    if (!sectionId) return { lines: [ln('error', `  Unknown section '${arg}'. Try: hero, destinations, fleet, crew, techspecs, logistics, booking`)] };
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return { lines: [ln('success', `  \u21e2 Scrolling to ${arg.toUpperCase()}\u2026`)] };
    }
    return { lines: [ln('error', `  Section element #${sectionId} not found.`)] };
  }

  // Ping
  if (cmd === 'ping') {
    const ms = Math.round(400 + Math.random() * 600);
    return {
      lines: [
      ln('system', '  PING earth.sol-relay.ares \u2026'),
      ln('output', `  64 bytes from earth.sol-relay.ares: time=${ms}ms`),
      ln('output', `  64 bytes from earth.sol-relay.ares: time=${ms + Math.round(Math.random() * 80 - 40)}ms`),
      ln('system', `  \u2014 Average latency: ${ms}ms (${(ms / 1000 * 299792).toFixed(0)} km light-delay)`)]

    };
  }

  // Game
  if (cmd === 'game' || cmd === 'asteroid' || cmd === 'play') {
    return {
      lines: [
      ln('system', '  [SYS] Loading ASTEROID DODGE tactical simulation\u2026'),
      ln('success', '  \u2713 Simulation ready. Launching\u2026')],

      action: 'game' as any
    };
  }

  // Passport / Boarding pass
  if (cmd === 'passport' || cmd === 'boarding' || cmd === 'pass' || cmd === 'id') {
    return {
      lines: [
        ln('system', '  [SYS] Retrieving Commander credentials\u2026'),
        ln('success', '  \u2713 Boarding pass loaded.'),
      ],
      action: 'passport' as any,
    };
  }

  // Mission log
  if (cmd === 'log' || cmd === 'journal') {
    return {
      lines: [
        ln('system', "  [SYS] Retrieving Captain's Log\u2026"),
        ln('success', '  \u2713 Mission Log displayed.'),
        ln('system', "  Tip: Look for the LOG button on the left side."),
      ],
    };
  }

  // Cinema mode
  if (cmd === 'cinema' || cmd === 'photo' || cmd === 'screenshot' || cmd === 'zen') {
    return {
      lines: [
        ln('system', '  [SYS] Activating Cinema Mode\u2026'),
        ln('success', '  \u2713 All HUD elements hidden. Press P to restore.'),
      ],
      action: 'cinema' as any,
    };
  }

  // Whoami
  if (cmd === 'whoami') {
    return { lines: [ln('output', '  CDR KIRA VASQUEZ \u00b7 CLEARANCE: ALPHA \u00b7 AUTH: BIOMETRIC+QUANTUM')] };
  }

  // Date
  if (cmd === 'date' || cmd === 'time') {
    const now = new Date();
    return {
      lines: [
      ln('output', `  EARTH UTC : ${now.toISOString()}`),
      ln('output', `  MARS SOL  : 247 (estimated)`)]

    };
  }

  // Unknown
  return { lines: [ln('error', `  Command not found: ${cmd}`), ln('system', "  Type 'help' for available commands.")] };
}

// ── Line colour mapping ──
const KIND_STYLE: Record<LineKind, string> = {
  input: 'text-white',
  output: 'text-white/60',
  error: 'text-red-400',
  success: 'text-green-400',
  system: 'text-white/25',
  heading: 'text-primary/60'
};

// ── Component ──
function CommandTerminal() {
  const idRef = useRef(0);
  const ln = makeLn(idRef);
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [gameMode, setGameMode] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const { enable: enableCinema } = useCinemaMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject terminal blink keyframe
  useEffect(() => {
    const STYLE_ID = 'cmd-terminal-style';
    let s = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!s) {
      s = document.createElement('style');
      s.id = STYLE_ID;
      s.textContent = `@keyframes terminal-blink{0%,49%{opacity:.55}50%,100%{opacity:0}}`;
      document.head.appendChild(s);
    }
    return () => {
      s?.remove();
    };
  }, []);

  // Focus trap for accessibility
  useEffect(() => {
    if (!open) return;
    const element = containerRef.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstEl?.focus();
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [open, gameMode]);

  // Game exit handler
  const handleGameExit = useCallback((finalScore: number) => {
    setGameMode(false);
    setLines((prev) => [
    ...prev,
    ln('system', ''),
    ln('heading', '\u2500\u2500 SIMULATION TERMINATED \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'),
    ln('output', `  Final Score: ${finalScore}`),
    ln('output', `  High Score:  ${Number(localStorage.getItem('ares_asteroid_hs') || '0')}`),
    ln('system', '  Type \'game\' to play again.'),
    ln('system', '')]
    );
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  // Global key listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't toggle terminal while in game mode
      if (gameMode) return;
      if (e.key === '`' || e.key === '~') {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (!open && (tag === 'INPUT' || tag === 'TEXTAREA')) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Escape closes
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, gameMode]);

  // Focus + boot
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      if (!bootedRef.current) {
        bootedRef.current = true;
        setLines(makeBoot(ln));
      }
    }
  }, [open]);

  // Scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Submit command
  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const raw = input.trim();
      if (!raw) return;

      const inputLine = ln('input', raw);
      const { lines: out, action } = processCommand(raw, ln);

      if (action === 'clear') {
        setLines([]);
        setInput('');
        return;
      }
      if (action === 'close') {
        setOpen(false);
        setInput('');
        return;
      }
      if ((action as string) === 'game') {
        setLines((prev) => [...prev, inputLine, ...out]);
        setHistory((prev) => [raw, ...prev.slice(0, 50)]);
        setHistIdx(-1);
        setInput('');
        // Slight delay for the "loading" message to show
        setTimeout(() => setGameMode(true), 400);
        return;
      }
      if ((action as string) === 'passport') {
        setLines((prev) => [...prev, inputLine, ...out]);
        setHistory((prev) => [raw, ...prev.slice(0, 50)]);
        setHistIdx(-1);
        setInput('');
        setTimeout(() => setPassportOpen(true), 300);
        return;
      }
      if ((action as string) === 'cinema') {
        setLines((prev) => [...prev, inputLine, ...out]);
        setHistory((prev) => [raw, ...prev.slice(0, 50)]);
        setHistIdx(-1);
        setInput('');
        setTimeout(() => { setOpen(false); enableCinema(); }, 400);
        return;
      }

      setLines((prev) => [...prev, inputLine, ...out]);
      setHistory((prev) => [raw, ...prev.slice(0, 50)]);
      setHistIdx(-1);
      setInput('');
    },
    [input]
  );

  // Arrow keys for history
  const onInputKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistIdx((prev) => {
          const next = Math.min(prev + 1, history.length - 1);
          if (next >= 0 && history[next]) setInput(history[next]);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistIdx((prev) => {
          const next = prev - 1;
          if (next < 0) {
            setInput('');
            return -1;
          }
          if (history[next]) setInput(history[next]);
          return next;
        });
      }
    },
    [history]
  );

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        ref={containerRef}
        className="fixed inset-0 z-[200] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EXPO_OUT }}>

          {/* Backdrop */}
          <div
        className="absolute inset-0"
        style={{ background: 'rgba(2,2,8,0.88)', backdropFilter: 'blur(6px)' }}
        onClick={() => setOpen(false)} />


          {/* Terminal panel */}
          <motion.div
          className="relative mx-auto mt-12 sm:mt-20 w-[95vw] max-w-3xl flex flex-col rounded-xl overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 8rem)',
            background: 'rgba(8,8,18,0.95)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 2px rgba(255,69,0,0.15)'
          }}
          initial={{ y: 40, scale: 0.97 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}>

            {/* Scanlines overlay */}
            <div
          className="absolute inset-0 pointer-events-none z-30 rounded-xl"
          style={{
            backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)'
          }} />


            {/* ── Header bar ── */}
            <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                {/* Window dots */}
                <div className="flex gap-1.5">
                  <button
                onClick={() => setOpen(false)}
                className="w-2.5 h-2.5 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors cursor-pointer"
                aria-label="Close terminal" />

                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="flex items-center gap-2">
                  <TerminalSquare className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[10px] font-display tracking-[0.18em] text-primary/50 font-bold">ARES-7 CMD</span>
                  <span className="text-[8px] font-display tracking-[0.12em] text-white/15">v4.2</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[8px] font-display tracking-[0.12em] text-white/15">ENCRYPTED</span>
                <span className="text-[8px] font-display tracking-[0.1em] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded">
                  ~ close
                </span>
              </div>
            </div>

            {/* ── Scrollable output / Game ── */}
            {gameMode ?
          <div className="relative z-10 flex-1 min-h-0" style={{ minHeight: '300px' }}>
                <AsteroidGame onExit={handleGameExit} />
              </div> :

          <div
          ref={scrollRef}
          className="relative z-10 flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-[1.65] min-h-0"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

              {lines.map((line) =>
            <div key={line.id} className={`whitespace-pre-wrap break-all ${KIND_STYLE[line.kind]}`}>
                  {line.kind === 'input' ?
              <>
                      <span className="text-primary/50 select-none">ares-7 &gt; </span>
                      {line.text}
                    </> :

              line.text
              }
                </div>
            )}
            </div>
          }

            {/* ── Input line ── */}
            {!gameMode &&
          <form onSubmit={submit} className="relative z-10 flex items-center px-4 py-3 border-t border-white/[0.06]">
              <span className="text-primary/50 text-[13px] font-mono select-none mr-2">ares-7 &gt;</span>
              <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKey}
            className="flex-1 bg-transparent text-white text-[13px] font-mono outline-none caret-primary placeholder:text-white/15"
            placeholder="type a command\u2026"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off" />

              {/* Blinking block cursor indicator */}
              <div
            className="w-2 h-4 ml-0.5"
            style={{
              background: 'var(--color-primary)',
              opacity: 0.55,
              animation: 'terminal-blink 1s step-end infinite'
            }} />

            </form>
          }

            {/* ── Status bar ── */}
            <div className="relative z-10 flex items-center justify-between px-4 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${gameMode ? 'bg-yellow-500/60' : 'bg-green-500/60'} animate-pulse`} />
                  <span className="text-[8px] font-display tracking-[0.12em] text-white/20">{gameMode ? 'SIMULATION' : 'CONNECTED'}</span>
                </div>
                <span className="text-[8px] font-display tracking-[0.12em] text-white/12">SOL 247</span>
              </div>
              <span className="text-[8px] font-display tracking-[0.1em] text-white/12">{gameMode ? 'ASTEROID DODGE v1.0' : 'AES-256-QUANTUM'}</span>
            </div>
          </motion.div>

          {/* Hint text below terminal */}
          <div className="relative z-10 text-center mt-4">
            <span className="text-[10px] font-display tracking-[0.15em] text-white/15">
              Press <kbd className="text-primary/40 mx-1">~</kbd> or <kbd className="text-primary/40 mx-1">Esc</kbd> to close
            </span>
          </div>

          {/* Boarding Pass overlay (inside terminal z-context) */}
          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>}>
            <BoardingPass open={passportOpen} onClose={() => setPassportOpen(false)} />
          </Suspense>
        </motion.div>
      }
    </AnimatePresence>);

}

export default memo(CommandTerminal);
