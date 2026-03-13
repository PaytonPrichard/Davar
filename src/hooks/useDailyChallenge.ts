"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getToday } from "@/lib/utils";
import { Word } from "@/types";

/* ── Types ────────────────────────────────────────────── */

export type ChallengeType =
  | "translate"       // Given Hebrew → pick English
  | "reverse"         // Given English → pick Hebrew
  | "transliterate"   // Given Hebrew → pick transliteration
  | "fill-blank"      // Sentence with blank → pick word
  | "match-sound";    // Given transliteration → pick Hebrew

export interface DailyQuestion {
  type: ChallengeType;
  prompt: string;
  promptHebrew?: string;
  correctAnswer: string;
  options: string[];
  wordId: string;
}

export interface DailyChallengeState {
  date: string;
  answers: (number | null)[];    // Index of chosen option per question, null = unanswered
  currentQuestion: number;
  completed: boolean;
  score: number;
  totalQuestions: number;
}

const QUESTIONS_PER_DAY = 5;

/* ── Seeded RNG (deterministic per date) ─────────────── */

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) | 0;
    return ((hash >>> 16) & 0x7fff) / 0x7fff;
  };
}

function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* ── Challenge type rotation by day of week ──────────── */

const DAY_TYPES: ChallengeType[][] = [
  ["translate", "reverse", "transliterate", "translate", "reverse"],       // Sun
  ["transliterate", "translate", "match-sound", "reverse", "translate"],   // Mon
  ["reverse", "match-sound", "translate", "transliterate", "reverse"],     // Tue
  ["translate", "transliterate", "reverse", "match-sound", "translate"],   // Wed
  ["match-sound", "reverse", "translate", "reverse", "transliterate"],     // Thu
  ["translate", "reverse", "transliterate", "match-sound", "translate"],   // Fri
  ["reverse", "translate", "transliterate", "translate", "reverse"],       // Sat
];

/* ── Generate questions for a date ───────────────────── */

function generateQuestions(date: string, words: Word[]): DailyQuestion[] {
  if (words.length < 20) return [];

  const rng = seededRandom(`davar-daily-${date}`);
  const dayOfWeek = new Date(date).getDay();
  const types = DAY_TYPES[dayOfWeek];

  // Pick 5 unique words for the day
  const shuffled = seededShuffle(words, rng);
  const selectedWords = shuffled.slice(0, QUESTIONS_PER_DAY);

  return selectedWords.map((word, i) => {
    const type = types[i];

    // Pick 3 distractors from remaining words
    const others = shuffled.filter((w) => w.id !== word.id);
    const distractors = others.slice(0, 3);

    let prompt: string;
    let promptHebrew: string | undefined;
    let correctAnswer: string;
    let wrongAnswers: string[];

    switch (type) {
      case "translate":
        prompt = "What does this word mean?";
        promptHebrew = word.hebrewNikud;
        correctAnswer = word.translation;
        wrongAnswers = distractors.map((d) => d.translation);
        break;
      case "reverse":
        prompt = `Which Hebrew word means "${word.translation}"?`;
        correctAnswer = word.hebrewNikud;
        wrongAnswers = distractors.map((d) => d.hebrewNikud);
        break;
      case "transliterate":
        prompt = "How is this word pronounced?";
        promptHebrew = word.hebrewNikud;
        correctAnswer = word.transliteration;
        wrongAnswers = distractors.map((d) => d.transliteration);
        break;
      case "match-sound":
        prompt = `Which Hebrew word is pronounced "${word.transliteration}"?`;
        correctAnswer = word.hebrewNikud;
        wrongAnswers = distractors.map((d) => d.hebrewNikud);
        break;
      case "fill-blank":
        prompt = `Complete: "_____" means "${word.translation}"`;
        correctAnswer = word.hebrewNikud;
        wrongAnswers = distractors.map((d) => d.hebrewNikud);
        break;
    }

    // Shuffle options with correct answer mixed in
    const allOptions = [correctAnswer, ...wrongAnswers];
    const options = seededShuffle(allOptions, rng);

    return {
      type,
      prompt,
      promptHebrew,
      correctAnswer,
      options,
      wordId: word.id,
    };
  });
}

/* ── Shareable result emoji grid ─────────────────────── */

export function generateShareText(state: DailyChallengeState): string {
  const emojiMap = (answer: number | null, qIndex: number, questions: DailyQuestion[]): string => {
    if (answer === null) return "\u2B1C"; // white square - skipped
    const q = questions[qIndex];
    return q.options[answer] === q.correctAnswer ? "\uD83D\uDFE9" : "\uD83D\uDFE5"; // green or red square
  };

  return `\u05D3\u05D1\u05E8 Daily Challenge ${state.date}\n${state.score}/${state.totalQuestions}\n\n${state.answers.map((a, i) => emojiMap(a, i, [])).join("")}`;
}

/* ── Hook ─────────────────────────────────────────────── */

const DEFAULT_STATE: DailyChallengeState = {
  date: "",
  answers: [],
  currentQuestion: 0,
  completed: false,
  score: 0,
  totalQuestions: QUESTIONS_PER_DAY,
};

export function useDailyChallenge(words: Word[]) {
  const [state, setState, hydrated] = useLocalStorage<DailyChallengeState>(
    "davar-daily-challenge",
    DEFAULT_STATE
  );

  const today = getToday();
  const isToday = state.date === today;

  const questions = useMemo(
    () => generateQuestions(today, words),
    [today, words]
  );

  // Check if today's challenge is available (not yet completed today)
  const isAvailable = hydrated && questions.length > 0 && !isToday;
  const isInProgress = hydrated && isToday && !state.completed;
  const isCompleted = hydrated && isToday && state.completed;

  const startChallenge = useCallback(() => {
    setState({
      date: today,
      answers: new Array(QUESTIONS_PER_DAY).fill(null),
      currentQuestion: 0,
      completed: false,
      score: 0,
      totalQuestions: QUESTIONS_PER_DAY,
    });
  }, [today, setState]);

  const submitAnswer = useCallback(
    (questionIndex: number, optionIndex: number) => {
      setState((prev) => {
        if (prev.answers[questionIndex] !== null) return prev; // Already answered

        const q = questions[questionIndex];
        const isCorrect = q.options[optionIndex] === q.correctAnswer;
        const newAnswers = [...prev.answers];
        newAnswers[questionIndex] = optionIndex;

        const newScore = prev.score + (isCorrect ? 1 : 0);
        const nextQ = questionIndex + 1;
        const isLast = nextQ >= QUESTIONS_PER_DAY;

        return {
          ...prev,
          answers: newAnswers,
          currentQuestion: isLast ? questionIndex : nextQ,
          completed: isLast,
          score: newScore,
        };
      });
    },
    [questions, setState]
  );

  const shareText = useMemo(() => {
    if (!isCompleted) return "";
    const emojis = state.answers
      .map((answer, i) => {
        if (answer === null) return "\u2B1C";
        const q = questions[i];
        if (!q) return "\u2B1C";
        return q.options[answer] === q.correctAnswer ? "\uD83D\uDFE9" : "\uD83D\uDFE5";
      })
      .join("");
    return `\u05D3\u05D1\u05E8 Daily Challenge ${state.date}\n${state.score}/${state.totalQuestions}\n\n${emojis}`;
  }, [isCompleted, state, questions]);

  return {
    state: isToday ? state : DEFAULT_STATE,
    questions,
    isAvailable,
    isInProgress,
    isCompleted,
    startChallenge,
    submitAnswer,
    shareText,
    hydrated,
  };
}
