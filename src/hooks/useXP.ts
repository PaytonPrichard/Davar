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

export function useXP() {
  const [xpState, setXPState, hydrated] = useLocalStorage<XPState>(
    "davar-xp",
    DEFAULT_XP_STATE
  );

  const awardXP = useCallback(
    (action: XPAction) => {
      const amount = XP_VALUES[action];
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

  return {
    totalXP: xpState.totalXP,
    level: xpState.level,
    todayXP,
    xpProgress,
    awardXP,
    hydrated,
  };
}
