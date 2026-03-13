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

export default function AchievementsPanel() {
  const { allWords } = useVocabulary();
  const { totalReviews, masteredCount, cardStates } = useSpacedRepetition(allWords);
  const { streak } = useStreak();
  const { totalXP, level, todayXP } = useXP();
  const { stats: quizStats } = useQuizStats();
  const { getProgressWithContext, unlockedCount, totalCount, checkAndUnlock } =
    useAchievements();

  const [completedLines] = useLocalStorage<Record<string, number[]>>(
    "davar-completed-lines",
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

  // Read league stats from localStorage for league achievements
  const leagueStats = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("davar-league") : null;
      if (!raw) return { tier: "bronze", totalPromotions: 0, bestRank: 0 };
      const data = JSON.parse(raw);
      return {
        tier: data.tier ?? "bronze",
        totalPromotions: data.totalPromotions ?? 0,
        bestRank: data.bestRank ?? 0,
      };
    } catch {
      return { tier: "bronze", totalPromotions: 0, bestRank: 0 };
    }
  }, [totalXP]); // Re-check when XP changes (proxy for league activity)

  // Read garden watering streak from localStorage
  const gardenWaterStreak = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("davar-garden-water-streak") : null;
      if (!raw) return 0;
      const data = JSON.parse(raw);
      return data.streak ?? 0;
    } catch {
      return 0;
    }
  }, [cardStates]); // Re-check when card states change (proxy for watering)

  // Read sentences built count from localStorage
  const sentencesBuilt = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("davar-sentences-built") : null;
      if (!raw) return 0;
      return parseInt(raw, 10) || 0;
    } catch {
      return 0;
    }
  }, [todayXP]); // Re-check when daily XP changes (proxy for sentence activity)

  // Read quest stats from localStorage
  const questStats = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("davar-quest-stats") : null;
      if (!raw) return { questsComplete: 0, questDailyAllComplete: 0, questStreak: 0 };
      const data = JSON.parse(raw);
      return {
        questsComplete: data.questsComplete ?? 0,
        questDailyAllComplete: data.questDailyAllComplete ?? 0,
        questStreak: data.questStreak ?? 0,
      };
    } catch {
      return { questsComplete: 0, questDailyAllComplete: 0, questStreak: 0 };
    }
  }, [todayXP]); // Re-check when daily XP changes (proxy for quest activity)

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
