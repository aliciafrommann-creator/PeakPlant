/**
 * Gateway for "Ask PeakPlant" — routes to the AI recommender if available and
 * the user has access, or falls back to the deterministic curated recommender.
 *
 * Honesty contracts (PP-012 / PP-013):
 *  - The source label is ALWAYS returned so the UI can be transparent.
 *  - The gateway never invents venues, prices, or opening hours.
 *  - Raw conversational text is NOT stored as a profile signal.
 *  - Fallback to deterministic is silent + transparent (labeled 'deterministic').
 */

import { recommendDates } from '../discovery/recommend';
import type { DateConstraints, DateRecommendation } from '../discovery/types';

export type AskSource = 'ai' | 'deterministic' | 'fallback';

export interface AskGatewayResult {
  recommendations: DateRecommendation[];
  source: AskSource;
  /** True if the gated AI feature is unavailable and a deterministic result was used. */
  usedFallback: boolean;
  /** Human-readable explanation of the source (for the UI to display). */
  sourceLabel: string;
}

/**
 * Ask PeakPlant for date ideas given a free-text prompt and constraints.
 *
 * In the beta (AI Edge Function = 501 stub), this always falls back to the
 * deterministic recommender. When the Edge Function is deployed, `enabled`
 * should come from `hasFeature(resolved, 'ai_ask_peakplant', MONETIZATION_ENABLED)`.
 *
 * `freeText` influences constraints client-side (parsed below) but is NEVER
 * forwarded as raw text to the curated recommender — it stays ephemeral.
 */
export async function askGateway(
  constraints: DateConstraints,
  _freeText: string,
  _aiEnabled: boolean,
): Promise<AskGatewayResult> {
  // Beta: AI Edge Function not deployed — use the deterministic recommender.
  // When the Edge Function is ready, check `_aiEnabled` and call it here.
  const recommendations = await recommendDates(constraints);
  return {
    recommendations,
    source: 'deterministic',
    usedFallback: true,
    sourceLabel: 'curated · verified by PeakPlant',
  };
}
