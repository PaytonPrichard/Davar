"use client";

import { useState, useCallback } from "react";
import { PRAYERS } from "@/data/prayers";
import AudioButton from "./AudioButton";
import ClickableHebrewLine from "./ClickableHebrewLine";
import { cn, stripNikud } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const dailyPrayers = PRAYERS.filter((p) => p.level === "beginner");
const shabbatPrayers = PRAYERS.filter((p) => p.level === "intermediate");
const holidayPrayers = PRAYERS.filter((p) => p.level === "advanced");

export default function PrayerMode() {
  const [selectedPrayerId, setSelectedPrayerId] = useState(PRAYERS[0]?.id);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showNikud, setShowNikud] = useState(true);
  const [completedLines, setCompletedLines] = useLocalStorage<Record<string, number[]>>(
    "davar-completed-prayer-lines",
    {}
  );

  const prayer = PRAYERS.find((p) => p.id === selectedPrayerId);

  const toggleLine = useCallback(
    (prayerId: string, lineIndex: number) => {
      setCompletedLines((prev) => {
        const lines = prev[prayerId] ?? [];
        const next = lines.includes(lineIndex)
          ? lines.filter((l) => l !== lineIndex)
          : [...lines, lineIndex];
        return { ...prev, [prayerId]: next };
      });
    },
    [setCompletedLines]
  );

  const isLineCompleted = (prayerId: string, lineIndex: number) =>
    (completedLines[prayerId] ?? []).includes(lineIndex);

  const isAllCompleted = (prayerId: string, lineCount: number) => {
    const done = (completedLines[prayerId] ?? []).length;
    return done >= lineCount;
  };

  const toggleAllLines = useCallback(
    (prayerId: string, lineCount: number) => {
      setCompletedLines((prev) => {
        const lines = prev[prayerId] ?? [];
        if (lines.length >= lineCount) {
          return { ...prev, [prayerId]: [] };
        }
        return { ...prev, [prayerId]: Array.from({ length: lineCount }, (_, i) => i) };
      });
    },
    [setCompletedLines]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Prayer selector grouped by category */}
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-green mb-2">
            Daily
          </h3>
          <div className="flex flex-wrap gap-2">
            {dailyPrayers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrayerId(p.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors border relative",
                  p.id === selectedPrayerId
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
                )}
              >
                {isAllCompleted(p.id, p.lines.length) && (
                  <span className="absolute -top-1.5 -right-1.5 text-accent-green text-xs bg-bg-primary rounded-full w-5 h-5 flex items-center justify-center border border-accent-green/30">
                    &#10003;
                  </span>
                )}
                {p.title}
                <span className="block text-xs text-accent-green">
                  {(completedLines[p.id] ?? []).length}/{p.lines.length} lines
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-yellow mb-2">
            Shabbat
          </h3>
          <div className="flex flex-wrap gap-2">
            {shabbatPrayers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrayerId(p.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors border relative",
                  p.id === selectedPrayerId
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
                )}
              >
                {isAllCompleted(p.id, p.lines.length) && (
                  <span className="absolute -top-1.5 -right-1.5 text-accent-green text-xs bg-bg-primary rounded-full w-5 h-5 flex items-center justify-center border border-accent-green/30">
                    &#10003;
                  </span>
                )}
                {p.title}
                <span className="block text-xs text-accent-green">
                  {(completedLines[p.id] ?? []).length}/{p.lines.length} lines
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            Holiday
          </h3>
          <div className="flex flex-wrap gap-2">
            {holidayPrayers.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPrayerId(p.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-colors border relative",
                  p.id === selectedPrayerId
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-card text-text-secondary border-border hover:border-accent/50"
                )}
              >
                {isAllCompleted(p.id, p.lines.length) && (
                  <span className="absolute -top-1.5 -right-1.5 text-accent-green text-xs bg-bg-primary rounded-full w-5 h-5 flex items-center justify-center border border-accent-green/30">
                    &#10003;
                  </span>
                )}
                {p.title}
                <span className="block text-xs text-accent-green">
                  {(completedLines[p.id] ?? []).length}/{p.lines.length} lines
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Display toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showNikud}
            onChange={(e) => setShowNikud(e.target.checked)}
            className="accent-accent"
          />
          Nikud (vowels)
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showTransliteration}
            onChange={(e) => setShowTransliteration(e.target.checked)}
            className="accent-accent"
          />
          Transliteration
        </label>
      </div>

      {/* Side-by-side prayer display */}
      {prayer && (
        <div className="bg-bg-card rounded-2xl border border-border p-6">
          <h2 className="hebrew-text text-2xl font-bold text-text-primary mb-1 text-center">
            {prayer.titleHebrew}
          </h2>
          <h3 className="text-sm text-text-muted text-center mb-4">
            {prayer.title}
          </h3>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => toggleAllLines(prayer.id, prayer.lines.length)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                isAllCompleted(prayer.id, prayer.lines.length)
                  ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                  : "border-border bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-card-hover"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs",
                isAllCompleted(prayer.id, prayer.lines.length)
                  ? "border-accent-green bg-accent-green/20 text-accent-green"
                  : "border-border text-transparent"
              )}>
                &#10003;
              </span>
              {isAllCompleted(prayer.id, prayer.lines.length) ? "Completed" : "Mark All Complete"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {prayer.lines.map((line, i) => (
              <div
                key={i}
                className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1 p-4 rounded-xl hover:bg-bg-card-hover transition-colors items-start"
              >
                {/* Checkmark — first column */}
                <button
                  onClick={() => toggleLine(prayer.id, i)}
                  className={cn(
                    "mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors text-xs row-span-2 sm:row-span-1",
                    isLineCompleted(prayer.id, i)
                      ? "border-accent-green bg-accent-green/20 text-accent-green"
                      : "border-border text-transparent hover:border-text-muted"
                  )}
                  title={isLineCompleted(prayer.id, i) ? "Mark as unread" : "Mark as done"}
                >
                  &#10003;
                </button>

                {/* English — appears second on mobile */}
                <div className="text-text-secondary text-sm sm:text-base leading-relaxed flex items-center order-2 sm:order-1">
                  {line.translation}
                </div>

                {/* Hebrew — appears first on mobile */}
                <div className="flex items-start gap-3 justify-end order-1 sm:order-2">
                  <div className="flex flex-col gap-1 items-end flex-1">
                    <ClickableHebrewLine
                      hebrew={showNikud ? line.hebrew : stripNikud(line.hebrew)}
                      className={cn(
                        "text-xl sm:text-2xl leading-relaxed text-right",
                        isLineCompleted(prayer.id, i) ? "text-text-muted" : "text-text-primary"
                      )}
                    />
                    {showTransliteration && (
                      <div className="text-sm text-accent italic text-right">
                        {line.transliteration}
                      </div>
                    )}
                  </div>
                  <AudioButton
                    text={line.hebrew}
                    size="sm"
                    className="mt-1 shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
