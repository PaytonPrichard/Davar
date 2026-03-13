"use client";

import { useMemo } from "react";
import { VOCABULARY } from "@/data/vocabulary";
import { findRootForWord } from "@/data/roots";
import { cn, cleanHebrew } from "@/lib/utils";
import type { AppMode } from "@/types";

/* ── Types ──────────────────────────────────────────────────── */

interface WordOfTheDayProps {
  onNavigate?: (mode: AppMode) => void;
}

/* ── Helpers ────────────────────────────────────────────────── */

function hashDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* ── Component ──────────────────────────────────────────────── */

export default function WordOfTheDay({ onNavigate }: WordOfTheDayProps) {
  const { word, rootInfo } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const index = hashDate(today) % VOCABULARY.length;
    const selectedWord = VOCABULARY[index];
    const root = selectedWord
      ? findRootForWord(cleanHebrew(selectedWord.hebrew))
      : undefined;
    return { word: selectedWord, rootInfo: root };
  }, []);

  if (!word) return null;

  // Get up to 2 related words from the same root (excluding the word itself)
  const relatedWords = rootInfo
    ? rootInfo.relatedWords
        .filter((rw) => cleanHebrew(rw.hebrew) !== cleanHebrew(word.hebrew))
        .slice(0, 2)
    : [];

  return (
    <button
      onClick={() => onNavigate?.("flashcards")}
      className="w-full text-left rounded-2xl border border-border bg-bg-card overflow-hidden transition hover:border-accent/30 hover:shadow-md group"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Word of the Day
        </span>
        <span className="text-[10px] text-text-muted">
          Tap to practice
        </span>
      </div>

      {/* Main word */}
      <div className="px-4 pb-2">
        <p className="hebrew-text text-3xl font-bold text-text-primary leading-snug" dir="rtl">
          {word.hebrewNikud}
        </p>
        <p className="mt-0.5 text-sm italic text-text-muted">
          {word.transliteration}
        </p>
        <p className="mt-1 text-sm font-medium text-text-secondary">
          {word.translation}
        </p>

        {/* Category & level badges */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] font-medium text-text-muted">
            {word.category}
          </span>
          {word.level && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                word.level === "A1" && "bg-accent-green/15 text-accent-green",
                word.level === "A2" && "bg-amber-500/15 text-amber-400",
                word.level === "B1" && "bg-accent-blue/15 text-accent-blue",
              )}
            >
              {word.level}
            </span>
          )}
        </div>
      </div>

      {/* Root info section */}
      {rootInfo && (
        <div className="border-t border-border px-4 py-2.5 bg-bg-secondary/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Root
            </span>
            <span className="hebrew-text text-sm font-bold text-accent" dir="rtl">
              {rootInfo.rootDisplay}
            </span>
            <span className="text-xs text-text-muted">
              — {rootInfo.meaning}
            </span>
          </div>

          {/* Related words */}
          {relatedWords.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {relatedWords.map((rw) => (
                <span
                  key={rw.hebrew}
                  className="inline-flex items-baseline gap-1.5 text-xs text-text-secondary"
                >
                  <span className="hebrew-text font-semibold text-text-primary" dir="rtl">
                    {rw.hebrewNikud}
                  </span>
                  <span className="text-text-muted">
                    {rw.translation}
                  </span>
                  <span className="text-[10px] text-text-muted/60">
                    ({rw.formNote})
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
