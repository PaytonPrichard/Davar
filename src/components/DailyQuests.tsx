"use client";

import { useQuests } from "@/hooks/useQuests";
import { useXP } from "@/hooks/useXP";
import { cn } from "@/lib/utils";

export default function DailyQuests() {
  const { quests, allComplete, bonusClaimed, claimBonus } = useQuests();
  const { awardXP } = useXP();

  const handleClaimBonus = () => {
    awardXP("quest_bonus");
    claimBonus();
  };

  if (quests.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <span>{"\uD83C\uDFAF"}</span>
          Daily Quests
        </h3>
        {allComplete && !bonusClaimed && (
          <button
            onClick={handleClaimBonus}
            className="px-3 py-1.5 rounded-lg bg-accent-green/15 text-accent-green text-xs font-semibold border border-accent-green/30 hover:bg-accent-green/25 transition-colors"
          >
            Claim Bonus (+25 XP)
          </button>
        )}
        {bonusClaimed && (
          <span className="text-xs text-accent-green font-medium">
            {"\u2713"} Bonus claimed!
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {quests.map((quest) => {
          const progressPct =
            quest.target > 0
              ? Math.min(100, Math.round((quest.current / quest.target) * 100))
              : 0;

          return (
            <div key={quest.id} className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0",
                  quest.completed
                    ? "bg-accent-green/15"
                    : "bg-bg-secondary"
                )}
              >
                {quest.completed ? "\u2713" : quest.icon}
              </div>

              {/* Title + progress bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium truncate",
                      quest.completed
                        ? "text-accent-green line-through"
                        : "text-text-primary"
                    )}
                  >
                    {quest.title}
                  </span>
                  <span className="text-xs text-text-muted shrink-0 ml-2 tabular-nums">
                    {quest.current}/{quest.target}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      quest.completed ? "bg-accent-green" : "bg-accent"
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
