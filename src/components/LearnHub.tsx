"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";
import { GRAMMAR_LESSONS } from "@/data/grammar";

/* ── Types ──────────────────────────────────────────────────── */

interface LearnHubProps {
  onNavigate: (mode: AppMode) => void;
}

interface LearnCard {
  mode: AppMode;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/* ── Component ──────────────────────────────────────────────── */

export default function LearnHub({ onNavigate }: LearnHubProps) {
  // Grammar lesson completion — check which lessons the user has expanded/studied
  // GrammarMode doesn't persist per-lesson completion, so we show total count
  const grammarLessonCount = GRAMMAR_LESSONS.length;

  // Alphabet — no progress tracking exists, show static info
  const alphabetSubtitle = "22 Hebrew letters + 5 final forms";

  const cards: LearnCard[] = useMemo(
    () => [
      {
        mode: "alphabet" as AppMode,
        label: "Alphabet",
        subtitle: alphabetSubtitle,
        icon: "\uD83D\uDD24",
        color: "text-accent-blue",
        bgColor: "bg-accent-blue/8",
        borderColor: "border-accent-blue/20",
      },
      {
        mode: "writing" as AppMode,
        label: "Writing",
        subtitle: "Practice tracing & typing Hebrew",
        icon: "\u270D\uFE0F",
        color: "text-teal-500",
        bgColor: "bg-teal-500/8",
        borderColor: "border-teal-500/20",
      },
      {
        mode: "grammar" as AppMode,
        label: "Grammar",
        subtitle: `${grammarLessonCount} lessons available`,
        icon: "\uD83D\uDCD0",
        color: "text-purple-500",
        bgColor: "bg-purple-500/8",
        borderColor: "border-purple-500/20",
      },
      {
        mode: "sentences" as AppMode,
        label: "Sentences",
        subtitle: "Build Hebrew sentences from word tiles",
        icon: "\uD83D\uDD24",
        color: "text-accent-yellow",
        bgColor: "bg-accent-yellow/8",
        borderColor: "border-accent-yellow/20",
      },
    ],
    [grammarLessonCount]
  );

  return (
    <div className="space-y-6">
      {/* Section title */}
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
        Learn
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
