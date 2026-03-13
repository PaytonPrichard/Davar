"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useQuests } from "@/hooks/useQuests";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import DailyQuests from "./DailyQuests";
import WordOfTheDay from "./WordOfTheDay";
import ProficiencyCard from "./ProficiencyCard";
import AchievementShowcase from "./AchievementShowcase";
import MistakeJournal from "./MistakeJournal";
import { SK_LEAGUE, SK_DAILY_CHALLENGE, SK_CUSTOM_WORDS } from "@/lib/storage-keys";

/* ── Types ──────────────────────────────────────────────────── */

interface HomeHubProps {
  onNavigate: (mode: AppMode) => void;
}

interface ActivityCard {
  mode: AppMode;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/* ── Component ──────────────────────────────────────────────── */

export default function HomeHub({ onNavigate }: HomeHubProps) {
  const { streak } = useStreak();
  const { level, totalXP, xpProgress, todayXP, activeXPMultiplier, xpMultiplierSource } = useXP();
  const { allWords } = useVocabulary();
  const { cardStates, dueCards } = useSpacedRepetition(allWords);
  const { quests, allComplete: questsAllComplete } = useQuests();

  // League data
  const leagueData = useMemo(() => {
    try {
      const raw = localStorage.getItem(SK_LEAGUE);
      if (raw) {
        const d = JSON.parse(raw);
        return { tier: d.tier as string, rank: d.currentRank as number | undefined };
      }
    } catch {}
    return { tier: "bronze", rank: undefined };
  }, []);

  // Custom words count
  const [customWords] = useLocalStorage<{ id: string }[]>(SK_CUSTOM_WORDS, []);

  // Garden stats
  const gardenStats = useMemo(() => {
    const entries = Object.values(cardStates);
    const wilting = entries.filter((s) => {
      if (!s.nextReview) return false;
      return new Date(s.nextReview) < new Date();
    }).length;
    const bloomed = entries.filter((s) => (s.stability ?? s.interval) >= 21).length;
    return { wilting, bloomed, total: entries.length };
  }, [cardStates]);

  // Word stats
  const wordStats = useMemo(() => {
    const mastered = Object.values(cardStates).filter(
      (s) => (s.stability ?? s.interval) >= 21
    ).length;
    return { total: allWords.length, mastered, collected: Object.keys(cardStates).length };
  }, [allWords, cardStates]);

  // Daily challenge status
  const dailyChallengeComplete = useMemo(() => {
    try {
      const raw = localStorage.getItem(SK_DAILY_CHALLENGE);
      if (raw) {
        const d = JSON.parse(raw);
        const today = new Date().toISOString().split("T")[0];
        return d.date === today && d.completed === true;
      }
    } catch {}
    return false;
  }, []);

  // Streak-at-risk
  const isStreakAtRisk = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 && todayXP === 0 && streak.current > 0;
  }, [todayXP, streak.current]);

  // Quests done count
  const questsDone = quests.filter((q) => q.completed).length;

  // Activity cards
  const activityCards: ActivityCard[] = useMemo(() => [
    {
      mode: "daily-challenge" as AppMode,
      label: "Daily Challenge",
      subtitle: dailyChallengeComplete ? "Completed today!" : "5 new questions",
      icon: dailyChallengeComplete ? "✅" : "🎯",
      color: "text-purple-500",
      bgColor: "bg-purple-500/8",
      borderColor: "border-purple-500/20",
    },
    {
      mode: "flashcards" as AppMode,
      label: "Flashcard Review",
      subtitle: dueCards.length > 0 ? `${dueCards.length} cards due` : "All caught up!",
      icon: dueCards.length > 0 ? "📇" : "✨",
      color: "text-accent",
      bgColor: "bg-accent/8",
      borderColor: "border-accent/20",
    },
    {
      mode: "skilltree" as AppMode,
      label: "Skill Path",
      subtitle: `Level ${level} — keep climbing`,
      icon: "🗺️",
      color: "text-accent-blue",
      bgColor: "bg-accent-blue/8",
      borderColor: "border-accent-blue/20",
    },
    {
      mode: "garden" as AppMode,
      label: "Vocabulary Garden",
      subtitle: gardenStats.wilting > 0
        ? `${gardenStats.wilting} plants need water`
        : gardenStats.bloomed > 0
          ? `${gardenStats.bloomed} plants blooming`
          : "Plant your first word",
      icon: gardenStats.wilting > 0 ? "💧" : "🌱",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/8",
      borderColor: "border-emerald-500/20",
    },
    {
      mode: "league" as AppMode,
      label: "Weekly League",
      subtitle: leagueData.rank
        ? `${leagueData.tier.charAt(0).toUpperCase() + leagueData.tier.slice(1)} — Rank #${leagueData.rank}`
        : `${leagueData.tier.charAt(0).toUpperCase() + leagueData.tier.slice(1)} tier`,
      icon: "🏆",
      color: "text-accent-yellow",
      bgColor: "bg-accent-yellow/8",
      borderColor: "border-accent-yellow/20",
    },
    {
      mode: "collection" as AppMode,
      label: "Word Collection",
      subtitle: `${wordStats.collected}/${wordStats.total} collected`,
      icon: "🃏",
      color: "text-rose-500",
      bgColor: "bg-rose-500/8",
      borderColor: "border-rose-500/20",
    },
    {
      mode: "custom" as AppMode,
      label: "My Words",
      subtitle: customWords.length > 0
        ? `${customWords.length} custom words`
        : "Add your own words",
      icon: "✏️",
      color: "text-teal-500",
      bgColor: "bg-teal-500/8",
      borderColor: "border-teal-500/20",
    },
  ], [dailyChallengeComplete, dueCards.length, level, gardenStats, leagueData, wordStats, customWords.length]);

  return (
    <div className="space-y-6">
      {/* ── 2x XP Banner ───────────────────────────────── */}
      {activeXPMultiplier > 1 && (
        <div className="flex items-center gap-2 rounded-xl border border-accent-yellow/30 bg-accent-yellow/10 px-4 py-3 text-sm">
          <span className="text-lg">⚡</span>
          <span className="text-accent-yellow font-semibold">
            {xpMultiplierSource === "saturday"
              ? "Double XP Saturday!"
              : `${activeXPMultiplier}x XP Active!`}
          </span>
          <span className="text-text-muted ml-1">All XP earned today is doubled.</span>
        </div>
      )}

      {/* ── Streak-at-Risk Nudge ───────────────────────── */}
      {isStreakAtRisk && (
        <button
          onClick={() => onNavigate("flashcards")}
          className="w-full flex items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-left text-sm transition-colors hover:bg-orange-500/15"
        >
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-semibold text-orange-400">
              Don&apos;t lose your {streak.current}-day streak!
            </p>
            <p className="text-text-muted text-xs">A quick review keeps it alive.</p>
          </div>
        </button>
      )}

      {/* ── Compact Stats Bar ──────────────────────────── */}
      <div className="flex items-center gap-4 rounded-2xl bg-bg-card border border-border p-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🔥</span>
          <div>
            <span className="text-lg font-bold text-text-primary">{streak.current}</span>
            <span className="text-xs text-text-muted ml-1">day{streak.current !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Level + XP bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-text-primary">
              Level {level}
            </span>
            <span className="text-xs text-text-muted">
              {totalXP.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min((xpProgress.current / xpProgress.needed) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Today's XP */}
        <div className="text-center">
          <span className="text-lg font-bold text-accent">{todayXP}</span>
          <span className="block text-[10px] text-text-muted">today</span>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Mastered */}
        <div className="text-center">
          <span className="text-lg font-bold text-accent-green">{wordStats.mastered}</span>
          <span className="block text-[10px] text-text-muted">mastered</span>
        </div>
      </div>

      {/* ── Word of the Day ──────────────────────────── */}
      <WordOfTheDay onNavigate={onNavigate} />

      {/* ── Daily Quests ───────────────────────────────── */}
      <DailyQuests />

      {/* ── Proficiency ───────────────────────────────── */}
      <ProficiencyCard onNavigate={onNavigate} />

      {/* ── Achievement Showcase ──────────────────────── */}
      <AchievementShowcase />

      {/* ── Activity Grid ──────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          Activities
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {activityCards.map((card) => (
            <button
              key={card.mode}
              onClick={() => onNavigate(card.mode)}
              className={cn(
                "relative rounded-2xl border p-4 text-left transition-all",
                "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                card.borderColor, card.bgColor
              )}
            >
              <span className="text-3xl block mb-2">{card.icon}</span>
              <span className={cn("text-sm font-semibold block", card.color)}>
                {card.label}
              </span>
              <span className="text-xs text-text-muted block mt-0.5">
                {card.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Quick Practice Row ──────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          Quick Practice
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { mode: "quiz" as AppMode, icon: "❓", label: "Quiz" },
            { mode: "listening" as AppMode, icon: "👂", label: "Listen" },
            { mode: "matching" as AppMode, icon: "🔗", label: "Match" },
            { mode: "sentences" as AppMode, icon: "🔤", label: "Build" },
          ].map((q) => (
            <button
              key={q.mode}
              onClick={() => onNavigate(q.mode)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-bg-card p-3 transition-all hover:bg-bg-card-hover hover:scale-[1.03] active:scale-[0.97]"
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="text-[11px] font-medium text-text-secondary">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* ── Mistake Journal ──────────────────────────── */}
      <MistakeJournal onNavigate={onNavigate} />
    </div>
  );
}
