"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { AppMode } from "@/types";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import HydrationGuard from "./HydrationGuard";
import ErrorBoundary from "./ErrorBoundary";
import FlashcardMode from "./FlashcardMode";
import HomeHub from "./HomeHub";
import SettingsPanel from "./SettingsPanel";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import LevelBadge from "./LevelBadge";
import PlacementTest, { PlacementResult, PlacementLevel } from "./PlacementTest";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuthContext } from "./AuthProvider";
import { cn } from "@/lib/utils";

// Dynamic imports for heavy, non-initial-view components
const ReadingMode = dynamic(() => import("./ReadingMode"));
const AlphabetMode = dynamic(() => import("./AlphabetMode"));
const PrayerMode = dynamic(() => import("./PrayerMode"));
const QuizMode = dynamic(() => import("./QuizMode"));
const CustomWordsManager = dynamic(() => import("./CustomWordsManager"));
const WritingPractice = dynamic(() => import("./WritingPractice"));
const GrammarMode = dynamic(() => import("./GrammarMode"));
const ListeningMode = dynamic(() => import("./ListeningMode"));
const MatchingGame = dynamic(() => import("./MatchingGame"));
const ConversationMode = dynamic(() => import("./ConversationMode"));
const ClozeMode = dynamic(() => import("./ClozeMode"));
const SkillTree = dynamic(() => import("./SkillTree"));
const DailyChallenge = dynamic(() => import("./DailyChallenge"));
const VocabularyGarden = dynamic(() => import("./VocabularyGarden"));
const StoryMode = dynamic(() => import("./StoryMode"));
const WordCollection = dynamic(() => import("./WordCollection"));
const WeeklyLeague = dynamic(() => import("./WeeklyLeague"));
const SentenceBuilderMode = dynamic(() => import("./SentenceBuilderMode"));

/* ── Tab group definitions ───────────────────────────────────── */

type TabGroup = "home" | "learn" | "practice" | "read";

interface SubTab {
  mode: AppMode;
  label: string;
}

interface PrimaryTab {
  group: TabGroup;
  label: string;
  icon: React.ReactNode;
  defaultMode: AppMode;
  subs: SubTab[];
}

const PRIMARY_TABS: PrimaryTab[] = [
  {
    group: "home",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    defaultMode: "home",
    subs: [],
  },
  {
    group: "learn",
    label: "Learn",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    defaultMode: "alphabet",
    subs: [
      { mode: "alphabet", label: "Alphabet" },
      { mode: "writing", label: "Writing" },
      { mode: "grammar", label: "Grammar" },
      { mode: "sentences", label: "Sentences" },
    ],
  },
  {
    group: "practice",
    label: "Practice",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    defaultMode: "flashcards",
    subs: [
      { mode: "flashcards", label: "Flashcards" },
      { mode: "quiz", label: "Quiz" },
      { mode: "listening", label: "Listening" },
      { mode: "matching", label: "Matching" },
      { mode: "cloze", label: "Fill-in" },
      { mode: "conversation", label: "Chat" },
    ],
  },
  {
    group: "read",
    label: "Read",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    defaultMode: "reading",
    subs: [
      { mode: "reading", label: "Passages" },
      { mode: "story", label: "Stories" },
      { mode: "prayers", label: "Prayers" },
    ],
  },
];

/* ── Find which group a mode belongs to ─────────────────────── */

const HOME_MODES = new Set<AppMode>(["home", "progress", "daily-challenge", "skilltree", "garden", "collection", "league", "custom"]);

function getGroup(mode: AppMode): TabGroup {
  if (HOME_MODES.has(mode)) return "home";
  for (const tab of PRIMARY_TABS) {
    if (tab.subs.some((s) => s.mode === mode)) return tab.group;
  }
  return "home";
}

/* ── AppShell ────────────────────────────────────────────────── */

