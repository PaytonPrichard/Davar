import { CardState, ReviewQuality } from "@/types";

export function createCardState(wordId: string): CardState {
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString().split("T")[0],
    lastReview: null,
  };
}

export function calculateSM2(
  state: CardState,
  quality: ReviewQuality
): CardState {
  const today = new Date().toISOString().split("T")[0];

  let { easeFactor, interval, repetitions } = state;

  if (quality < 3) {
    // Failed review — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Successful review
    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    // Update ease factor
    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, Math.min(3.0, easeFactor));
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    wordId: state.wordId,
    easeFactor,
    interval,
    repetitions,
    nextReview: nextDate.toISOString().split("T")[0],
    lastReview: today,
  };
}

export function getDueCards(
  allStates: Record<string, CardState>,
  wordIds: string[],
  newCardsPerDay: number = 20
): string[] {
  const today = new Date().toISOString().split("T")[0];

  const due: { wordId: string; priority: number }[] = [];
  const newCards: string[] = [];

  for (const wordId of wordIds) {
    const state = allStates[wordId];
    if (!state) {
      // New card — never reviewed
      newCards.push(wordId);
    } else if (state.nextReview <= today) {
      // Due or overdue — calculate days overdue for priority sorting
      const daysOverdue = Math.max(
        0,
        (Date.now() - new Date(state.nextReview).getTime()) / 86400000
      );
      due.push({ wordId, priority: daysOverdue });
    }
  }

  // Sort overdue cards: most overdue first
  due.sort((a, b) => b.priority - a.priority);

  // Cap new cards per day
  const todayNewCards = newCards.slice(0, newCardsPerDay);

  // Overdue cards first, then new cards
  return [...due.map((d) => d.wordId), ...todayNewCards];
}

export function isWordMastered(state: CardState | undefined): boolean {
  if (!state) return false;
  return state.repetitions >= 3 && state.easeFactor >= 2.0;
}
