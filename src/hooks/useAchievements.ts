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
  // League fields
  leaguePromotions?: number;
  leagueTier?: string; // "bronze" | "silver" | "gold" | "diamond"
  leagueBestRank?: number;
  // Garden fields
  gardenBlooms?: number;
  gardenWaterStreak?: number;
  // Quest fields
  questsComplete?: number;
  questDailyAllComplete?: number;
  questStreak?: number;
  // Sentence Builder fields
  sentencesBuilt?: number;
}

const TIER_ORDER: Record<string, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  diamond: 4,
};

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
    // League achievements
    case "league_promotion": {
      const val = ctx.leaguePromotions ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
    case "league_tier": {
      const currentTierNum = TIER_ORDER[ctx.leagueTier ?? "bronze"] ?? 0;
      const targetTierNum = TIER_ORDER[condition.threshold] ?? 0;
      return { met: currentTierNum >= targetTierNum, current: currentTierNum };
    }
    case "league_rank": {
      const bestRank = ctx.leagueBestRank ?? 0;
      // rank 1 is best, so met when bestRank <= threshold and bestRank > 0
      return { met: bestRank > 0 && bestRank <= condition.threshold, current: bestRank > 0 ? bestRank : 0 };
    }
    // Garden achievements
    case "garden_blooms": {
      const val = ctx.gardenBlooms ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
    case "garden_water_streak": {
      const val = ctx.gardenWaterStreak ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
    // Quest achievements
    case "quests_complete": {
      const val = ctx.questsComplete ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
    case "quest_daily_all": {
      const val = ctx.questDailyAllComplete ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
    case "quest_streak": {
      const val = ctx.questStreak ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
    // Sentence Builder achievements
    case "sentences_built": {
      const val = ctx.sentencesBuilt ?? 0;
      return { met: val >= condition.threshold, current: val };
    }
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
        const { met, current } = evaluateCondition(a, ctx);
        const threshold = a.condition.threshold;
        const numericThreshold = typeof threshold === "number" ? threshold : 1;
        return {
          achievement: a,
          unlocked,
          unlockedAt: state.unlockedAt[a.id] ?? null,
          currentValue: current,
          percent: unlocked || met ? 100 : Math.min(99, Math.round((current / numericThreshold) * 100)),
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
