"use client";

import { useMemo, useState } from "react";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { HEBREW_ROOTS } from "@/data/roots";
import { Word, CardState } from "@/types";
import { cn } from "@/lib/utils";
import AudioButton from "./AudioButton";

/* ── Rarity tiers based on mastery ───────────────────── */

type Rarity = "undiscovered" | "common" | "uncommon" | "rare" | "legendary";

function getRarity(state: CardState | undefined): Rarity {
  if (!state || state.repetitions === 0) return "undiscovered";
  const stability = state.stability ?? state.interval;
  if (stability < 3) return "common";
  if (stability < 10) return "uncommon";
  if (stability < 21) return "rare";
  return "legendary";
}

const RARITY_STYLES: Record<Rarity, { border: string; bg: string; text: string; label: string; glow: string }> = {
  undiscovered: {
    border: "border-border",
    bg: "bg-bg-secondary",
    text: "text-text-muted",
    label: "Undiscovered",
    glow: "",
  },
  common: {
    border: "border-slate-400/30",
    bg: "bg-slate-500/5",
    text: "text-slate-400",
    label: "Common",
    glow: "",
  },
  uncommon: {
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    text: "text-green-400",
    label: "Uncommon",
    glow: "shadow-green-500/10",
  },
  rare: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    label: "Rare",
    glow: "shadow-blue-500/20 shadow-lg",
  },
  legendary: {
    border: "border-yellow-500/40",
    bg: "bg-gradient-to-br from-yellow-500/10 to-amber-500/5",
    text: "text-yellow-400",
    label: "Legendary",
    glow: "shadow-yellow-500/25 shadow-xl",
  },
};

/* ── Card detail ─────────────────────────────────────── */

interface CollectionCard {
  word: Word;
  rarity: Rarity;
  cardState: CardState | undefined;
  rootInfo: {
    root: string;
    meaning: string;
  } | null;
}

type SortBy = "rarity" | "category" | "alphabetical";

