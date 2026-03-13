"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getToday, getYesterday, daysBetween } from "@/lib/utils";
import { SK_STREAK } from "@/lib/storage-keys";

interface StreakData {
  current: number;
  lastStudyDate: string;
  longest: number;
  /** Number of streak freezes available */
  freezesAvailable: number;
  /** Dates where a freeze was used */
  freezesUsed: string[];
  /** Total freezes ever earned */
  totalFreezesEarned: number;
}

const DEFAULT_STREAK: StreakData = {
  current: 0,
  lastStudyDate: "",
  longest: 0,
  freezesAvailable: 1, // Start with one free freeze
  freezesUsed: [],
  totalFreezesEarned: 1,
};

function getDayBefore(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useStreak() {
  const [streak, setStreak, hydrated] = useLocalStorage<StreakData>(
    SK_STREAK,
    DEFAULT_STREAK
  );

  const recordStudy = useCallback(() => {
    const today = getToday();
    setStreak((prev) => {
      // Backward compat: ensure new fields exist
      const longest = prev.longest ?? prev.current;
      const freezesAvailable = prev.freezesAvailable ?? 0;
      const freezesUsed = prev.freezesUsed ?? [];
      const totalFreezesEarned = prev.totalFreezesEarned ?? 0;

      if (prev.lastStudyDate === today) {
        // Already studied today
        return { ...prev, longest, freezesAvailable, freezesUsed, totalFreezesEarned };
      }

      if (prev.lastStudyDate === getYesterday()) {
        // Studied yesterday — increment streak
        const newCurrent = prev.current + 1;
        return {
          current: newCurrent,
          lastStudyDate: today,
          longest: Math.max(longest, newCurrent),
          freezesAvailable,
          freezesUsed,
          totalFreezesEarned,
        };
      }

      // Missed a day — check if we can use a streak freeze
      const missedDays = prev.lastStudyDate
        ? daysBetween(prev.lastStudyDate, today) - 1
        : 0;

      if (missedDays === 1 && freezesAvailable > 0) {
        // Auto-apply one freeze for the missed day
        const freezeDate = getYesterday();
        const newCurrent = prev.current + 1; // Continue streak
        return {
          current: newCurrent,
          lastStudyDate: today,
          longest: Math.max(longest, newCurrent),
          freezesAvailable: freezesAvailable - 1,
          freezesUsed: [...freezesUsed.slice(-29), freezeDate], // Keep last 30
          totalFreezesEarned,
        };
      }

      // Streak broken — start fresh
      return {
        current: 1,
        lastStudyDate: today,
        longest: Math.max(longest, prev.current),
        freezesAvailable,
        freezesUsed,
        totalFreezesEarned,
      };
    });
  }, [setStreak]);

  /** Award a streak freeze (from achievements, mystery rewards, etc.) */
  const awardFreeze = useCallback(() => {
    setStreak((prev) => ({
      ...prev,
      freezesAvailable: (prev.freezesAvailable ?? 0) + 1,
      totalFreezesEarned: (prev.totalFreezesEarned ?? 0) + 1,
    }));
  }, [setStreak]);

  return { streak, recordStudy, awardFreeze, hydrated };
}
