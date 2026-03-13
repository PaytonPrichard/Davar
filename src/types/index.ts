export interface Word {
  id: string;
  hebrew: string;
  hebrewNikud: string;
  transliteration: string;
  translation: string;
  category: string;
}

export interface CardState {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string | null;
  // FSRS fields (optional for backward compatibility)
  stability?: number;
  difficulty?: number;
  lapses?: number;
  fsrsState?: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
}

export interface UserProgress {
  cardStates: Record<string, CardState>;
  streak: { current: number; lastStudyDate: string };
  totalReviews: number;
  wordsLearned: string[];
  customWords: Word[];
  customCategories: string[];
}

export interface Letter {
  hebrew: string;
  name: string;
  transliteration: string;
  sound: string;
  final?: string;
}

export interface Passage {
  id: string;
  title: string;
  titleHebrew: string;
  level: "beginner" | "intermediate" | "advanced";
  lines: PassageLine[];
  vocabIds?: string[];
}

export interface PassageLine {
  hebrew: string;
  transliteration: string;
  translation: string;
}

export type ReviewQuality = 1 | 2 | 3 | 4 | 5;

export type AppMode =
  | "flashcards"
  | "reading"
  | "alphabet"
  | "prayers"
  | "quiz"
  | "custom"
  | "progress"
  | "skilltree"
  | "writing"
  | "grammar"
  | "listening"
  | "matching"
  | "cloze"
  | "conversation"
  | "settings"
  | "daily-challenge"
  | "garden"
  | "story"
  | "collection"
  | "league";

export interface FuzzyMatchResult {
  status: "correct" | "close" | "incorrect";
  message: string;
}

/* ── XP & Gamification ───────────────────────────────────── */

export type XPAction =
  | "flashcard_review"
  | "quiz_correct"
  | "quiz_close"
  | "passage_line_read"
  | "passage_complete"
  | "listening_correct"
  | "matching_complete"
  | "cloze_correct"
  | "streak_bonus"
  | "perfect_quiz"
  | "conversation_message"
  | "writing_practice"
  | "grammar_practice"
  | "daily_challenge_correct"
  | "daily_challenge_complete"
  | "daily_challenge_perfect"
  | "garden_water";

export const XP_VALUES: Record<XPAction, number> = {
  flashcard_review: 5,
  quiz_correct: 10,
  quiz_close: 5,
  passage_line_read: 3,
  passage_complete: 50,
  listening_correct: 10,
  matching_complete: 25,
  cloze_correct: 10,
  streak_bonus: 20,
  perfect_quiz: 30,
  conversation_message: 5,
  writing_practice: 5,
  grammar_practice: 8,
  daily_challenge_correct: 15,
  daily_challenge_complete: 50,
  daily_challenge_perfect: 75,
  garden_water: 5,
};

export interface XPState {
  totalXP: number;
  level: number;
  dailyXP: Record<string, number>; // ISO date → XP earned
}

export function xpForLevel(level: number): number {
  // Each level requires more XP: 100, 150, 225, 337, ...
  return Math.round(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + xpForLevel(level) <= totalXP) {
    xpNeeded += xpForLevel(level);
    level++;
  }
  return level;
}

export function xpProgressInLevel(totalXP: number): { current: number; needed: number } {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + xpForLevel(level) <= totalXP) {
    xpNeeded += xpForLevel(level);
    level++;
  }
  return { current: totalXP - xpNeeded, needed: xpForLevel(level) };
}

/* ── Achievements ────────────────────────────────────────── */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: "total_xp"; threshold: number }
  | { type: "level"; threshold: number }
  | { type: "streak"; threshold: number }
  | { type: "words_mastered"; threshold: number }
  | { type: "total_reviews"; threshold: number }
  | { type: "passages_complete"; threshold: number }
  | { type: "quizzes_complete"; threshold: number }
  | { type: "perfect_quizzes"; threshold: number }
  | { type: "daily_xp"; threshold: number }
  | { type: "categories_mastered"; threshold: number };

export interface AchievementState {
  unlockedIds: string[];
  unlockedAt: Record<string, string>; // id → ISO date
}

/* ── Settings ────────────────────────────────────────────── */

export interface AppSettings {
  ttsProvider: "browser" | "google-cloud" | "elevenlabs";
  ttsApiKey: string;
  aiProvider: "none" | "openai" | "anthropic" | "gemini";
  aiApiKey: string;
  aiModel: string;
  dailyNewCards: number;
  autoPlayAudio: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ttsProvider: "browser",
  ttsApiKey: "",
  aiProvider: "none",
  aiApiKey: "",
  aiModel: "",
  dailyNewCards: 20,
  autoPlayAudio: true,
};

export const CATEGORIES = [
  "Greetings & Basics",
  "Numbers",
  "Food & Drink",
  "Family & People",
  "Colors",
  "Body",
  "Travel & Places",
  "Work & School",
  "Time & Calendar",
  "Nature & Weather",
  "Emotions & Descriptions",
  "Common Phrases",
  "Clothing",
  "Home & House",
  "Verbs & Actions",
] as const;

export type BuiltinCategory = (typeof CATEGORIES)[number];
