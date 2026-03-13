"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { PASSAGES } from "@/data/passages";
import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/hooks/useSettings";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { prompt, PROMPTS } from "@/lib/ai";
import { cn, shuffle, stripNikud } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────── */

interface ClozeItem {
  passageTitle: string;
  fullHebrew: string;
  hebrewWithBlank: string;
  missingWord: string;
  translation: string;
  transliteration: string;
  distractors: string[];
}

/* ── Build cloze items from passages ──────────────────────── */

function buildClozeItems(level: string): ClozeItem[] {
  const passages = level === "all"
    ? PASSAGES
    : PASSAGES.filter((p) => p.level === level);

  const items: ClozeItem[] = [];

  for (const passage of passages) {
    for (const line of passage.lines) {
      const words = line.hebrew.split(/\s+/).filter((w) => w.length > 1);
      if (words.length < 3) continue;

      // Pick a content word (skip first/last, prefer longer words)
      const candidates = words.slice(1, -1).filter((w) => stripNikud(w).length >= 2);
      if (candidates.length === 0) continue;

      const missing = candidates[Math.floor(Math.random() * candidates.length)];
      const blank = line.hebrew.replace(missing, "______");

      // Build distractors from other words in the passage
      const otherWords = passage.lines
        .flatMap((l) => l.hebrew.split(/\s+/))
        .filter((w) => stripNikud(w) !== stripNikud(missing) && w.length > 1);
      const uniqueOther = [...new Set(otherWords)];
      const distractors = shuffle(uniqueOther).slice(0, 3);

      items.push({
        passageTitle: passage.title,
        fullHebrew: line.hebrew,
        hebrewWithBlank: blank,
        missingWord: missing,
        translation: line.translation,
        transliteration: line.transliteration,
        distractors,
      });
    }
  }

  return shuffle(items);
}

/* ── Component ────────────────────────────────────────────── */

