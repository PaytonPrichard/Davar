"use client";

import { useMemo, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXP } from "@/hooks/useXP";
import { cn } from "@/lib/utils";
import { SK_LEAGUE } from "@/lib/storage-keys";

/* ── Types ────────────────────────────────────────────── */

type LeagueTier = "bronze" | "silver" | "gold" | "diamond";

interface BotLearner {
  name: string;
  avatar: string;
  weeklyXP: number;
}

interface LeagueState {
  weekStart: string; // ISO date of week start (Monday)
  tier: LeagueTier;
  weeklyXP: number;
  bots: BotLearner[];
  prevResult?: {
    tier: LeagueTier;
    rank: number;
    promoted: boolean;
    demoted: boolean;
  };
  // Cumulative stats for achievements
  totalPromotions?: number;
  bestRank?: number;
}

/* ── Constants ────────────────────────────────────────── */

const TIER_INFO: Record<LeagueTier, { label: string; emoji: string; color: string; bg: string; nextTier?: LeagueTier; prevTier?: LeagueTier; promoteTop: number; demoteBottom: number }> = {
  bronze: {
    label: "Bronze League",
    emoji: "\uD83E\uDD49",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    nextTier: "silver",
    promoteTop: 3,
    demoteBottom: 0,
  },
  silver: {
    label: "Silver League",
    emoji: "\uD83E\uDD48",
    color: "text-slate-300",
    bg: "bg-slate-300/10",
    nextTier: "gold",
    prevTier: "bronze",
    promoteTop: 3,
    demoteBottom: 3,
  },
  gold: {
    label: "Gold League",
    emoji: "\uD83E\uDD47",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    nextTier: "diamond",
    prevTier: "silver",
    promoteTop: 3,
    demoteBottom: 3,
  },
  diamond: {
    label: "Diamond League",
    emoji: "\uD83D\uDC8E",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    prevTier: "gold",
    promoteTop: 0,
    demoteBottom: 3,
  },
};

const BOT_NAMES = [
  "Avigail", "Noam", "Tamar", "Eitan", "Shira", "Oren", "Noa", "Yonatan",
  "Michal", "Amir", "Lior", "Dana", "Gal", "Roi", "Tal", "Maya",
  "Itai", "Yael", "Omri", "Tali", "Elad", "Hila", "Shai", "Roni",
];

const BOT_AVATARS = [
  "\uD83E\uDDD1\u200D\uD83C\uDF93", "\uD83D\uDC69\u200D\uD83D\uDCBB", "\uD83E\uDDD1\u200D\uD83D\uDCDA",
  "\uD83D\uDC68\u200D\uD83C\uDFEB", "\uD83D\uDC69\u200D\uD83C\uDF93", "\uD83E\uDDD1\u200D\uD83D\uDD2C",
  "\uD83D\uDC68\u200D\uD83D\uDCBB", "\uD83D\uDC69\u200D\uD83C\uDFEB", "\uD83E\uDDD1\u200D\uD83C\uDFA8",
  "\uD83D\uDC68\u200D\uD83D\uDCDA",
];

/* ── Helpers ──────────────────────────────────────────── */

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

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

function generateBots(weekStart: string, tier: LeagueTier): BotLearner[] {
  const rng = seededRandom(`davar-league-${weekStart}-${tier}`);
  const count = 14; // 15 total including user

  // XP range per tier
  const ranges: Record<LeagueTier, [number, number]> = {
    bronze: [50, 400],
    silver: [150, 700],
    gold: [300, 1200],
    diamond: [500, 2000],
  };
  const [min, max] = ranges[tier];

  const shuffledNames = [...BOT_NAMES];
  for (let i = shuffledNames.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledNames[i], shuffledNames[j]] = [shuffledNames[j], shuffledNames[i]];
  }

  return shuffledNames.slice(0, count).map((name, i) => ({
    name,
    avatar: BOT_AVATARS[i % BOT_AVATARS.length],
    weeklyXP: Math.round(min + rng() * (max - min)),
  }));
}

function daysLeftInWeek(): number {
  const now = new Date();
  const day = now.getDay();
  // Sunday = 0, we want days until Sunday end
  return day === 0 ? 0 : 7 - day;
}

/* ── Component ────────────────────────────────────────── */

const DEFAULT_STATE: LeagueState = {
  weekStart: "",
  tier: "bronze",
  weeklyXP: 0,
  bots: [],
};

