import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

/* ================================================================
   ACHIEVEMENT SYSTEM

   Tracks user discoveries and interactions across the site.
   Unlocked achievements persist in localStorage.

   Each achievement has:
     - id: unique slug
     - title: display name
     - description: how to unlock
     - icon: emoji
     - secret: if true, hidden until unlocked
   ================================================================ */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_visit', title: 'First Contact', description: 'Visit the ARES-X site', icon: '🚀' },
  { id: 'explorer', title: 'Deep Space Explorer', description: 'Visit all 6 pages', icon: '🌌' },
  { id: 'terraformed', title: 'Planet Engineer', description: 'Discover terraformed Mars', icon: '🌍', secret: true },
  { id: 'konami', title: 'Classified Access', description: 'Enter the Konami Code', icon: '🔓', secret: true },
  { id: 'crew_chat', title: 'Mars Pen Pal', description: 'Chat with a crew member', icon: '💬' },
  { id: 'simulator', title: 'Touchdown', description: 'Complete the landing simulator', icon: '🎯' },
  { id: 'booking', title: 'Ticket to Mars', description: 'Open the booking panel', icon: '🎟️' },
  { id: 'signal_lost', title: 'Signal Lost', description: 'Find the 404 page', icon: '📡', secret: true },
  { id: 'night_sky', title: 'Stargazer', description: 'View Mars panorama at night', icon: '🌙' },
  { id: 'all_crew', title: 'Roll Call', description: 'Chat with all 4 crew members', icon: '👨‍🚀', secret: true },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Score 100+ in Asteroid Dodge', icon: '☄️', secret: true },
  { id: 'cartographer', title: 'Mars Cartographer', description: 'View all gallery images', icon: '🗺️' },
];

const STORAGE_KEY = 'ares-x-achievements';

interface AchievementContextValue {
  unlocked: Set<string>;
  unlock: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  totalUnlocked: number;
  totalAchievements: number;
  /** The most recently unlocked achievement (for toast) */
  lastUnlocked: Achievement | null;
  clearLastUnlocked: () => void;
}

const AchievementContext = createContext<AchievementContextValue | null>(null);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [lastUnlocked, setLastUnlocked] = useState<Achievement | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  }, [unlocked]);

  const unlock = useCallback((id: string) => {
    setUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) setLastUnlocked(achievement);
      return next;
    });
  }, []);

  const isUnlocked = useCallback((id: string) => unlocked.has(id), [unlocked]);
  const clearLastUnlocked = useCallback(() => setLastUnlocked(null), []);

  // Auto-unlock first_visit
  useEffect(() => {
    unlock('first_visit');
  }, [unlock]);

  return (
    <AchievementContext.Provider
      value={{
        unlocked,
        unlock,
        isUnlocked,
        totalUnlocked: unlocked.size,
        totalAchievements: ACHIEVEMENTS.length,
        lastUnlocked,
        clearLastUnlocked,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievements must be used within AchievementProvider');
  return ctx;
}
