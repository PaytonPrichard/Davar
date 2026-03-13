"use client";

import { useState, useMemo, useCallback } from "react";
import type { PassageLine } from "@/types";
import { shuffle, cleanHebrew, cn } from "@/lib/utils";

interface SentenceBuilderProps {
  lines: PassageLine[];
  onComplete?: () => void;
}

export default function SentenceBuilder({ lines, onComplete }: SentenceBuilderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongTile, setWrongTile] = useState<string | null>(null);
  const [hinting, setHinting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const line = lines[currentIndex];

  // Split Hebrew line into words and shuffle them
  const targetWords = useMemo(
    () => line.hebrew.split(/\s+/).filter(Boolean),
    [line.hebrew]
  );

  const shuffledWords = useMemo(() => {
    // Reshuffle when sentence changes — use index as dep
    const reversed = [...targetWords].reverse();
    const isTooObvious = (arr: string[]) =>
      arr.every((w, i) => w === targetWords[i]) ||
      arr.every((w, i) => w === reversed[i]);

    let attempt = shuffle(targetWords);
    if (targetWords.length > 1) {
      let tries = 0;
      while (tries < 10 && isTooObvious(attempt)) {
        attempt = shuffle(targetWords);
        tries++;
      }
    }
    return attempt;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, line.hebrew]);

  const remaining = useMemo(() => {
    const placedCount: Record<string, number> = {};
    for (const w of placed) {
      placedCount[w] = (placedCount[w] || 0) + 1;
    }
    return shuffledWords.filter((w) => {
      if ((placedCount[w] || 0) > 0) {
        placedCount[w]--;
        return false;
      }
      return true;
    });
  }, [shuffledWords, placed]);

  const handleTileTap = useCallback(
    (word: string) => {
      if (completed) return;
      const nextExpected = targetWords[placed.length];
      if (cleanHebrew(word) === cleanHebrew(nextExpected)) {
        // Correct
        const newPlaced = [...placed, word];
        setPlaced(newPlaced);
        setWrongTile(null);
        setHinting(false);
        if (newPlaced.length === targetWords.length) {
          setCompleted(true);
        }
      } else {
        // Wrong
        setWrongTile(word);
        setTimeout(() => setWrongTile(null), 400);
      }
    },
    [placed, targetWords, completed]
  );

  const handleUndo = useCallback(() => {
    if (placed.length === 0) return;
    setPlaced((prev) => prev.slice(0, -1));
    setCompleted(false);
    setHinting(false);
  }, [placed.length]);

  const handleHint = useCallback(() => {
    setHinting(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < lines.length - 1) {
      setCurrentIndex((i) => i + 1);
      setPlaced([]);
      setWrongTile(null);
      setHinting(false);
      setCompleted(false);
    } else {
      onComplete?.();
    }
  }, [currentIndex, lines.length, onComplete]);

  // Find the correct next word for hint highlighting
  const hintWord = hinting ? targetWords[placed.length] : null;

  // Track which hint-matching tile has been flagged so we only glow one
  let hintUsed = false;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>
          {currentIndex + (completed ? 1 : 0)} / {lines.length} sentences
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleHint}
            disabled={completed || placed.length === targetWords.length}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Hint
          </button>
          <button
            onClick={handleUndo}
            disabled={placed.length === 0}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Undo
          </button>
        </div>
      </div>

      {/* English prompt */}
      <div className="text-center text-text-secondary text-sm italic px-4">
        &ldquo;{line.translation}&rdquo;
      </div>

      {/* Placed words (answer area) */}
      <div
        className="min-h-[52px] rounded-xl border-2 border-dashed border-border bg-bg-secondary/50 p-3 flex flex-wrap gap-2 justify-center"
        dir="rtl"
      >
        {placed.length === 0 && (
          <span className="text-text-muted text-sm self-center">
            Tap words below to build the sentence
          </span>
        )}
        {placed.map((word, i) => (
          <span
            key={`${i}-${word}`}
            className="hebrew-text px-3 py-1.5 rounded-lg bg-accent-green/20 text-accent-green font-medium text-lg animate-pop-in"
          >
            {word}
          </span>
        ))}
      </div>

      {/* Available tiles */}
      {!completed && (
        <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
          {remaining.map((word, i) => {
            const isWrong = wrongTile === word;
            const isHint =
              hintWord !== null &&
              !hintUsed &&
              cleanHebrew(word) === cleanHebrew(hintWord);
            if (isHint) hintUsed = true;

            return (
              <button
                key={`${i}-${word}`}
                onClick={() => handleTileTap(word)}
                className={cn(
                  "hebrew-text px-4 py-2 rounded-xl border font-medium text-lg transition-all cursor-pointer select-none",
                  "bg-bg-card border-border text-text-primary hover:border-accent/50 hover:bg-bg-card-hover",
                  isWrong && "animate-shake border-red-500/60 bg-red-500/10 text-red-400",
                  isHint && "animate-hint-glow border-accent-blue"
                )}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {/* Completion state */}
      {completed && (
        <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-sm text-accent italic">{line.transliteration}</div>
          {currentIndex < lines.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-colors font-medium text-sm"
            >
              Next Sentence &rarr;
            </button>
          ) : (
            <button
              onClick={() => onComplete?.()}
              className="px-5 py-2 rounded-xl bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors font-medium text-sm"
            >
              {onComplete ? "Continue →" : "All sentences completed!"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
