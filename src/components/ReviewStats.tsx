"use client";

import { useMemo, memo } from "react";
import { CardState } from "@/types";
import { isWordMastered } from "@/lib/fsrs";
import { cn } from "@/lib/utils";

interface ReviewStatsProps {
  cardStates: Record<string, CardState>;
  totalWordCount: number;
  dueCount: number;
}

export default memo(function ReviewStats({
  cardStates,
  totalWordCount,
  dueCount,
}: ReviewStatsProps) {
  const stats = useMemo(() => {
    const cards = Object.values(cardStates);
    const total = totalWordCount;
    const reviewed = cards.length;

    // Mastered: stability > 21
    const mastered = cards.filter(isWordMastered).length;

    // Learning: has been reviewed but not yet mastered
    const learning = cards.filter((c) => !isWordMastered(c)).length;

    // New: never reviewed
    const newCount = total - reviewed;

    // Due today (passed in from parent)
    const dueToday = dueCount;

    // Retention rate approximation: cards that are in Review state (fsrsState === 2)
    // and have good stability, as a percentage of all reviewed cards
    const goodOrEasyCards = cards.filter(
      (c) => c.stability !== undefined && c.stability > 5
    ).length;
    const retentionRate =
      reviewed > 0 ? Math.round((goodOrEasyCards / reviewed) * 100) : 0;

    // Review forecast: due tomorrow, due this week
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    let dueTomorrow = 0;
    let dueThisWeek = 0;
    for (const c of cards) {
      if (c.nextReview === tomorrowStr) {
        dueTomorrow++;
      }
      if (c.nextReview > tomorrowStr && c.nextReview <= weekEndStr) {
        dueThisWeek++;
      }
    }
    // Include tomorrow in week count
    dueThisWeek += dueTomorrow;

    // Reviews per day for the last 7 days (approximate from lastReview dates)
    const last7Days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = cards.filter((c) => c.lastReview === dateStr).length;
      last7Days.push({ label: dayLabel, count });
    }
    const maxReviews = Math.max(...last7Days.map((d) => d.count), 1);

    return {
      total,
      mastered,
      learning,
      newCount,
      dueToday,
      retentionRate,
      dueTomorrow,
      dueThisWeek,
      last7Days,
      maxReviews,
    };
  }, [cardStates, totalWordCount, dueCount]);

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
        <span>{"📊"}</span>
        SRS Review Statistics
      </h3>

      {/* Main stats grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-5">
        <StatBox label="Total" value={stats.total} color="text-text-primary" />
        <StatBox
          label="Mastered"
          value={stats.mastered}
          color="text-accent-green"
        />
        <StatBox
          label="Learning"
          value={stats.learning}
          color="text-accent-blue"
        />
        <StatBox
          label="New"
          value={stats.newCount}
          color="text-text-muted"
        />
        <StatBox
          label="Due Today"
          value={stats.dueToday}
          color="text-accent-yellow"
        />
      </div>

      {/* Retention rate */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-sm text-text-secondary">Retention Rate</span>
        <span className="text-sm font-semibold text-accent-green">
          {stats.retentionRate}%
        </span>
      </div>
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-accent-green rounded-full transition-all duration-500"
          style={{ width: `${stats.retentionRate}%` }}
        />
      </div>

      {/* Review forecast */}
      <div className="flex items-center gap-4 mb-5 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-yellow" />
          <span className="text-text-secondary">
            <strong className="text-text-primary">{stats.dueTomorrow}</strong>{" "}
            due tomorrow
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-blue" />
          <span className="text-text-secondary">
            <strong className="text-text-primary">{stats.dueThisWeek}</strong>{" "}
            due this week
          </span>
        </div>
      </div>

      {/* Bar chart: Reviews per day, last 7 days */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-text-secondary mb-3">
          Reviews (Last 7 Days)
        </h4>
        <div className="flex items-end gap-2 h-24">
          {stats.last7Days.map((day, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] text-text-muted tabular-nums">
                {day.count > 0 ? day.count : ""}
              </span>
              <div
                className={cn(
                  "w-full rounded-t transition-all duration-500",
                  day.count > 0 ? "bg-accent" : "bg-bg-secondary"
                )}
                style={{
                  height: `${
                    day.count > 0
                      ? Math.max(8, (day.count / stats.maxReviews) * 64)
                      : 4
                  }px`,
                }}
              />
              <span className="text-[10px] text-text-muted">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
})

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-bg-secondary rounded-xl p-3 text-center">
      <div className={cn("text-lg font-bold tabular-nums", color)}>
        {value.toLocaleString()}
      </div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}
