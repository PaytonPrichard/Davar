"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSettings } from "@/hooks/useSettings";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import { useQuizStats } from "@/hooks/useQuizStats";
import { fuzzyMatch } from "@/lib/fuzzy-match";
import { prompt, PROMPTS } from "@/lib/ai";
import { shuffle } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Word, FuzzyMatchResult, AppMode } from "@/types";
import AudioButton from "./AudioButton";
import SessionComplete from "./SessionComplete";

export default function QuizMode({ onNavigate }: { onNavigate?: (mode: AppMode) => void }) {
  const { allWords, categories } = useVocabulary();
  const { settings } = useSettings();
  const { recordStudy } = useStreak();
  const { awardXP } = useXP();
  const { recordQuiz } = useQuizStats();
  const [aiHint, setAiHint] = useState<string>("");
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const sessionXPRef = useRef(0);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<FuzzyMatchResult | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize quiz words
  useEffect(() => {
    const words =
      selectedCategory === "all"
        ? allWords
        : allWords.filter((w) => w.category === selectedCategory);
    setQuizWords(shuffle(words).slice(0, 20));
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setResult(null);
    setInput("");
    recordedRef.current = false;
  }, [allWords, selectedCategory]);

  const currentWord = quizWords[currentIndex];

  const handleSubmit = useCallback(() => {
    if (!currentWord || !input.trim()) return;

    const matchResult = fuzzyMatch(input, currentWord.transliteration);
    setResult(matchResult);
    setScore((prev) => ({
      correct:
        prev.correct + (matchResult.status !== "incorrect" ? 1 : 0),
      total: prev.total + 1,
    }));

    if (matchResult.status !== "incorrect") {
      setStreak((s) => s + 1);
      recordStudy();
      if (matchResult.status === "correct") {
        awardXP("quiz_correct");
        sessionXPRef.current += 10;
      } else {
        awardXP("quiz_close");
        sessionXPRef.current += 5;
      }
    } else {
      setStreak(0);
    }
  }, [currentWord, input, recordStudy]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setInput("");
    setResult(null);
    setAiHint("");
    setAiHintLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const fetchAiHint = useCallback(async () => {
    if (!currentWord || aiHintLoading) return;
    if (settings.aiProvider === "none" || !settings.aiApiKey) {
      setAiHint("Configure an AI provider in Settings for smart hints.");
      return;
    }
    setAiHintLoading(true);
    const res = await prompt(
      PROMPTS.quizFeedback(
        currentWord.hebrewNikud,
        input,
        currentWord.transliteration
      ),
      settings,
      "You are a Hebrew tutor. Give a brief, helpful explanation."
    );
    setAiHint(res.text || res.error || "");
    setAiHintLoading(false);
  }, [currentWord, input, settings, aiHintLoading]);

  const handleSkip = useCallback(() => {
    setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    setStreak(0);
    handleNext();
  }, [handleNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && result) {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "Tab" && !result) {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [result, handleNext, handleSkip]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Record quiz stats when quiz finishes
  const recordedRef = useRef(false);
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    if (!currentWord && score.total > 0 && !recordedRef.current) {
      recordedRef.current = true;
      recordQuiz(score.correct, score.total);
    }
  }, [currentWord, score, recordQuiz]);
  /* eslint-enable react-hooks/immutability */

  if (!currentWord && score.total > 0) {
    const isPerfect = score.correct === score.total;
    return (
      <SessionComplete
        stats={{
          wordsReviewed: score.total,
          correctCount: score.correct,
          totalCount: score.total,
          xpEarned: sessionXPRef.current,
          isPerfect,
          mode: "Quiz",
        }}
        onContinue={() => {
          const words =
            selectedCategory === "all"
              ? allWords
              : allWords.filter((w) => w.category === selectedCategory);
          setQuizWords(shuffle(words).slice(0, 20));
          setCurrentIndex(0);
          setScore({ correct: 0, total: 0 });
          setStreak(0);
          setResult(null);
          setInput("");
          sessionXPRef.current = 0;
          recordedRef.current = false; // eslint-disable-line react-hooks/immutability
        }}
        continueLabel="New Quiz"
        onNavigate={onNavigate}
        suggestions={[
          { label: "Review flashcards", mode: "flashcards", desc: "Strengthen weak words" },
          { label: "Read a passage", mode: "reading", desc: "See words in context" },
        ]}
      />
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="text-4xl">&#128218;</div>
        <h2 className="text-xl font-bold text-text-primary">No words to quiz</h2>
        <p className="text-text-secondary max-w-md text-sm">
          Start with flashcards to learn some vocabulary first, then come back for a quiz.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4 text-sm">
          <span className="text-text-secondary">
            Score:{" "}
            <span className="text-accent-green font-semibold">
              {score.correct}/{score.total}
            </span>
          </span>
          {streak >= 3 && (
            <span className="text-accent-yellow font-semibold">
              &#128293; {streak} streak!
            </span>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-accent"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz card */}
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
        <div className="w-full bg-bg-card rounded-2xl border border-border p-8 flex flex-col items-center gap-4">
          <div className="text-xs text-text-muted uppercase tracking-wider">
            Type the transliteration
          </div>
          <div className="hebrew-text text-5xl font-bold text-text-primary">
            {currentWord.hebrewNikud}
          </div>
          <AudioButton text={currentWord.hebrew} size="md" />
          <div className="text-sm text-text-secondary">
            ({currentWord.translation})
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!result) handleSubmit();
              else handleNext();
            }}
            className="w-full"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!!result}
              placeholder="Type transliteration..."
              className={cn(
                "w-full px-4 py-3 rounded-xl text-center text-lg bg-bg-secondary border transition-colors",
                result?.status === "correct"
                  ? "border-green-500 text-green-400"
                  : result?.status === "close"
                    ? "border-yellow-500 text-yellow-400"
                    : result?.status === "incorrect"
                      ? "border-red-500 text-red-400"
                      : "border-border text-text-primary focus:border-accent"
              )}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>

          {/* Result feedback */}
          {result && (
            <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
              <div
                className={cn(
                  "text-lg font-semibold",
                  result.status === "correct"
                    ? "text-green-400"
                    : result.status === "close"
                      ? "text-yellow-400"
                      : "text-red-400"
                )}
              >
                {result.message}
              </div>
              {result.status === "incorrect" && (
                <div className="text-sm text-text-secondary">
                  Answer:{" "}
                  <span className="text-accent font-medium">
                    {currentWord.transliteration}
                  </span>
                </div>
              )}
              {/* AI Explain button */}
              {result.status !== "correct" && !aiHint && (
                <button
                  onClick={fetchAiHint}
                  disabled={aiHintLoading}
                  className="text-xs text-text-muted hover:text-accent transition-colors mt-1"
                >
                  {aiHintLoading ? "Thinking..." : "Explain why?"}
                </button>
              )}
              {aiHint && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-sm text-text-secondary mt-1 max-w-md text-left">
                  {aiHint}
                </div>
              )}
              <button
                onClick={handleNext}
                className="mt-2 px-6 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
              >
                Next (Enter)
              </button>
            </div>
          )}
        </div>

        {/* Skip */}
        {!result && (
          <button
            onClick={handleSkip}
            className="text-text-muted hover:text-text-secondary text-sm transition-colors"
          >
            Skip (Tab)
          </button>
        )}

        {/* Progress */}
        <div className="w-full">
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{
                width: `${(currentIndex / quizWords.length) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs text-text-muted text-center mt-1">
            {currentIndex + 1} / {quizWords.length}
          </div>
        </div>
      </div>
    </div>
  );
}
