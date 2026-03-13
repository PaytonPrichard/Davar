"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Word, CardState, CATEGORIES } from "@/types";
import { isWordMastered } from "@/lib/fsrs";

/* ── Types ────────────────────────────────────────────── */

export interface PrestigeLevel {
  level: number;      // 0 = not prestiged, 1 = bronze star, 2 = silver, 3 = gold
  xpBonus: number;    // XP earned from prestige
  prestigedAt?: string; // ISO date of last prestige
}

interface PrestigeState {
  categories: Record<string, PrestigeLevel>;
}

const DEFAULT_STATE: PrestigeState = {
  categories: {},
};

/* ── Constants ────────────────────────────────────────── */

export const PRESTIGE_TIERS = [
  { level: 0, label: "Not Prestiged", star: "", color: "", xpReward: 0 },
  { level: 1, label: "Bronze Star", star: "\u2B50", color: "text-amber-600", xpReward: 100 },
  { level: 2, label: "Silver Star", star: "\uD83C\uDF1F", color: "text-slate-300", xpReward: 250 },
  { level: 3, label: "Gold Star", star: "\uD83D\uDCAB", color: "text-yellow-400", xpReward: 500 },
];

const MAX_PRESTIGE = 3;

/* ── Hook ─────────────────────────────────────────────── */

export function usePrestige() {
  const [state, setState, hydrated] = useLocalStorage<PrestigeState>(
    "davar-prestige",
    DEFAULT_STATE
  );

  /** Get prestige level for a category */
  const getPrestige = useCallback(
    (category: string): PrestigeLevel => {
      return state.categories[category] ?? { level: 0, xpBonus: 0 };
    },
    [state.categories]
  );

  /** Check if a category can be prestiged (all words mastered) */
  const canPrestige = useCallback(
    (category: string, words: Word[], cardStates: Record<string, CardState>): boolean => {
      const catWords = words.filter((w) => w.category === category);
      if (catWords.length === 0) return false;

      const currentLevel = getPrestige(category).level;
      if (currentLevel >= MAX_PRESTIGE) return false;

      // All words in category must be mastered
      return catWords.every((w) => {
        const state = cardStates[w.id];
        return state && isWordMastered(state);
      });
    },
    [getPrestige]
  );

  /** Prestige a category — returns XP reward amount */
  const prestigeCategory = useCallback(
    (category: string): number => {
      const current = getPrestige(category);
      if (current.level >= MAX_PRESTIGE) return 0;

      const newLevel = current.level + 1;
      const tier = PRESTIGE_TIERS[newLevel];
      const xpReward = tier.xpReward;

      setState((prev) => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: {
            level: newLevel,
            xpBonus: (current.xpBonus ?? 0) + xpReward,
            prestigedAt: new Date().toISOString(),
          },
        },
      }));

      return xpReward;
    },
    [getPrestige, setState]
  );

  /** Get all category prestige statuses */
  const allPrestige = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      ...getPrestige(cat),
    }));
  }, [getPrestige]);

  const totalPrestigeStars = useMemo(
    () => allPrestige.reduce((sum, p) => sum + p.level, 0),
    [allPrestige]
  );

  return {
    getPrestige,
    canPrestige,
    prestigeCategory,
    allPrestige,
    totalPrestigeStars,
    hydrated,
  };
}
