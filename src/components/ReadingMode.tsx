"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { PASSAGES } from "@/data/passages";
import type { ReviewQuality } from "@/types";
import AudioButton from "./AudioButton";
import ClickableHebrewLine from "./ClickableHebrewLine";
import SentenceBuilder from "./SentenceBuilder";
import ComprehensionQuiz from "./ComprehensionQuiz";
import Flashcard from "./Flashcard";
import { cn, stripNikud } from "@/lib/utils";
import { trackQuest } from "@/hooks/useQuests";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SK_COMPLETED_LINES, SK_LESSON_STEP } from "@/lib/storage-keys";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useStreak } from "@/hooks/useStreak";

// ── Lesson steps ──────────────────────────────────────────
type LessonStep = "read" | "build" | "test" | "words" | "complete";

const STEP_ORDER: LessonStep[] = ["read", "build", "test", "words", "complete"];

const STEP_LABELS: Record<LessonStep, string> = {
  read: "Read",
  build: "Build",
  test: "Test",
  words: "Words",
  complete: "Done",
};

interface ReadingModeProps {
  navigateToPassageId?: string;
  onPassageConsumed?: () => void;
}

export default function ReadingMode({ navigateToPassageId, onPassageConsumed }: ReadingModeProps) {
  const [selectedPassageId, setSelectedPassageId] = useState(PASSAGES[0]?.id);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showNikud, setShowNikud] = useState(true);
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const [completedLines, setCompletedLines, hydrated] = useLocalStorage<Record<string, number[]>>(
    SK_COMPLETED_LINES,
    {}
  );
  const [lessonSteps, setLessonSteps] = useLocalStorage<Record<string, LessonStep>>(
    SK_LESSON_STEP,
    {}
  );
  const didAutoSelect = useRef(false);

  // Vocab hooks (for step 4)
  const { allWords } = useVocabulary();
  const { dueCards, recordReview, bulkMarkKnown } = useSpacedRepetition(allWords);
  const { recordStudy } = useStreak();

  // Vocab drill state
  const [drillIndex, setDrillIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Navigate to a specific passage when requested via search
  useEffect(() => {
    if (navigateToPassageId && PASSAGES.some((p) => p.id === navigateToPassageId)) {
      setSelectedPassageId(navigateToPassageId);
      didAutoSelect.current = true;
      onPassageConsumed?.();
    }
  }, [navigateToPassageId, onPassageConsumed]);

  // Once localStorage hydrates, jump to the first non-completed passage
  useEffect(() => {
    if (!hydrated || didAutoSelect.current) return;
    didAutoSelect.current = true;
    const first = PASSAGES.find(
      (p) => (completedLines[p.id] ?? []).length < p.lines.length
    );
    if (first) setSelectedPassageId(first.id);
  }, [hydrated, completedLines]);

  // Reset expanded line & drill state when switching passages
  useEffect(() => {
    setExpandedLine(null);
    setDrillIndex(0);
    setCardKey((k) => k + 1);
  }, [selectedPassageId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const passage = PASSAGES.find((p) => p.id === selectedPassageId);

  // ── Passage vocab ──────────────────────────────────────
  const passageWords = useMemo(() => {
    const ids = passage?.vocabIds ?? [];
    return ids
      .map((id) => allWords.find((w) => w.id === id))
      .filter((w): w is NonNullable<typeof w> => w != null);
  }, [passage?.vocabIds, allWords]);

  const passageDue = useMemo(() => {
    const passageIds = new Set(passageWords.map((w) => w.id));
    return dueCards.filter((id) => passageIds.has(id));
  }, [dueCards, passageWords]);

  const hasVocabStep = passageWords.length > 0 && passageDue.length > 0;

  // ── Current lesson step ────────────────────────────────
  const currentStep: LessonStep = passage
    ? (lessonSteps[passage.id] ?? "read")
    : "read";

  const setCurrentStep = useCallback(
    (step: LessonStep) => {
      if (!passage) return;
      setLessonSteps((prev) => ({ ...prev, [passage.id]: step }));
    },
    [passage, setLessonSteps]
  );

  // ── Step navigation helpers ────────────────────────────
  const getNextStep = useCallback(
    (from: LessonStep): LessonStep => {
      const idx = STEP_ORDER.indexOf(from);
      for (let i = idx + 1; i < STEP_ORDER.length; i++) {
        const step = STEP_ORDER[i];
        // Skip "words" step if no vocab due
        if (step === "words" && !hasVocabStep) continue;
        return step;
      }
      return "complete";
    },
    [hasVocabStep]
  );

  const advanceStep = useCallback(() => {
    const next = getNextStep(currentStep);
    setCurrentStep(next);
    // Reset drill state when entering words step
    if (next === "words") {
      setDrillIndex(0);
      setCardKey((k) => k + 1);
    }
    // Track quest when passage lesson is fully completed
    if (next === "complete") {
      trackQuest("read-passage");
    }
  }, [currentStep, getNextStep, setCurrentStep]);

  // ── Completed-lines helpers ────────────────────────────
  const toggleLine = useCallback(
    (passageId: string, lineIndex: number) => {
      setCompletedLines((prev) => {
        const lines = prev[passageId] ?? [];
        const next = lines.includes(lineIndex)
          ? lines.filter((l) => l !== lineIndex)
          : [...lines, lineIndex];
        return { ...prev, [passageId]: next };
      });
    },
    [setCompletedLines]
  );

  const isLineCompleted = (passageId: string, lineIndex: number) =>
    (completedLines[passageId] ?? []).includes(lineIndex);

  const isAllCompleted = (passageId: string, lineCount: number) => {
    const done = (completedLines[passageId] ?? []).length;
    return done >= lineCount;
  };

  const toggleAllLines = useCallback(
    (passageId: string, lineCount: number) => {
      setCompletedLines((prev) => {
        const lines = prev[passageId] ?? [];
        if (lines.length >= lineCount) {
          return { ...prev, [passageId]: [] };
        }
        return { ...prev, [passageId]: Array.from({ length: lineCount }, (_, i) => i) };
      });
    },
    [setCompletedLines]
  );

  // ── Vocab drill handlers ───────────────────────────────
  const currentWordId = passageDue[drillIndex];
  const currentWord = allWords.find((w) => w.id === currentWordId);

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

  // ── Passage navigation ─────────────────────────────────
  const goToNextPassage = useCallback(() => {
    const currentIndex = PASSAGES.findIndex((p) => p.id === selectedPassageId);
    if (currentIndex < PASSAGES.length - 1) {
      setSelectedPassageId(PASSAGES[currentIndex + 1].id);
    }
  }, [selectedPassageId]);

  // ── Styling constants ──────────────────────────────────
  const levelLabel = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };
  const levelColor = {
    beginner: "text-accent-green bg-accent-green/10",
    intermediate: "text-accent-yellow bg-accent-yellow/10",
    advanced: "text-accent bg-accent/10",
  };

  const completedCount = passage ? (completedLines[passage.id] ?? []).length : 0;
  const totalLines = passage?.lines.length ?? 0;
  const progressPercent = totalLines > 0 ? Math.round((completedCount / totalLines) * 100) : 0;
  const allLinesRead = passage ? isAllCompleted(passage.id, passage.lines.length) : false;

  // ── Visible steps for indicator (exclude "complete") ───
  const visibleSteps = useMemo(() => {
    const steps: LessonStep[] = ["read", "build", "test"];
    if (hasVocabStep) steps.push("words");
    return steps;
  }, [hasVocabStep]);

  const stepIndex = (step: LessonStep) => STEP_ORDER.indexOf(step);
  const currentStepIndex = stepIndex(currentStep);

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Intro text */}
      <p className="text-sm text-text-muted leading-relaxed">
        Click any Hebrew word to see its definition and save it. Tap a sentence to mark it as read.
        Use the toggles below to show or hide transliteration and translation.
      </p>

      {/* Passage selector with level filter */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedPassageId}
          onChange={(e) => setSelectedPassageId(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:border-accent"
        >
          <optgroup label="Beginner">
            {PASSAGES.filter((p) => p.level === "beginner").map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.titleHebrew}
                {(completedLines[p.id] ?? []).length >= p.lines.length ? " \u2713" : ""}
              </option>
            ))}
          </optgroup>
          <optgroup label="Intermediate">
            {PASSAGES.filter((p) => p.level === "intermediate").map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.titleHebrew}
                {(completedLines[p.id] ?? []).length >= p.lines.length ? " \u2713" : ""}
              </option>
            ))}
          </optgroup>
          <optgroup label="Advanced">
            {PASSAGES.filter((p) => p.level === "advanced").map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.titleHebrew}
                {(completedLines[p.id] ?? []).length >= p.lines.length ? " \u2713" : ""}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Prev/Next arrows */}
        {passage && (() => {
          const currentIndex = PASSAGES.findIndex((p) => p.id === selectedPassageId);
          const hasPrev = currentIndex > 0;
          const hasNext = currentIndex < PASSAGES.length - 1;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => hasPrev && setSelectedPassageId(PASSAGES[currentIndex - 1].id)}
                disabled={!hasPrev}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  hasPrev
                    ? "border-border text-text-secondary hover:text-text-primary hover:bg-bg-card"
                    : "border-transparent text-text-muted/30 cursor-not-allowed"
                )}
                title="Previous passage"
              >
                {"\u2190"}
              </button>
              <span className="text-xs text-text-muted px-1">
                {currentIndex + 1}/{PASSAGES.length}
              </span>
              <button
                onClick={() => hasNext && setSelectedPassageId(PASSAGES[currentIndex + 1].id)}
                disabled={!hasNext}
                className={cn(
                  "p-2 rounded-lg border transition-colors",
                  hasNext
                    ? "border-border text-text-secondary hover:text-text-primary hover:bg-bg-card"
                    : "border-transparent text-text-muted/30 cursor-not-allowed"
                )}
                title="Next passage"
              >
                {"\u2192"}
              </button>
            </div>
          );
        })()}
      </div>

      {/* Passage card */}
      {passage && (
        <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h2 className="hebrew-text text-2xl font-bold text-text-primary">
                {passage.titleHebrew}
              </h2>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <h3 className="text-sm text-text-muted">{passage.title}</h3>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", levelColor[passage.level])}>
                {levelLabel[passage.level]}
              </span>
            </div>

            {/* ── Step indicator bar ─────────────────────── */}
            <div className="flex items-center gap-1 mb-4">
              {visibleSteps.map((step) => {
                const thisIdx = stepIndex(step);
                const isCompleted = currentStepIndex > thisIdx;
                const isCurrent = currentStep === step;
                const canClick = isCompleted; // can only revisit completed steps

                return (
                  <button
                    key={step}
                    onClick={() => canClick && setCurrentStep(step)}
                    disabled={!canClick && !isCurrent}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all text-xs font-medium",
                      isCompleted && "cursor-pointer text-accent-green hover:bg-accent-green/10",
                      isCurrent && "text-accent bg-accent/10",
                      !isCompleted && !isCurrent && "text-text-muted/50 cursor-not-allowed"
                    )}
                  >
                    {/* Step pip */}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        isCompleted && "bg-accent-green",
                        isCurrent && "bg-accent",
                        !isCompleted && !isCurrent && "bg-text-muted/30"
                      )}
                    />
                    {STEP_LABELS[step]}
                  </button>
                );
              })}
            </div>

            {/* Progress bar + controls row (only visible during Read step) */}
            {currentStep === "read" && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-green rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-text-muted">
                      {completedCount}/{totalLines} lines
                    </span>
                    <button
                      onClick={() => toggleAllLines(passage.id, passage.lines.length)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border",
                        isAllCompleted(passage.id, passage.lines.length)
                          ? "border-border text-text-muted hover:text-text-secondary hover:bg-bg-secondary"
                          : "border-accent-green/30 bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
                      )}
                    >
                      {isAllCompleted(passage.id, passage.lines.length) ? "Reset" : "Mark all read"}
                    </button>
                  </div>
                </div>

                {/* Display toggles */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setShowNikud((v) => !v)}
                    title="Toggle vowel points (nikud)"
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border hebrew-text",
                      showNikud
                        ? "border-accent-blue/40 bg-accent-blue/10 text-accent-blue"
                        : "border-border bg-transparent text-text-muted hover:text-text-secondary"
                    )}
                  >
                    נִ
                  </button>
                  <button
                    onClick={() => setShowTransliteration((v) => !v)}
                    title="Toggle transliteration"
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border",
                      showTransliteration
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-transparent text-text-muted hover:text-text-secondary"
                    )}
                  >
                    Aa
                  </button>
                  <button
                    onClick={() => setShowTranslation((v) => !v)}
                    title="Toggle translation"
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border",
                      showTranslation
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border bg-transparent text-text-muted hover:text-text-secondary"
                    )}
                  >
                    En
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* ── Step content ──────────────────────────────── */}
          <div className="py-2">
            {/* Step 1: Read */}
            {currentStep === "read" && (
              <>
                {passage.lines.map((line, i) => {
                  const completed = isLineCompleted(passage.id, i);
                  const isExpanded = expandedLine === i;
                  const showTrans = showTranslation || isExpanded;

                  return (
                    <div
                      key={i}
                      onClick={() => toggleLine(passage.id, i)}
                      className={cn(
                        "relative cursor-pointer transition-all mx-2 my-1 rounded-xl px-4 py-3 border-l-[3px]",
                        completed
                          ? "border-l-accent-green bg-accent-green/5"
                          : "border-l-transparent hover:bg-bg-card-hover"
                      )}
                    >
                      {/* Hebrew + transliteration row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 flex items-baseline gap-3 flex-wrap">
                          {showTransliteration && (
                            <span className="text-sm text-text-muted italic leading-relaxed">
                              {line.transliteration}
                            </span>
                          )}
                        </div>
                        <div className="flex items-start gap-2 shrink-0">
                          <ClickableHebrewLine
                            hebrew={showNikud ? line.hebrew : stripNikud(line.hebrew)}
                            className="text-xl leading-relaxed text-text-primary"
                          />
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <AudioButton text={line.hebrew} size="sm" />
                            {completed && (
                              <span className="text-accent-green text-sm">&#10003;</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Translation — always-on via toggle, or tap line to peek */}
                      {showTrans && (
                        <p className={cn(
                          "text-sm mt-1 leading-snug",
                          showTranslation ? "text-text-secondary" : "text-text-muted"
                        )}>
                          {line.translation}
                        </p>
                      )}

                      {/* Tap hint for translation when toggles are off */}
                      {!showTranslation && !isExpanded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedLine(i);
                          }}
                          className="text-xs text-text-muted/50 hover:text-text-muted mt-1 transition-colors"
                        >
                          show translation
                        </button>
                      )}
                      {!showTranslation && isExpanded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedLine(null);
                          }}
                          className="text-xs text-text-muted/50 hover:text-text-muted mt-1 transition-colors"
                        >
                          hide
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Continue button when all lines read */}
                {allLinesRead && (
                  <div className="px-4 py-4">
                    <button
                      onClick={advanceStep}
                      className="w-full py-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/25 transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to practice &#8594;
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Build Sentences */}
            {currentStep === "build" && (
              <div className="px-6 py-4 animate-[fadeIn_0.3s_ease-out]">
                <SentenceBuilder
                  key={`build-${passage.id}`}
                  lines={passage.lines}
                  onComplete={advanceStep}
                />
              </div>
            )}

            {/* Step 3: Test Yourself (Comprehension Quiz) */}
            {currentStep === "test" && (
              <div className="px-6 py-4 animate-[fadeIn_0.3s_ease-out]">
                <ComprehensionQuiz
                  key={`test-${passage.id}`}
                  lines={passage.lines}
                  onComplete={() => advanceStep()}
                />
              </div>
            )}

            {/* Step 4: Practice Words (vocab drill) */}
            {currentStep === "words" && (
              <div className="px-6 py-4 animate-[fadeIn_0.3s_ease-out]">
                {currentWord ? (
                  <>
                    <div className="text-xs text-text-muted text-center mb-4">
                      {Math.min(drillIndex, passageDue.length)} / {passageDue.length} words
                    </div>
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
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="text-3xl">&#10024;</div>
                    <p className="text-text-secondary text-sm">
                      All passage words reviewed!
                    </p>
                    <button
                      onClick={advanceStep}
                      className="px-5 py-2 rounded-xl bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors font-medium text-sm"
                    >
                      Continue &#8594;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === "complete" && (
              <div className="flex flex-col items-center gap-4 py-10 px-6 animate-[fadeIn_0.3s_ease-out]">
                <div className="text-4xl">&#127775;</div>
                <p className="text-lg font-semibold text-text-primary">
                  Lesson complete!
                </p>
                <p className="text-sm text-text-muted text-center">
                  You read, built sentences, and tested yourself on &ldquo;{passage.title}&rdquo;.
                </p>
                {(() => {
                  const currentIndex = PASSAGES.findIndex((p) => p.id === selectedPassageId);
                  const hasNext = currentIndex < PASSAGES.length - 1;
                  if (!hasNext) return (
                    <p className="text-sm text-accent-green font-medium">
                      You&rsquo;ve completed all passages!
                    </p>
                  );
                  const next = PASSAGES[currentIndex + 1];
                  return (
                    <button
                      onClick={goToNextPassage}
                      className="w-full max-w-xs py-3 rounded-xl bg-accent-green/15 border border-accent-green/30 text-accent-green text-sm font-medium hover:bg-accent-green/25 transition-colors flex items-center justify-center gap-2"
                    >
                      Next Passage: {next.title} &#8594;
                    </button>
                  );
                })()}
                {/* Restart lesson */}
                <button
                  onClick={() => setCurrentStep("read")}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  Restart this lesson
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
