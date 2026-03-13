"use client";

import { useMemo } from "react";
import type { CardState, Word } from "@/types";
import AudioButton from "./AudioButton";
import { cn } from "@/lib/utils";

interface DifficultWordsProps {
  cardStates: Record<string, CardState>;
  allWords: Word[];
}

export default function DifficultWords({
  cardStates,
  allWords,
}: DifficultWordsProps) {
  const difficultWords = useMemo(() => {
    return allWords
      .filter((w) => {
        const cs = cardStates[w.id];
        if (!cs) return false;
        return cs.easeFactor < 1.8 || (cs.repetitions > 0 && cs.easeFactor < 2.0);
      })
      .sort((a, b) => {
        const eA = cardStates[a.id]?.easeFactor ?? 2.5;
        const eB = cardStates[b.id]?.easeFactor ?? 2.5;
        return eA - eB;
      })
      .slice(0, 10);
  }, [cardStates, allWords]);

  if (difficultWords.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          Difficult Words
        </h3>
        <div className="text-center py-4">
          <div className="text-2xl mb-2">&#127942;</div>
          <p className="text-sm text-text-muted">
            No difficult words yet! Keep studying and any tricky words will
            appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        Difficult Words
      </h3>
      <p className="text-xs text-text-muted mb-4">
        Words you find most challenging, ranked by difficulty
      </p>

      <div className="flex flex-col gap-2">
        {difficultWords.map((word) => {
          const cs = cardStates[word.id];
          const ef = cs?.easeFactor ?? 2.5;
          const diffColor =
            ef < 1.5
              ? "bg-red-500/20 text-red-400"
              : "bg-accent-yellow/20 text-accent-yellow";

          return (
            <div
              key={word.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary hover:bg-bg-card-hover transition-colors"
            >
              <span className="hebrew-text text-xl font-bold text-text-primary min-w-[60px] text-center">
                {word.hebrewNikud}
              </span>
              <AudioButton text={word.hebrew} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-accent font-medium">
                  {word.transliteration}
                </div>
                <div className="text-xs text-text-secondary truncate">
                  {word.translation}
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  diffColor
                )}
              >
                {ef.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
