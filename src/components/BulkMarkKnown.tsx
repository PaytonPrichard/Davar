"use client";

import { useState, useMemo } from "react";
import { Word, CardState } from "@/types";
import { isWordMastered } from "@/lib/sm2";

interface BulkMarkKnownProps {
  allWords: Word[];
  categories: string[];
  cardStates: Record<string, CardState>;
  bulkMarkKnown: (wordIds: string[]) => void;
  onClose: () => void;
}

export default function BulkMarkKnown({
  allWords,
  categories,
  cardStates,
  bulkMarkKnown,
  onClose,
}: BulkMarkKnownProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("all");

  const filteredWords = useMemo(() => {
    if (category === "all") return allWords;
    return allWords.filter((w) => w.category === category);
  }, [allWords, category]);

  const masteredIds = useMemo(() => {
    const set = new Set<string>();
    for (const w of filteredWords) {
      if (isWordMastered(cardStates[w.id])) {
        set.add(w.id);
      }
    }
    return set;
  }, [filteredWords, cardStates]);

  const nonMasteredFiltered = useMemo(
    () => filteredWords.filter((w) => !masteredIds.has(w.id)),
    [filteredWords, masteredIds]
  );

  const allNonMasteredSelected = useMemo(
    () =>
      nonMasteredFiltered.length > 0 &&
      nonMasteredFiltered.every((w) => selectedIds.has(w.id)),
    [nonMasteredFiltered, selectedIds]
  );

  const selectedCount = useMemo(
    () => filteredWords.filter((w) => selectedIds.has(w.id)).length,
    [filteredWords, selectedIds]
  );

  const toggleWord = (wordId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allNonMasteredSelected) {
        for (const w of nonMasteredFiltered) {
          next.delete(w.id);
        }
      } else {
        for (const w of nonMasteredFiltered) {
          next.add(w.id);
        }
      }
      return next;
    });
  };

  const handleMarkKnown = () => {
    const ids = Array.from(selectedIds).filter((id) => !masteredIds.has(id));
    if (ids.length === 0) return;
    bulkMarkKnown(ids);
    setSelectedIds(new Set());
  };

  // Count of selected non-mastered words (the ones that will actually be marked)
  const actionableCount = Array.from(selectedIds).filter(
    (id) => !masteredIds.has(id)
  ).length;

  return (
    <div className="w-full rounded-2xl border border-border bg-bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Mark Words as Known
        </h3>
        <button
          onClick={onClose}
          className="text-sm font-medium px-4 py-1.5 rounded-lg border border-border bg-bg-secondary text-text-primary hover:bg-bg-card-hover transition-colors"
        >
          Done
        </button>
      </div>

      {/* Category filter + Select All */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-accent"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={toggleSelectAll}
          className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
        >
          {allNonMasteredSelected ? "Deselect All" : "Select All"}
        </button>

        <span className="text-sm text-text-muted ml-auto">
          {selectedCount} of {filteredWords.length} selected
        </span>
      </div>

      {/* Scrollable word list */}
      <div className="max-h-[400px] overflow-y-auto border border-border rounded-xl divide-y divide-border">
        {filteredWords.map((word) => {
          const mastered = masteredIds.has(word.id);
          const checked = mastered || selectedIds.has(word.id);

          return (
            <label
              key={word.id}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                mastered
                  ? "opacity-50 cursor-default"
                  : "hover:bg-bg-card-hover"
              }`}
            >
              {mastered ? (
                <span className="text-accent-green text-lg shrink-0">
                  &#10003;
                </span>
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleWord(word.id)}
                  className="w-4 h-4 shrink-0 accent-accent rounded"
                />
              )}
              <span className="hebrew-text text-lg text-text-primary min-w-[80px]">
                {word.hebrewNikud}
              </span>
              <span className="text-sm text-accent">{word.transliteration}</span>
              <span className="text-sm text-text-secondary ml-auto">
                {word.translation}
              </span>
            </label>
          );
        })}

        {filteredWords.length === 0 && (
          <div className="px-4 py-8 text-center text-text-muted text-sm">
            No words in this category.
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleMarkKnown}
          disabled={actionableCount === 0}
          className="px-6 py-2 rounded-xl bg-accent-green hover:bg-accent-green/80 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {actionableCount > 0
            ? `Mark ${actionableCount} Word${actionableCount !== 1 ? "s" : ""} as Known`
            : "Mark as Known"}
        </button>
      </div>
    </div>
  );
}
