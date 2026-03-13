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

const DEFAULT_XP_STATE: XPState = {
  totalXP: 0,
  level: 1,
  dailyXP: {},
};

/* ── XP Multiplier helper ──────────────────────────────────── */

/**
 * Returns the active XP multiplier.
 * Sources (checked in order, first match wins):
 *  1. Saturday "Double XP" event (getDay() === 6)
 *  2. Mystery-reward XP buff stored in localStorage
 *     (key: "davar-xp-buff", shape: { multiplier: number, expiresAt: ISO_string })
 *  3. Mystery-reward state multiplier stored by useMysteryRewards
 *     (key: "davar-mystery-rewards", xpMultiplier / xpMultiplierExpires)
 */
export function getXPMultiplier(): number {
  // Check Double XP Saturday
  if (new Date().getDay() === 6) return 2;

  // Check mystery reward buff (standalone key)
  try {
    const buff = JSON.parse(localStorage.getItem("davar-xp-buff") || "null");
    if (buff && new Date(buff.expiresAt) > new Date()) return buff.multiplier;
  } catch {
    /* ignore malformed data */
  }

  // Check mystery-rewards state multiplier
  try {
    const mrState = JSON.parse(
      localStorage.getItem("davar-mystery-rewards") || "null"
    );
    if (mrState && mrState.xpMultiplierExpires === getToday() && mrState.xpMultiplier > 1) {
      return mrState.xpMultiplier;
    }
  } catch {
    /* ignore malformed data */
  }

  return 1;
}

/**
 * Describes *why* the multiplier is active so the UI can pick the right copy.
 */
export type XPMultiplierSource = "saturday" | "mystery-buff" | "mystery-reward" | null;

export function getXPMultiplierSource(): XPMultiplierSource {
  if (new Date().getDay() === 6) return "saturday";
  try {
    const buff = JSON.parse(localStorage.getItem("davar-xp-buff") || "null");
    if (buff && new Date(buff.expiresAt) > new Date()) return "mystery-buff";
  } catch {}
  try {
    const mrState = JSON.parse(
      localStorage.getItem("davar-mystery-rewards") || "null"
    );
    if (mrState && mrState.xpMultiplierExpires === getToday() && mrState.xpMultiplier > 1) {
      return "mystery-reward";
    }
  } catch {}
  return null;
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useXP() {
  const [xpState, setXPState, hydrated] = useLocalStorage<XPState>(
    "davar-xp",
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

  /** Current active XP multiplier (reactive-ish: recalculated on each render) */
  const activeXPMultiplier = getXPMultiplier();
  const xpMultiplierSource = getXPMultiplierSource();

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