export default function ClozeMode() {
  const { settings } = useSettings();
  const { speak } = useAudio(settings);
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();

  const [level, setLevel] = useState<string>("all");
  const [items, setItems] = useState<ClozeItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showTranslation, setShowTranslation] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const answeredRef = useRef(false);

  const QUESTIONS_PER_SESSION = 10;

  // Build items on mount / level change
  useEffect(() => {
    const built = buildClozeItems(level);
    setItems(built.slice(0, QUESTIONS_PER_SESSION));
    setIdx(0);
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    resetQuestion();
  }, [level]);

  const item = items[idx];

  function resetQuestion() {
    setSelected(null);
    setResult(null);
    setShowHint(false);
    setHint("");
    setShowTranslation(false);
    answeredRef.current = false;
  }

  // Shuffle the answer options
  const options = useMemo(() => {
    if (!item) return [];
    return shuffle([item.missingWord, ...item.distractors]);
  }, [item]);

  /* ── Answer handler ────────────────────────────────────── */
  const handleSelect = useCallback(
    (word: string) => {
      if (answeredRef.current || !item) return;
      answeredRef.current = true;
      setSelected(word);

      const isCorrect =
        stripNikud(word) === stripNikud(item.missingWord);

      setResult(isCorrect ? "correct" : "incorrect");
      setScore((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));

      if (isCorrect) {
        awardXP("cloze_correct");
        recordStudy();
        speak(item.fullHebrew);
      }
    },
    [item, awardXP, recordStudy, speak]
  );

  /* ── Next question ─────────────────────────────────────── */
  const next = useCallback(() => {
    if (idx + 1 >= items.length) {
      setSessionComplete(true);
      return;
    }
    setIdx((i) => i + 1);
    resetQuestion();
  }, [idx, items.length]);

  /* ── AI hint ───────────────────────────────────────────── */
  const getHint = useCallback(async () => {
    if (!item || hintLoading) return;
    if (settings.aiProvider === "none" || !settings.aiApiKey) {
      setHint("Configure an AI provider in Settings for smart hints.");
      setShowHint(true);
      return;
    }

    setHintLoading(true);
    setShowHint(true);
    const res = await prompt(
      PROMPTS.clozeHint(item.hebrewWithBlank, item.missingWord),
      settings,
      "You are a Hebrew tutor. Give a subtle hint without revealing the answer."
    );
    setHint(res.text || res.error || "Could not generate hint.");
    setHintLoading(false);
  }, [item, settings, hintLoading]);

  /* ── Session complete ──────────────────────────────────── */
  if (sessionComplete) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">{pct >= 80 ? "\uD83C\uDF1F" : pct >= 50 ? "\uD83D\uDC4D" : "\uD83D\uDCAA"}</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Cloze Complete!
          </h2>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Score</div>
              <div className={cn(
                "text-xl font-bold",
                pct >= 80 ? "text-accent-green" : pct >= 50 ? "text-accent-yellow" : "text-accent"
              )}>
                {score.correct}/{score.total}
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Accuracy</div>
              <div className={cn(
                "text-xl font-bold",
                pct >= 80 ? "text-accent-green" : pct >= 50 ? "text-accent-yellow" : "text-accent"
              )}>
                {pct}%
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const built = buildClozeItems(level);
              setItems(built.slice(0, QUESTIONS_PER_SESSION));
              setIdx(0);
              setScore({ correct: 0, total: 0 });
              setSessionComplete(false);
              resetQuestion();
            }}
            className="w-full px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-text-secondary text-sm">No cloze items available for this level.</p>
      </div>
    );
  }

  /* ── Main UI ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text-primary">Fill in the Blank</h2>
          <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full">
            {idx + 1}/{items.length}
          </span>
        </div>

        {/* Level filter */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:border-accent"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 rounded-full"
          style={{ width: `${((idx + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-text-secondary">
          Correct: <span className="text-accent-green font-semibold">{score.correct}</span>
        </span>
        {score.total - score.correct > 0 && (
          <span className="text-text-secondary">
            Wrong: <span className="text-red-400 font-semibold">{score.total - score.correct}</span>
          </span>
        )}
      </div>

      {/* Passage reference */}
      <p className="text-xs text-text-muted">
        From: <span className="italic">{item.passageTitle}</span>
      </p>

      {/* The sentence with blank */}
      <div className="bg-bg-card border border-border rounded-2xl p-6 text-center">
        <p className="hebrew-text text-2xl leading-relaxed text-text-primary" dir="rtl">
          {result
            ? item.fullHebrew
            : item.hebrewWithBlank}
        </p>

        {/* Translation toggle */}
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="mt-3 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {showTranslation ? "Hide translation" : "Show translation"}
        </button>
        {showTranslation && (
          <p className="text-sm text-text-secondary mt-1 italic">
            {item.translation}
          </p>
        )}
      </div>

      {/* Answer options */}
      {!result && (
        <div className="grid grid-cols-2 gap-3">
          {options.map((word, i) => (
            <button
              key={i}
              onClick={() => handleSelect(word)}
              className="hebrew-text text-lg p-4 rounded-xl border-2 border-border bg-bg-card hover:border-accent/50 hover:bg-bg-card-hover transition-all"
              dir="rtl"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Result feedback */}
      {result && (
        <div className="animate-[fadeIn_0.2s_ease-out]">
          <div
            className={cn(
              "rounded-xl p-4 text-center mb-3",
              result === "correct"
                ? "bg-accent-green/10 border border-accent-green/30"
                : "bg-red-500/10 border border-red-500/30"
            )}
          >
            <p className={cn(
              "font-semibold",
              result === "correct" ? "text-accent-green" : "text-red-400"
            )}>
              {result === "correct" ? "Correct!" : "Not quite"}
            </p>
            {result === "incorrect" && (
              <p className="text-sm text-text-secondary mt-1">
                The answer was:{" "}
                <span className="hebrew-text font-semibold text-text-primary">
                  {item.missingWord}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={next}
            className="w-full px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
          >
            {idx + 1 >= items.length ? "See Results" : "Next"}
          </button>
        </div>
      )}

      {/* Hint button (before answering) */}
      {!result && (
        <div className="text-center">
          {!showHint ? (
            <button
              onClick={getHint}
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              Need a hint?
            </button>
          ) : (
            <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl p-3 text-sm text-text-secondary">
              {hintLoading ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                hint
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
