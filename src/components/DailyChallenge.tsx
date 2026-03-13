"use client";

import { useState, useCallback, useEffect } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { useDailyChallenge, DailyQuestion } from "@/hooks/useDailyChallenge";
import { cn } from "@/lib/utils";
import AudioButton from "./AudioButton";

export default function DailyChallenge() {
  const { allWords } = useVocabulary();
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();
  const {
    state,
    questions,
    isAvailable,
    isInProgress,
    isCompleted,
    startChallenge,
    submitAnswer,
    shareText,
    hydrated,
  } = useDailyChallenge(allWords);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentQ = questions[state.currentQuestion];
  const answered = state.answers[state.currentQuestion] !== null;

  // Reset selection when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
  }, [state.currentQuestion]);

  // Award XP on completion
  useEffect(() => {
    if (isCompleted && !xpAwarded) {
      setXpAwarded(true);
      recordStudy();
      awardXP("daily_challenge_complete");
      if (state.score === state.totalQuestions) {
        awardXP("daily_challenge_perfect");
      }
    }
  }, [isCompleted, xpAwarded, state.score, state.totalQuestions, awardXP, recordStudy]);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (answered || showResult) return;
      setSelectedOption(optionIndex);
    },
    [answered, showResult]
  );

  const handleConfirm = useCallback(() => {
    if (selectedOption === null) return;
    submitAnswer(state.currentQuestion, selectedOption);
    setShowResult(true);

    const q = questions[state.currentQuestion];
    if (q.options[selectedOption] === q.correctAnswer) {
      awardXP("daily_challenge_correct");
    }
  }, [selectedOption, state.currentQuestion, submitAnswer, questions, awardXP]);

  const handleNext = useCallback(() => {
    setShowResult(false);
    setSelectedOption(null);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
  }, [shareText]);

  if (!hydrated) return null;

  // Not yet started today
  if (isAvailable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center text-4xl shadow-lg shadow-accent/20">
            {"\u2728"}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-yellow flex items-center justify-center text-sm font-bold text-black animate-bounce">
            !
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Daily Challenge
          </h2>
          <p className="text-text-secondary max-w-sm">
            5 questions to test your Hebrew. A new challenge every day — come
            back tomorrow for a fresh set!
          </p>
        </div>

        <button
          onClick={startChallenge}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-blue text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25"
        >
          Start Today&apos;s Challenge
        </button>

        <div className="flex gap-6 text-sm text-text-muted">
          <span>5 questions</span>
          <span>{"\u00B7"}</span>
          <span>+50 XP minimum</span>
          <span>{"\u00B7"}</span>
          <span>Bonus for perfect!</span>
        </div>
      </div>
    );
  }

  // Completed today — show results
  if (isCompleted) {
    const perfect = state.score === state.totalQuestions;
    const percentage = Math.round((state.score / state.totalQuestions) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="text-6xl">
          {perfect ? "\uD83C\uDF1F" : percentage >= 60 ? "\uD83C\uDF89" : "\uD83D\uDCAA"}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            {perfect
              ? "Perfect Score!"
              : percentage >= 80
                ? "Great Job!"
                : percentage >= 60
                  ? "Nice Work!"
                  : "Keep Practicing!"}
          </h2>
          <p className="text-text-secondary">
            You scored {state.score}/{state.totalQuestions} ({percentage}%)
          </p>
        </div>

        {/* Result grid */}
        <div className="flex gap-2">
          {state.answers.map((answer, i) => {
            const q = questions[i];
            if (!q) return null;
            const correct = answer !== null && q.options[answer] === q.correctAnswer;
            return (
              <div
                key={i}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold transition-all",
                  correct
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                )}
              >
                {correct ? "\u2713" : "\u2717"}
              </div>
            );
          })}
        </div>

        {/* XP earned */}
        <div className="flex gap-4 text-sm">
          <span className="text-accent-yellow font-medium">
            +{state.score * 15 + 50 + (perfect ? 75 : 0)} XP earned
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-6 py-2.5 rounded-xl bg-bg-card border border-border hover:bg-bg-card-hover text-text-primary font-medium transition-colors flex items-center gap-2"
          >
            {copied ? "\u2713 Copied!" : "\uD83D\uDCCB Share Results"}
          </button>
          {shareText && (
            <div className="bg-bg-card rounded-xl border border-border p-4 text-sm font-mono text-text-secondary whitespace-pre max-w-xs text-center">
              {shareText}
            </div>
          )}
        </div>

        <p className="text-xs text-text-muted mt-4">
          Come back tomorrow for a new challenge!
        </p>
      </div>
    );
  }

  // In progress — show current question
  if (!currentQ) return null;

  const correctOptionIndex = currentQ.options.indexOf(currentQ.correctAnswer);
  const wasCorrect =
    showResult && selectedOption !== null && selectedOption === correctOptionIndex;
  const wasWrong = showResult && !wasCorrect;

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <span className="text-sm text-text-muted">Daily Challenge</span>
        <span className="text-sm font-medium text-accent">
          {state.currentQuestion + 1} / {state.totalQuestions}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 w-full">
        {Array.from({ length: state.totalQuestions }).map((_, i) => {
          const a = state.answers[i];
          const q = questions[i];
          let color = "bg-bg-secondary"; // unanswered
          if (a !== null && q) {
            color =
              q.options[a] === q.correctAnswer
                ? "bg-green-500"
                : "bg-red-500";
          } else if (i === state.currentQuestion) {
            color = "bg-accent";
          }
          return (
            <div
              key={i}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                color
              )}
            />
          );
        })}
      </div>

      {/* Question card */}
      <div className="w-full bg-bg-card rounded-2xl border border-border p-8 flex flex-col items-center gap-5">
        {/* Challenge type badge */}
        <span className="text-xs text-text-muted uppercase tracking-wider px-3 py-1 bg-bg-secondary rounded-full">
          {currentQ.type === "translate"
            ? "Translate"
            : currentQ.type === "reverse"
              ? "Find the Hebrew"
              : currentQ.type === "transliterate"
                ? "Pronunciation"
                : currentQ.type === "match-sound"
                  ? "Sound Match"
                  : "Fill in the Blank"}
        </span>

        {/* Prompt */}
        <p className="text-lg text-text-primary text-center font-medium">
          {currentQ.prompt}
        </p>

        {/* Hebrew display */}
        {currentQ.promptHebrew && (
          <div className="flex items-center gap-3">
            <span className="hebrew-text text-4xl font-bold text-text-primary">
              {currentQ.promptHebrew}
            </span>
            <AudioButton
              text={currentQ.promptHebrew.replace(/[\u0591-\u05C7]/g, "")}
              size="md"
            />
          </div>
        )}

        {/* Options */}
        <div className="w-full grid grid-cols-1 gap-3 mt-2">
          {currentQ.options.map((option, i) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            const isSelected = selectedOption === i;
            const isCorrectOption = i === correctOptionIndex;

            let optionStyle = "border-border hover:border-accent/50 hover:bg-accent/5";
            if (isSelected && !showResult) {
              optionStyle = "border-accent bg-accent/10 ring-2 ring-accent/30";
            }
            if (showResult) {
              if (isCorrectOption) {
                optionStyle =
                  "border-green-500 bg-green-500/10 ring-2 ring-green-500/30";
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  "border-red-500 bg-red-500/10 ring-2 ring-red-500/30";
              } else {
                optionStyle = "border-border opacity-50";
              }
            }

            const isHebrew =
              currentQ.type === "reverse" ||
              currentQ.type === "match-sound" ||
              currentQ.type === "fill-blank";

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={cn(
                  "w-full px-5 py-3.5 rounded-xl border text-left transition-all flex items-center gap-3",
                  optionStyle,
                  showResult ? "cursor-default" : "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                    isSelected && !showResult
                      ? "bg-accent text-white"
                      : showResult && isCorrectOption
                        ? "bg-green-500 text-white"
                        : showResult && isSelected
                          ? "bg-red-500 text-white"
                          : "bg-bg-secondary text-text-muted"
                  )}
                >
                  {letter}
                </span>
                <span
                  className={cn(
                    "text-base",
                    isHebrew ? "hebrew-text text-xl" : "",
                    showResult && isCorrectOption
                      ? "text-green-400 font-medium"
                      : "text-text-primary"
                  )}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {!showResult ? (
        <button
          onClick={handleConfirm}
          disabled={selectedOption === null}
          className={cn(
            "px-8 py-3 rounded-xl font-semibold text-lg transition-all",
            selectedOption !== null
              ? "bg-accent hover:bg-accent-hover text-white hover:scale-105"
              : "bg-bg-secondary text-text-muted cursor-not-allowed"
          )}
        >
          Confirm
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "text-lg font-semibold",
              wasCorrect ? "text-green-400" : "text-red-400"
            )}
          >
            {wasCorrect ? "Correct!" : "Not quite!"}
          </div>
          {wasWrong && (
            <p className="text-sm text-text-secondary">
              The answer was:{" "}
              <span className="text-accent font-medium">
                {currentQ.correctAnswer}
              </span>
            </p>
          )}
          {state.currentQuestion < state.totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all hover:scale-105"
            >
              Next Question
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
