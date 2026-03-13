"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useQuizStats } from "@/hooks/useQuizStats";
import { useSettings } from "@/hooks/useSettings";

/* ── Types ──────────────────────────────────────────────────── */

interface PracticeHubProps {
  onNavigate: (mode: AppMode) => void;
}

interface PracticeCard {
  mode: AppMode;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/* ── Component ──────────────────────────────────────────────── */

export default function PracticeHub({ onNavigate }: PracticeHubProps) {
  const { allWords } = useVocabulary();
  const { dueCards } = useSpacedRepetition(allWords);
  const { stats: quizStats } = useQuizStats();
  const { settings } = useSettings();

  // Quiz accuracy subtitle
  const quizSubtitle = useMemo(() => {
    if (quizStats.totalQuestions > 0) {
      const accuracy = Math.round(
        (quizStats.totalCorrect / quizStats.totalQuestions) * 100
      );
      return `${accuracy}% accuracy \u00B7 ${quizStats.quizzesTaken} quizzes`;
    }
    return "Test your knowledge";
  }, [quizStats]);

  // Chat subtitle — check for AI API key
  const chatSubtitle = useMemo(() => {
    if (settings.aiProvider === "none" || !settings.aiApiKey) {
      return "Requires API key";
    }
    return "AI Hebrew conversation";
  }, [settings.aiProvider, settings.aiApiKey]);

  const cards: PracticeCard[] = useMemo(
    () => [
      {
        mode: "flashcards" as AppMode,
        label: "Flashcards",
        subtitle:
          dueCards.length > 0
            ? `${dueCards.length} cards due`
            : "All caught up!",
        icon: dueCards.length > 0 ? "\uD83D\uDCC7" : "\u2728",
        color: "text-accent",
        bgColor: "bg-accent/8",
        borderColor: "border-accent/20",
      },
      {
        mode: "quiz" as AppMode,
        label: "Quiz",
        subtitle: quizSubtitle,
        icon: "\u2753",
        color: "text-accent-blue",
        bgColor: "bg-accent-blue/8",
        borderColor: "border-accent-blue/20",
      },
      {
        mode: "listening" as AppMode,
        label: "Listening",
        subtitle: "Hear and identify Hebrew",
        icon: "\uD83D\uDC42",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/8",
        borderColor: "border-emerald-500/20",
      },
      {
        mode: "matching" as AppMode,
        label: "Matching",
        subtitle: "Memory card matching game",
        icon: "\uD83D\uDD17",
        color: "text-accent-yellow",
        bgColor: "bg-accent-yellow/8",
        borderColor: "border-accent-yellow/20",
      },
      {
        mode: "cloze" as AppMode,
        label: "Fill-in",
        subtitle: "Complete the sentence",
        icon: "\uD83D\uDCDD",
        color: "text-rose-500",
        bgColor: "bg-rose-500/8",
        borderColor: "border-rose-500/20",
      },
      {
        mode: "conversation" as AppMode,
        label: "Chat",
        subtitle: chatSubtitle,
        icon: "\uD83D\uDCAC",
        color: "text-purple-500",
        bgColor: "bg-purple-500/8",
        borderColor: "border-purple-500/20",
      },
    ],
    [dueCards.length, quizSubtitle, chatSubtitle]
  );

  return (
    <div className="space-y-6">
      {/* Section title */}
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
        Practice
      </h2>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <button
            key={card.mode}
            onClick={() => onNavigate(card.mode)}
            className={cn(
              "relative rounded-2xl border p-4 text-left transition-all",
              "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              card.borderColor,
              card.bgColor
            )}
          >
            <span className="text-3xl block mb-2">{card.icon}</span>
            <span className={cn("text-sm font-semibold block", card.color)}>
              {card.label}
            </span>
            <span className="text-xs text-text-muted block mt-0.5">
              {card.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
