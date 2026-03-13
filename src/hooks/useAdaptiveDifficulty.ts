"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getToday } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────── */

interface PerformanceWindow {
  correct: number;
  total: number;
  date: string;
}

interface AdaptiveDifficultyState {
  /** Rolling window of recent session performance */
  recentSessions: PerformanceWindow[];
  /** Current difficulty multiplier: 0.5 (easy) to 2.0 (hard) */
  difficultyMultiplier: number;
  /** Number of consecutive "too easy" sessions */
  easyStreak: number;
  /** Number of consecutive "too hard" sessions */
  hardStreak: number;
}

export interface DifficultySettings {
  /** Recommended number of new cards per day (adjusted from base) */
  newCardsPerDay: number;
  /** Number of options for multiple-choice (3-6) */
  mcOptions: number;
  /** Whether to include hints */
  showHints: boolean;
  /** Difficulty label for display */
  label: "Easy" | "Normal" | "Challenging" | "Hard";
  /** Raw multiplier */
  multiplier: number;
  /** Recent accuracy */
  recentAccuracy: number;
}

/* ── Constants ────────────────────────────────────────── */

// Target accuracy for "flow state" — not too easy, not too hard
const TARGET_ACCURACY = 0.80;
const EASY_THRESHOLD = 0.92;  // Above this = bump up difficulty
const HARD_THRESHOLD = 0.60;  // Below this = ease off

const DEFAULT_STATE: AdaptiveDifficultyState = {
  recentSessions: [],
  difficultyMultiplier: 1.0,
  easyStreak: 0,
  hardStreak: 0,
};

/* ── Hook ─────────────────────────────────────────────── */

export function useAdaptiveDifficulty() {
  const [state, setState, hydrated] = useLocalStorage<AdaptiveDifficultyState>(
    "davar-adaptive-difficulty",
    DEFAULT_STATE
  );

  /** Record a session result and update difficulty */
  const recordSession = useCallback(
    (correct: number, total: number) => {
      if (total === 0) return;
      const today = getToday();
      const accuracy = correct / total;

      setState((prev) => {
        // Add new session, keep only last 10
        const sessions = [
          ...prev.recentSessions,
          { correct, total, date: today },
        ].slice(-10);

        // Calculate rolling accuracy
        const totalCorrect = sessions.reduce((s, w) => s + w.correct, 0);
        const totalAttempts = sessions.reduce((s, w) => s + w.total, 0);
        const rollingAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : TARGET_ACCURACY;

        let newMultiplier = prev.difficultyMultiplier;
        let newEasyStreak = prev.easyStreak;
        let newHardStreak = prev.hardStreak;

        if (accuracy >= EASY_THRESHOLD) {
          newEasyStreak++;
          newHardStreak = 0;
          // Gradual increase
          if (newEasyStreak >= 2) {
            newMultiplier = Math.min(2.0, newMultiplier + 0.1);
          }
        } else if (accuracy <= HARD_THRESHOLD) {
          newHardStreak++;
          newEasyStreak = 0;
          // Quick decrease (we want to prevent frustration fast)
          newMultiplier = Math.max(0.5, newMultiplier - 0.15);
        } else {
          // In the sweet spot — gentle drift toward target
          newEasyStreak = 0;
          newHardStreak = 0;
          if (rollingAccuracy > TARGET_ACCURACY + 0.05) {
            newMultiplier = Math.min(2.0, newMultiplier + 0.05);
          } else if (rollingAccuracy < TARGET_ACCURACY - 0.05) {
            newMultiplier = Math.max(0.5, newMultiplier - 0.05);
          }
        }

        return {
          recentSessions: sessions,
          difficultyMultiplier: Math.round(newMultiplier * 100) / 100,
          easyStreak: newEasyStreak,
          hardStreak: newHardStreak,
        };
      });
    },
    [setState]
  );

  /** Get current difficulty settings */
  const settings = useMemo((): DifficultySettings => {
    const m = state.difficultyMultiplier;

    // Calculate recent accuracy
    const totalCorrect = state.recentSessions.reduce((s, w) => s + w.correct, 0);
    const totalAttempts = state.recentSessions.reduce((s, w) => s + w.total, 0);
    const recentAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    // Base new cards = 20, scale with difficulty
    const newCardsPerDay = Math.round(20 * m);

    // MC options: fewer when easier, more when harder
    const mcOptions = m < 0.8 ? 3 : m < 1.2 ? 4 : m < 1.6 ? 5 : 6;

    // Hints only at lower difficulties
    const showHints = m < 0.9;

    // Label
    const label: DifficultySettings["label"] =
      m < 0.8 ? "Easy" : m < 1.2 ? "Normal" : m < 1.6 ? "Challenging" : "Hard";

    return {
      newCardsPerDay,
      mcOptions,
      showHints,
      label,
      multiplier: m,
      recentAccuracy: Math.round(recentAccuracy * 100),
    };
  }, [state]);

  return {
    settings,
    recordSession,
    hydrated,
  };
}
