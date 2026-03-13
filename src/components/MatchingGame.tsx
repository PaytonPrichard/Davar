"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Word, XP_VALUES } from "@/types";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { cn, shuffle } from "@/lib/utils";
import { trackQuest } from "@/hooks/useQuests";

/* ── Types ──────────────────────────────────────────────────── */

interface GameCard {
  id: string;
  wordId: string;
  content: string;
  type: "hebrew" | "english";
}

type CardStatus = "idle" | "selected" | "matched" | "wrong";

interface CardState {
  card: GameCard;
  status: CardStatus;
}

/* ── Constants ──────────────────────────────────────────────── */

const PAIR_COUNT_OPTIONS = [4, 5, 6] as const;
const WRONG_FLASH_MS = 800;

/* ── Helpers ────────────────────────────────────────────────── */

function buildCards(words: Word[]): GameCard[] {
  const hebrewCards: GameCard[] = words.map((w) => ({
    id: `h-${w.id}`,
    wordId: w.id,
    content: w.hebrewNikud || w.hebrew,
    type: "hebrew",
  }));

  const englishCards: GameCard[] = words.map((w) => ({
    id: `e-${w.id}`,
    wordId: w.id,
    content: w.translation,
    type: "english",
  }));

  return shuffle([...hebrewCards, ...englishCards]);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Component ──────────────────────────────────────────────── */

export default function MatchingGame() {
  const { allWords, categories } = useVocabulary();
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();

  /* ── Configuration ──────────────────────────────────────── */
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pairCount, setPairCount] = useState<number>(6);

  /* ── Game state ─────────────────────────────────────────── */
  const [cards, setCards] = useState<CardState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedWordIds, setMatchedWordIds] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  const lockRef = useRef(false); // prevents clicks during wrong-flash animation
  const awardedRef = useRef(false); // prevents double XP award

  /* ── Filtered word pool ─────────────────────────────────── */
  const wordPool = useMemo(() => {
    if (selectedCategory === "all") return allWords;
    return allWords.filter((w) => w.category === selectedCategory);
  }, [allWords, selectedCategory]);

  /* ── Initialize / restart game ──────────────────────────── */
  const startGame = useCallback(() => {
    const count = Math.min(pairCount, wordPool.length);
    const chosen = shuffle(wordPool).slice(0, count);
    const gameCards = buildCards(chosen);

    setCards(gameCards.map((card) => ({ card, status: "idle" })));
    setSelectedId(null);
    setMatchedWordIds(new Set());
    setMistakes(0);
    setTimer(0);
    setGameActive(true);
    setGameComplete(false);
    setXpAwarded(0);
    lockRef.current = false;
    awardedRef.current = false;
  }, [pairCount, wordPool]);

  // Start on mount and when config changes
  useEffect(() => {
    if (wordPool.length > 0) {
      startGame();
    }
  }, [startGame, wordPool.length]);

  /* ── Timer ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!gameActive || gameComplete) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameActive, gameComplete]);

  /* ── Completion check ───────────────────────────────────── */
  const totalPairs = useMemo(() => {
    const wordIds = new Set(cards.map((c) => c.card.wordId));
    return wordIds.size;
  }, [cards]);

  useEffect(() => {
    if (totalPairs > 0 && matchedWordIds.size === totalPairs && !awardedRef.current) {
      awardedRef.current = true;
      setGameComplete(true);
      setGameActive(false);
      trackQuest("matching-game");

      // Calculate accuracy and XP
      const totalAttempts = matchedWordIds.size + mistakes;
      const accuracy = totalAttempts > 0 ? Math.round((matchedWordIds.size / totalAttempts) * 100) : 100;

      // Award base XP for completion
      awardXP("matching_complete");
      let earned = XP_VALUES.matching_complete;

      // Bonus for perfect game (no mistakes)
      if (mistakes === 0) {
        awardXP("perfect_quiz");
        earned += XP_VALUES.perfect_quiz;
      }

      setXpAwarded(earned);
      recordStudy();
    }
  }, [matchedWordIds, totalPairs, mistakes, awardXP, recordStudy]);

  /* ── Card click handler ─────────────────────────────────── */
  const handleCardClick = useCallback(
    (clickedId: string) => {
      if (lockRef.current || gameComplete) return;

      const clickedCard = cards.find((c) => c.card.id === clickedId);
      if (!clickedCard || clickedCard.status === "matched") return;

      // If nothing selected yet, select this card
      if (selectedId === null) {
        setSelectedId(clickedId);
        setCards((prev) =>
          prev.map((c) =>
            c.card.id === clickedId ? { ...c, status: "selected" } : c
          )
        );
        return;
      }

      // Clicking the already-selected card deselects it
      if (selectedId === clickedId) {
        setSelectedId(null);
        setCards((prev) =>
          prev.map((c) =>
            c.card.id === clickedId ? { ...c, status: "idle" } : c
          )
        );
        return;
      }

      const firstCard = cards.find((c) => c.card.id === selectedId);
      if (!firstCard) return;

      // Must click one Hebrew and one English (not two of the same type)
      if (firstCard.card.type === clickedCard.card.type) {
        // Switch selection to the new card
        setSelectedId(clickedId);
        setCards((prev) =>
          prev.map((c) => {
            if (c.card.id === clickedId) return { ...c, status: "selected" };
            if (c.card.id === selectedId) return { ...c, status: "idle" };
            return c;
          })
        );
        return;
      }

      // Check for match
      const isMatch = firstCard.card.wordId === clickedCard.card.wordId;

      if (isMatch) {
        // Correct match
        const wordId = firstCard.card.wordId;
        setMatchedWordIds((prev) => new Set([...prev, wordId]));
        setCards((prev) =>
          prev.map((c) => {
            if (c.card.wordId === wordId) return { ...c, status: "matched" };
            return c;
          })
        );
        setSelectedId(null);
      } else {
        // Wrong match — flash red briefly
        lockRef.current = true;
        setMistakes((m) => m + 1);
        setCards((prev) =>
          prev.map((c) => {
            if (c.card.id === clickedId || c.card.id === selectedId) {
              return { ...c, status: "wrong" };
            }
            return c;
          })
        );

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => {
              if (c.status === "wrong") return { ...c, status: "idle" };
              return c;
            })
          );
          setSelectedId(null);
          lockRef.current = false;
        }, WRONG_FLASH_MS);
      }
    },
    [cards, selectedId, gameComplete]
  );

  /* ── Grid layout ────────────────────────────────────────── */
  const gridCols = useMemo(() => {
    const total = cards.length;
    if (total <= 8) return "grid-cols-2 sm:grid-cols-4";
    if (total <= 10) return "grid-cols-2 sm:grid-cols-5";
    return "grid-cols-3 sm:grid-cols-4";
  }, [cards.length]);

  /* ── Completion screen ──────────────────────────────────── */
  if (gameComplete) {
    const totalAttempts = matchedWordIds.size + mistakes;
    const accuracy = totalAttempts > 0 ? Math.round((matchedWordIds.size / totalAttempts) * 100) : 100;

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-bg-card rounded-2xl border border-border p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">&#127881;</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            All Matched!
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Great work completing the matching game.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Time</div>
              <div className="text-lg font-bold text-text-primary">
                {formatTime(timer)}
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Accuracy</div>
              <div className={cn(
                "text-lg font-bold",
                accuracy === 100 ? "text-accent-green" : accuracy >= 80 ? "text-accent-yellow" : "text-accent"
              )}>
                {accuracy}%
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Pairs</div>
              <div className="text-lg font-bold text-accent-blue">
                {matchedWordIds.size}
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-3">
              <div className="text-xs text-text-muted mb-1">Mistakes</div>
              <div className={cn(
                "text-lg font-bold",
                mistakes === 0 ? "text-accent-green" : "text-red-400"
              )}>
                {mistakes}
              </div>
            </div>
          </div>

          {/* XP earned */}
          <div className="bg-accent/10 rounded-xl p-3 mb-6">
            <span className="text-accent font-bold text-lg">+{xpAwarded} XP</span>
            {mistakes === 0 && (
              <span className="block text-xs text-accent-yellow mt-1">
                Perfect game bonus!
              </span>
            )}
          </div>

          <button
            onClick={startGame}
            className="w-full px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Not enough words ───────────────────────────────────── */
  if (wordPool.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-text-secondary text-sm">
          Not enough words in this category. Choose a different category or add more words.
        </p>
      </div>
    );
  }

  /* ── Main game UI ───────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
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

          {/* Pair count */}
          <div className="flex items-center gap-1">
            {PAIR_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setPairCount(n)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  pairCount === n
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
                )}
              >
                {n} pairs
              </button>
            ))}
          </div>
        </div>

        {/* Timer and score */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary">
            Matched:{" "}
            <span className="text-accent-green font-semibold">
              {matchedWordIds.size}/{totalPairs}
            </span>
          </span>
          {mistakes > 0 && (
            <span className="text-text-secondary">
              Mistakes:{" "}
              <span className="text-red-400 font-semibold">{mistakes}</span>
            </span>
          )}
          <span className="text-text-muted font-mono tabular-nums">
            {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-green transition-all duration-300 rounded-full"
          style={{
            width: `${totalPairs > 0 ? (matchedWordIds.size / totalPairs) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Card grid */}
      <div className={cn("grid gap-3", gridCols)}>
        {cards.map(({ card, status }) => {
          const isDisabled = status === "matched";

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isDisabled}
              className={cn(
                "p-4 rounded-xl border-2 transition-all duration-200 min-h-[80px] flex items-center justify-center text-center select-none",
                // Base styles
                status === "idle" &&
                  "bg-bg-card border-border hover:border-accent/50 hover:bg-bg-card-hover cursor-pointer",
                // Selected
                status === "selected" &&
                  "border-accent bg-accent/10 cursor-pointer",
                // Matched
                status === "matched" &&
                  "border-accent-green bg-accent-green/10 pointer-events-none",
                // Wrong flash
                status === "wrong" &&
                  "border-red-400 bg-red-500/10 animate-shake"
              )}
            >
              {card.type === "hebrew" ? (
                <span
                  className={cn(
                    "hebrew-text text-xl font-semibold",
                    status === "matched" ? "text-accent-green" : "text-text-primary"
                  )}
                >
                  {card.content}
                </span>
              ) : (
                <span
                  className={cn(
                    "text-sm italic",
                    status === "matched" ? "text-accent-green" : "text-text-secondary"
                  )}
                >
                  {card.content}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Restart button */}
      <div className="flex justify-center">
        <button
          onClick={startGame}
          className="text-text-muted hover:text-text-secondary text-sm transition-colors"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}
