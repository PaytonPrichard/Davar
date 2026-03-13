"use client";

import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface DailyGoalsProps {
  reviewsDone: number;
  linesCompleted: number;
  quizzesTaken: number;
}

interface GoalTargets {
  reviewTarget: number;
  lineTarget: number;
  quizTarget: number;
}

const DEFAULT_TARGETS: GoalTargets = {
  reviewTarget: 20,
  lineTarget: 5,
  quizTarget: 1,
};

export default function DailyGoals({
  reviewsDone,
  linesCompleted,
  quizzesTaken,
}: DailyGoalsProps) {
  const [targets, setTargets] = useLocalStorage<GoalTargets>(
    "davar-daily-goals",
    DEFAULT_TARGETS
  );
  const [showConfig, setShowConfig] = useState(false);
  const [draft, setDraft] = useState(targets);

  const goals = useMemo(
    () => [
      {
        label: "Reviews",
        current: reviewsDone,
        target: targets.reviewTarget,
        icon: "\uD83D\uDCC4",
      },
      {
        label: "Lines read",
        current: linesCompleted,
        target: targets.lineTarget,
        icon: "\uD83D\uDCD6",
      },
      {
        label: "Quizzes",
        current: quizzesTaken,
        target: targets.quizTarget,
        icon: "\u26A1",
      },
    ],
    [reviewsDone, linesCompleted, quizzesTaken, targets]
  );

  const completedCount = goals.filter((g) => g.current >= g.target).length;
  const allComplete = completedCount === goals.length;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Daily Goals
        </h3>
        <button
          onClick={() => {
            setDraft(targets);
            setShowConfig((v) => !v);
          }}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {showConfig ? "Done" : "Configure"}
        </button>
      </div>

      {showConfig ? (
        <div className="flex flex-col gap-3">
          {[
            { key: "reviewTarget" as const, label: "Daily reviews" },
            { key: "lineTarget" as const, label: "Lines to read" },
            { key: "quizTarget" as const, label: "Quizzes to take" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{label}</span>
              <input
                type="number"
                min={1}
                max={999}
                value={draft[key]}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    [key]: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-20 px-2 py-1 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary text-center"
              />
            </div>
          ))}
          <button
            onClick={() => {
              setTargets(draft);
              setShowConfig(false);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors self-end"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          {/* Completion ring */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke={allComplete ? "var(--accent-green)" : "var(--accent)"}
                  strokeWidth="3"
                  strokeDasharray={`${(completedCount / goals.length) * 97.4} 97.4`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-primary">
                {completedCount}/{goals.length}
              </span>
            </div>
            <div className="flex-1">
              {allComplete ? (
                <p className="text-accent-green font-medium text-sm">
                  All goals complete! Great work!
                </p>
              ) : (
                <p className="text-text-secondary text-sm">
                  {completedCount} of {goals.length} goals met today
                </p>
              )}
            </div>
          </div>

          {/* Goal rows */}
          <div className="flex flex-col gap-2">
            {goals.map((g) => {
              const done = g.current >= g.target;
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={g.label} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors",
                      done
                        ? "border-accent-green bg-accent-green/20 text-accent-green"
                        : "border-border text-text-muted"
                    )}
                  >
                    {done ? "\u2713" : ""}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span
                        className={
                          done ? "text-accent-green" : "text-text-secondary"
                        }
                      >
                        <span>{g.icon}</span>{" "}
                        {g.label}
                      </span>
                      <span className="text-text-muted text-xs">
                        {g.current}/{g.target}
                      </span>
                    </div>
                    <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          done ? "bg-accent-green" : "bg-accent"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
