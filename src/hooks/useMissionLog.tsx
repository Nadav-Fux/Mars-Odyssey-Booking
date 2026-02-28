import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

/* ================================================================
   MISSION LOG  —  Captain's Journal

   Automatically records timestamped log entries as the user
   explores the site.  Entries persist in localStorage.

   Call `log(icon, text)` from anywhere to write an entry.
   Pre-built helpers: logNav, logAchievement, logEvent.
   ================================================================ */

export interface LogEntry {
  id: number;
  ts: number;          // Date.now()
  sol: number;         // "Sol" day (relative to first visit)
  met: string;         // HH:MM formatted mission elapsed time
  icon: string;        // Emoji
  text: string;
}

const STORAGE_KEY = 'ares-mission-log';
const FIRST_VISIT_KEY = 'ares_first_visit'; // shared with BoardingPass
const MAX_ENTRIES = 80;

// ── Helpers ──
function getFirstVisit(): number {
  const stored = localStorage.getItem(FIRST_VISIT_KEY);
  if (stored) return new Date(stored).getTime();
  const now = Date.now();
  localStorage.setItem(FIRST_VISIT_KEY, new Date(now).toISOString());
  return now;
}

function calcSol(firstVisit: number, now: number): number {
  return Math.floor((now - firstVisit) / 86_400_000) + 1;
}

function calcMET(firstVisit: number, now: number): string {
  const diff = now - firstVisit;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Context ──
interface MissionLogContextValue {
  entries: LogEntry[];
  log: (icon: string, text: string) => void;
  logNav: (pageName: string) => void;
  logAchievement: (title: string, icon: string) => void;
  logEvent: (text: string) => void;
  clearLog: () => void;
  unreadCount: number;
  markRead: () => void;
}

const MissionLogContext = createContext<MissionLogContextValue | null>(null);

let _nextId = 0;

export function MissionLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: LogEntry[] = stored ? JSON.parse(stored) : [];
      // Restore _nextId
      if (parsed.length > 0) _nextId = Math.max(...parsed.map(e => e.id)) + 1;
      return parsed;
    } catch {
      return [];
    }
  });

  const [lastReadCount, setLastReadCount] = useState(() => {
    try {
      return Number(localStorage.getItem('ares-log-read') || '0');
    } catch { return 0; }
  });

  const firstVisit = getFirstVisit();

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Deduplicate helper: don't write identical text within 5s
  const recentTexts = useState<Set<string>>(() => new Set())[0];

  const log = useCallback((icon: string, text: string) => {
    // Dedup
    const key = `${icon}:${text}`;
    if (recentTexts.has(key)) return;
    recentTexts.add(key);
    setTimeout(() => recentTexts.delete(key), 5000);

    const now = Date.now();
    const entry: LogEntry = {
      id: _nextId++,
      ts: now,
      sol: calcSol(firstVisit, now),
      met: calcMET(firstVisit, now),
      icon,
      text,
    };
    setEntries(prev => {
      const next = [...prev, entry];
      return next.length > MAX_ENTRIES ? next.slice(-MAX_ENTRIES) : next;
    });
  }, [firstVisit, recentTexts]);

  const logNav = useCallback((pageName: string) => {
    log('🧭', `Navigated to ${pageName}`);
  }, [log]);

  const logAchievement = useCallback((title: string, icon: string) => {
    log('🏆', `Achievement unlocked: ${icon} ${title}`);
  }, [log]);

  const logEvent = useCallback((text: string) => {
    log('📡', text);
  }, [log]);

  const clearLog = useCallback(() => {
    setEntries([]);
    _nextId = 0;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = Math.max(0, entries.length - lastReadCount);

  const markRead = useCallback(() => {
    setLastReadCount(entries.length);
    localStorage.setItem('ares-log-read', String(entries.length));
  }, [entries.length]);

  // Auto-log first visit (only once ever)
  useEffect(() => {
    if (entries.length === 0) {
      log('🚀', 'First contact established. Systems online.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MissionLogContext.Provider
      value={{ entries, log, logNav, logAchievement, logEvent, clearLog, unreadCount, markRead }}
    >
      {children}
    </MissionLogContext.Provider>
  );
}

export function useMissionLog() {
  const ctx = useContext(MissionLogContext);
  if (!ctx) throw new Error('useMissionLog must be used within MissionLogProvider');
  return ctx;
}