export default function WeeklyLeague() {
  const { todayXP } = useXP();
  const [state, setState, hydrated] = useLocalStorage<LeagueState>(
    SK_LEAGUE,
    DEFAULT_STATE
  );

  const currentWeek = getWeekStart();

  // Initialize or transition week
  useEffect(() => {
    if (!hydrated) return;

    if (state.weekStart !== currentWeek) {
      setState((prev) => {
        let newTier = prev.tier || "bronze";
        let prevResult: LeagueState["prevResult"] | undefined;

        // If there was a previous week, determine promotion/demotion
        if (prev.weekStart && prev.bots.length > 0) {
          const allParticipants = [
            { name: "You", weeklyXP: prev.weeklyXP },
            ...prev.bots,
          ].sort((a, b) => b.weeklyXP - a.weeklyXP);

          const rank = allParticipants.findIndex((p) => p.name === "You") + 1;
          const tierInfo = TIER_INFO[prev.tier];

          let promoted = false;
          let demoted = false;

          if (tierInfo.nextTier && rank <= tierInfo.promoteTop) {
            newTier = tierInfo.nextTier;
            promoted = true;
          } else if (
            tierInfo.prevTier &&
            tierInfo.demoteBottom > 0 &&
            rank > allParticipants.length - tierInfo.demoteBottom
          ) {
            newTier = tierInfo.prevTier;
            demoted = true;
          }

          prevResult = {
            tier: prev.tier,
            rank,
            promoted,
            demoted,
          };
        }

        // Track cumulative promotions and best rank for achievements
        const newPromotions = (prev.totalPromotions ?? 0) + (prevResult?.promoted ? 1 : 0);
        const prevBestRank = prev.bestRank ?? Infinity;
        const newBestRank = prevResult
          ? Math.min(prevBestRank, prevResult.rank)
          : prevBestRank;

        return {
          weekStart: currentWeek,
          tier: newTier,
          weeklyXP: 0,
          bots: generateBots(currentWeek, newTier),
          prevResult,
          totalPromotions: newPromotions,
          bestRank: newBestRank === Infinity ? undefined : newBestRank,
        };
      });
    }
  }, [hydrated, state.weekStart, currentWeek, setState]);

  // Sync weekly XP from daily XP data
  const weeklyUserXP = useMemo(() => {
    // Count XP earned since the start of this week
    // Use todayXP as a proxy + stored weeklyXP
    return state.weeklyXP;
  }, [state.weeklyXP]);

  // Increment weekly XP whenever daily XP changes
  useEffect(() => {
    if (!hydrated || state.weekStart !== currentWeek) return;
    const storedDayKey = `davar-league-day-${currentWeek}`;
    const lastTracked = parseInt(localStorage.getItem(storedDayKey) ?? "0", 10);
    if (todayXP > lastTracked) {
      const diff = todayXP - lastTracked;
      localStorage.setItem(storedDayKey, todayXP.toString());
      setState((prev) => ({
        ...prev,
        weeklyXP: prev.weeklyXP + diff,
      }));
    }
  }, [todayXP, hydrated, currentWeek, state.weekStart, setState]);

  if (!hydrated) return null;

  const tierInfo = TIER_INFO[state.tier];
  const daysLeft = daysLeftInWeek();

  // Build leaderboard
  const leaderboard = useMemo(() => {
    const all = [
      { name: "You", avatar: "\uD83D\uDE4B", weeklyXP: state.weeklyXP, isUser: true },
      ...state.bots.map((b) => ({ ...b, isUser: false })),
    ].sort((a, b) => b.weeklyXP - a.weeklyXP);
    return all;
  }, [state.bots, state.weeklyXP]);

  const userRank = leaderboard.findIndex((p) => p.isUser) + 1;
  const totalParticipants = leaderboard.length;
  const isInPromotionZone = tierInfo.promoteTop > 0 && userRank <= tierInfo.promoteTop;
  const isInDemotionZone =
    tierInfo.demoteBottom > 0 && userRank > totalParticipants - tierInfo.demoteBottom;

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      {/* Previous week result banner */}
      {state.prevResult && (
        <div
          className={cn(
            "rounded-xl border p-4 text-center",
            state.prevResult.promoted
              ? "bg-green-500/10 border-green-500/30"
              : state.prevResult.demoted
                ? "bg-red-500/10 border-red-500/30"
                : "bg-bg-card border-border"
          )}
        >
          <p className="text-sm font-medium text-text-primary">
            {state.prevResult.promoted
              ? `\uD83C\uDF89 Promoted to ${TIER_INFO[state.tier].label.replace(" League", "")}! You finished #${state.prevResult.rank} last week.`
              : state.prevResult.demoted
                ? `\u2B07\uFE0F Demoted to ${TIER_INFO[state.tier].label.replace(" League", "")}. You finished #${state.prevResult.rank} \u2014 you'll get it next week!`
                : `You finished #${state.prevResult.rank} in ${TIER_INFO[state.prevResult.tier].label}. Keep it up!`}
          </p>
          <button
            onClick={() => setState((prev) => ({ ...prev, prevResult: undefined }))}
            className="text-xs text-text-muted hover:text-text-secondary mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-2">{tierInfo.emoji}</div>
        <h2 className={cn("text-2xl font-bold", tierInfo.color)}>
          {tierInfo.label}
        </h2>
        <p className="text-sm text-text-muted mt-1">
          {daysLeft > 0
            ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`
            : "Week ends today!"}
        </p>
      </div>

      {/* Your rank card */}
      <div
        className={cn(
          "rounded-xl border p-4 text-center",
          isInPromotionZone
            ? "bg-green-500/10 border-green-500/30"
            : isInDemotionZone
              ? "bg-red-500/10 border-red-500/30"
              : "bg-accent/10 border-accent/30"
        )}
      >
        <span className="text-3xl font-bold text-text-primary">#{userRank}</span>
        <p className="text-sm text-text-secondary mt-1">
          {state.weeklyXP} XP this week
        </p>
        {isInPromotionZone && tierInfo.nextTier && (
          <p className="text-xs text-green-400 mt-1 font-medium">
            {"\u2B06"} Promotion zone!
          </p>
        )}
        {isInDemotionZone && tierInfo.prevTier && (
          <p className="text-xs text-red-400 mt-1 font-medium">
            {"\u2B07"} Demotion zone \u2014 earn more XP!
          </p>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
        {leaderboard.map((p, i) => {
          const rank = i + 1;
          const inPromo = tierInfo.promoteTop > 0 && rank <= tierInfo.promoteTop;
          const inDemo =
            tierInfo.demoteBottom > 0 && rank > totalParticipants - tierInfo.demoteBottom;

          return (
            <div
              key={p.name}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors",
                p.isUser ? "bg-accent/5" : "",
                inPromo ? "border-l-2 border-l-green-500" : "",
                inDemo ? "border-l-2 border-l-red-500" : ""
              )}
            >
              {/* Rank */}
              <span
                className={cn(
                  "w-8 text-center font-bold text-sm",
                  rank === 1
                    ? "text-yellow-400"
                    : rank === 2
                      ? "text-slate-300"
                      : rank === 3
                        ? "text-amber-600"
                        : "text-text-muted"
                )}
              >
                {rank <= 3
                  ? rank === 1
                    ? "\uD83E\uDD47"
                    : rank === 2
                      ? "\uD83E\uDD48"
                      : "\uD83E\uDD49"
                  : `#${rank}`}
              </span>

              {/* Avatar + Name */}
              <span className="text-xl">{p.avatar}</span>
              <span
                className={cn(
                  "flex-1 text-sm font-medium",
                  p.isUser ? "text-accent font-bold" : "text-text-primary"
                )}
              >
                {p.name}
                {p.isUser && " (you)"}
              </span>

              {/* XP */}
              <span className="text-sm font-semibold text-text-secondary">
                {p.weeklyXP} XP
              </span>
            </div>
          );
        })}
      </div>

      {/* Tier progression */}
      <div className="flex justify-center gap-3">
        {(["bronze", "silver", "gold", "diamond"] as LeagueTier[]).map((t) => (
          <div
            key={t}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
              state.tier === t
                ? `${TIER_INFO[t].bg} border border-current ${TIER_INFO[t].color}`
                : "opacity-40"
            )}
          >
            <span className="text-xl">{TIER_INFO[t].emoji}</span>
            <span className="text-[10px] font-medium">{t}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-text-muted">
        {tierInfo.promoteTop > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500/50" />
            Top {tierInfo.promoteTop} promote
          </span>
        )}
        {tierInfo.demoteBottom > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500/50" />
            Bottom {tierInfo.demoteBottom} demote
          </span>
        )}
      </div>
    </div>
  );
}
