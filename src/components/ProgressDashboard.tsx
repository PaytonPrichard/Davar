"use client";

import { useMemo } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useStreak } from "@/hooks/useStreak";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useQuizStats } from "@/hooks/useQuizStats";
import { useXP } from "@/hooks/useXP";
import { isWordMastered } from "@/lib/sm2";
import { PASSAGES } from "@/data/passages";
import { PRAYERS } from "@/data/prayers";
import DailyGoals from "./DailyGoals";
import DailyQuests from "./DailyQuests";
import DifficultWords from "./DifficultWords";
import AchievementsPanel from "./AchievementsPanel";
import PrestigePanel from "./PrestigePanel";
import ExportImport from "./ExportImport";
import ShareProgressCard from "./ShareProgressCard";
import ReviewStats from "./ReviewStats";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";

interface ProgressDashboardProps {
  onNavigate?: (mode: AppMode) => void;
}

export default function ProgressDashboard({ onNavigate }: ProgressDashboardProps) {
  const { allWords, customWords, categories } = useVocabulary();
  const { cardStates, totalReviews, masteredCount, dueCards } =
    useSpacedRepetition(allWords);
  const { streak } = useStreak();
  const { stats: quizStats } = useQuizStats();
  const { totalXP, level: xpLevel, todayXP, activeXPMultiplier, xpMultiplierSource } = useXP();

  // Streak-at-risk detection: after 6 PM, no XP today, active streak
  const streakAtRisk = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 && todayXP === 0 && streak.current > 0;
  }, [todayXP, streak.current]);

  const [completedLines] = useLocalStorage<Record<string, number[]>>(
    "davar-completed-lines",
    {}
  );
  const [completedPrayerLines] = useLocalStorage<Record<string, number[]>>(
    "davar-completed-prayer-lines",
    {}
  );

  // Word stats
  const wordStats = useMemo(() => {
    const reviewed = Object.keys(cardStates).length;
    const total = allWords.length;
    return {
      total,
      reviewed,
      mastered: masteredCount,
      percentReviewed: total > 0 ? Math.round((reviewed / total) * 100) : 0,
      percentMastered: total > 0 ? Math.round((masteredCount / total) * 100) : 0,
    };
  }, [allWords, cardStates, masteredCount]);

  // Vocabulary category breakdown
  const categoryProgress = useMemo(() => {
    return categories.map((cat) => {
      const catWords = allWords.filter((w) => w.category === cat);
      const catMastered = catWords.filter((w) =>
        isWordMastered(cardStates[w.id])
      ).length;
      return {
        name: cat,
        total: catWords.length,
        mastered: catMastered,
        percent:
          catWords.length > 0
            ? Math.round((catMastered / catWords.length) * 100)
            : 0,
      };
    });
  }, [categories, allWords, cardStates]);

  // Reading stats
  const readingStats = useMemo(() => {
    const totalLines = PASSAGES.reduce((sum, p) => sum + p.lines.length, 0);
    let linesCompleted = 0;
    let passagesCompleted = 0;
    const perPassage = PASSAGES.map((p) => {
      const done = (completedLines[p.id] ?? []).length;
      const total = p.lines.length;
      linesCompleted += done;
      if (done >= total) passagesCompleted++;
      return {
        id: p.id,
        title: p.title,
        level: p.level,
        done,
        total,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
    return {
      totalPassages: PASSAGES.length,
      passagesCompleted,
      totalLines,
      linesCompleted,
      percentLines: totalLines > 0 ? Math.round((linesCompleted / totalLines) * 100) : 0,
      perPassage,
    };
  }, [completedLines]);

  // Prayer stats
  const prayerStats = useMemo(() => {
    const totalLines = PRAYERS.reduce((sum, p) => sum + p.lines.length, 0);
    let linesCompleted = 0;
    let prayersCompleted = 0;
    const perPrayer = PRAYERS.map((p) => {
      const done = (completedPrayerLines[p.id] ?? []).length;
      const total = p.lines.length;
      linesCompleted += done;
      if (done >= total) prayersCompleted++;
      return {
        id: p.id,
        title: p.title,
        level: p.level,
        done,
        total,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
    return {
      totalPrayers: PRAYERS.length,
      prayersCompleted,
      totalLines,
      linesCompleted,
      percentLines: totalLines > 0 ? Math.round((linesCompleted / totalLines) * 100) : 0,
      perPrayer,
    };
  }, [completedPrayerLines]);

  // My Words stats
  const myWordsStats = useMemo(() => {
    const total = customWords.length;
    const mastered = customWords.filter((w) =>
      isWordMastered(cardStates[w.id])
    ).length;
    const reviewed = customWords.filter((w) => cardStates[w.id]).length;
    return { total, mastered, reviewed };
  }, [customWords, cardStates]);

  // Level-based progress
  const levelProgress = useMemo(() => {
    const levels: { key: "A1" | "A2" | "B1"; label: string; color: string; barColor: string; borderColor: string; bgColor: string; hoverBg: string }[] = [
      { key: "A1", label: "Basics", color: "text-accent-green", barColor: "bg-accent-green", borderColor: "border-accent-green/20", bgColor: "bg-accent-green/5", hoverBg: "hover:bg-accent-green/10" },
      { key: "A2", label: "Growing", color: "text-amber-400", barColor: "bg-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5", hoverBg: "hover:bg-amber-500/10" },
      { key: "B1", label: "Challenging", color: "text-accent-blue", barColor: "bg-accent-blue", borderColor: "border-accent-blue/20", bgColor: "bg-accent-blue/5", hoverBg: "hover:bg-accent-blue/10" },
    ];
    return levels.map((lvl) => {
      const words = allWords.filter((w) => w.level === lvl.key);
      const mastered = words.filter((w) => isWordMastered(cardStates[w.id])).length;
      return {
        ...lvl,
        total: words.length,
        mastered,
        percent: words.length > 0 ? Math.round((mastered / words.length) * 100) : 0,
      };
    });
  }, [allWords, cardStates]);

  const handleLevelPractice = (levelKey: "A1" | "A2" | "B1") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("davar-level-filter", levelKey);
    }
    onNavigate?.("flashcards");
  };

  // Quiz average
  const quizAverage =
    quizStats.totalQuestions > 0
      ? Math.round((quizStats.totalCorrect / quizStats.totalQuestions) * 100)
      : 0;

  // XP for level progress
  const xpPct = xpLevel > 0
    ? Math.round(
        ((totalXP - xpForLevelCumulative(xpLevel - 1)) /
          xpForLevelRange(xpLevel)) *
          100
      )
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── 2x XP Event Banner ─────────────────────────────── */}
      {activeXPMultiplier > 1 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow">
          <span className="text-lg">{"\u26A1"}</span>
          <span className="text-sm font-medium">
            {xpMultiplierSource === "saturday"
              ? "Double XP Saturday! All XP earned today is doubled."
              : `${activeXPMultiplier}x XP Active! Expires at end of day.`}
          </span>
        </div>
      )}

      {/* ── Streak-at-Risk Nudge ───────────────────────────── */}
      {streakAtRisk && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <span className="text-lg">{"\uD83D\uDD25"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-400">
              Don&apos;t lose your {streak.current}-day streak!
            </p>
            <p className="text-xs text-orange-400/70">
              A quick review keeps it alive.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("flashcards")}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 text-xs font-semibold border border-orange-500/30 hover:bg-orange-500/25 transition-colors"
            >
              Start a Quick Review {"\u2192"}
            </button>
          )}
        </div>
      )}

      {/* ── Hero stats row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <HeroCard
          icon={"\uD83D\uDD25"}
          label="Day Streak"
          value={streak.current}
          subtext={streak.current >= 7 ? "Keep it up!" : streak.current > 0 ? "Nice start!" : "Start today!"}
          ringPct={Math.min(100, (streak.current / 30) * 100)}
          ringColor="var(--accent-yellow)"
          accentClass="text-accent-yellow"
        />
        <HeroCard
          icon={"\u2B50"}
          label="Mastered"
          value={wordStats.mastered}
          subtext={`of ${wordStats.total} words`}
          ringPct={wordStats.percentMastered}
          ringColor="var(--accent-green)"
          accentClass="text-accent-green"
        />
        <HeroCard
          icon={"\u26A1"}
          label={`Level ${xpLevel}`}
          value={totalXP}
          subtext="total XP"
          ringPct={xpPct}
          ringColor="var(--accent)"
          accentClass="text-accent"
        />
        <HeroCard
          icon={"\uD83D\uDCDA"}
          label="Reviews"
          value={totalReviews}
          subtext={`${wordStats.reviewed} words seen`}
          ringPct={wordStats.percentReviewed}
          ringColor="var(--accent-blue)"
          accentClass="text-accent-blue"
        />
      </div>

      {/* ── Daily Quests ───────────────────────────────────── */}
      <DailyQuests />

      {/* ── Daily Goals ────────────────────────────────────── */}
      <DailyGoals
        reviewsDone={totalReviews}
        linesCompleted={Object.values(completedLines).reduce((sum, lines) => sum + lines.length, 0)}
        quizzesTaken={quizStats.quizzesTaken}
      />

      {/* ── Practice by Level ────────────────────────────────── */}
      <SectionCard title="Practice by Level" icon={"\uD83C\uDFAF"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {levelProgress.map((lvl) => (
            <button
              key={lvl.key}
              onClick={() => handleLevelPractice(lvl.key)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all hover:scale-[1.02]",
                lvl.borderColor, lvl.bgColor, lvl.hoverBg
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-sm font-semibold", lvl.color)}>
                  {lvl.label}
                </span>
                <span className="text-xs text-text-muted">
                  {lvl.mastered}/{lvl.total}
                </span>
              </div>
              <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", lvl.barColor)}
                  style={{ width: `${lvl.percent}%` }}
                />
              </div>
              <span className="block text-[10px] text-text-muted mt-1.5">
                {lvl.mastered === lvl.total && lvl.total > 0
                  ? "All mastered!"
                  : `${lvl.total - lvl.mastered} remaining`}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Vocabulary ─────────────────────────────────────── */}
      <SectionCard title="Vocabulary" icon={"\uD83C\uDFB4"}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MiniRingStat
            label="Reviewed"
            value={wordStats.percentReviewed}
            color="var(--accent-blue)"
          />
          <MiniRingStat
            label="Mastered"
            value={wordStats.percentMastered}
            color="var(--accent-green)"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-text-secondary mb-3">
            By Category
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {categoryProgress.map((cat) => (
              <div key={cat.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary truncate">{cat.name}</span>
                  <span className="text-text-muted shrink-0">
                    {cat.mastered}/{cat.total}
                  </span>
                </div>
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-green transition-all duration-500 rounded-full"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Reading ────────────────────────────────────────── */}
      <SectionCard title="Reading" icon={"\uD83D\uDCD6"}>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-text-secondary">
            {readingStats.passagesCompleted}/{readingStats.totalPassages} passages
          </span>
          <span className="text-xs text-text-muted">
            {readingStats.linesCompleted}/{readingStats.totalLines} lines
          </span>
        </div>
        <ProgressBar value={readingStats.percentLines} color="bg-accent-blue" />
        <div className="mt-4 flex flex-col gap-2">
          {readingStats.perPassage.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary truncate">{p.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <LevelPill level={p.level} />
                    <span className="text-text-muted">
                      {p.done}/{p.total}
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-blue transition-all duration-300 rounded-full"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
              {p.done >= p.total && (
                <span className="text-accent-green text-sm shrink-0">{"\u2713"}</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Prayers ────────────────────────────────────────── */}
      <SectionCard title="Prayers" icon={"\uD83D\uDD4E"}>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-text-secondary">
            {prayerStats.prayersCompleted}/{prayerStats.totalPrayers} prayers
          </span>
          <span className="text-xs text-text-muted">
            {prayerStats.linesCompleted}/{prayerStats.totalLines} lines
          </span>
        </div>
        <ProgressBar value={prayerStats.percentLines} color="bg-purple-500" />
        <div className="mt-4 flex flex-col gap-2">
          {prayerStats.perPrayer.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-secondary truncate">{p.title}</span>
                  <span className="text-text-muted">
                    {p.done}/{p.total}
                  </span>
                </div>
                <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${p.percent}%` }}
                  />
                </div>
              </div>
              {p.done >= p.total && (
                <span className="text-accent-green text-sm shrink-0">{"\u2713"}</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Quiz ───────────────────────────────────────────── */}
      <SectionCard title="Quiz" icon={"\u2753"}>
        {quizStats.quizzesTaken === 0 ? (
          <p className="text-sm text-text-muted">
            No quizzes taken yet. Head to Practice {"\u2192"} Quiz to test yourself!
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <MiniStat label="Quizzes" value={quizStats.quizzesTaken.toString()} />
              <MiniStat label="Avg Score" value={`${quizAverage}%`} />
              <MiniStat label="Best" value={`${quizStats.bestScore}%`} />
            </div>
            <div className="flex items-baseline justify-between text-xs mb-2">
              <span className="text-text-secondary">
                Lifetime: {quizStats.totalCorrect}/{quizStats.totalQuestions}
              </span>
            </div>
            <ProgressBar value={quizAverage} color="bg-accent-yellow" />
          </>
        )}
      </SectionCard>

      {/* ── SRS Review Stats ─────────────────────────────────── */}
      <ReviewStats
        cardStates={cardStates}
        totalWordCount={allWords.length}
        dueCount={dueCards.length}
      />

      {/* ── Prestige ─────────────────────────────────────────── */}
      <PrestigePanel />

      {/* ── Achievements ────────────────────────────────────── */}
      <AchievementsPanel />

      {/* ── Difficult Words ────────────────────────────────── */}
      <DifficultWords cardStates={cardStates} allWords={allWords} />

      {/* ── My Words ───────────────────────────────────────── */}
      {myWordsStats.total > 0 && (
        <SectionCard title="My Words" icon={"\uD83D\uDCDD"}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MiniStat label="Saved" value={myWordsStats.total.toString()} />
            <MiniStat label="Reviewed" value={myWordsStats.reviewed.toString()} />
            <MiniStat label="Mastered" value={myWordsStats.mastered.toString()} />
          </div>
          <ProgressBar
            value={
              myWordsStats.total > 0
                ? Math.round((myWordsStats.mastered / myWordsStats.total) * 100)
                : 0
            }
            color="bg-accent-green"
          />
        </SectionCard>
      )}

      {/* ── Share & Export ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 items-start">
        <ShareProgressCard />
        <ExportImport />
      </div>
    </div>
  );
}

/* ── Helper components ───────────────────────────────────────── */

function HeroCard({
  icon,
  label,
  value,
  subtext,
  ringPct,
  ringColor,
  accentClass,
}: {
  icon: string;
  label: string;
  value: number;
  subtext: string;
  ringPct: number;
  ringColor: string;
  accentClass: string;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(100, ringPct) / 100);

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden group hover:border-accent/30 transition-colors">
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Ring + icon */}
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl">
          {icon}
        </span>
      </div>

      <span className={cn("text-2xl font-bold tabular-nums", accentClass)}>
        {value.toLocaleString()}
      </span>
      <span className="text-xs font-medium text-text-primary">{label}</span>
      <span className="text-[10px] text-text-muted">{subtext}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-6">
      <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniRingStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);

  return (
    <div className="bg-bg-secondary rounded-xl p-4 flex items-center gap-3">
      <div className="relative w-12 h-12 shrink-0">
        <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
          <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-primary">
          {value}%
        </span>
      </div>
      <span className="text-sm text-text-secondary font-medium">{label}</span>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-secondary rounded-xl p-3 text-center">
      <div className="text-lg font-bold text-text-primary tabular-nums">{value}</div>
      <div className="text-[10px] text-text-muted">{label}</div>
    </div>
  );
}

function LevelPill({ level }: { level: string }) {
  const colors = {
    beginner: "bg-accent-green/15 text-accent-green",
    intermediate: "bg-accent-blue/15 text-accent-blue",
    advanced: "bg-accent-yellow/15 text-accent-yellow",
  };
  return (
    <span
      className={cn(
        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
        colors[level as keyof typeof colors] ?? "bg-bg-secondary text-text-muted"
      )}
    >
      {level}
    </span>
  );
}

/* ── XP helpers ──────────────────────────────────────────────── */

function xpForLevelRange(level: number): number {
  return Math.round(100 * Math.pow(1.5, level - 1));
}

function xpForLevelCumulative(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevelRange(i);
  }
  return total;
}