export default function WordCollection() {
  const { allWords, categories } = useVocabulary();
  const { cardStates } = useSpacedRepetition(allWords);
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterRarity, setFilterRarity] = useState<Rarity | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("rarity");
  const [showUndiscovered, setShowUndiscovered] = useState(false);

  // Build root lookup
  const rootLookup = useMemo(() => {
    const map = new Map<string, { root: string; meaning: string }>();
    for (const root of HEBREW_ROOTS) {
      for (const rw of root.relatedWords) {
        map.set(rw.hebrew, { root: root.rootDisplay, meaning: root.meaning });
      }
    }
    return map;
  }, []);

  // Build collection cards
  const cards = useMemo((): CollectionCard[] => {
    return allWords.map((word) => {
      const state = cardStates[word.id];
      const rarity = getRarity(state);
      const rootInfo = rootLookup.get(word.hebrew) ?? null;
      return { word, rarity, cardState: state, rootInfo };
    });
  }, [allWords, cardStates, rootLookup]);

  // Stats
  const stats = useMemo(() => {
    const counts: Record<Rarity, number> = {
      undiscovered: 0,
      common: 0,
      uncommon: 0,
      rare: 0,
      legendary: 0,
    };
    for (const card of cards) counts[card.rarity]++;
    return counts;
  }, [cards]);

  const discoveredCount = cards.length - stats.undiscovered;
  const totalCount = cards.length;
  const completionPct = Math.round((discoveredCount / totalCount) * 100);

  // Filter & sort
  const filteredCards = useMemo(() => {
    let result = cards;

    if (!showUndiscovered) {
      result = result.filter((c) => c.rarity !== "undiscovered");
    }
    if (filterCategory !== "all") {
      result = result.filter((c) => c.word.category === filterCategory);
    }
    if (filterRarity !== "all") {
      result = result.filter((c) => c.rarity === filterRarity);
    }

    const rarityOrder: Record<Rarity, number> = {
      legendary: 5,
      rare: 4,
      uncommon: 3,
      common: 2,
      undiscovered: 1,
    };

    switch (sortBy) {
      case "rarity":
        result.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
        break;
      case "category":
        result.sort((a, b) => a.word.category.localeCompare(b.word.category));
        break;
      case "alphabetical":
        result.sort((a, b) => a.word.hebrew.localeCompare(b.word.hebrew));
        break;
    }

    return result;
  }, [cards, filterCategory, filterRarity, sortBy, showUndiscovered]);

  // Category completion
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; discovered: number }>();
    for (const card of cards) {
      const cat = card.word.category;
      const curr = map.get(cat) ?? { total: 0, discovered: 0 };
      curr.total++;
      if (card.rarity !== "undiscovered") curr.discovered++;
      map.set(cat, curr);
    }
    return map;
  }, [cards]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            {"\uD83C\uDFB4"} Word Collection
          </h2>
          <p className="text-sm text-text-muted mt-1">
            {discoveredCount}/{totalCount} discovered ({completionPct}%)
          </p>
        </div>

        {/* Rarity summary */}
        <div className="flex gap-3 text-xs">
          {(["legendary", "rare", "uncommon", "common"] as Rarity[]).map((r) => (
            <span key={r} className={cn("font-medium", RARITY_STYLES[r].text)}>
              {stats[r]} {RARITY_STYLES[r].label}
            </span>
          ))}
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="w-full">
        <div className="h-3 bg-bg-secondary rounded-full overflow-hidden flex">
          <div
            className="h-full bg-yellow-500 transition-all"
            style={{ width: `${(stats.legendary / totalCount) * 100}%` }}
          />
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(stats.rare / totalCount) * 100}%` }}
          />
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(stats.uncommon / totalCount) * 100}%` }}
          />
          <div
            className="h-full bg-slate-400 transition-all"
            style={{ width: `${(stats.common / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => {
            const cs = categoryStats.get(cat);
            return (
              <option key={cat} value={cat}>
                {cat} ({cs?.discovered ?? 0}/{cs?.total ?? 0})
              </option>
            );
          })}
        </select>

        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value as Rarity | "all")}
          className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="all">All Rarities</option>
          <option value="legendary">Legendary</option>
          <option value="rare">Rare</option>
          <option value="uncommon">Uncommon</option>
          <option value="common">Common</option>
          <option value="undiscovered">Undiscovered</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary"
        >
          <option value="rarity">Sort by Rarity</option>
          <option value="category">Sort by Category</option>
          <option value="alphabetical">Sort A-Z</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showUndiscovered}
            onChange={(e) => setShowUndiscovered(e.target.checked)}
            className="rounded border-border"
          />
          Show undiscovered
        </label>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredCards.map((card) => {
          const style = RARITY_STYLES[card.rarity];
          const isUndiscovered = card.rarity === "undiscovered";

          return (
            <button
              key={card.word.id}
              onClick={() => !isUndiscovered && setSelectedCard(card)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                style.border,
                style.bg,
                style.glow,
                isUndiscovered
                  ? "cursor-default"
                  : "hover:scale-105 cursor-pointer"
              )}
            >
              {/* Rarity indicator dot */}
              {card.rarity !== "undiscovered" && (
                <div
                  className={cn(
                    "absolute top-1.5 right-1.5 w-2 h-2 rounded-full",
                    card.rarity === "legendary"
                      ? "bg-yellow-400"
                      : card.rarity === "rare"
                        ? "bg-blue-400"
                        : card.rarity === "uncommon"
                          ? "bg-green-400"
                          : "bg-slate-400"
                  )}
                />
              )}

              {/* Word display */}
              <span
                className={cn(
                  "hebrew-text text-xl font-bold",
                  isUndiscovered ? "text-text-muted blur-[3px]" : "text-text-primary"
                )}
              >
                {isUndiscovered ? card.word.hebrew : card.word.hebrewNikud}
              </span>

              {/* Translation */}
              <span
                className={cn(
                  "text-[10px] truncate w-full text-center",
                  isUndiscovered ? "text-text-muted" : style.text
                )}
              >
                {isUndiscovered ? "???" : card.word.translation}
              </span>
            </button>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No cards match these filters.
        </div>
      )}

      {/* Card detail modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className={cn(
              "border rounded-2xl p-6 max-w-sm w-full mx-4",
              RARITY_STYLES[selectedCard.rarity].border,
              "bg-bg-card shadow-2xl",
              RARITY_STYLES[selectedCard.rarity].glow
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Rarity badge */}
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                  RARITY_STYLES[selectedCard.rarity].text,
                  selectedCard.rarity === "legendary"
                    ? "bg-yellow-500/15"
                    : selectedCard.rarity === "rare"
                      ? "bg-blue-500/15"
                      : selectedCard.rarity === "uncommon"
                        ? "bg-green-500/15"
                        : "bg-slate-500/15"
                )}
              >
                {RARITY_STYLES[selectedCard.rarity].label}
              </span>

              {/* Word */}
              <div className="text-center">
                <div className="hebrew-text text-4xl font-bold text-text-primary">
                  {selectedCard.word.hebrewNikud}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {selectedCard.word.transliteration}
                </div>
                <div className="text-lg text-text-primary mt-1 font-medium">
                  {selectedCard.word.translation}
                </div>
              </div>

              <AudioButton text={selectedCard.word.hebrew} size="md" />

              {/* Root info */}
              {selectedCard.rootInfo && (
                <div className="w-full bg-bg-secondary rounded-xl p-3 text-center">
                  <span className="text-xs text-text-muted uppercase tracking-wider">
                    Root
                  </span>
                  <div className="hebrew-text text-lg font-bold text-accent mt-1">
                    {selectedCard.rootInfo.root}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {selectedCard.rootInfo.meaning}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-2 text-sm">
                <div className="bg-bg-secondary rounded-lg p-2 text-center">
                  <span className="text-text-muted text-xs">Category</span>
                  <div className="text-text-primary text-xs font-medium mt-0.5">
                    {selectedCard.word.category}
                  </div>
                </div>
                <div className="bg-bg-secondary rounded-lg p-2 text-center">
                  <span className="text-text-muted text-xs">Reviews</span>
                  <div className="text-text-primary text-xs font-medium mt-0.5">
                    {selectedCard.cardState?.repetitions ?? 0}
                  </div>
                </div>
                {selectedCard.cardState && (
                  <>
                    <div className="bg-bg-secondary rounded-lg p-2 text-center">
                      <span className="text-text-muted text-xs">Stability</span>
                      <div className="text-text-primary text-xs font-medium mt-0.5">
                        {Math.round(selectedCard.cardState.stability ?? selectedCard.cardState.interval)} days
                      </div>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-2 text-center">
                      <span className="text-text-muted text-xs">Next Review</span>
                      <div className="text-text-primary text-xs font-medium mt-0.5">
                        {selectedCard.cardState.nextReview}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="w-full py-2.5 rounded-xl bg-bg-secondary text-text-secondary hover:text-text-primary font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
