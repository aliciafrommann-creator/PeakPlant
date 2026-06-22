/**
 * Gateway for "Ask PeakPlant" — routes to the AI recommender if available and
 * the user has access, or falls back to the deterministic curated recommender.
 *
 * Honesty contracts (PP-012 / PP-013):
 *  - The source label is ALWAYS returned so the UI can be transparent.
 *  - The gateway never invents venues, prices, or opening hours. The AI only
 *    reorders + rewords a pool of curated candidates (see aiRecommend.ts).
 *  - Raw conversational text is NOT stored as a profile signal and is NOT sent
 *    to the model — only structured constraints + curated candidates are.
 *  - Fallback to deterministic is silent + transparent (labeled 'deterministic').
 */

import { recommendDates, rankedCandidates } from '../discovery/recommend';
import type { DateConstraints, DateRecommendation } from '../discovery/types';
import { mergeAiRanking, type AiPick } from './aiRecommend';
import { supabase } from '../supabase/client';
import { aiSurfaceEnabled } from './safety';

export type AskSource = 'ai' | 'deterministic' | 'fallback';

export interface AskGatewayResult {
  recommendations: DateRecommendation[];
  source: AskSource;
  /** True if the gated AI feature is unavailable and a deterministic result was used. */
  usedFallback: boolean;
  /** Human-readable explanation of the source (for the UI to display). */
  sourceLabel: string;
}

const LABEL_AI = 'personalized by PeakPlant AI · facts stay curated';
const LABEL_CURATED = 'curated · verified by PeakPlant';

/** How many curated candidates the AI may choose/reorder among. */
const CANDIDATE_POOL = 6;

/**
 * Call the `discover` Edge Function with curated candidates and ask it only to
 * rank + reword. Returns the AI picks, or null on any failure / unavailability
 * so the caller can fall back. Never throws.
 */
async function fetchAiPicks(
  constraints: DateConstraints,
  candidates: DateRecommendation[],
): Promise<AiPick[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke('discover', {
      body: {
        constraints,
        // Send only what the model needs to rank — id, title, concept. Facts,
        // prices and places stay on the client and are re-attached after.
        candidates: candidates.map((c) => ({
          momentId: c.momentId,
          title: c.title,
          concept: c.concept,
        })),
      },
    });
    if (error || !data || !Array.isArray((data as { picks?: unknown }).picks)) return null;
    return (data as { picks: AiPick[] }).picks;
  } catch {
    // 501 (not deployed), network error, auth error — all degrade to curated.
    return null;
  }
}

/**
 * Ask PeakPlant for date ideas given a free-text prompt and constraints.
 *
 * When AI is enabled (kill switch on, Supabase configured, caller has access),
 * the curated candidate pool is sent to the `discover` Edge Function for warm
 * re-ranking. On ANY failure the deterministic curated result is returned, so
 * the user always gets ideas. `freeText` shapes constraints upstream but is
 * never forwarded as raw text (it stays ephemeral).
 */
export async function askGateway(
  constraints: DateConstraints,
  _freeText: string,
  aiEnabled: boolean,
): Promise<AskGatewayResult> {
  const deterministic = await recommendDates(constraints);

  const canUseAi = aiEnabled && aiSurfaceEnabled('askPeakPlant') && Boolean(supabase);
  if (canUseAi) {
    const candidates = rankedCandidates(constraints, CANDIDATE_POOL);
    if (candidates.length > 0) {
      const picks = await fetchAiPicks(constraints, candidates);
      const merged = picks ? mergeAiRanking(candidates, picks) : [];
      if (merged.length > 0) {
        return {
          recommendations: merged,
          source: 'ai',
          usedFallback: false,
          sourceLabel: LABEL_AI,
        };
      }
    }
    // AI was eligible but produced nothing usable — transparent fallback.
    return {
      recommendations: deterministic,
      source: 'fallback',
      usedFallback: true,
      sourceLabel: LABEL_CURATED,
    };
  }

  return {
    recommendations: deterministic,
    source: 'deterministic',
    usedFallback: true,
    sourceLabel: LABEL_CURATED,
  };
}
