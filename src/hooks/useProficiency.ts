"use client";

import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useVocabulary } from "./useVocabulary";
import { useSpacedRepetition } from "./useSpacedRepetition";
import { useQuizStats } from "./useQuizStats";
import { PASSAGES } from "@/data/passages";
import { GRAMMAR_LESSONS } from "@/data/grammar";

/* ── Level definitions ──────────────────────────────────────── */

export interface ProficiencyLevel {
  level: number;
  name: string;
  nameHebrew: string;
  description: string;
  icon: string;
  requirements: {
    wordsKnown: number;
    grammarLessons: number;
    passagesRead: number;
    exerciseAccuracy: number;
  };
}

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  {
    level: 1,
    name: "Foundations",
    nameHebrew: "יסודות",
    icon: "🌱",
    description: "Learning the alphabet and first words",
    requirements: { wordsKnown: 0, grammarLessons: 0, passagesRead: 0, exerciseAccuracy: 0 },
  },
  {
    level: 2,
    name: "Basics",
    nameHebrew: "בסיס",
    icon: "🌿",
    description: "100 words, present tense, simple phrases",
    requirements: { wordsKnown: 50, grammarLessons: 4, passagesRead: 2, exerciseAccuracy: 50 },
  },
  {
    level: 3,
    name: "Elementary",
    nameHebrew: "יסודי",
    icon: "🌳",
    description: "200 words, past tense, beginner reading",
    requirements: { wordsKnown: 120, grammarLessons: 8, passagesRead: 5, exerciseAccuracy: 60 },
  },
  {
    level: 4,
    name: "Conversational",
    nameHebrew: "שיחתי",
    icon: "💬",
    description: "300 words, 3 tenses, intermediate stories",
    requirements: { wordsKnown: 220, grammarLessons: 13, passagesRead: 10, exerciseAccuracy: 70 },
  },
  {
    level: 5,
    name: "Confident",
    nameHebrew: "בטוח",
    icon: "⭐",
    description: "400+ words, all grammar, advanced content",
    requirements: { wordsKnown: 350, grammarLessons: 16, passagesRead: 14, exerciseAccuracy: 80 },
  },
];

/* ── Return type ────────────────────────────────────────────── */

interface DimensionProgress {
  current: number;
  needed: number;
  met: boolean;
}

export interface UseProficiencyReturn {
  currentLevel: ProficiencyLevel;
  nextLevel: ProficiencyLevel | null;
  progress: {
    wordsKnown: DimensionProgress;
    grammarLessons: DimensionProgress;
    passagesRead: DimensionProgress;
    exerciseAccuracy: DimensionProgress;
  };
  overallProgress: number;
}

/* ── Hook ───────────────────────────────────────────────────── */

export function useProficiency(): UseProficiencyReturn {
  const { allWords } = useVocabulary();
  const { masteredCount } = useSpacedRepetition(allWords);
  const { stats: quizStats } = useQuizStats();

  // Reading progress: passages where all lines are completed
  const [completedLines] = useLocalStorage<Record<string, number[]>>(
    "davar-completed-lines",
    {}
  );

  // Grammar lessons viewed/completed — persisted set of lesson IDs.
  // GrammarMode does not currently persist completion, so this key can be
  // populated by future UI or manually. We read whatever is there.
  const [grammarCompleted] = useLocalStorage<string[]>(
    "davar-grammar-completed",
    []
  );

  // Also check lesson-step records: passages that reached "complete"
  const [lessonSteps] = useLocalStorage<Record<string, string>>(
    "davar-lesson-step",
    {}
  );

  const metrics = useMemo(() => {
    // 1. Mastered words (stability >= 21 from FSRS, already computed)
    const wordsKnown = masteredCount;

    // 2. Grammar lessons completed
    //    Use the dedicated grammar-completed set. Deduplicate against
    //    known lesson IDs so stale data can't inflate the count.
    const knownLessonIds = new Set(GRAMMAR_LESSONS.map((l) => l.id));
    const grammarLessons = grammarCompleted.filter((id) => knownLessonIds.has(id)).length;

    // 3. Passages completed — union of two signals:
    //    a) Every line read (davar-completed-lines)
    //    b) Lesson step reached "complete" (davar-lesson-step)
    const passagesRead = PASSAGES.filter((p) => {
      const allLinesRead = (completedLines[p.id] ?? []).length >= p.lines.length;
      const lessonDone = lessonSteps[p.id] === "complete";
      return allLinesRead || lessonDone;
    }).length;

    // 4. Exercise accuracy from quiz stats
    const exerciseAccuracy =
      quizStats.totalQuestions > 0
        ? Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100)
        : 0;

    return { wordsKnown, grammarLessons, passagesRead, exerciseAccuracy };
  }, [masteredCount, grammarCompleted, completedLines, lessonSteps, quizStats]);

  // Determine current level: highest level where ALL requirements are met
  const currentLevel = useMemo(() => {
    let best = PROFICIENCY_LEVELS[0];
    for (const level of PROFICIENCY_LEVELS) {
      const r = level.requirements;
      if (
        metrics.wordsKnown >= r.wordsKnown &&
        metrics.grammarLessons >= r.grammarLessons &&
        metrics.passagesRead >= r.passagesRead &&
        metrics.exerciseAccuracy >= r.exerciseAccuracy
      ) {
        best = level;
      }
    }
    return best;
  }, [metrics]);

  const nextLevel = useMemo(() => {
    const idx = PROFICIENCY_LEVELS.findIndex((l) => l.level === currentLevel.level);
    return idx < PROFICIENCY_LEVELS.length - 1 ? PROFICIENCY_LEVELS[idx + 1] : null;
  }, [currentLevel]);

  // Per-dimension progress toward next level
  const progress = useMemo(() => {
    const target = nextLevel?.requirements ?? currentLevel.requirements;
    return {
      wordsKnown: {
        current: metrics.wordsKnown,
        needed: target.wordsKnown,
        met: metrics.wordsKnown >= target.wordsKnown,
      },
      grammarLessons: {
        current: metrics.grammarLessons,
        needed: target.grammarLessons,
        met: metrics.grammarLessons >= target.grammarLessons,
      },
      passagesRead: {
        current: metrics.passagesRead,
        needed: target.passagesRead,
        met: metrics.passagesRead >= target.passagesRead,
      },
      exerciseAccuracy: {
        current: metrics.exerciseAccuracy,
        needed: target.exerciseAccuracy,
        met: metrics.exerciseAccuracy >= target.exerciseAccuracy,
      },
    };
  }, [metrics, nextLevel, currentLevel]);

  // Overall progress: average of per-dimension progress percentages (capped at 100%)
  const overallProgress = useMemo(() => {
    if (!nextLevel) return 100;
    const dims = [
      progress.wordsKnown,
      progress.grammarLessons,
      progress.passagesRead,
      progress.exerciseAccuracy,
    ];
    const pcts = dims.map((d) =>
      d.needed > 0 ? Math.min(100, Math.round((d.current / d.needed) * 100)) : 100
    );
    return Math.round(pcts.reduce((sum, p) => sum + p, 0) / pcts.length);
  }, [nextLevel, progress]);

  return { currentLevel, nextLevel, progress, overallProgress };
}
