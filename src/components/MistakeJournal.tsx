"use client";

import { useMemo } from "react";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useVocabulary } from "@/hooks/useVocabulary";
import { cn } from "@/lib/utils";
import type { AppMode } from "@/types";

interface MistakeJournalProps {
  onNavigate?: (mode: AppMode) => void;
}

export default function MistakeJournal({ onNavigate }: MistakeJournalProps) {
  const { allWords } = useVocabulary();
  const { cardStates } = useSpacedRepetition(allWords);

  const problemWords = useMemo(() => {
    return allWords
      .filter((w) => {
        const cs = cardStates[w.id];
        if (!cs) return false;
        const lapses = cs.lapses ?? 0;
        const difficulty = cs.difficulty ?? 0;
        const stability = cs.stability ?? cs.interval;
        const repetitions = cs.repetitions;

        return (
          lapses >= 2 ||
          difficulty >= 0.7 ||
          (stability < 3 && repetitions >= 3)
        );
      })
      .sort((a, b) => {
        const lapsesA = cardStates[a.id]?.lapses ?? 0;
        const lapsesB = cardStates[b.id]?.lapses ?? 0;
        return lapsesB - lapsesA;
      })
      .slice(0, 20);
  }, [allWords, cardStates]);

  if (problemWords.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{"📓"}</span>
          <h3 className="text-lg font-semibold text-text-primary">
            Problem Words
          </h3>
        </div>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">{"🎉"}</div>
          <p className="text-sm text-text-muted">
            No problem words yet — keep practicing!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      {/* Red-tinted header */}
      <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{"📓"}</span>
            <h3 className="text-lg font-semibold text-text-primary">
              Problem Words
            </h3>
            <span className="text-xs text-text-muted font-normal">
              {problemWords.length} word{problemWords.length !== 1 ? "s" : ""}
            </span>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("flashcards")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Practice These
            </button>
          )}
        </div>
      </div>

      {/* Scrollable word list */}
      <div className="p-4 max-h-[400px] overflow-y-auto flex flex-col gap-2">
        {problemWords.map((word) => {
          const cs = cardStates[word.id];
          const lapses = cs?.lapses ?? 0;
          const stability = cs?.stability ?? cs?.interval ?? 0;

          // Stability indicator: red < 3, yellow 3-10, green > 10
          const stabilityColor =
            stability < 3
              ? "text-red-400"
              : stability < 10
                ? "text-accent-yellow"
                : "text-green-400";

          const stabilityLabel =
            stability < 3
              ? "Fragile"
              : stability < 10
                ? "Weak"
                : "Stable";

          return (
            <div
              key={word.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary hover:bg-bg-card-hover transition-colors"
            >
              <span className="hebrew-text text-xl font-bold text-text-primary min-w-[60px] text-center">
                {word.hebrewNikud}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-accent font-medium">
                  {word.transliteration}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {word.translation}
                </div>
              </div>
              {/* Stability indicator */}
              <span
                className={cn(
                  "text-[10px] font-medium hidden sm:inline",
                  stabilityColor
                )}
              >
                {stabilityLabel}
              </span>
              {/* Lapse count badge */}
              {lapses > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400">
                  {lapses} lapse{lapses !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
