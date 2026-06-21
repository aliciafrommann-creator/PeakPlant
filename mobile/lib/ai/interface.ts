import type { MomentCard } from '../types';
import type { AIContext, CardSuggestion, ReflectionPrompt } from './types';

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
}
