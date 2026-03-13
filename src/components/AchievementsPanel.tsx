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
  const { totalReviews, masteredCount } = useSpacedRepetition(allWords);
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
    }),
    [totalXP, level, streak, masteredCount, totalReviews, passagesComplete, quizStats, todayXP]
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
