/**
 * Centralized localStorage key constants.
 * Every davar-* key used across the app should be defined here.
 */

export const STORAGE_PREFIX = "davar-";

// User progress
export const SK_CARD_STATES = "davar-card-states";
export const SK_COMPLETED_LINES = "davar-completed-lines";
export const SK_COMPLETED_PRAYER_LINES = "davar-completed-prayer-lines";
export const SK_STORY_PROGRESS = "davar-story-progress";
export const SK_LESSON_STEP = "davar-lesson-step";
export const SK_TOTAL_REVIEWS = "davar-total-reviews";
export const SK_GRAMMAR_COMPLETED = "davar-grammar-completed";
export const SK_SENTENCES_BUILT = "davar-sentences-built";

// Learning metrics
export const SK_XP = "davar-xp";
export const SK_STREAK = "davar-streak";
export const SK_QUIZ_STATS = "davar-quiz-stats";

// Settings & preferences
export const SK_THEME = "davar-theme";
export const SK_THEME_CHANGE = "davar-theme-change";
export const SK_SETTINGS = "davar-settings";
export const SK_LEVEL_FILTER = "davar-level-filter";
export const SK_PLACEMENT = "davar-placement";
export const SK_PLACEMENT_ANSWERS = "davar-placement-answers";

// Gamification
export const SK_LEAGUE = "davar-league";
export const SK_PRESTIGE = "davar-prestige";
export const SK_DAILY_GOALS = "davar-daily-goals";
export const SK_DAILY_CHALLENGE = "davar-daily-challenge";
export const SK_MYSTERY_REWARDS = "davar-mystery-rewards";
export const SK_XP_BUFF = "davar-xp-buff";
export const SK_ACHIEVEMENTS = "davar-achievements";
export const SK_ACHIEVEMENT_SHOWCASE = "davar-achievement-showcase";

// Features
export const SK_CUSTOM_WORDS = "davar-custom-words";
export const SK_QUESTS = "davar-quests";
export const SK_QUESTS_UPDATED = "davar-quests-updated";
export const SK_QUEST_STATS = "davar-quest-stats";
export const SK_GARDEN_WATER_STREAK = "davar-garden-water-streak";
export const SK_VIDEOS_WATCHED = "davar-videos-watched";
export const SK_ADAPTIVE_DIFFICULTY = "davar-adaptive-difficulty";

// Consent & privacy
export const SK_CONSENT = "davar-consent-accepted";
export const SK_AI_CONSENT = "davar-ai-consent-accepted";

/* ── Shared helpers ──────────────────────────────────────────── */

/** Collect all davar-* entries from localStorage. */
export function getAllDavarData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
  } catch {}
  return data;
}

/** Calculate total bytes used by davar-* entries (UTF-16). */
export function getStorageSizeBytes(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        total += (localStorage.getItem(key) ?? "").length * 2;
      }
    }
  } catch {}
  return total;
}
