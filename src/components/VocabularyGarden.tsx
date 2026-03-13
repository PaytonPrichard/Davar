"use client";

import { useMemo, useState, useCallback } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { useXP } from "@/hooks/useXP";
import { useStreak } from "@/hooks/useStreak";
import { CardState, Word, AppMode } from "@/types";
import { cn } from "@/lib/utils";
import { trackQuest } from "@/hooks/useQuests";
import AudioButton from "./AudioButton";

/* ── Garden watering streak tracker ─────────────────── */

const GARDEN_WATER_KEY = "davar-garden-water-streak";

interface GardenWaterData {
  lastWaterDate: string;
  streak: number;
}

function recordGardenWater(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem(GARDEN_WATER_KEY);
    const data: GardenWaterData = raw ? JSON.parse(raw) : { lastWaterDate: "", streak: 0 };

    if (data.lastWaterDate === today) return; // Already watered today

    // Check if yesterday was watered (streak continues)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const newStreak = data.lastWaterDate === yesterdayStr ? data.streak + 1 : 1;
    localStorage.setItem(
      GARDEN_WATER_KEY,
      JSON.stringify({ lastWaterDate: today, streak: newStreak })
    );
  } catch {
    // localStorage unavailable
  }
}

/* ── Plant growth stages ─────────────────────────────── */

type PlantStage = "seed" | "sprout" | "sapling" | "tree" | "bloom";

interface GardenPlant {
  word: Word;
  stage: PlantStage;
  isWilting: boolean;
  daysOverdue: number;
  stability: number;
  cardState: CardState | undefined;
}

function getPlantStage(state: CardState | undefined): PlantStage {
  if (!state || state.repetitions === 0) return "seed";
  const stability = state.stability ?? state.interval;
  if (stability < 3) return "sprout";
  if (stability < 10) return "sapling";
  if (stability < 21) return "tree";
  return "bloom";
}

