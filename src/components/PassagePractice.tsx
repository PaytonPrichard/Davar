"use client";

import { useState, useMemo, useCallback } from "react";
import type { Passage, ReviewQuality } from "@/types";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useStreak } from "@/hooks/useStreak";
import { isWordMastered } from "@/lib/sm2";
import Flashcard from "./Flashcard";
import SentenceBuilder from "./SentenceBuilder";
import ComprehensionQuiz from "./ComprehensionQuiz";
import { cn } from "@/lib/utils";

type PracticeMode = "words" | "sentences" | "comprehension" | null;

interface PassagePracticeProps {
  passage: Passage;
}

export default function PassagePractice({ passage }: PassagePracticeProps) {
  const [mode, setMode] = useState<PracticeMode>(null);
  const [drilling, setDrilling] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [drillIndex, setDrillIndex] = useState(0);

  const { allWords } = useVocabulary();
  const { dueCards, recordReview, cardStates, bulkMarkKnown } =
    useSpacedRepetition(allWords);
  const { recordStudy } = useStreak();

  // Get the Word objects for this passage's vocab
  const passageWords = useMemo(() => {
    const ids = passage.vocabIds ?? [];
    return ids
      .map((id) => allWords.find((w) => w.id === id))
      .filter((w): w is NonNullable<typeof w> => w != null);
  }, [passage.vocabIds, allWords]);

  // Due cards scoped to this passage
  const passageDue = useMemo(() => {
    const passageIds = new Set(passageWords.map((w) => w.id));
    return dueCards.filter((id) => passageIds.has(id));
  }, [dueCards, passageWords]);

  const currentWordId = passageDue[drillIndex];
  const currentWord = allWords.find((w) => w.id === currentWordId);

  const toggleMode = (m: PracticeMode) => {
    setMode((prev) => (prev === m ? null : m));
    setDrilling(false);
    setDrillIndex(0);
    setCardKey((k) => k + 1);
  };

  const handleRate = useCallback(
    (quality: ReviewQuality) => {
      if (!currentWordId) return;
      recordReview(currentWordId, quality);
      recordStudy();
      setDrillIndex((prev) => prev + 1);
      setCardKey((k) => k + 1);
    },
    [currentWordId, recordReview, recordStudy]
  );

  const handleSkip = useCallback(() => {
    setDrillIndex((prev) => prev + 1);
    setCardKey((k) => k + 1);
  }, []);

  if (passageWords.length === 0 && !passage.lines.length) return null;

  return (
    <div className="mt-6 border-t border-border pt-5">
      {/* Toggle buttons */}
      <div className="flex gap-2 justify-center mb-4">
        {passageWords.length > 0 && (
          <button
            onClick={() => toggleMode("words")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              mode === "words"
                ? "bg-accent text-white border-accent"
                : "bg-bg-secondary text-text-secondary border-border hover:border-accent/50 hover:text-text-primary"
            )}
          >
            Practice Words
          </button>
        )}
        <button
          onClick={() => toggleMode("sentences")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
            mode === "sentences"
              ? "bg-accent text-white border-accent"
              : "bg-bg-secondary text-text-secondary border-border hover:border-accent/50 hover:text-text-primary"
          )}
        >
          Build Sentences
        </button>
        {passage.lines.length > 0 && (
          <button
            onClick={() => toggleMode("comprehension")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
              mode === "comprehension"
                ? "bg-accent text-white border-accent"
                : "bg-bg-secondary text-text-secondary border-border hover:border-accent/50 hover:text-text-primary"
            )}
          >
            Test Yourself
          </button>
        )}
      </div>

      {/* Practice Words mode */}
      {mode === "words" && !drilling && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {passageWords.map((word) => {
              const mastered = isWordMastered(cardStates[word.id]);
              return (
                <div
                  key={word.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border text-sm"
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      mastered ? "bg-accent-green" : "bg-text-muted/40"
                    )}
                  />
                  <span className="hebrew-text text-text-primary">
                    {word.hebrewNikud}
                  </span>
                  <span className="text-text-muted text-xs">
                    {word.translation}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => {
                setDrilling(true);
                setDrillIndex(0);
                setCardKey((k) => k + 1);
              }}
              className="px-5 py-2 rounded-xl bg-accent/20 text-accent hover:bg-accent/30 transition-colors font-medium text-sm"
            >
              Start Drill ({passageDue.length} due)
            </button>
          </div>
        </div>
      )}

      {/* Drilling flashcards */}
      {mode === "words" && drilling && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          {currentWord ? (
            <Flashcard
              key={cardKey}
              word={currentWord}
              onRate={handleRate}
              onSkip={handleSkip}
              onMarkKnown={() => {
                bulkMarkKnown([currentWord.id]);
                setDrillIndex((prev) => prev + 1);
                setCardKey((k) => k + 1);
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="text-3xl">&#10024;</div>
              <p className="text-text-secondary text-sm">
                {passageDue.length === 0 && drillIndex === 0
                  ? "No words due for review — all caught up!"
                  : "All passage words reviewed!"}
              </p>
              <button
                onClick={() => setDrilling(false)}
                className="px-4 py-1.5 rounded-lg text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Back to overview
              </button>
            </div>
          )}
          {/* Mini progress */}
          {passageDue.length > 0 && (
            <div className="mt-4 text-xs text-text-muted text-center">
              {Math.min(drillIndex, passageDue.length)} / {passageDue.length}
            </div>
          )}
        </div>
      )}

      {/* Build Sentences mode */}
      {mode === "sentences" && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <SentenceBuilder lines={passage.lines} />
        </div>
      )}

      {/* Comprehension Quiz mode */}
      {mode === "comprehension" && (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <ComprehensionQuiz lines={passage.lines} />
        </div>
      )}
    </div>
  );
}
