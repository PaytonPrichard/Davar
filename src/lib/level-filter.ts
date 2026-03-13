import { SK_LEVEL_FILTER, SK_PLACEMENT } from "./storage-keys";

export type LevelFilter = "all" | "A1" | "A2" | "B1";

export const LEVEL_PILLS: { value: LevelFilter; label: string; activeClass: string }[] = [
  { value: "all", label: "All", activeClass: "bg-accent/10 text-accent border-accent/30" },
  { value: "A1", label: "Basics", activeClass: "bg-accent-green/10 text-accent-green border-accent-green/30" },
  { value: "A2", label: "Growing", activeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "B1", label: "Challenging", activeClass: "bg-accent-blue/10 text-accent-blue border-accent-blue/30" },
];

/**
 * Determine initial level filter from localStorage.
 * Checks for an explicit override first, then falls back to placement result.
 * If `consumeOverride` is true (default), the explicit override key is removed after reading.
 */
export function getInitialLevelFilter(consumeOverride = true): LevelFilter {
  if (typeof window === "undefined") return "all";
  // Check if dashboard set a specific level filter
  const stored = localStorage.getItem(SK_LEVEL_FILTER);
  if (stored) {
    if (consumeOverride) localStorage.removeItem(SK_LEVEL_FILTER);
    if (stored === "A1" || stored === "A2" || stored === "B1") return stored;
  }
  // Auto-suggest from placement test
  try {
    const raw = localStorage.getItem(SK_PLACEMENT);
    if (raw) {
      const placement = JSON.parse(raw);
      if (placement.level === "complete-beginner" || placement.level === "beginner") return "A1";
      if (placement.level === "intermediate") return "A2";
    }
  } catch { /* ignore */ }
  return "all";
}
