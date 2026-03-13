"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getToday } from "@/lib/utils";
import {
  XPAction,
  XPState,
  XP_VALUES,
  getLevelFromXP,
  xpProgressInLevel,
} from "@/types";
import { SK_XP_BUFF, SK_MYSTERY_REWARDS, SK_XP } from "@/lib/storage-keys";

const DEFAULT_XP_STATE: XPState = {
  totalXP: 0,
  level: 1,
  dailyXP: {},
};

/* ── XP Multiplier helper ──────────────────────────────────── */

/**
 * Describes *why* the multiplier is active so the UI can pick the right copy.
 */
export type XPMultiplierSource = "saturday" | "mystery-buff" | "mystery-reward" | null;

/**
 * Returns the active XP multiplier AND its source in a single pass,
 * avoiding duplicate localStorage reads.
 */
function resolveXPMultiplier(): { multiplier: number; source: XPMultiplierSource } {
  if (new Date().getDay() === 6) return { multiplier: 2, source: "saturday" };

  try {
    const buff = JSON.parse(localStorage.getItem(SK_XP_BUFF) || "null");
    if (buff && new Date(buff.expiresAt) > new Date()) {
      return { multiplier: buff.multiplier, source: "mystery-buff" };
    }
  } catch { /* ignore malformed data */ }

  try {
    const mrState = JSON.parse(localStorage.getItem(SK_MYSTERY_REWARDS) || "null");
    if (mrState && mrState.xpMultiplierExpires === getToday() && mrState.xpMultiplier > 1) {
      return { multiplier: mrState.xpMultiplier, source: "mystery-reward" };
    }
  } catch { /* ignore malformed data */ }

  return { multiplier: 1, source: null };
}

/** Standalone getter for use outside React (e.g. in awardXP callback). */
export function getXPMultiplier(): number {
  return resolveXPMultiplier().multiplier;
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useXP() {
  const [xpState, setXPState, hydrated] = useLocalStorage<XPState>(
    SK_XP,
    DEFAULT_XP_STATE
  );

  const awardXP = useCallback(
    (action: XPAction) => {
      const baseAmount = XP_VALUES[action];
      const multiplier = getXPMultiplier();
      const amount = baseAmount * multiplier;
      const today = getToday();

      setXPState((prev) => {
        const newTotal = prev.totalXP + amount;

        // Prune dailyXP older than 90 days to prevent unbounded growth
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
        const prunedDailyXP: Record<string, number> = {};
        for (const [date, xp] of Object.entries(prev.dailyXP)) {
          if (date >= cutoffStr) prunedDailyXP[date] = xp;
        }

        return {
          totalXP: newTotal,
          level: getLevelFromXP(newTotal),
          dailyXP: {
            ...prunedDailyXP,
            [today]: (prunedDailyXP[today] ?? 0) + amount,
          },
        };
      });
    },
    [setXPState]
  );

  const todayXP = useMemo(() => {
    const today = getToday();
    return xpState.dailyXP[today] ?? 0;
  }, [xpState.dailyXP]);

  const xpProgress = useMemo(
    () => xpProgressInLevel(xpState.totalXP),
    [xpState.totalXP]
  );

  // Memoize multiplier — recalculates when XP state changes (good proxy for user activity)
  const { multiplier: activeXPMultiplier, source: xpMultiplierSource } = useMemo(
    () => resolveXPMultiplier(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xpState.totalXP]
  );

  return {
    totalXP: xpState.totalXP,
    level: xpState.level,
    todayXP,
    xpProgress,
    awardXP,
    hydrated,
    activeXPMultiplier,
    xpMultiplierSource,
  };
}
