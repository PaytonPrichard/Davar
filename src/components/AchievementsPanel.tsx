"use client";

import { useMemo } from "react";
import { useAchievements, AchievementProgress } from "@/hooks/useAchievements";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import { useQuizStats } from "@/hooks/useQuizStats";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PASSAGES } from "@/data/passages";
import { cn } from "@/lib/utils";
import { SK_LEAGUE, SK_GARDEN_WATER_STREAK, SK_SENTENCES_BUILT, SK_QUEST_STATS, SK_COMPLETED_LINES } from "@/lib/storage-keys";

export default function AchievementsPanel() {
  const { allWords } = useVocabulary();
  const { totalReviews, masteredCount, cardStates } = useSpacedRepetition(allWords);
  const { streak } = useStreak();
  const { totalXP, level, todayXP } = useXP();
  const { stats: quizStats } = useQuizStats();
  const { getProgressWithContext, unlockedCount, totalCount, checkAndUnlock } =
    useAchievements();

  const [completedLines] = useLocalStorage<Record<string, number[]>>(
    SK_COMPLETED_LINES,
    {}
  );

  const passagesComplete = useMemo(() => {
    return PASSAGES.filter(
      (p) => (completedLines[p.id] ?? []).length >= p.lines.length
    ).length;
  }, [completedLines]);

  // Count bloomed plants (stability >= 21) for garden achievements
  const gardenBlooms = useMemo(() => {
    return Object.values(cardStates).filter((s) => {
      const stability = s.stability ?? s.interval;
      return stability >= 21;
    }).length;
  }, [cardStates]);

  // Use useLocalStorage so these update reactively when any tab writes to them
  const [leagueRaw] = useLocalStorage<Record<string, unknown>>(SK_LEAGUE, {});
  const leagueStats = useMemo(() => ({
    tier: (leagueRaw.tier as string) ?? "bronze",
    totalPromotions: (leagueRaw.totalPromotions as number) ?? 0,
    bestRank: (leagueRaw.bestRank as number) ?? 0,
  }), [leagueRaw]);

  const [waterStreakRaw] = useLocalStorage<{ streak?: number }>(SK_GARDEN_WATER_STREAK, {});
  const gardenWaterStreak = waterStreakRaw.streak ?? 0;

  const [sentencesBuiltRaw] = useLocalStorage<number>(SK_SENTENCES_BUILT, 0);
  const sentencesBuilt = sentencesBuiltRaw ?? 0;

  const [questStatsRaw] = useLocalStorage<Record<string, number>>(SK_QUEST_STATS, {});
  const questStats = useMemo(() => ({
    questsComplete: questStatsRaw.questsComplete ?? 0,
    questDailyAllComplete: questStatsRaw.questDailyAllComplete ?? 0,
    questStreak: questStatsRaw.questStreak ?? 0,
  }), [questStatsRaw]);

  const ctx = useMemo(
    () => ({
      totalXP,
      level,
      streak: streak.current,
      wordsMastered: masteredCount,
      totalReviews,
      passagesComplete,
      quizzesComplete: quizStats.quizzesTaken,
      perfectQuizzes: quizStats.perfectQuizzes ?? 0,  // backward compatible
      dailyXP: todayXP,
      // League context
      leaguePromotions: leagueStats.totalPromotions,
      leagueTier: leagueStats.tier,
      leagueBestRank: leagueStats.bestRank,
      // Garden context
      gardenBlooms,
      gardenWaterStreak,
      // Quest context
      questsComplete: questStats.questsComplete,
      questDailyAllComplete: questStats.questDailyAllComplete,
      questStreak: questStats.questStreak,
      // Sentence Builder context
      sentencesBuilt,
    }),
    [totalXP, level, streak, masteredCount, totalReviews, passagesComplete, quizStats, todayXP, leagueStats, gardenBlooms, gardenWaterStreak, questStats, sentencesBuilt]
  );

  // Check for new unlocks on each render
  useMemo(() => {
    checkAndUnlock(ctx);
  }, [ctx, checkAndUnlock]);

  const achievements = getProgressWithContext(ctx);

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
        <span>{"🏆"}</span>
        Achievements
        <span className="text-xs text-text-muted font-normal ml-auto">
          {unlockedCount}/{totalCount}
        </span>
      </h3>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {unlocked.map((a) => (
            <AchievementCard key={a.achievement.id} item={a} />
          ))}
        </div>
      )}

      {/* Next up — locked sorted by closest to completion */}
      {locked.length > 0 && (
        <>
          <h4 className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
            Next Up
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locked
              .sort((a, b) => b.percent - a.percent)
              .slice(0, 6)
              .map((a) => (
                <AchievementCard key={a.achievement.id} item={a} />
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function AchievementCard({ item }: { item: AchievementProgress }) {
  const { achievement, unlocked, percent } = item;

  return (
    <div
      className={cn(
        "rounded-xl border p-3 flex flex-col items-center text-center gap-1 transition-colors",
        unlocked
          ? "border-accent-yellow/30 bg-accent-yellow/5"
          : "border-border bg-bg-secondary opacity-60"
      )}
    >
      <span className={cn("text-2xl", !unlocked && "grayscale")}>
        {achievement.icon}
      </span>
      <span className="text-xs font-semibold text-text-primary leading-tight">
        {achievement.title}
      </span>
      <span className="text-[10px] text-text-muted leading-tight">
        {achievement.description}
      </span>
      {!unlocked && (
        <div className="w-full mt-1">
          <div className="h-1 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-yellow/50 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[9px] text-text-muted">{percent}%</span>
        </div>
      )}
    </div>
  );
}
