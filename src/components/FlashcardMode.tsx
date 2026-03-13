"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ReviewQuality } from "@/types";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import { trackQuest } from "@/hooks/useQuests";
import { cn } from "@/lib/utils";
import Flashcard from "./Flashcard";
import BulkMarkKnown from "./BulkMarkKnown";
import SessionComplete, { SessionStats } from "./SessionComplete";
import { AppMode } from "@/types";
import { LevelFilter, LEVEL_PILLS, getInitialLevelFilter } from "@/lib/level-filter";

export default function FlashcardMode({ onNavigate }: { onNavigate?: (mode: AppMode) => void }) {
  const { allWords, categories } = useVocabulary();
  const { dueCards, recordReview, masteredCount, totalReviews, cardStates, bulkMarkKnown } =
    useSpacedRepetition(allWords);
  const { recordStudy } = useStreak();
  const { awardXP } = useXP();
  const sessionXPRef = useRef(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>(getInitialLevelFilter);
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [showBulkMark, setShowBulkMark] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);

  // Identify weak words: high lapses, low stability, or low ease factor
  const weakWordIds = useMemo(() => {
    const weak = new Set<string>();
    for (const [wordId, state] of Object.entries(cardStates)) {
      const isWeak =
        (state.lapses !== undefined && state.lapses >= 2) ||
        (state.stability !== undefined && state.stability < 5 && state.repetitions > 0) ||
        (state.easeFactor < 1.8 && state.repetitions > 0);
      if (isWeak) weak.add(wordId);
    }
    return weak;
  }, [cardStates]);

  const filteredWords = useMemo(() => {
    let words = allWords;
    if (selectedCategory !== "all") {
      words = words.filter((w) => w.category === selectedCategory);
    }
    if (selectedLevel !== "all") {
      words = words.filter((w) => w.level === selectedLevel);
    }
    if (showWeakOnly) {
      words = words.filter((w) => weakWordIds.has(w.id));
    }
    return words;
  }, [allWords, selectedCategory, selectedLevel, showWeakOnly, weakWordIds]);

  const filteredDue = useMemo(() => {
    const filteredIds = new Set(filteredWords.map((w) => w.id));
    // When showing weak words, include all weak words even if not "due" yet
    if (showWeakOnly) {
      return filteredWords.map((w) => w.id);
    }
    return dueCards.filter((id) => filteredIds.has(id));
  }, [dueCards, filteredWords, showWeakOnly]);

  const currentWordId = filteredDue[currentIndex];
  const currentWord = allWords.find((w) => w.id === currentWordId);

  const handleRate = useCallback(
    (quality: ReviewQuality) => {
      if (!currentWordId) return;
      recordReview(currentWordId, quality);
      recordStudy();
      awardXP("flashcard_review");
      trackQuest("review-flashcards");
      sessionXPRef.current += 5;
      setSessionReviewed((n) => n + 1);
      setCardKey((k) => k + 1);
    },
    [currentWordId, recordReview, recordStudy, awardXP]
  );

  const handleSkip = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setCardKey((k) => k + 1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        // Space is handled by Flashcard component for reveal
      }
      if (e.key === "1") handleRate(1);
      if (e.key === "2") handleRate(3);
      if (e.key === "3") handleRate(4);
      if (e.key === "4") handleRate(5);
      if (e.key === "ArrowRight") handleSkip();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRate, handleSkip]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4 text-sm">
          <span className="text-text-secondary">
            Due: <span className="text-accent font-semibold">{filteredDue.length}</span>
          </span>
          <span className="text-text-secondary">
            Mastered: <span className="text-accent-green font-semibold">{masteredCount}</span>
          </span>
          <span className="text-text-secondary">
            Reviews: <span className="text-accent-blue font-semibold">{totalReviews}</span>
          </span>
          <span className="text-text-secondary">
            Session: <span className="text-purple-400 font-semibold">{sessionReviewed}</span>
          </span>
        </div>

        {/* Level pills + Category filter + Weak Words + Mark Known */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {LEVEL_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => {
                  setSelectedLevel(pill.value);
                  setCurrentIndex(0);
                  setCardKey((k) => k + 1);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  selectedLevel === pill.value
                    ? pill.activeClass
                    : "bg-bg-secondary text-text-muted border-transparent hover:border-border"
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
              setCardKey((k) => k + 1);
            }}
            className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-accent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowWeakOnly((v) => !v);
              setCurrentIndex(0);
              setCardKey((k) => k + 1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showWeakOnly
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30"
            }`}
            title={`${weakWordIds.size} weak word${weakWordIds.size !== 1 ? "s" : ""}`}
          >
            Weak ({weakWordIds.size})
          </button>
          <button
            onClick={() => setShowBulkMark((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showBulkMark
                ? "bg-accent-blue text-white border-accent-blue"
                : "bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 border-accent-blue/30"
            }`}
          >
            Mark Known
          </button>
        </div>
      </div>

      {/* Card area — bulk mark overlays on top */}
      <div className="relative">
        {showBulkMark && (
          <div className="absolute inset-0 z-10">
            <BulkMarkKnown
              allWords={allWords}
              categories={categories}
              cardStates={cardStates}
              bulkMarkKnown={bulkMarkKnown}
              onClose={() => setShowBulkMark(false)}
            />
          </div>
        )}

        {/* Card or completion message */}
        {currentWord ? (
          <Flashcard
            key={cardKey}
            word={currentWord}
            onRate={handleRate}
            onSkip={handleSkip}
            onMarkKnown={() => {
              bulkMarkKnown([currentWord.id]);
              setSessionReviewed((n) => n + 1);
              setCardKey((k) => k + 1);
            }}
          />
        ) : sessionReviewed > 0 ? (
          <SessionComplete
            stats={{
              wordsReviewed: sessionReviewed,
              xpEarned: sessionXPRef.current,
              mode: "Flashcard Review",
            }}
            onContinue={() => {
              setCurrentIndex(0);
              setCardKey((k) => k + 1);
              setSessionReviewed(0);
              sessionXPRef.current = 0;
            }}
            continueLabel="Review Again"
            onNavigate={onNavigate}
            suggestions={[
              { label: "Take a quiz", mode: "quiz", desc: "Test what you reviewed" },
              { label: "Try listening", mode: "listening", desc: "Practice hearing words" },
            ]}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
            <div className="text-4xl">&#127881;</div>
            <h2 className="text-2xl font-bold text-text-primary">
              All caught up!
            </h2>
            <p className="text-text-secondary max-w-md">
              No cards due for review. New cards will appear tomorrow, or switch categories to study more.
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setCardKey((k) => k + 1);
              }}
              className="mt-2 px-6 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              Review Again
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {filteredDue.length > 0 && (
        <div className="w-full max-w-lg mx-auto">
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, (currentIndex / filteredDue.length) * 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-text-muted text-center mt-1">
            {Math.min(currentIndex, filteredDue.length)} / {filteredDue.length}
          </div>
        </div>
      )}
    </div>
  );
}
