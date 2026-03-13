"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { useMysteryRewards, MysteryReward } from "@/hooks/useMysteryRewards";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";
import MysteryRewardReveal from "./MysteryRewardReveal";

/* ── Types ────────────────────────────────────────────── */

export interface SessionStats {
  wordsReviewed: number;
  correctCount?: number;
  totalCount?: number;
  xpEarned: number;
  isPerfect?: boolean;
  mode: string;
  /** New achievements unlocked during this session */
  newAchievements?: { title: string; icon: string }[];
}

interface SessionCompleteProps {
  stats: SessionStats;
  onContinue: () => void;
  onNavigate?: (mode: AppMode) => void;
  continueLabel?: string;
  suggestions?: { label: string; mode: AppMode; desc: string }[];
}

/* ── Confetti particles ──────────────────────────────── */

function Confetti() {
  const particles = useMemo(() => {
    const colors = [
      "bg-accent",
      "bg-accent-yellow",
      "bg-accent-green",
      "bg-accent-blue",
      "bg-pink-400",
      "bg-purple-400",
    ];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      size: Math.random() > 0.5 ? "w-2 h-2" : "w-1.5 h-3",
      rotation: `${Math.random() * 360}deg`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn("absolute rounded-sm opacity-0", p.color, p.size)}
          style={{
            left: p.left,
            top: "-10px",
            animationName: "confetti-fall",
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animationFillMode: "forwards",
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(500px) rotate(720deg) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}

/* ── Streak milestone messages ───────────────────────── */

function getStreakMessage(streak: number): string | null {
  if (streak === 1) return "You started a streak! Come back tomorrow to keep it going.";
  if (streak === 3) return "3-day streak! You're building a habit!";
  if (streak === 7) return "One week streak! Consistency is key!";
  if (streak === 14) return "Two-week streak! You're on fire!";
  if (streak === 30) return "30-day streak! Incredible dedication!";
  if (streak === 50) return "50 days! You're a Hebrew warrior!";
  if (streak === 100) return "100-DAY STREAK! Legendary!";
  if (streak % 10 === 0 && streak > 0) return `${streak}-day streak! Keep going!`;
  return null;
}

/* ── Component ────────────────────────────────────────── */

export default function SessionComplete({
  stats,
  onContinue,
  onNavigate,
  continueLabel = "Continue",
  suggestions,
}: SessionCompleteProps) {
  const { level, xpProgress, todayXP } = useXP();
  const { streak } = useStreak();
  const { rollReward } = useMysteryRewards();
  const [show, setShow] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);
  const [showRewardReveal, setShowRewardReveal] = useState(false);
  const rolledRef = useRef(false);

  // Roll for mystery reward on mount
  useEffect(() => {
    if (rolledRef.current) return;
    rolledRef.current = true;
    const reward = rollReward();
    if (reward) {
      setMysteryReward(reward);
      setShowRewardReveal(true);
    }
  }, [rollReward]);

  // Staggered reveal animation
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 100);
    const t2 = setTimeout(() => setShowStats(true), 600);
    const t3 = setTimeout(() => setShowStreak(true), 1200);
    const t4 = setTimeout(() => setShowSuggestions(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const percentage = stats.totalCount
    ? Math.round(((stats.correctCount ?? 0) / stats.totalCount) * 100)
    : null;

  const streakMessage = getStreakMessage(streak.current);

  const emoji = stats.isPerfect
    ? "\uD83C\uDF1F"
    : percentage !== null && percentage >= 80
      ? "\uD83C\uDF89"
      : percentage !== null && percentage >= 60
        ? "\uD83D\uDC4D"
        : "\uD83D\uDCAA";

  const title = stats.isPerfect
    ? "Perfect!"
    : percentage !== null && percentage >= 80
      ? "Great Session!"
      : percentage !== null && percentage >= 60
        ? "Nice Work!"
        : stats.wordsReviewed > 0
          ? "Session Complete!"
          : "All Done!";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[450px] gap-6">
      {/* Mystery reward overlay */}
      {showRewardReveal && mysteryReward && (
        <MysteryRewardReveal
          reward={mysteryReward}
          onDismiss={() => setShowRewardReveal(false)}
        />
      )}

      {/* Confetti for good scores */}
      {(stats.isPerfect || (percentage !== null && percentage >= 80)) && (
        <Confetti />
      )}

      {/* Main celebration */}
      <div
        className={cn(
          "transition-all duration-700",
          show ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      >
        <div className="text-7xl mb-2 text-center">{emoji}</div>
        <h2 className="text-3xl font-bold text-text-primary text-center">
          {title}
        </h2>
      </div>

      {/* Stats grid */}
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md transition-all duration-500",
          showStats
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        )}
      >
        {stats.wordsReviewed > 0 && (
          <StatCard
            label="Words"
            value={stats.wordsReviewed.toString()}
            color="text-accent"
          />
        )}
        {stats.correctCount !== undefined && stats.totalCount !== undefined && (
          <StatCard
            label="Score"
            value={`${stats.correctCount}/${stats.totalCount}`}
            color="text-accent-green"
          />
        )}
        <StatCard
          label="XP Earned"
          value={`+${stats.xpEarned}`}
          color="text-accent-yellow"
        />
        <StatCard
          label="Today"
          value={`${todayXP} XP`}
          color="text-accent-blue"
        />
      </div>

      {/* XP progress bar */}
      <div
        className={cn(
          "w-full max-w-sm transition-all duration-500",
          showStats
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        )}
      >
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Level {level}</span>
          <span>
            {xpProgress.current} / {xpProgress.needed} XP
          </span>
        </div>
        <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent-blue rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(
                100,
                (xpProgress.current / xpProgress.needed) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Streak callout */}
      {(streakMessage || streak.current > 0) && (
        <div
          className={cn(
            "flex items-center gap-3 px-5 py-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 max-w-sm transition-all duration-500",
            showStreak
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          )}
        >
          <span className="text-2xl">{"\uD83D\uDD25"}</span>
          <div>
            <span className="text-accent-yellow font-bold text-lg">
              {streak.current} day{streak.current !== 1 ? "s" : ""}
            </span>
            {streakMessage && (
              <p className="text-xs text-text-secondary">{streakMessage}</p>
            )}
            {(streak.freezesAvailable ?? 0) > 0 && (
              <p className="text-xs text-cyan-400 mt-0.5">
                {"\u2744\uFE0F"} {streak.freezesAvailable} freeze{(streak.freezesAvailable ?? 0) !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>
      )}

      {/* New achievements */}
      {stats.newAchievements && stats.newAchievements.length > 0 && (
        <div
          className={cn(
            "flex flex-col gap-2 w-full max-w-sm transition-all duration-500",
            showStreak
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          )}
        >
          {stats.newAchievements.map((ach, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
            >
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <span className="text-xs text-yellow-400 uppercase tracking-wider font-medium">
                  Achievement Unlocked!
                </span>
                <p className="text-sm text-text-primary font-medium">
                  {ach.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        className={cn(
          "flex flex-col items-center gap-4 w-full max-w-sm transition-all duration-500",
          showSuggestions
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        )}
      >
        <button
          onClick={onContinue}
          className="w-full px-8 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-lg transition-all hover:scale-[1.02]"
        >
          {continueLabel}
        </button>

        {/* Cross-mode suggestions */}
        {suggestions && onNavigate && (
          <div className="flex gap-3 w-full">
            {suggestions.map((s) => (
              <button
                key={s.mode}
                onClick={() => onNavigate(s.mode)}
                className="flex-1 p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-colors text-left"
              >
                <span className="text-sm font-medium text-accent">
                  {s.label} {"\u2192"}
                </span>
                <span className="block text-xs text-text-muted mt-0.5">
                  {s.desc}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────── */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-3 text-center">
      <div className={cn("text-xl font-bold", color)}>{value}</div>
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
    </div>
  );
}
