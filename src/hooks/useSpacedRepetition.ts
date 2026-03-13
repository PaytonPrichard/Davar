"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { CardState, ReviewQuality, Word } from "@/types";
import { calculateReview, createCardState, getDueCards, isWordMastered } from "@/lib/fsrs";
import { SK_CARD_STATES, SK_TOTAL_REVIEWS } from "@/lib/storage-keys";

export function useSpacedRepetition(words: Word[]) {
  const [cardStates, setCardStates, hydrated] = useLocalStorage<
    Record<string, CardState>
  >(SK_CARD_STATES, {});

  const [totalReviews, setTotalReviews] = useLocalStorage<number>(
    SK_TOTAL_REVIEWS,
    0
  );

  const wordIds = useMemo(() => words.map((w) => w.id), [words]);

  const dueCards = useMemo(() => {
    if (!hydrated) return [];
    return getDueCards(cardStates, wordIds);
  }, [cardStates, wordIds, hydrated]);

  const recordReview = useCallback(
    (wordId: string, quality: ReviewQuality) => {
      setCardStates((prev) => {
        const current = prev[wordId] || createCardState(wordId);
        const updated = calculateReview(current, quality);
        return { ...prev, [wordId]: updated };
      });
      setTotalReviews((prev) => prev + 1);
    },
    [setCardStates, setTotalReviews]
  );

  const masteredCount = useMemo(() => {
    return Object.values(cardStates).filter(isWordMastered).length;
  }, [cardStates]);

  const bulkMarkKnown = useCallback(
    (wordIds: string[]) => {
      const today = new Date().toISOString().split("T")[0];
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);
      const nextReview = nextDate.toISOString().split("T")[0];

      setCardStates((prev) => {
        const next = { ...prev };
        for (const wordId of wordIds) {
          next[wordId] = {
            wordId,
            repetitions: 5,
            easeFactor: 2.5,
            interval: 30,
            nextReview,
            lastReview: today,
            stability: 30,
            difficulty: 5,
            lapses: 0,
            fsrsState: 2, // Review
          };
        }
        return next;
      });
    },
    [setCardStates]
  );

  const getCardState = useCallback(
    (wordId: string): CardState | undefined => {
      return cardStates[wordId];
    },
    [cardStates]
  );

  return {
    dueCards,
    recordReview,
    masteredCount,
    totalReviews,
    getCardState,
    cardStates,
    bulkMarkKnown,
    hydrated,
  };
}
