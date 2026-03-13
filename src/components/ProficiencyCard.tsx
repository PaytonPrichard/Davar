"use client";

import { useProficiency } from "@/hooks/useProficiency";
import { cn } from "@/lib/utils";
import type { AppMode } from "@/types";

/* ── Types ──────────────────────────────────────────────────── */

interface ProficiencyCardProps {
  onNavigate?: (mode: AppMode) => void;
}

/* ── Skill ring dimensions ──────────────────────────────────── */

interface SkillBarProps {
  label: string;
  current: number;
  needed: number;
  met: boolean;
  textColor: string;
  bgTrack: string;
  bgFill: string;
  bgFillDim: string;
  suffix?: string;
}

function SkillBar({ label, current, needed, met, textColor, bgTrack, bgFill, bgFillDim, suffix = "" }: SkillBarProps) {
  const pct = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className={cn("text-xs font-medium", met ? textColor : "text-text-muted")}>
          {current}/{needed}{suffix}
        </span>
      </div>
      <div className={cn("h-2 rounded-full overflow-hidden", bgTrack)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            met ? bgFill : bgFillDim
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────── */

export default function ProficiencyCard({ onNavigate }: ProficiencyCardProps) {
  const { currentLevel, nextLevel, progress, overallProgress } = useProficiency();

  return (
    <button
      onClick={() => onNavigate?.("skilltree")}
      className={cn(
        "w-full text-left bg-bg-card rounded-2xl border border-border p-5",
        "hover:border-accent/40 hover:bg-bg-card-hover transition-all group"
      )}
    >
      {/* ── Header: icon + level name + Hebrew ──────────── */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" role="img" aria-label={currentLevel.name}>
          {currentLevel.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              Level {currentLevel.level}: {currentLevel.name}
            </h3>
            <span className="hebrew-text text-sm text-accent font-medium">
              {currentLevel.nameHebrew}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5 truncate">
            {currentLevel.description}
          </p>
        </div>
        <span className="text-text-muted text-sm shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          &#8594;
        </span>
      </div>

      {/* ── Overall progress toward next level ──────────── */}
      {nextLevel && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted">
              Progress to Level {nextLevel.level}
            </span>
            <span className="text-[11px] font-medium text-accent">
              {overallProgress}%
            </span>
          </div>
          <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Four skill dimension bars ───────────────────── */}
      <div className="grid grid-cols-1 gap-2.5">
        <SkillBar
          label="Vocabulary"
          current={progress.wordsKnown.current}
          needed={progress.wordsKnown.needed}
          met={progress.wordsKnown.met}
          textColor="text-accent-green"
          bgTrack="bg-accent-green/10"
          bgFill="bg-accent-green"
          bgFillDim="bg-accent-green/60"
          suffix=" words"
        />
        <SkillBar
          label="Grammar"
          current={progress.grammarLessons.current}
          needed={progress.grammarLessons.needed}
          met={progress.grammarLessons.met}
          textColor="text-accent-blue"
          bgTrack="bg-accent-blue/10"
          bgFill="bg-accent-blue"
          bgFillDim="bg-accent-blue/60"
          suffix=" lessons"
        />
        <SkillBar
          label="Reading"
          current={progress.passagesRead.current}
          needed={progress.passagesRead.needed}
          met={progress.passagesRead.met}
          textColor="text-accent-yellow"
          bgTrack="bg-accent-yellow/10"
          bgFill="bg-accent-yellow"
          bgFillDim="bg-accent-yellow/60"
          suffix=" passages"
        />
        <SkillBar
          label="Accuracy"
          current={progress.exerciseAccuracy.current}
          needed={progress.exerciseAccuracy.needed}
          met={progress.exerciseAccuracy.met}
          textColor="text-purple-400"
          bgTrack="bg-purple-400/10"
          bgFill="bg-purple-400"
          bgFillDim="bg-purple-400/60"
          suffix="%"
        />
      </div>

      {/* ── Next level hint ─────────────────────────────── */}
      {nextLevel ? (
        <p className="text-[11px] text-text-muted mt-3 text-center">
          Next: {nextLevel.icon} {nextLevel.name} ({nextLevel.nameHebrew}) — {nextLevel.description}
        </p>
      ) : (
        <p className="text-[11px] text-accent-green mt-3 text-center font-medium">
          Maximum proficiency reached!
        </p>
      )}
    </button>
  );
}
