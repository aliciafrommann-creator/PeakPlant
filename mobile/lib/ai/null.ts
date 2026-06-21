/**
 * Null AI — used in the MVP (no network calls, no provider keys).
 *
 * Returns deterministic, goal-aware fallbacks so screens that consume
 * IAIPersonalization already work end-to-end before the real AI is wired.
 */

import type { MomentCard } from '../types';
import type { IAIPersonalization } from './interface';
import type { AIContext, CardSuggestion, ReflectionPrompt } from './types';

const GOAL_CARD_AFFINITY: Record<string, string[]> = {
  'deeper conversations': ['card-01', 'card-03', 'card-05', 'card-17'],
  'shared adventures': ['card-02', 'card-12', 'card-15'],
  'more presence': ['card-13', 'card-16', 'card-20'],
  'understanding each other': ['card-04', 'card-07', 'card-09', 'card-10'],
  'playful moments': ['card-11', 'card-18', 'card-19'],
  'quiet closeness': ['card-06', 'card-08', 'card-16'],
};

function pickCard(context: AIContext, candidates: MomentCard[]): MomentCard {
  const sealed = candidates.filter((c) => c.status === 'sealed');
  const pool = sealed.length > 0 ? sealed : candidates;

  // Prefer cards that match a selected goal (deterministic — no inference).
  for (const goal of context.goals) {
    const affinityIds = GOAL_CARD_AFFINITY[goal] ?? [];
    const match = pool.find((c) => affinityIds.includes(c.id));
    if (match) return match;
  }

  // Fallback: lowest-number unsealed card.
  return pool.reduce((a, b) => (a.number < b.number ? a : b));
}

export const nullAI: IAIPersonalization = {
  async suggestCard(context: AIContext, candidates: MomentCard[]): Promise<CardSuggestion> {
    const pick = pickCard(context, candidates);
    const usedGoals = context.goals.filter((g) =>
      (GOAL_CARD_AFFINITY[g] ?? []).includes(pick.id),
    );

    return {
      cardId: pick.id,
      rationale: usedGoals.length > 0
        ? `fits your goal: ${usedGoals[0]}`
        : "a moment you haven't explored yet",
      signalsUsed: usedGoals.length > 0 ? ['chosen goals'] : [],
      signalsNotUsed: ['diary notes', 'time of day', 'location'],
    };
  },

  async reflectionPrompt(_note: string, _card: MomentCard): Promise<ReflectionPrompt> {
    // No reflection prompts in the MVP — return empty so the UI hides the widget.
    return { text: '' };
  },
};
