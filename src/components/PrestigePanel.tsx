"use client";

import { useState, useCallback } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useXP } from "@/hooks/useXP";
import { usePrestige, PRESTIGE_TIERS } from "@/hooks/usePrestige";
import { isWordMastered } from "@/lib/fsrs";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

export default function PrestigePanel() {
  const { allWords } = useVocabulary();
  const { cardStates } = useSpacedRepetition(allWords);
  const { awardXP } = useXP();
  const { getPrestige, canPrestige, prestigeCategory, totalPrestigeStars } =
    usePrestige();
  const [justPrestiged, setJustPrestiged] = useState<string | null>(null);

  const handlePrestige = useCallback(
    (category: string) => {
      const xp = prestigeCategory(category);
      if (xp > 0) {
        // Award XP (use passage_complete as a large XP event)
        awardXP("passage_complete"); // 50 XP base
        setJustPrestiged(category);
        setTimeout(() => setJustPrestiged(null), 3000);
      }
    },
    [prestigeCategory, awardXP]
  );

  const categories = CATEGORIES.map((cat) => {
    const catWords = allWords.filter((w) => w.category === cat);
    const catMastered = catWords.filter((w) => isWordMastered(cardStates[w.id])).length;
    const prestige = getPrestige(cat);
    const isPrestigeable = canPrestige(cat, allWords, cardStates);
    const tier = PRESTIGE_TIERS[prestige.level];
    const nextTier = PRESTIGE_TIERS[prestige.level + 1];

    return {
      name: cat,
      total: catWords.length,
      mastered: catMastered,
      percent: catWords.length > 0 ? Math.round((catMastered / catWords.length) * 100) : 0,
      prestige,
      tier,
      nextTier,
      isPrestigeable,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          {"\u2B50"} Prestige
        </h3>
        <span className="text-sm text-text-muted">
          {totalPrestigeStars} star{totalPrestigeStars !== 1 ? "s" : ""} earned
        </span>
      </div>

      <div className="grid gap-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
              justPrestiged === cat.name
                ? "border-yellow-500/50 bg-yellow-500/10 animate-pulse"
                : cat.isPrestigeable
                  ? "border-accent/30 bg-accent/5"
                  : "border-border bg-bg-card"
            )}
          >
            {/* Stars */}
            <div className="flex items-center w-16 shrink-0">
              {cat.prestige.level > 0 ? (
                <span className={cn("text-lg", cat.tier.color)}>
                  {Array.from({ length: cat.prestige.level })
                    .map((_, i) => PRESTIGE_TIERS[i + 1].star)
                    .join("")}
                </span>
              ) : (
                <span className="text-text-muted text-xs">-</span>
              )}
            </div>

            {/* Category info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">
                {cat.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      cat.percent === 100 ? "bg-accent-green" : "bg-accent"
                    )}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {cat.mastered}/{cat.total}
                </span>
              </div>
            </div>

            {/* Prestige button */}
            {cat.isPrestigeable ? (
              <button
                onClick={() => handlePrestige(cat.name)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold transition-all hover:scale-105 shrink-0"
              >
                {cat.nextTier?.star} Prestige!
              </button>
            ) : cat.percent === 100 && cat.prestige.level >= 3 ? (
              <span className="text-xs text-yellow-400 font-medium shrink-0">
                Max {"\uD83D\uDC51"}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-text-muted justify-center pt-2">
        {PRESTIGE_TIERS.slice(1).map((tier) => (
          <span key={tier.level} className="flex items-center gap-1">
            <span>{tier.star}</span>
            <span className={tier.color}>{tier.label}</span>
            <span>(+{tier.xpReward} XP)</span>
          </span>
        ))}
      </div>
    </div>
  );
}
