"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { AchievementState, Achievement } from "@/types";
import { ACHIEVEMENTS } from "@/data/achievements";

export interface AchievementProgress {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  percent: number;
}

interface AchievementContext {
  totalXP: number;
  level: number;
  streak: number;
  wordsMastered: number;
  totalReviews: number;
  passagesComplete: number;
  quizzesComplete: number;
  perfectQuizzes: number;
  dailyXP: number;
}

function evaluateCondition(
  achievement: Achievement,
  ctx: AchievementContext
): { met: boolean; current: number } {
  const { condition } = achievement;
  switch (condition.type) {
    case "total_xp":
      return { met: ctx.totalXP >= condition.threshold, current: ctx.totalXP };
    case "level":
      return { met: ctx.level >= condition.threshold, current: ctx.level };
    case "streak":
      return { met: ctx.streak >= condition.threshold, current: ctx.streak };
    case "words_mastered":
      return { met: ctx.wordsMastered >= condition.threshold, current: ctx.wordsMastered };
    case "total_reviews":
      return { met: ctx.totalReviews >= condition.threshold, current: ctx.totalReviews };
    case "passages_complete":
      return { met: ctx.passagesComplete >= condition.threshold, current: ctx.passagesComplete };
    case "quizzes_complete":
      return { met: ctx.quizzesComplete >= condition.threshold, current: ctx.quizzesComplete };
    case "perfect_quizzes":
      return { met: ctx.perfectQuizzes >= condition.threshold, current: ctx.perfectQuizzes };
    case "daily_xp":
      return { met: ctx.dailyXP >= condition.threshold, current: ctx.dailyXP };
    case "categories_mastered":
      return { met: false, current: 0 };
  }
}

const DEFAULT_STATE: AchievementState = {
  unlockedIds: [],
  unlockedAt: {},
};

export function useAchievements() {
  const [state, setState] = useLocalStorage<AchievementState>(
    "davar-achievements",
    DEFAULT_STATE
  );

  const checkAndUnlock = useCallback(
    (ctx: AchievementContext): string[] => {
      const newlyUnlocked: string[] = [];
      const today = new Date().toISOString().split("T")[0];

      setState((prev) => {
        let changed = false;
        const nextIds = [...prev.unlockedIds];
        const nextAt = { ...prev.unlockedAt };

        for (const achievement of ACHIEVEMENTS) {
          if (prev.unlockedIds.includes(achievement.id)) continue;
          const { met } = evaluateCondition(achievement, ctx);
          if (met) {
            nextIds.push(achievement.id);
            nextAt[achievement.id] = today;
            newlyUnlocked.push(achievement.id);
            changed = true;
          }
        }

        return changed ? { unlockedIds: nextIds, unlockedAt: nextAt } : prev;
      });

      return newlyUnlocked;
    },
    [setState]
  );

  const progress = useMemo((): AchievementProgress[] => {
    return ACHIEVEMENTS.map((a) => {
      const unlocked = state.unlockedIds.includes(a.id);
      return {
        achievement: a,
        unlocked,
        unlockedAt: state.unlockedAt[a.id] ?? null,
        currentValue: 0, // will be filled by caller with context
        percent: unlocked ? 100 : 0,
      };
    });
  }, [state]);

  const getProgressWithContext = useCallback(
    (ctx: AchievementContext): AchievementProgress[] => {
      return ACHIEVEMENTS.map((a) => {
        const unlocked = state.unlockedIds.includes(a.id);
        const { current } = evaluateCondition(a, ctx);
        const threshold = a.condition.threshold;
        return {
          achievement: a,
          unlocked,
          unlockedAt: state.unlockedAt[a.id] ?? null,
          currentValue: current,
          percent: unlocked ? 100 : Math.min(99, Math.round((current / threshold) * 100)),
        };
      });
    },
    [state]
  );

  return {
    state,
    unlockedCount: state.unlockedIds.length,
    totalCount: ACHIEVEMENTS.length,
    checkAndUnlock,
    progress,
    getProgressWithContext,
  };
}
