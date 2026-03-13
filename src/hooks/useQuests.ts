"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getToday } from "@/lib/utils";
import { SK_QUEST_STATS, SK_QUESTS, SK_QUESTS_UPDATED } from "@/lib/storage-keys";

/* ── Types ────────────────────────────────────────────── */

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface UseQuestsReturn {
  quests: Quest[];
  allComplete: boolean;
  bonusClaimed: boolean;
  trackQuest: (questId: string, amount?: number) => void;
  claimBonus: () => void;
}

interface QuestsStorage {
  date: string;
  quests: Quest[];
  bonusClaimed: boolean;
}

/* ── Quest pool ───────────────────────────────────────── */

interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
}

const QUEST_POOL: QuestTemplate[] = [
  {
    id: "earn-xp",
    title: "Earn 100 XP today",
    description: "Earn 100 XP from any activities",
    icon: "\u26A1",
    target: 100,
  },
  {
    id: "water-plants",
    title: "Water 3 plants in your garden",
    description: "Water wilting plants in the Vocabulary Garden",
    icon: "\uD83D\uDCA7",
    target: 3,
  },
  {
    id: "daily-challenge",
    title: "Complete the Daily Challenge",
    description: "Finish today's Daily Challenge",
    icon: "\u2728",
    target: 1,
  },
  {
    id: "review-flashcards",
    title: "Review 15 flashcards",
    description: "Review flashcards in any category",
    icon: "\uD83C\uDFB4",
    target: 15,
  },
  {
    id: "read-passage",
    title: "Read 1 passage",
    description: "Complete all lines in a reading passage",
    icon: "\uD83D\uDCD6",
    target: 1,
  },
  {
    id: "quiz-streak",
    title: "Get a 5-card streak in Quiz",
    description: "Answer 5 questions correctly in a row",
    icon: "\uD83D\uDD25",
    target: 1,
  },
  {
    id: "master-word",
    title: "Master a new word",
    description: "Bring a word to mastered status",
    icon: "\u2B50",
    target: 1,
  },
  {
    id: "matching-game",
    title: "Complete a matching game",
    description: "Finish a round of the matching game",
    icon: "\uD83E\uDDE9",
    target: 1,
  },
];

/* ── Seeded RNG (deterministic per date) ─────────────── */

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) | 0;
    return ((hash >>> 16) & 0x7fff) / 0x7fff;
  };
}

function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* ── Pick 3 quests for a given date ───────────────────── */

function pickQuestsForDate(date: string): Quest[] {
  const rng = seededRandom(`davar-quests-${date}`);
  const shuffled = seededShuffle(QUEST_POOL, rng);
  return shuffled.slice(0, 3).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    icon: t.icon,
    target: t.target,
    current: 0,
    completed: false,
  }));
}

/* ── Quest stats for achievements ─────────────────────── */

const QUEST_STATS_KEY = SK_QUEST_STATS;

interface QuestStats {
  questsComplete: number;
  questDailyAllComplete: number;
  questStreak: number;
  lastAllCompleteDate: string;
}

function readQuestStats(): QuestStats {
  if (typeof window === "undefined") return { questsComplete: 0, questDailyAllComplete: 0, questStreak: 0, lastAllCompleteDate: "" };
  try {
    const raw = localStorage.getItem(QUEST_STATS_KEY);
    if (!raw) return { questsComplete: 0, questDailyAllComplete: 0, questStreak: 0, lastAllCompleteDate: "" };
    return JSON.parse(raw) as QuestStats;
  } catch {
    return { questsComplete: 0, questDailyAllComplete: 0, questStreak: 0, lastAllCompleteDate: "" };
  }
}

function writeQuestStats(stats: QuestStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEST_STATS_KEY, JSON.stringify(stats));
  } catch {
    // localStorage unavailable
  }
}

function recordQuestComplete(): void {
  const stats = readQuestStats();
  stats.questsComplete += 1;
  writeQuestStats(stats);
}

function recordQuestDailyAllComplete(): void {
  const stats = readQuestStats();
  const today = getToday();

  if (stats.lastAllCompleteDate === today) return; // Already recorded today

  stats.questDailyAllComplete += 1;

  // Update quest streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  stats.questStreak = stats.lastAllCompleteDate === yesterdayStr
    ? stats.questStreak + 1
    : 1;

  stats.lastAllCompleteDate = today;
  writeQuestStats(stats);
}

