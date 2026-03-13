"use client";

import { useState, useCallback, useRef } from "react";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useQuizStats } from "@/hooks/useQuizStats";
import { cn } from "@/lib/utils";

export default function ShareProgressCard() {
  const { totalXP, level } = useXP();
  const { streak } = useStreak();
  const { allWords } = useVocabulary();
  const { masteredCount, totalReviews } = useSpacedRepetition(allWords);
  const { stats: quizStats } = useQuizStats();
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const generateShareText = useCallback(() => {
    const lines = [
      `\u05D3\u05D1\u05E8 Hebrew Learning Progress`,
      ``,
      `\uD83C\uDF1F Level ${level} \u00B7 ${totalXP} XP`,
      `\uD83D\uDD25 ${streak.current} day streak`,
      `\uD83D\uDCDA ${masteredCount} words mastered`,
      `\uD83D\uDCAA ${totalReviews} total reviews`,
      quizStats.quizzesTaken > 0
        ? `\uD83C\uDFAF ${quizStats.quizzesTaken} quizzes (${Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100)}% accuracy)`
        : null,
      ``,
      `Learning Hebrew with Davar!`,
    ]
      .filter(Boolean)
      .join("\n");
    return lines;
  }, [level, totalXP, streak, masteredCount, totalReviews, quizStats]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  }, [generateShareText]);

  if (!showCard) {
    return (
      <button
        onClick={() => setShowCard(true)}
        className="px-4 py-2 rounded-xl bg-bg-card border border-border hover:bg-bg-card-hover text-sm text-text-secondary transition-colors"
      >
        {"\uD83D\uDCE4"} Share Progress
      </button>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 max-w-sm">
      {/* Visual card */}
      <div className="bg-gradient-to-br from-accent/20 to-accent-blue/20 rounded-xl p-5 border border-accent/20">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-text-primary">
            <span className="hebrew-text text-accent">{"\u05D3\u05D1\u05E8"}</span> Progress
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-card/80 rounded-lg p-2.5 text-center">
            <div className="text-xl font-bold text-accent">{level}</div>
            <div className="text-[10px] text-text-muted">Level</div>
          </div>
          <div className="bg-bg-card/80 rounded-lg p-2.5 text-center">
            <div className="text-xl font-bold text-accent-yellow">{streak.current}</div>
            <div className="text-[10px] text-text-muted">Day Streak</div>
          </div>
          <div className="bg-bg-card/80 rounded-lg p-2.5 text-center">
            <div className="text-xl font-bold text-accent-green">{masteredCount}</div>
            <div className="text-[10px] text-text-muted">Words</div>
          </div>
          <div className="bg-bg-card/80 rounded-lg p-2.5 text-center">
            <div className="text-xl font-bold text-accent-blue">{totalXP}</div>
            <div className="text-[10px] text-text-muted">Total XP</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          {copied ? "\u2713 Copied!" : "\uD83D\uDCCB Copy Stats"}
        </button>
        <button
          onClick={() => setShowCard(false)}
          className="px-4 py-2 rounded-xl bg-bg-secondary text-text-muted text-sm transition-colors hover:text-text-secondary"
        >
          Close
        </button>
      </div>
    </div>
  );
}