export default function AppShell() {
  const [mode, setMode] = useState<AppMode>("home");
  const [passageId, setPassageId] = useState<string | undefined>();
  const { streak, hydrated } = useStreak();
  const { level: xpLevel, totalXP, xpProgress, todayXP } = useXP();
  const { user, isSignedIn, configured: authConfigured, syncStatus } = useAuthContext();
  const [placementResult, setPlacementResult, placementHydrated] =
    useLocalStorage<PlacementResult | null>("davar-placement", null);

  const showPlacement = placementHydrated && placementResult === null;

  const handlePlacementComplete = useCallback((result: PlacementResult) => {
    setPlacementResult(result);
    // Navigate to the appropriate starting mode
    const startModes: Record<PlacementLevel, AppMode> = {
      "complete-beginner": "alphabet",
      beginner: "flashcards",
      intermediate: "reading",
      advanced: "grammar",
    };
    setMode(startModes[result.level]);
  }, [setPlacementResult]);

  const handlePlacementSkip = useCallback(() => {
    setPlacementResult({
      level: "complete-beginner",
      score: 0,
      totalQuestions: 20,
      stageScores: [0, 0, 0, 0, 0],
      completedAt: new Date().toISOString(),
    });
    setMode("alphabet");
  }, [setPlacementResult]);

  // Streak-at-risk: after 6 PM, no XP earned today, active streak
  const isStreakAtRisk = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 && todayXP === 0 && streak.current > 0;
  }, [todayXP, streak.current]);

  const activeGroup = useMemo(() => getGroup(mode), [mode]);
  const activeTab = useMemo(
    () => PRIMARY_TABS.find((t) => t.group === activeGroup)!,
    [activeGroup]
  );

  const handleSearchNavigate = useCallback(
    (target: AppMode, targetPassageId?: string) => {
      setMode(target);
      if (target === "reading" && targetPassageId) {
        setPassageId(targetPassageId);
      }
    },
    []
  );

  // Navigate to a different mode (passed down to child components)
  const navigateTo = useCallback((target: AppMode) => {
    setMode(target);
  }, []);

  // Keyboard shortcuts: Ctrl+1-4 for primary tabs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= PRIMARY_TABS.length) {
        e.preventDefault();
        setMode(PRIMARY_TABS[num - 1].defaultMode);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Show placement test for new users
  if (showPlacement) {
    return (
      <HydrationGuard>
        <ErrorBoundary>
          <PlacementTest
            onComplete={handlePlacementComplete}
            onSkip={handlePlacementSkip}
          />
        </ErrorBoundary>
      </HydrationGuard>
    );
  }

  return (
    <HydrationGuard>
      <ErrorBoundary>
        <div className="min-h-screen bg-bg-primary">
          {/* ── Header ──────────────────────────────────────── */}
          <header className="sticky top-0 z-50 bg-bg-secondary/95 backdrop-blur-sm border-b border-border">
            {/* Top row: logo, search, theme, streak */}
            <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
              <h1 className="text-lg font-bold text-text-primary shrink-0">
                <span className="hebrew-text text-accent text-xl">דבר</span>{" "}
                <span className="hidden sm:inline">Davar</span>
              </h1>

              <div className="flex-1" />

              <SearchBar onNavigate={handleSearchNavigate} />
              <ThemeToggle />
              <button
                onClick={() => setMode("settings")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  mode === "settings" ? "text-accent" : "text-text-muted hover:text-text-secondary"
                )}
                aria-label="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {hydrated && (
                <LevelBadge level={xpLevel} xpProgress={xpProgress} totalXP={totalXP} />
              )}

              {hydrated && streak.current > 0 && (
                <div className="flex items-center gap-1 text-sm shrink-0 relative">
                  <span className="text-base">{"\uD83D\uDD25"}</span>
                  <span className="text-accent-yellow font-semibold">
                    {streak.current}
                  </span>
                  {isStreakAtRisk && (
                    <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </div>
              )}

              {authConfigured && (
                <button
                  onClick={() => setMode("settings")}
                  className="shrink-0"
                  aria-label={isSignedIn ? "Account" : "Sign in"}
                >
                  {isSignedIn && user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className={cn(
                        "w-7 h-7 rounded-full border-2 transition-colors",
                        syncStatus === "synced" ? "border-accent-green/50" : "border-border"
                      )}
                    />
                  ) : isSignedIn ? (
                    <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                      {(user?.email?.[0] ?? "U").toUpperCase()}
                    </div>
                  ) : (
                    <div className="text-xs text-text-muted hover:text-accent transition-colors whitespace-nowrap">
                      Sign in
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Primary tab bar */}
            <div className="max-w-5xl mx-auto px-4">
              <nav className="flex -mb-px">
                {PRIMARY_TABS.map((tab, i) => {
                  const isActive = activeGroup === tab.group;
                  return (
                    <button
                      key={tab.group}
                      onClick={() => setMode(tab.defaultMode)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                        isActive
                          ? "text-accent border-accent"
                          : "text-text-muted border-transparent hover:text-text-secondary hover:border-text-muted/30"
                      )}
                    >
                      <span className={isActive ? "text-accent" : "text-text-muted"}>
                        {tab.icon}
                      </span>
                      {tab.label}
                      <span className="hidden lg:inline text-[10px] text-text-muted/60 ml-0.5">
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sub-tab bar — only shown when group has 2+ subs */}
            {activeTab.subs.length > 1 && (
              <div className="bg-bg-primary/50 border-t border-border/50">
                <div className="max-w-5xl mx-auto px-4">
                  <nav className="flex gap-1 overflow-x-auto">
                    {activeTab.subs.map((sub) => {
                      const isActive = mode === sub.mode;
                      return (
                        <button
                          key={sub.mode}
                          onClick={() => setMode(sub.mode)}
                          className={cn(
                            "px-4 py-2 text-xs font-medium transition-colors rounded-t-lg",
                            isActive
                              ? "text-accent bg-accent/10"
                              : "text-text-muted hover:text-text-secondary hover:bg-bg-card-hover/50"
                          )}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}
          </header>

          {/* ── Main content ─────────────────────────────────── */}
          <main className="max-w-5xl mx-auto px-4 py-6">
            {/* Home group */}
            {mode === "home" && <HomeHub onNavigate={navigateTo} />}
            {mode === "skilltree" && <SkillTree onNavigate={navigateTo} />}
            {mode === "custom" && <CustomWordsManager />}
            {mode === "daily-challenge" && <DailyChallenge />}
            {mode === "garden" && <VocabularyGarden navigateTo={navigateTo} />}
            {mode === "collection" && <WordCollection />}
            {mode === "league" && <WeeklyLeague />}
            {mode === "settings" && (
              <SettingsPanel />
            )}

            {/* Learn group */}
            {mode === "alphabet" && <AlphabetMode />}
            {mode === "writing" && <WritingPractice />}
            {mode === "grammar" && <GrammarMode onNavigate={navigateTo} />}
            {mode === "sentences" && <SentenceBuilderMode onNavigate={navigateTo} />}

            {/* Practice group */}
            {mode === "flashcards" && (
              <FlashcardMode onNavigate={navigateTo} />
            )}
            {mode === "quiz" && <QuizMode onNavigate={navigateTo} />}
            {mode === "listening" && <ListeningMode />}
            {mode === "matching" && <MatchingGame />}
            {mode === "cloze" && <ClozeMode />}
            {mode === "conversation" && <ConversationMode />}

            {/* Read group */}
            {mode === "reading" && (
              <ReadingMode
                navigateToPassageId={passageId}
                onPassageConsumed={() => setPassageId(undefined)}
              />
            )}
            {mode === "story" && <StoryMode />}
            {mode === "prayers" && <PrayerMode />}

            {/* Cross-mode suggestions (shown at bottom) */}
            {mode !== "home" && !HOME_MODES.has(mode) && (
              <CrossModeSuggestions currentMode={mode} onNavigate={navigateTo} />
            )}
          </main>
        </div>
      </ErrorBoundary>
    </HydrationGuard>
  );
}

/* ── Cross-mode suggestions ──────────────────────────────────── */

function CrossModeSuggestions({
  currentMode,
  onNavigate,
}: {
  currentMode: AppMode;
  onNavigate: (mode: AppMode) => void;
}) {
  // Define "continue to" suggestions based on current mode
  const suggestions: Record<string, { label: string; mode: AppMode; desc: string }[]> = {
    flashcards: [
      { label: "Test yourself", mode: "quiz", desc: "Quiz on what you just reviewed" },
      { label: "Try listening", mode: "listening", desc: "Practice hearing the words" },
    ],
    quiz: [
      { label: "Review flashcards", mode: "flashcards", desc: "Strengthen weak words" },
      { label: "Read a passage", mode: "reading", desc: "See words in context" },
    ],
    listening: [
      { label: "Take a quiz", mode: "quiz", desc: "Test your knowledge" },
      { label: "Review flashcards", mode: "flashcards", desc: "Reinforce vocabulary" },
    ],
    reading: [
      { label: "Practice words", mode: "flashcards", desc: "Drill passage vocabulary" },
      { label: "Test listening", mode: "listening", desc: "Hear the words you read" },
    ],
    prayers: [
      { label: "Read passages", mode: "reading", desc: "Practice more Hebrew texts" },
      { label: "Review vocabulary", mode: "flashcards", desc: "Strengthen your words" },
    ],
    alphabet: [
      { label: "Practice writing", mode: "writing", desc: "Trace and type letters" },
      { label: "Learn grammar", mode: "grammar", desc: "Verb conjugation patterns" },
    ],
    writing: [
      { label: "Review alphabet", mode: "alphabet", desc: "See all letters at a glance" },
      { label: "Learn grammar", mode: "grammar", desc: "Verb patterns and lessons" },
    ],
    grammar: [
      { label: "Practice vocabulary", mode: "flashcards", desc: "See these patterns in action" },
      { label: "Read passages", mode: "reading", desc: "Find grammar in real text" },
    ],
    sentences: [
      { label: "Learn grammar", mode: "grammar", desc: "Understand the patterns you built" },
      { label: "Read passages", mode: "reading", desc: "See sentences in full context" },
    ],
    matching: [
      { label: "Try cloze", mode: "cloze", desc: "Fill in the blanks from passages" },
      { label: "Review flashcards", mode: "flashcards", desc: "Reinforce the words you matched" },
    ],
    cloze: [
      { label: "Read passages", mode: "reading", desc: "See these sentences in full context" },
      { label: "Conversation", mode: "conversation", desc: "Practice using these words" },
    ],
    conversation: [
      { label: "Review vocabulary", mode: "flashcards", desc: "Strengthen the words you used" },
      { label: "Try listening", mode: "listening", desc: "Test your comprehension" },
    ],
    "daily-challenge": [
      { label: "Review flashcards", mode: "flashcards", desc: "Practice the words you saw" },
      { label: "Visit your garden", mode: "garden", desc: "See your word collection grow" },
    ],
    garden: [
      { label: "Review flashcards", mode: "flashcards", desc: "Water your wilting plants" },
      { label: "Daily challenge", mode: "daily-challenge", desc: "Today's Hebrew puzzle" },
    ],
    story: [
      { label: "Review vocabulary", mode: "flashcards", desc: "Practice story words" },
      { label: "Visit your garden", mode: "garden", desc: "See your growing collection" },
    ],
    collection: [
      { label: "Review flashcards", mode: "flashcards", desc: "Level up word rarities" },
      { label: "Take a quiz", mode: "quiz", desc: "Test your knowledge" },
    ],
    league: [
      { label: "Earn more XP", mode: "flashcards", desc: "Climb the leaderboard" },
      { label: "Daily challenge", mode: "daily-challenge", desc: "Quick XP boost" },
    ],
  };

  const items = suggestions[currentMode];
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <p className="text-xs text-text-muted mb-3">Continue with...</p>
      <div className="flex gap-3">
        {items.map((item) => (
          <button
            key={item.mode}
            onClick={() => onNavigate(item.mode)}
            className="flex-1 p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-colors text-left"
          >
            <span className="text-sm font-medium text-accent">
              {item.label} &#8594;
            </span>
            <span className="block text-xs text-text-muted mt-0.5">
              {item.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
