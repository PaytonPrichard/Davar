"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSettings } from "@/hooks/useSettings";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import { useQuizStats } from "@/hooks/useQuizStats";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { fuzzyMatch } from "@/lib/fuzzy-match";
import { prompt, PROMPTS } from "@/lib/ai";
import { shuffle } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { trackQuest } from "@/hooks/useQuests";
import { Word, FuzzyMatchResult, AppMode } from "@/types";
import AudioButton from "./AudioButton";
import SessionComplete from "./SessionComplete";

/* ── Adaptive difficulty helpers ─────────────────────────── */

type DifficultyMode = "easy" | "balanced" | "hard";

function getDifficultyMode(recentResults: boolean[]): DifficultyMode {
  if (recentResults.length < 3) return "balanced";
  const correct = recentResults.filter(Boolean).length;
  const accuracy = correct / recentResults.length;
  if (accuracy < 0.5) return "easy";
  if (accuracy > 0.75) return "hard";
  return "balanced";
}

function getDifficultyLabel(mode: DifficultyMode): { label: string; icon: string; color: string } {
  switch (mode) {
    case "easy":
      return { label: "Easy", icon: "\u{1F331}", color: "text-accent-green" };
    case "hard":
      return { label: "Hard", icon: "\u{1F525}", color: "text-accent-yellow" };
    default:
      return { label: "Balanced", icon: "\u2696\uFE0F", color: "text-accent-blue" };
  }
}

/**
 * Sort words by difficulty preference.
 * "easy" prefers words the user has seen more (higher repetitions / stability).
 * "hard" prefers words with fewer reviews or higher level.
 * "balanced" returns a shuffled mix.
 */
function weightedWordSelection(
  words: Word[],
  mode: DifficultyMode,
  cardStates: Record<string, { repetitions?: number; stability?: number }>,
  count: number,
): Word[] {
  if (mode === "balanced") return shuffle(words).slice(0, count);

  const scored = words.map((w) => {
    const cs = cardStates[w.id];
    const reps = cs?.repetitions ?? 0;
    const stab = cs?.stability ?? 0;
    const levelScore = w.level === "A1" ? 0 : w.level === "A2" ? 1 : 2;
    // Higher score = "harder" word
    const difficultyScore = levelScore * 3 - reps - stab;
    return { word: w, difficultyScore };
  });

  if (mode === "easy") {
    // Prefer easier words (lower difficulty score)
    scored.sort((a, b) => a.difficultyScore - b.difficultyScore);
  } else {
    // Prefer harder words (higher difficulty score)
    scored.sort((a, b) => b.difficultyScore - a.difficultyScore);
  }

  // Take the top portion but still shuffle within that to add variety
  const pool = scored.slice(0, Math.max(count * 2, Math.ceil(scored.length * 0.6)));
  return shuffle(pool.map((s) => s.word)).slice(0, count);
}

import { LevelFilter, LEVEL_PILLS, getInitialLevelFilter } from "@/lib/level-filter";

export default function QuizMode({ onNavigate }: { onNavigate?: (mode: AppMode) => void }) {
  const { allWords, categories } = useVocabulary();
  const { settings } = useSettings();
  const { recordStudy } = useStreak();
  const { awardXP } = useXP();
  const { recordQuiz } = useQuizStats();
  const { cardStates } = useSpacedRepetition(allWords);
  const [aiHint, setAiHint] = useState<string>("");
  const [aiHintLoading, setAiHintLoading] = useState(false);
  const sessionXPRef = useRef(0);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>(getInitialLevelFilter);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<FuzzyMatchResult | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  // Adaptive difficulty: track last 10 answers
  const [recentResults, setRecentResults] = useState<boolean[]>([]);
  const difficultyMode = useMemo(() => getDifficultyMode(recentResults), [recentResults]);
  const difficultyInfo = useMemo(() => getDifficultyLabel(difficultyMode), [difficultyMode]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize quiz words (adaptive difficulty influences word selection)
  useEffect(() => {
    let words =
      selectedCategory === "all"
        ? allWords
        : allWords.filter((w) => w.category === selectedCategory);
    if (selectedLevel !== "all") {
      words = words.filter((w) => w.level === selectedLevel);
    }
    setQuizWords(weightedWordSelection(words, difficultyMode, cardStates, 20));
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setResult(null);
    setInput("");
    setRecentResults([]);
    recordedRef.current = false;
  }, [allWords, selectedCategory, selectedLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentWord = quizWords[currentIndex];

  const handleSubmit = useCallback(() => {
    if (!currentWord || !input.trim()) return;

    const matchResult = fuzzyMatch(input, currentWord.transliteration);
    const isCorrect = matchResult.status !== "incorrect";
    setResult(matchResult);
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // Track for adaptive difficulty (keep last 10)
    setRecentResults((prev) => {
      const next = [...prev, isCorrect];
      return next.length > 10 ? next.slice(-10) : next;
    });

    if (isCorrect) {
      setStreak((s) => {
        const newStreak = s + 1;
        if (newStreak >= 5) trackQuest("quiz-streak");
        return newStreak;
      });
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
    // Skips count as incorrect for adaptive difficulty
    setRecentResults((prev) => {
      const next = [...prev, false];
      return next.length > 10 ? next.slice(-10) : next;
    });
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
          let words =
            selectedCategory === "all"
              ? allWords
              : allWords.filter((w) => w.category === selectedCategory);
          if (selectedLevel !== "all") {
            words = words.filter((w) => w.level === selectedLevel);
          }
          setQuizWords(weightedWordSelection(words, difficultyMode, cardStates, 20));
          setCurrentIndex(0);
          setScore({ correct: 0, total: 0 });
          setStreak(0);
          setResult(null);
          setInput("");
          setRecentResults([]);
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
        <div className="flex gap-4 text-sm items-center">
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
          {/* Adaptive difficulty badge */}
          {recentResults.length >= 3 && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors",
                difficultyMode === "easy"
                  ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                  : difficultyMode === "hard"
                    ? "bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow"
                    : "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
              )}
              title={`Adaptive difficulty: ${difficultyInfo.label} (${Math.round((recentResults.filter(Boolean).length / recentResults.length) * 100)}% accuracy)`}
            >
              <span>{difficultyInfo.icon}</span>
              {difficultyInfo.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {LEVEL_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setSelectedLevel(pill.value)}
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
