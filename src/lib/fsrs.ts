import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";
import { CardState, ReviewQuality } from "@/types";

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: true,
  enable_short_term: true,
});

/** Map our 1-5 quality scale to FSRS grades */
function qualityToGrade(quality: ReviewQuality): Grade {
  switch (quality) {
    case 1: return Rating.Again;
    case 2: return Rating.Hard;
    case 3: return Rating.Good;
    case 4:
    case 5: return Rating.Easy;
  }
}

/** Convert our CardState to an FSRS Card */
function toFSRSCard(state: CardState): Card {
  if (state.stability !== undefined && state.difficulty !== undefined) {
    // Already has FSRS data
    return {
      due: new Date(state.nextReview),
      stability: state.stability,
      difficulty: state.difficulty,
      elapsed_days: 0,
      scheduled_days: state.interval,
      learning_steps: 0,
      reps: state.repetitions,
      lapses: state.lapses ?? 0,
      state: state.fsrsState ?? 0,
      last_review: state.lastReview ? new Date(state.lastReview) : undefined,
    };
  }
  // Migrate from SM2 — create an approximation
  if (state.repetitions === 0) {
    return createEmptyCard(new Date(state.nextReview));
  }
  // Existing SM2 card: approximate FSRS fields
  return {
    due: new Date(state.nextReview),
    stability: state.interval * (state.easeFactor / 2.5),
    difficulty: Math.min(10, Math.max(1, (3.5 - state.easeFactor) * 4 + 5)),
    elapsed_days: 0,
    scheduled_days: state.interval,
    learning_steps: 0,
    reps: state.repetitions,
    lapses: 0,
    state: state.repetitions >= 2 ? 2 : 1, // Review or Learning
    last_review: state.lastReview ? new Date(state.lastReview) : undefined,
  };
}

/** Convert FSRS Card back to our CardState */
function fromFSRSCard(wordId: string, card: Card): CardState {
  return {
    wordId,
    easeFactor: Math.max(1.3, 2.5 - (card.difficulty - 5) / 4),
    interval: card.scheduled_days,
    repetitions: card.reps,
    nextReview: card.due.toISOString().split("T")[0],
    lastReview: card.last_review
      ? card.last_review.toISOString().split("T")[0]
      : null,
    stability: card.stability,
    difficulty: card.difficulty,
    lapses: card.lapses,
    fsrsState: card.state,
  };
}

export function createCardState(wordId: string): CardState {
  const card = createEmptyCard();
  return fromFSRSCard(wordId, card);
}

export function calculateReview(
  state: CardState,
  quality: ReviewQuality
): CardState {
  const card = toFSRSCard(state);
  const grade = qualityToGrade(quality);
  const now = new Date();
  const result = scheduler.repeat(card, now);
  const updated = result[grade].card;
  return fromFSRSCard(state.wordId, updated);
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
      newCards.push(wordId);
    } else if (state.nextReview <= today) {
      const daysOverdue = Math.max(
        0,
        (Date.now() - new Date(state.nextReview).getTime()) / 86400000
      );
      due.push({ wordId, priority: daysOverdue });
    }
  }

  due.sort((a, b) => b.priority - a.priority);

  // Cap total reviews to avoid overwhelming after absence
  const MAX_DUE_PER_DAY = 100;
  const cappedDue = due.slice(0, MAX_DUE_PER_DAY);

  // Scale new cards down if overdue load is heavy
  const newCardSlots = Math.max(0, Math.min(newCardsPerDay, MAX_DUE_PER_DAY - cappedDue.length));
  const todayNewCards = newCards.slice(0, newCardSlots);

  return [...cappedDue.map((d) => d.wordId), ...todayNewCards];
}

export function isWordMastered(state: CardState | undefined): boolean {
  if (!state) return false;
  // FSRS: mastered if stability > 21 days and in Review state
  if (state.stability !== undefined) {
    return state.stability > 21 && (state.fsrsState === 2);
  }
  // SM2 fallback
  return state.repetitions >= 3 && state.easeFactor >= 2.0;
}
