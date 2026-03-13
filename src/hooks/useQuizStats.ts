"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { SK_QUIZ_STATS } from "@/lib/storage-keys";

export interface QuizStats {
  quizzesTaken: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number; // percentage 0-100
  perfectQuizzes: number;
}

const DEFAULT_STATS: QuizStats = {
  quizzesTaken: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  bestScore: 0,
  perfectQuizzes: 0,
};

export function useQuizStats() {
  const [stats, setStats, hydrated] = useLocalStorage<QuizStats>(
    SK_QUIZ_STATS,
    DEFAULT_STATS
  );

  const recordQuiz = useCallback(
    (correct: number, total: number) => {
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      setStats((prev) => ({
        quizzesTaken: prev.quizzesTaken + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalQuestions: prev.totalQuestions + total,
        bestScore: Math.max(prev.bestScore, pct),
        perfectQuizzes: (prev.perfectQuizzes ?? 0) + (correct === total ? 1 : 0),
      }));
    },
    [setStats]
  );

  return { stats, recordQuiz, hydrated };
}