/* ── Standalone tracking function ─────────────────────── */

const STORAGE_KEY = SK_QUESTS;

function readStorage(): QuestsStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuestsStorage;
  } catch {
    return null;
  }
}

function writeStorage(data: QuestsStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function ensureTodayStorage(): QuestsStorage {
  const today = getToday();
  const stored = readStorage();
  if (stored && stored.date === today) return stored;

  const fresh: QuestsStorage = {
    date: today,
    quests: pickQuestsForDate(today),
    bonusClaimed: false,
  };
  writeStorage(fresh);
  return fresh;
}

/**
 * Standalone function any component can import to track quest progress.
 * Directly mutates localStorage so the useQuests hook picks up changes
 * on its next re-render.
 */
export function trackQuest(questId: string, amount = 1): void {
  const data = ensureTodayStorage();
  const quest = data.quests.find((q) => q.id === questId);
  if (!quest || quest.completed) return;

  quest.current = Math.min(quest.target, quest.current + amount);
  const justCompleted = !quest.completed && quest.current >= quest.target;
  quest.completed = quest.current >= quest.target;
  writeStorage(data);

  // Track quest completion stats for achievements
  if (justCompleted) {
    recordQuestComplete();
    // Check if all quests are now complete
    if (data.quests.every((q) => q.completed)) {
      recordQuestDailyAllComplete();
    }
  }

  // Dispatch a custom event so the hook re-reads
  window.dispatchEvent(new Event(SK_QUESTS_UPDATED));
}

/* ── Default state ────────────────────────────────────── */

const DEFAULT_STORAGE: QuestsStorage = {
  date: "",
  quests: [],
  bonusClaimed: false,
};

/* ── Hook ─────────────────────────────────────────────── */

export function useQuests(): UseQuestsReturn {
  const [stored, setStored] = useLocalStorage<QuestsStorage>(
    STORAGE_KEY,
    DEFAULT_STORAGE
  );

  const today = getToday();

  // If stored date is stale, compute fresh quests for today
  const data = useMemo((): QuestsStorage => {
    if (stored.date === today) return stored;
    return {
      date: today,
      quests: pickQuestsForDate(today),
      bonusClaimed: false,
    };
  }, [stored, today]);

  // Persist fresh data when the date has rolled over
  useEffect(() => {
    if (stored.date !== today) {
      setStored(data);
    }
  }, [stored.date, today, data, setStored]);

  // Listen for trackQuest updates from other components
  useEffect(() => {
    const handler = () => {
      const fresh = readStorage();
      if (fresh && fresh.date === today) {
        setStored(fresh);
      }
    };
    window.addEventListener(SK_QUESTS_UPDATED, handler);
    return () => window.removeEventListener(SK_QUESTS_UPDATED, handler);
  }, [today, setStored]);

  const quests = data.quests;
  const allComplete = quests.length > 0 && quests.every((q) => q.completed);
  const bonusClaimed = data.bonusClaimed;

  const trackQuestHook = useCallback(
    (questId: string, amount = 1) => {
      setStored((prev) => {
        const current =
          prev.date === today
            ? prev
            : {
                date: today,
                quests: pickQuestsForDate(today),
                bonusClaimed: false,
              };

        const updatedQuests = current.quests.map((q) => {
          if (q.id !== questId || q.completed) return q;
          const newCurrent = Math.min(q.target, q.current + amount);
          const justCompleted = newCurrent >= q.target;
          if (justCompleted) {
            recordQuestComplete();
          }
          return {
            ...q,
            current: newCurrent,
            completed: justCompleted,
          };
        });

        // Check if all quests are now complete
        if (updatedQuests.every((q) => q.completed) && !current.quests.every((q) => q.completed)) {
          recordQuestDailyAllComplete();
        }

        return { ...current, quests: updatedQuests };
      });
    },
    [setStored, today]
  );

  const claimBonus = useCallback(() => {
    setStored((prev) => {
      if (prev.bonusClaimed) return prev;
      return { ...prev, bonusClaimed: true };
    });
  }, [setStored]);

  return {
    quests,
    allComplete,
    bonusClaimed,
    trackQuest: trackQuestHook,
    claimBonus,
  };
}
