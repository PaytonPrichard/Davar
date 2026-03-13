"use client";

import { useState, useCallback } from "react";
import type { PassageLine } from "@/types";
import AudioButton from "./AudioButton";
import { cn } from "@/lib/utils";

interface ComprehensionQuizProps {
  lines: PassageLine[];
  onComplete?: (score: { got: number; tricky: number }) => void;
}

type LineRating = "got" | "tricky";

export default function ComprehensionQuiz({
  lines,
  onComplete,
}: ComprehensionQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratings, setRatings] = useState<LineRating[]>([]);
  const [finished, setFinished] = useState(false);

  const currentLine = lines[currentIndex];
  const totalLines = lines.length;

  const handleRate = useCallback(
    (rating: LineRating) => {
      const newRatings = [...ratings, rating];
      setRatings(newRatings);
      setRevealed(false);

      if (currentIndex + 1 >= totalLines) {
        setFinished(true);
        const got = newRatings.filter((r) => r === "got").length;
        const tricky = newRatings.filter((r) => r === "tricky").length;
        onComplete?.({ got, tricky });
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [ratings, currentIndex, totalLines, onComplete]
  );

  const trickyLines = ratings
    .map((r, i) => (r === "tricky" ? i : -1))
    .filter((i) => i >= 0);

  const gotCount = ratings.filter((r) => r === "got").length;
  const trickyCount = ratings.filter((r) => r === "tricky").length;

  // Re-review tricky lines
  const [reviewing, setReviewing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewRevealed, setReviewRevealed] = useState(false);

  const startReReview = () => {
    setReviewing(true);
    setReviewIndex(0);
    setReviewRevealed(false);
  };

  const currentReviewLine =
    reviewing && trickyLines[reviewIndex] !== undefined
      ? lines[trickyLines[reviewIndex]]
      : null;

  // Finished summary screen
  if (finished && !reviewing) {
    const percentage = Math.round((gotCount / totalLines) * 100);
    let emoji: string;
    let message: string;
    if (percentage === 100) {
      emoji = "\u{1F31F}";
      message = "Perfect score!";
    } else if (percentage >= 80) {
      emoji = "\u{1F44F}";
      message = "Great job!";
    } else if (percentage >= 50) {
      emoji = "\u{1F4AA}";
      message = "Good effort!";
    } else {
      emoji = "\u{1F4DA}";
      message = "Keep practicing!";
    }

    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-[fadeIn_0.3s_ease-out]">
        <div className="text-4xl">{emoji}</div>
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary mb-1">
            {gotCount}/{totalLines} lines — {message}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green inline-block" />
              {gotCount} got it
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
              {trickyCount} tricky
            </span>
          </div>
        </div>

        {trickyLines.length > 0 && (
          <button
            onClick={startReReview}
            className="px-5 py-2 rounded-xl bg-orange-400/20 text-orange-400 hover:bg-orange-400/30 transition-colors font-medium text-sm"
          >
            Review {trickyLines.length} Tricky Line{trickyLines.length > 1 ? "s" : ""}
          </button>
        )}
      </div>
    );
  }

  // Re-review mode for tricky lines
  if (reviewing && currentReviewLine) {
    return (
      <div className="flex flex-col items-center gap-6 py-6 animate-[fadeIn_0.3s_ease-out]">
        {/* Progress */}
        <div className="text-xs text-text-muted">
          Re-reviewing {reviewIndex + 1} / {trickyLines.length} tricky lines
        </div>

        {/* Hebrew line */}
        <div className="text-center">
          <p className="hebrew-text text-2xl leading-relaxed text-text-primary mb-2">
            {currentReviewLine.hebrew}
          </p>
          <AudioButton text={currentReviewLine.hebrew} size="md" />
        </div>

        {/* Reveal area */}
        {!reviewRevealed ? (
          <button
            onClick={() => setReviewRevealed(true)}
            className="w-full max-w-sm py-4 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-accent/50 hover:text-text-secondary transition-colors text-sm"
          >
            Tap to reveal translation
          </button>
        ) : (
          <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-bg-secondary rounded-xl p-4 text-center mb-4">
              <p className="text-xs text-text-muted mb-1">
                {currentReviewLine.transliteration}
              </p>
              <p className="text-text-primary font-medium">
                {currentReviewLine.translation}
              </p>
            </div>
            <button
              onClick={() => {
                if (reviewIndex + 1 >= trickyLines.length) {
                  setReviewing(false);
                } else {
                  setReviewIndex((i) => i + 1);
                  setReviewRevealed(false);
                }
              }}
              className="w-full py-2 rounded-xl text-sm font-medium transition-colors bg-accent text-white hover:bg-accent/90"
            >
              {reviewIndex + 1 >= trickyLines.length ? "Done" : "Next"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Re-review finished — back to summary
  if (reviewing && !currentReviewLine) {
    setReviewing(false);
    return null;
  }

  // Main quiz flow
  return (
    <div className="flex flex-col items-center gap-6 py-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
          <span>Line {currentIndex + 1} of {totalLines}</span>
          <span>{ratings.length} answered</span>
        </div>
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / totalLines) * 100}%` }}
          />
        </div>
      </div>

      {/* Hebrew line */}
      <div className="text-center">
        <p className="hebrew-text text-2xl leading-relaxed text-text-primary mb-2">
          {currentLine.hebrew}
        </p>
        <AudioButton text={currentLine.hebrew} size="md" />
      </div>

      {/* Reveal area */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full max-w-sm py-4 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-accent/50 hover:text-text-secondary transition-colors text-sm"
        >
          Tap to reveal translation
        </button>
      ) : (
        <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-bg-secondary rounded-xl p-4 text-center mb-4">
            <p className="text-xs text-text-muted mb-1">
              {currentLine.transliteration}
            </p>
            <p className="text-text-primary font-medium">
              {currentLine.translation}
            </p>
          </div>

          {/* Rating buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleRate("got")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                "bg-accent-green/15 text-accent-green hover:bg-accent-green/25 border border-accent-green/30"
              )}
            >
              Got it
            </button>
            <button
              onClick={() => handleRate("tricky")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                "bg-orange-400/15 text-orange-400 hover:bg-orange-400/25 border border-orange-400/30"
              )}
            >
              Tricky
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
