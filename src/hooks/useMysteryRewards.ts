"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { getToday } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────── */

export type RewardType = "bonus_xp" | "streak_freeze" | "xp_multiplier" | "nothing";

export interface MysteryReward {
  type: RewardType;
  label: string;
  description: string;
  icon: string;
  value?: number; // XP amount, multiplier, etc.
}

interface RewardHistory {
  date: string;
  reward: RewardType;
}

interface MysteryRewardsState {
  /** How many sessions completed today */
  sessionsToday: number;
  lastSessionDate: string;
  /** Track reward frequency to maintain variable ratio */
  rewardHistory: RewardHistory[];
  /** Active XP multiplier (1.0 = normal) */
  xpMultiplier: number;
  xpMultiplierExpires: string; // ISO date
}

const DEFAULT_STATE: MysteryRewardsState = {
  sessionsToday: 0,
  lastSessionDate: "",
  rewardHistory: [],
  xpMultiplier: 1.0,
  xpMultiplierExpires: "",
};

/* ── Reward definitions ──────────────────────────────── */

const REWARDS: MysteryReward[] = [
  {
    type: "bonus_xp",
    label: "Bonus XP!",
    description: "+25 bonus XP!",
    icon: "\u2728",
    value: 25,
  },
  {
    type: "bonus_xp",
    label: "XP Jackpot!",
    description: "+50 bonus XP!",
    icon: "\uD83C\uDF1F",
    value: 50,
  },
  {
    type: "streak_freeze",
    label: "Streak Freeze!",
    description: "Earned a streak freeze! It will auto-protect your streak if you miss a day.",
    icon: "\u2744\uFE0F",
  },
  {
    type: "xp_multiplier",
    label: "Double XP!",
    description: "2x XP for the rest of today!",
    icon: "\uD83D\uDD25",
    value: 2,
  },
];

/* ── Hook ─────────────────────────────────────────────── */

export function useMysteryRewards() {
  const [state, setState, hydrated] = useLocalStorage<MysteryRewardsState>(
    "davar-mystery-rewards",
    DEFAULT_STATE
  );

  /**
   * Roll for a mystery reward after completing a session.
   * Uses variable ratio reinforcement: ~30% chance on average,
   * but adjusted so rewards feel random and exciting.
   *
   * Returns a reward or null if no reward this time.
   */
  const rollReward = useCallback((): MysteryReward | null => {
    const today = getToday();
    let sessionsToday = state.lastSessionDate === today ? state.sessionsToday : 0;
    sessionsToday++;

    // Variable ratio: base 30% chance, increases slightly for each
    // unrewarded session (up to 60%), creating the "it's coming soon" feel
    const recentHistory = state.rewardHistory.slice(-10);
    const recentRewards = recentHistory.filter((h) => h.reward !== "nothing").length;
    const recentNothing = recentHistory.length - recentRewards;

    // Base probability 0.3, +0.05 for each consecutive miss (max 0.6)
    const probability = Math.min(0.6, 0.3 + recentNothing * 0.05);
    const roll = Math.random();

    let reward: MysteryReward | null = null;

    if (roll < probability) {
      // Pick a random reward (weighted)
      const weights = [40, 15, 25, 20]; // bonus25, bonus50, freeze, 2x
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalWeight;
      let rewardIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          rewardIndex = i;
          break;
        }
      }
      reward = REWARDS[rewardIndex];
    }

    setState((prev) => ({
      ...prev,
      sessionsToday,
      lastSessionDate: today,
      rewardHistory: [
        ...prev.rewardHistory.slice(-19),
        { date: today, reward: reward?.type ?? "nothing" },
      ],
      // Set XP multiplier if that's the reward
      xpMultiplier: reward?.type === "xp_multiplier" ? (reward.value ?? 2) : prev.xpMultiplier,
      xpMultiplierExpires:
        reward?.type === "xp_multiplier" ? today : prev.xpMultiplierExpires,
    }));

    return reward;
  }, [state, setState]);

  /** Check if XP multiplier is active */
  const activeMultiplier = hydrated && state.xpMultiplierExpires === getToday()
    ? state.xpMultiplier
    : 1.0;

  return {
    rollReward,
    activeMultiplier,
    sessionsToday: state.lastSessionDate === getToday() ? state.sessionsToday : 0,
    hydrated,
  };
}
