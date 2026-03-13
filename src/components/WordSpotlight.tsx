"use client";

import { useState, useMemo, useCallback } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { findRootForWord } from "@/data/roots";
import { cleanHebrew, shuffle } from "@/lib/utils";
import AudioButton from "./AudioButton";
import { cn } from "@/lib/utils";

/**
 * Multi-modal word review widget. Picks a word and lets users
 * see, hear, and type it — reinforcing through multiple channels.
 */
export default function WordSpotlight() {
  const { allWords } = useVocabulary();
  const { cardStates, dueCards } = useSpacedRepetition(allWords);

  // Pick words to spotlight: prioritize difficult/due, then random
  const spotlightWords = useMemo(() => {
    const difficult = allWords.filter((w) => {
      const cs = cardStates[w.id];
      return cs && cs.easeFactor < 2.0;
    });
    const due = dueCards
      .map((id) => allWords.find((w) => w.id === id))
      .filter((w): w is NonNullable<typeof w> => w != null);
    const pool = difficult.length > 0 ? difficult : due.length > 0 ? due : allWords;
    return shuffle(pool).slice(0, 20);
  }, [allWords, cardStates, dueCards]);

  const [wordIdx, setWordIdx] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [typingResult, setTypingResult] = useState<"correct" | "incorrect" | null>(null);

  const word = spotlightWords[wordIdx % Math.max(1, spotlightWords.length)];
  const rootInfo = word ? findRootForWord(cleanHebrew(word.hebrew)) : undefined;

  const nextWord = useCallback(() => {
    setWordIdx((i) => i + 1);
    setTypedAnswer("");
    setShowAnswer(false);
    setTypingResult(null);
  }, []);

  const checkAnswer = () => {
    if (!typedAnswer.trim() || !word) return;
    const a = typedAnswer.trim().toLowerCase();
    const correct =
      a === word.transliteration.toLowerCase() ||
      a === word.hebrew ||
      a === word.translation.toLowerCase().split("/")[0].trim();
    setTypingResult(correct ? "correct" : "incorrect");
    setShowAnswer(true);
  };

  if (!word) {
    return (
      <div className="bg-bg-card rounded-2xl border border-border p-6 text-center text-text-muted text-sm">
        Add some words to get started with Word Spotlight.
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Word Spotlight
        </h3>
        <button
          onClick={nextWord}
          className="text-xs text-text-muted hover:text-accent transition-colors"
        >
          Next word &#8594;
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Main word display */}
        <div className="flex items-center justify-center gap-4 py-5">
          <span className="hebrew-text text-4xl font-bold text-text-primary">
            {word.hebrewNikud}
          </span>
          <AudioButton text={word.hebrew} size="lg" />
        </div>

        {/* Reveal section */}
        {showAnswer ? (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
              <span className="text-accent italic font-medium">
                {word.transliteration}
              </span>
              <span className="text-text-muted">—</span>
              <span className="text-text-secondary">{word.translation}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted border border-border">
                {word.category}
              </span>
            </div>

            {/* Root connections */}
            {rootInfo && (
              <div className="mt-3 p-3 bg-bg-secondary rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-muted">Root:</span>
                  <span className="hebrew-text text-sm font-bold text-accent-blue">
                    {rootInfo.rootDisplay}
                  </span>
                  <span className="text-xs text-text-secondary">
                    ({rootInfo.meaning})
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {rootInfo.relatedWords
                    .filter((rw) => cleanHebrew(rw.hebrew) !== cleanHebrew(word.hebrew))
                    .slice(0, 4)
                    .map((rw, i) => (
                      <span key={i} className="text-xs text-text-muted">
                        <span className="hebrew-text text-text-secondary">
                          {rw.hebrewNikud}
                        </span>{" "}
                        {rw.translation}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Typing result */}
            {typingResult && (
              <p
                className={cn(
                  "text-center text-sm font-medium mt-3",
                  typingResult === "correct"
                    ? "text-accent-green"
                    : "text-red-400"
                )}
              >
                {typingResult === "correct" ? "Correct!" : "Not quite"}
              </p>
            )}
          </div>
        ) : (
          /* Quick test */
          <div>
            <p className="text-xs text-text-muted text-center mb-2">
              Type the transliteration or translation:
            </p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkAnswer();
                }}
                placeholder="Type here..."
                className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary text-center"
              />
              <button
                onClick={checkAnswer}
                className="px-3 py-2 rounded-lg bg-accent/15 text-accent text-sm font-medium hover:bg-accent/25 transition-colors"
              >
                Check
              </button>
              <button
                onClick={() => setShowAnswer(true)}
                className="px-3 py-2 rounded-lg bg-bg-secondary text-text-muted text-sm hover:text-text-secondary transition-colors"
              >
                Reveal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
