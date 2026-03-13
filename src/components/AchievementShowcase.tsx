"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { Achievement } from "@/types";
import { cn } from "@/lib/utils";

export default function AchievementShowcase() {
  const { state } = useAchievements();
  const [showcaseIds, setShowcaseIds] = useLocalStorage<string[]>(
    "davar-achievement-showcase",
    []
  );
  const [editing, setEditing] = useState(false);

  // All unlocked achievements, sorted most-recently-unlocked first
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => state.unlockedIds.includes(a.id)).sort(
      (a, b) => {
        const dateA = state.unlockedAt[a.id] ?? "";
        const dateB = state.unlockedAt[b.id] ?? "";
        return dateB.localeCompare(dateA);
      }
    );
  }, [state]);

  // The 3 achievements to display: user picks or most recent
  const displayAchievements = useMemo(() => {
    // If user has valid favorites, use those
    if (showcaseIds.length > 0) {
      const picks = showcaseIds
        .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
        .filter(
          (a): a is Achievement =>
            a !== undefined && state.unlockedIds.includes(a.id)
        );
      if (picks.length > 0) return picks.slice(0, 3);
    }
    // Fallback to 3 most recently unlocked
    return unlockedAchievements.slice(0, 3);
  }, [showcaseIds, unlockedAchievements, state.unlockedIds]);

  // Toggle an achievement in/out of the showcase (max 3)
  const toggleShowcase = useCallback(
    (id: string) => {
      setShowcaseIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= 3) return prev; // already at max
        return [...prev, id];
      });
    },
    [setShowcaseIds]
  );

  // Close modal on Escape
  useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editing]);

  if (unlockedAchievements.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3 text-center">
          Achievement Showcase
        </h3>
        <p className="text-xs text-text-muted text-center">
          Unlock achievements to showcase them here!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Showcase
          </h3>
          {unlockedAchievements.length > 3 && (
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {/* 3 badge circles in a row */}
        <div className="flex items-center justify-center gap-4">
          {displayAchievements.map((a) => (
            <div
              key={a.id}
              className="flex flex-col items-center gap-1 min-w-0"
            >
              <div className="w-14 h-14 rounded-full bg-accent-yellow/10 border-2 border-accent-yellow/30 flex items-center justify-center">
                <span className="text-2xl">{a.icon}</span>
              </div>
              <span className="text-[10px] font-medium text-text-primary text-center leading-tight truncate max-w-[72px]">
                {a.title}
              </span>
            </div>
          ))}
          {/* Empty slots if fewer than 3 */}
          {Array.from({ length: Math.max(0, 3 - displayAchievements.length) }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-14 h-14 rounded-full bg-bg-secondary border-2 border-border border-dashed flex items-center justify-center">
                  <span className="text-lg text-text-muted">?</span>
                </div>
                <span className="text-[10px] text-text-muted">Locked</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setEditing(false)}
        >
          <div
            className="bg-bg-card rounded-2xl border border-border p-6 w-full max-w-sm mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">
                Choose Showcase (up to 3)
              </h3>
              <button
                onClick={() => setEditing(false)}
                className="text-text-muted hover:text-text-primary text-lg leading-none"
              >
                {"✕"}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-2">
              {unlockedAchievements.map((a) => {
                const selected = showcaseIds.includes(a.id);
                const atMax = showcaseIds.length >= 3 && !selected;

                return (
                  <button
                    key={a.id}
                    onClick={() => !atMax && toggleShowcase(a.id)}
                    disabled={atMax}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                      selected
                        ? "border-accent-yellow/50 bg-accent-yellow/10"
                        : atMax
                          ? "border-border bg-bg-secondary opacity-40 cursor-not-allowed"
                          : "border-border bg-bg-secondary hover:bg-bg-card-hover"
                    )}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">
                        {a.title}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {a.description}
                      </div>
                    </div>
                    {selected && (
                      <span className="text-accent-yellow text-sm">
                        {"✓"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setEditing(false)}
              className="mt-4 w-full py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
