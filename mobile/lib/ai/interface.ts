import type { MomentCard } from '../types';
import type { TogetherMoment } from '../together';
import type { DateConstraints, DateRecommendation } from '../discovery/types';
import type { AIContext, CardSuggestion, ReflectionPrompt, MomentSuggestion } from './types';

/**
 * AI personalization contract.
 *
 * All implementations must satisfy AI_SAFETY requirements:
 * - Server-side only (client holds no provider keys)
 * - Approved-signal context only (see AIContext)
 * - Deterministic fallback when confidence is low or model unavailable
 * - AI has no authority to take real-world actions; it returns suggestions only
 */
export interface IAIPersonalization {
  /**
   * Suggest a next card to explore from the list of candidates.
   * Must return a CardSuggestion with factual rationale and signal lists (explainability).
   */
  suggestCard(
    context: AIContext,
    candidates: MomentCard[],
  ): Promise<CardSuggestion>;

  /**
   * Return a single gentle reflection prompt while the user writes a memory note.
   * Returns { text: '' } when no prompt is warranted (model unavailable, sensitive text
   * detected, or user has personalization off).
   *
   * Raw note text is ephemeral — never stored as a profile signal (AI_SAFETY).
   */
  reflectionPrompt(note: string, card: MomentCard): Promise<ReflectionPrompt>;

  /**
   * Suggest one "moment to do together" from candidates, with a factual
   * rationale and signal lists (explainability). Used when the `missions`
   * feature is enabled.
   */
  suggestMoment(
    context: AIContext,
    candidates: TogetherMoment[],
  ): Promise<MomentSuggestion>;
}

/**
 * Date Discovery contract (PROPOSAL, Phase 2). Kept separate from
 * IAIPersonalization because discovery has its own lifecycle: today it's the
 * deterministic curated recommender (`nullDiscovery`); later the same interface
 * is satisfied by a server-side Claude Edge Function (`anthropicDiscovery`)
 * that personalizes and verifies freshness — the client never changes.
 *
 * Hard rules (AI_SAFETY): suggestions only (never books/acts), no fabricated
 * venues/facts (every fact carries provenance), raw constraints are ephemeral,
 * explainable via signalsUsed/signalsNotUsed.
 */
export interface IDateDiscovery {
  /** Rank curated date ideas for the couple's current situation. */
  recommend(constraints: DateConstraints): Promise<DateRecommendation[]>;
  /** The plain-language "why this?" contract for a recommendation. */
  explain(rec: DateRecommendation): { signalsUsed: string[]; signalsNotUsed: string[] };
}
