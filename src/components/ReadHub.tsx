"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppMode } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SK_COMPLETED_LINES, SK_COMPLETED_PRAYER_LINES, SK_STORY_PROGRESS } from "@/lib/storage-keys";
import { PASSAGES } from "@/data/passages";
import { PRAYERS } from "@/data/prayers";
import { STORIES } from "@/data/stories";

/* ── Types ──────────────────────────────────────────────────── */

interface ReadHubProps {
  onNavigate: (mode: AppMode) => void;
}

interface ReadCard {
  mode: AppMode;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/* ── Component ──────────────────────────────────────────────── */

export default function ReadHub({ onNavigate }: ReadHubProps) {
  // Passage progress — localStorage key: davar-completed-lines
  const [completedLines] = useLocalStorage<Record<string, number[]>>(
    SK_COMPLETED_LINES,
    {}
  );

  // Prayer progress — localStorage key: davar-completed-prayer-lines
  const [completedPrayerLines] = useLocalStorage<Record<string, number[]>>(
    SK_COMPLETED_PRAYER_LINES,
    {}
  );

  // Story progress — localStorage key: davar-story-progress
  const [storyProgress] = useLocalStorage<{
    completedChapters: string[];
  }>(SK_STORY_PROGRESS, { completedChapters: [] });

  // Count fully completed passages
  const passagesCompleted = useMemo(() => {
    let count = 0;
    for (const passage of PASSAGES) {
      const done = (completedLines[passage.id] ?? []).length;
      if (done >= passage.lines.length) count++;
    }
    return count;
  }, [completedLines]);

  // Count fully completed prayers
  const prayersCompleted = useMemo(() => {
    let count = 0;
    for (const prayer of PRAYERS) {
      const done = (completedPrayerLines[prayer.id] ?? []).length;
      if (done >= prayer.lines.length) count++;
    }
    return count;
  }, [completedPrayerLines]);

  // Story stats
  const totalChapters = useMemo(
    () => STORIES.reduce((sum, s) => sum + s.chapters.length, 0),
    []
  );
  const chaptersCompleted = storyProgress.completedChapters.length;

  // Total lines read across passages and prayers
  const totalLinesRead = useMemo(() => {
    let lines = 0;
    for (const arr of Object.values(completedLines)) {
      lines += arr.length;
    }
    for (const arr of Object.values(completedPrayerLines)) {
      lines += arr.length;
    }
    return lines;
  }, [completedLines, completedPrayerLines]);

  const cards: ReadCard[] = useMemo(
    () => [
      {
        mode: "reading" as AppMode,
        label: "Passages",
        subtitle:
          passagesCompleted > 0
            ? `${passagesCompleted}/${PASSAGES.length} completed`
            : `${PASSAGES.length} passages to explore`,
        icon: "\uD83D\uDCC4",
        color: "text-accent",
        bgColor: "bg-accent/8",
        borderColor: "border-accent/20",
      },
      {
        mode: "story" as AppMode,
        label: "Stories",
        subtitle:
          chaptersCompleted > 0
            ? `${chaptersCompleted}/${totalChapters} chapters completed`
            : `${totalChapters} chapters across ${STORIES.length} series`,
        icon: "\uD83D\uDCD6",
        color: "text-accent-blue",
        bgColor: "bg-accent-blue/8",
        borderColor: "border-accent-blue/20",
      },
      {
        mode: "prayers" as AppMode,
        label: "Prayers",
        subtitle:
          prayersCompleted > 0
            ? `${prayersCompleted}/${PRAYERS.length} prayers learned`
            : `${PRAYERS.length} prayers to study`,
        icon: "\uD83D\uDD6F\uFE0F",
        color: "text-accent-yellow",
        bgColor: "bg-accent-yellow/8",
        borderColor: "border-accent-yellow/20",
      },
    ],
    [passagesCompleted, chaptersCompleted, totalChapters, prayersCompleted]
  );

  return (
    <div className="space-y-6">
      {/* Section title */}
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
        Read
      </h2>

      {/* Card grid — 3 cards in a row on larger screens, 2+1 on small */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <button
            key={card.mode}
            onClick={() => onNavigate(card.mode)}
            className={cn(
              "relative rounded-2xl border p-4 text-left transition-all",
              "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              card.borderColor,
              card.bgColor
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

      {/* Reading Stats mini section */}
      {totalLinesRead > 0 && (
        <div className="rounded-2xl border border-border bg-bg-card p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Reading Stats
          </h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-lg font-bold text-text-primary">
                {totalLinesRead}
              </span>
              <span className="block text-[10px] text-text-muted">
                lines read
              </span>
            </div>

            <div className="w-px h-8 bg-border" />

            <div className="text-center">
              <span className="text-lg font-bold text-accent">
                {passagesCompleted}
              </span>
              <span className="block text-[10px] text-text-muted">
                passages done
              </span>
            </div>

            <div className="w-px h-8 bg-border" />

            <div className="text-center">
              <span className="text-lg font-bold text-accent-blue">
                {chaptersCompleted}
              </span>
              <span className="block text-[10px] text-text-muted">
                story chapters
              </span>
            </div>

            <div className="w-px h-8 bg-border" />

            <div className="text-center">
              <span className="text-lg font-bold text-accent-yellow">
                {prayersCompleted}
              </span>
              <span className="block text-[10px] text-text-muted">
                prayers learned
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