function getDaysOverdue(state: CardState | undefined): number {
  if (!state || !state.nextReview) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(state.nextReview);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

/* ── Plant emoji/visual per stage ────────────────────── */

const PLANT_VISUALS: Record<PlantStage, { emoji: string; label: string; color: string }> = {
  seed: { emoji: "\uD83E\uDEB4", label: "Seed", color: "text-amber-700" },
  sprout: { emoji: "\uD83C\uDF31", label: "Sprout", color: "text-green-500" },
  sapling: { emoji: "\uD83C\uDF3F", label: "Sapling", color: "text-green-400" },
  tree: { emoji: "\uD83C\uDF33", label: "Tree", color: "text-green-600" },
  bloom: { emoji: "\uD83C\uDF38", label: "Bloom", color: "text-pink-400" },
};

/* ── Filter tabs ─────────────────────────────────────── */
type GardenFilter = "all" | "wilting" | "blooming" | "new";

export default function VocabularyGarden({
  navigateTo,
}: {
  navigateTo?: (mode: AppMode) => void;
}) {
  const { allWords } = useVocabulary();
  const { cardStates, dueCards, recordReview } = useSpacedRepetition(allWords);
  const { awardXP } = useXP();
  const { recordStudy } = useStreak();
  const [filter, setFilter] = useState<GardenFilter>("all");
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const [waterAnimation, setWaterAnimation] = useState<string | null>(null);

  // Build garden plants from words that have at least been seen
  const plants = useMemo((): GardenPlant[] => {
    const result: GardenPlant[] = [];
    for (const word of allWords) {
      const state = cardStates[word.id];
      if (!state) continue; // Only show words the user has interacted with
      const stage = getPlantStage(state);
      const daysOverdue = getDaysOverdue(state);
      const isWilting = daysOverdue > 0 && stage !== "seed";

      result.push({
        word,
        stage,
        isWilting,
        daysOverdue,
        stability: state.stability ?? state.interval,
        cardState: state,
      });
    }

    // Sort: wilting first (most overdue), then by stage descending
    result.sort((a, b) => {
      if (a.isWilting && !b.isWilting) return -1;
      if (!a.isWilting && b.isWilting) return 1;
      if (a.isWilting && b.isWilting) return b.daysOverdue - a.daysOverdue;
      const stageOrder: Record<PlantStage, number> = {
        bloom: 5,
        tree: 4,
        sapling: 3,
        sprout: 2,
        seed: 1,
      };
      return stageOrder[b.stage] - stageOrder[a.stage];
    });

    return result;
  }, [allWords, cardStates]);

  const filteredPlants = useMemo(() => {
    switch (filter) {
      case "wilting":
        return plants.filter((p) => p.isWilting);
      case "blooming":
        return plants.filter((p) => p.stage === "bloom" || p.stage === "tree");
      case "new":
        return plants.filter((p) => p.stage === "seed" || p.stage === "sprout");
      default:
        return plants;
    }
  }, [plants, filter]);

  const wiltingCount = useMemo(() => plants.filter((p) => p.isWilting).length, [plants]);
  const bloomCount = useMemo(
    () => plants.filter((p) => p.stage === "bloom").length,
    [plants]
  );

  const handleWater = useCallback(
    (plant: GardenPlant) => {
      if (!plant.isWilting) return;
      // "Watering" = quick review as "Good"
      recordReview(plant.word.id, 3);
      recordStudy();
      awardXP("garden_water");
      trackQuest("water-plants");
      recordGardenWater();
      setWaterAnimation(plant.word.id);
      setTimeout(() => setWaterAnimation(null), 1000);
      setSelectedPlant(null);
    },
    [recordReview, recordStudy, awardXP]
  );

  const filterTabs: { key: GardenFilter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: plants.length },
    { key: "wilting", label: "Needs Water", count: wiltingCount },
    { key: "blooming", label: "Thriving", count: bloomCount },
    { key: "new", label: "Seedlings" },
  ];

  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
        <div className="text-6xl">{"\uD83C\uDF31"}</div>
        <h2 className="text-2xl font-bold text-text-primary">
          Your Garden is Empty
        </h2>
        <p className="text-text-secondary max-w-md">
          Start learning words to plant seeds in your garden. Each word you
          study becomes a plant that grows as you master it!
        </p>
        {navigateTo && (
          <button
            onClick={() => navigateTo("flashcards")}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition-all"
          >
            Start Learning
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            {"\uD83C\uDF3B"} Your Garden
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {plants.length} plants {"\u00B7"} {bloomCount} blooming{" "}
            {wiltingCount > 0 && (
              <span className="text-amber-400">
                {"\u00B7"} {wiltingCount} need water!
              </span>
            )}
          </p>
        </div>

        {wiltingCount > 0 && (
          <button
            onClick={() => navigateTo?.("flashcards")}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 text-sm font-medium transition-colors"
          >
            {"\uD83D\uDCA7"} Review Due ({wiltingCount})
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              filter === tab.key
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-bg-card text-text-muted border border-border hover:text-text-secondary"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Garden grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {filteredPlants.map((plant) => {
          const visual = PLANT_VISUALS[plant.stage];
          const isWatering = waterAnimation === plant.word.id;

          return (
            <button
              key={plant.word.id}
              onClick={() => setSelectedPlant(plant)}
              className={cn(
                "relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all hover:scale-105",
                plant.isWilting
                  ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                  : "border-border bg-bg-card hover:bg-bg-card-hover",
                isWatering && "animate-bounce"
              )}
              title={`${plant.word.hebrewNikud} - ${plant.word.translation}`}
            >
              {/* Wilting indicator */}
              {plant.isWilting && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-[8px]">{"\uD83D\uDCA7"}</span>
                </div>
              )}

              {/* Plant emoji */}
              <span
                className={cn(
                  "text-2xl transition-all",
                  plant.isWilting && "opacity-60 grayscale-[30%]",
                  isWatering && "text-3xl"
                )}
              >
                {isWatering ? "\uD83D\uDCA7" : visual.emoji}
              </span>

              {/* Word label */}
              <span className="hebrew-text text-xs text-text-primary truncate w-full text-center">
                {plant.word.hebrew}
              </span>
            </button>
          );
        })}
      </div>

      {filteredPlants.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No plants match this filter.
        </div>
      )}

      {/* Plant detail modal */}
      {selectedPlant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedPlant(null)}
        >
          <div
            className="bg-bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Plant visual */}
              <div
                className={cn(
                  "text-5xl",
                  selectedPlant.isWilting && "opacity-60"
                )}
              >
                {PLANT_VISUALS[selectedPlant.stage].emoji}
              </div>

              {/* Word info */}
              <div className="text-center">
                <div className="hebrew-text text-3xl font-bold text-text-primary">
                  {selectedPlant.word.hebrewNikud}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {selectedPlant.word.transliteration}
                </div>
                <div className="text-base text-text-primary mt-1">
                  {selectedPlant.word.translation}
                </div>
              </div>

              <AudioButton text={selectedPlant.word.hebrew} size="md" />

              {/* Growth info */}
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Stage</span>
                  <span className={cn("font-medium", PLANT_VISUALS[selectedPlant.stage].color)}>
                    {PLANT_VISUALS[selectedPlant.stage].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Stability</span>
                  <span className="text-text-primary">
                    {Math.round(selectedPlant.stability)} days
                  </span>
                </div>
                {selectedPlant.isWilting && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Overdue</span>
                    <span className="text-amber-400 font-medium">
                      {selectedPlant.daysOverdue} day
                      {selectedPlant.daysOverdue !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Growth progress bar */}
              <div className="w-full">
                <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      selectedPlant.isWilting
                        ? "bg-amber-500"
                        : selectedPlant.stage === "bloom"
                          ? "bg-pink-400"
                          : "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min(100, (selectedPlant.stability / 21) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-text-muted text-center mt-1">
                  {selectedPlant.stage === "bloom"
                    ? "Fully grown!"
                    : `${Math.round(Math.min(100, (selectedPlant.stability / 21) * 100))}% to bloom`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                {selectedPlant.isWilting && (
                  <button
                    onClick={() => handleWater(selectedPlant)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
                  >
                    {"\uD83D\uDCA7"} Water (+15 XP)
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs text-text-muted border-t border-border/50 pt-4">
        {Object.entries(PLANT_VISUALS).map(([stage, visual]) => (
          <span key={stage} className="flex items-center gap-1">
            <span>{visual.emoji}</span> {visual.label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span>{"\uD83D\uDCA7"}</span> Needs water
        </span>
      </div>
    </div>
  );
}
