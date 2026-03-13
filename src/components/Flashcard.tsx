"use client";

import { useState, memo } from "react";
import { Word, ReviewQuality } from "@/types";
import AudioButton from "./AudioButton";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  word: Word;
  onRate: (quality: ReviewQuality) => void;
  onSkip: () => void;
  onMarkKnown?: () => void;
}

export default memo(function Flashcard({ word, onRate, onSkip, onMarkKnown }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (!revealed) setRevealed(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        onClick={handleReveal}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleReveal(); } }}
        role="button"
        tabIndex={0}
        aria-label={revealed ? `${word.hebrewNikud} — ${word.translation}` : `${word.hebrewNikud} — tap to reveal`}
        className={cn(
          "w-full min-h-[280px] rounded-2xl border border-border bg-bg-card p-8 cursor-pointer transition-all hover:bg-bg-card-hover",
          "flex flex-col items-center justify-center gap-4 relative",
          !revealed && "hover:border-accent/50"
        )}
      >
        {/* Level badge */}
        {word.level && (
          <span
            className={cn(
              "absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              word.level === "A1" && "bg-accent-green/10 text-accent-green",
              word.level === "A2" && "bg-amber-500/10 text-amber-400",
              word.level === "B1" && "bg-accent-blue/10 text-accent-blue"
            )}
          >
            {word.level === "A1" ? "Basics" : word.level === "A2" ? "Growing" : "Challenging"}
          </span>
        )}

        {/* Hebrew word — always visible */}
        <div className="hebrew-text text-5xl font-bold text-text-primary">
          {word.hebrewNikud}
        </div>

        <div className="flex items-center gap-2">
          <AudioButton text={word.hebrew} size="md" />
          <span className="text-xs text-text-muted uppercase tracking-wider">
            {word.category}
          </span>
        </div>

        {/* Revealed content */}
        {revealed ? (
          <div className="flex flex-col items-center gap-2 mt-2 animate-[fadeIn_0.3s_ease-out]">
            <div className="text-xl text-accent font-medium">
              {word.transliteration}
            </div>
            <div className="text-lg text-text-secondary">
              {word.translation}
            </div>
          </div>
        ) : (
          <div className="text-text-muted text-sm mt-2">
            Tap or press Space to reveal
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {revealed && (
        <div className="flex gap-3 animate-[fadeIn_0.3s_ease-out]">
          <button
            onClick={() => onRate(1)}
            className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
          >
            Again
            <span className="block text-xs opacity-60">1</span>
          </button>
          <button
            onClick={() => onRate(3)}
            className="px-5 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors font-medium"
          >
            Hard
            <span className="block text-xs opacity-60">2</span>
          </button>
          <button
            onClick={() => onRate(4)}
            className="px-5 py-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors font-medium"
          >
            Good
            <span className="block text-xs opacity-60">3</span>
          </button>
          <button
            onClick={() => onRate(5)}
            className="px-5 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium"
          >
            Easy
            <span className="block text-xs opacity-60">4</span>
          </button>
        </div>
      )}

      {/* Skip + Know it buttons */}
      {!revealed && (
        <div className="flex items-center gap-4">
          <button
            onClick={onSkip}
            className="text-text-muted hover:text-text-secondary text-sm transition-colors"
          >
            Skip (→)
          </button>
          {onMarkKnown && (
            <button
              onClick={onMarkKnown}
              className="text-sm text-red-400 hover:text-red-500 font-medium transition-colors"
            >
              Know it
            </button>
          )}
        </div>
      )}
    </div>
  );
})
