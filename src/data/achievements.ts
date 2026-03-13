import { Achievement } from "@/types";

export const ACHIEVEMENTS: Achievement[] = [
  // XP milestones
  { id: "xp-100", title: "First Steps", description: "Earn 100 XP", icon: "\u2B50", condition: { type: "total_xp", threshold: 100 } },
  { id: "xp-500", title: "Getting Serious", description: "Earn 500 XP", icon: "\uD83C\uDF1F", condition: { type: "total_xp", threshold: 500 } },
  { id: "xp-1000", title: "Dedicated Learner", description: "Earn 1,000 XP", icon: "\uD83D\uDCAB", condition: { type: "total_xp", threshold: 1000 } },
  { id: "xp-5000", title: "Hebrew Scholar", description: "Earn 5,000 XP", icon: "\uD83C\uDFC6", condition: { type: "total_xp", threshold: 5000 } },
  { id: "xp-10000", title: "Master of Words", description: "Earn 10,000 XP", icon: "\uD83D\uDC51", condition: { type: "total_xp", threshold: 10000 } },

  // Streak milestones
  { id: "streak-3", title: "Hat Trick", description: "3-day study streak", icon: "🔥", condition: { type: "streak", threshold: 3 } },
  { id: "streak-7", title: "Week Warrior", description: "7-day study streak", icon: "⚡", condition: { type: "streak", threshold: 7 } },
  { id: "streak-14", title: "Two Weeks Strong", description: "14-day streak", icon: "💪", condition: { type: "streak", threshold: 14 } },
  { id: "streak-30", title: "Monthly Master", description: "30-day streak", icon: "🎯", condition: { type: "streak", threshold: 30 } },
  { id: "streak-100", title: "Centurion", description: "100-day streak!", icon: "💯", condition: { type: "streak", threshold: 100 } },

  // Words mastered
  { id: "words-10", title: "Vocabulary Starter", description: "Master 10 words", icon: "\uD83D\uDCDA", condition: { type: "words_mastered", threshold: 10 } },
  { id: "words-50", title: "Word Collector", description: "Master 50 words", icon: "\uD83D\uDCD6", condition: { type: "words_mastered", threshold: 50 } },
  { id: "words-100", title: "Lexicon Builder", description: "Master 100 words", icon: "\uD83D\uDCD5", condition: { type: "words_mastered", threshold: 100 } },
  { id: "words-200", title: "Vocabulary Expert", description: "Master 200 words", icon: "\uD83C\uDF93", condition: { type: "words_mastered", threshold: 200 } },

  // Reviews
  { id: "reviews-50", title: "Diligent Student", description: "Complete 50 reviews", icon: "\u270F\uFE0F", condition: { type: "total_reviews", threshold: 50 } },
  { id: "reviews-200", title: "Practice Makes Perfect", description: "Complete 200 reviews", icon: "\uD83D\uDCDD", condition: { type: "total_reviews", threshold: 200 } },
  { id: "reviews-500", title: "Review Machine", description: "Complete 500 reviews", icon: "\u26A1", condition: { type: "total_reviews", threshold: 500 } },
  { id: "reviews-1000", title: "Thousand Reviews", description: "Complete 1,000 reviews", icon: "\uD83C\uDFC5", condition: { type: "total_reviews", threshold: 1000 } },

  // Quizzes
  { id: "quiz-5", title: "Quiz Taker", description: "Complete 5 quizzes", icon: "\u2753", condition: { type: "quizzes_complete", threshold: 5 } },
  { id: "quiz-20", title: "Quiz Champion", description: "Complete 20 quizzes", icon: "\uD83C\uDFAF", condition: { type: "quizzes_complete", threshold: 20 } },
  { id: "perfect-3", title: "Perfectionist", description: "3 perfect quizzes", icon: "\uD83D\uDC8E", condition: { type: "perfect_quizzes", threshold: 3 } },

  // Passages
  { id: "passages-3", title: "Reader", description: "Complete 3 passages", icon: "\uD83D\uDCDC", condition: { type: "passages_complete", threshold: 3 } },
  { id: "passages-10", title: "Bookworm", description: "Complete 10 passages", icon: "\uD83D\uDCDA", condition: { type: "passages_complete", threshold: 10 } },

  // Daily XP
  { id: "daily-50", title: "Productive Day", description: "Earn 50 XP in one day", icon: "\u2600\uFE0F", condition: { type: "daily_xp", threshold: 50 } },
  { id: "daily-100", title: "Power Session", description: "Earn 100 XP in one day", icon: "\uD83D\uDCAA", condition: { type: "daily_xp", threshold: 100 } },
  { id: "daily-200", title: "Unstoppable", description: "Earn 200 XP in one day", icon: "\uD83D\uDE80", condition: { type: "daily_xp", threshold: 200 } },

  // Levels
  { id: "level-5", title: "Beginner", description: "Reach Level 5", icon: "\uD83C\uDF31", condition: { type: "level", threshold: 5 } },
  { id: "level-10", title: "Intermediate", description: "Reach Level 10", icon: "\uD83C\uDF3F", condition: { type: "level", threshold: 10 } },
  { id: "level-20", title: "Advanced", description: "Reach Level 20", icon: "\uD83C\uDF33", condition: { type: "level", threshold: 20 } },

  // League achievements
  { id: "league-promotion", title: "League Promotion", description: "Get promoted in the Weekly League", icon: "🏅", condition: { type: "league_promotion", threshold: 1 } },
  { id: "league-gold", title: "Gold Tier", description: "Reach Gold tier in the Weekly League", icon: "🥇", condition: { type: "league_tier", threshold: "gold" } },
  { id: "league-diamond", title: "Diamond Tier", description: "Reach Diamond tier in the Weekly League", icon: "💎", condition: { type: "league_tier", threshold: "diamond" } },
  { id: "league-top", title: "Top of the League", description: "Finish #1 in your league for a week", icon: "👑", condition: { type: "league_rank", threshold: 1 } },

  // Garden achievements
  { id: "garden-bloom-1", title: "First Bloom", description: "Bloom your first plant in the Garden", icon: "🌸", condition: { type: "garden_blooms", threshold: 1 } },
  { id: "garden-bloom-25", title: "Green Thumb", description: "Bloom 25 plants", icon: "🌺", condition: { type: "garden_blooms", threshold: 25 } },
  { id: "garden-bloom-100", title: "Master Gardener", description: "Bloom 100 plants", icon: "🌻", condition: { type: "garden_blooms", threshold: 100 } },
  { id: "garden-water-streak", title: "Dedicated Gardener", description: "Water plants 7 days in a row", icon: "🌿", condition: { type: "garden_water_streak", threshold: 7 } },

  // Quest achievements
  { id: "quest-first", title: "Quest Starter", description: "Complete your first daily quest", icon: "📋", condition: { type: "quests_complete", threshold: 1 } },
  { id: "quest-daily-all", title: "Quest Master", description: "Complete all 3 daily quests in one day", icon: "⭐", condition: { type: "quest_daily_all", threshold: 1 } },
  { id: "quest-streak-7", title: "Quest Streak", description: "Complete all daily quests 7 days in a row", icon: "🗓️", condition: { type: "quest_streak", threshold: 7 } },

  // Sentence Builder achievements
  { id: "sentences-10", title: "Sentence Starter", description: "Build 10 correct sentences", icon: "🔤", condition: { type: "sentences_built", threshold: 10 } },
  { id: "sentences-50", title: "Sentence Pro", description: "Build 50 correct sentences", icon: "📝", condition: { type: "sentences_built", threshold: 50 } },
  { id: "sentences-100", title: "Sentence Master", description: "Build 100 correct sentences", icon: "🏗️", condition: { type: "sentences_built", threshold: 100 } },
];
