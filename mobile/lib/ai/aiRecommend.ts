/**
 * Client-side safety merge for the `discover` Edge Function response.
 *
 * The Edge Function returns only an ordering of candidate moment ids plus a
 * personalized "why" and the signals it used. It can NEVER return a venue, a
 * price, an opening time, or any other fact — those always come from the curated
 * candidate the client already holds. `mergeAiRanking` enforces that contract a
 * second time on-device (defense in depth):
 *
 *   - every returned id must match a candidate the client sent; unknown ids are
 *     dropped (no fabricated ideas can slip through),
 *   - the warm "why" is trimmed + length-capped; an empty one keeps the
 *     candidate's own deterministic "why",
 *   - all structured facts/price/place/freshness come from the curated
 *     candidate, never from the model,
 *   - the result is capped to a primary pick + one alternative.
 *
 * Pure (no network / RN imports) so it is unit-tested in node and reused as the
 * single validation point for the AI path.
 */

import type { DateRecommendation } from '../discovery/types';

/** One AI pick: which curated idea, and the warm rationale for it. */
export interface AiPick {
  momentId: string;
  why?: string;
  signalsUsed?: string[];
}

/** Hard cap on the personalized "why" length — keeps a model from running long. */
export const AI_WHY_MAX = 280;

function cleanWhy(why: string | undefined): string | null {
  if (typeof why !== 'string') return null;
  const trimmed = why.replace(/\s+/g, ' ').trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > AI_WHY_MAX ? `${trimmed.slice(0, AI_WHY_MAX - 1).trimEnd()}…` : trimmed;
}

function cleanSignals(signals: string[] | undefined): string[] | null {
  if (!Array.isArray(signals)) return null;
  const cleaned = signals
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0)
    .slice(0, 6);
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Apply an AI ranking to the curated candidate pool, safely.
 *
 * @param candidates the curated recommendations the client sent to the function
 * @param picks      the AI's ordered choices (ids + warm "why")
 * @param limit      max recommendations to return (default 2: primary + alt)
 */
export function mergeAiRanking(
  candidates: DateRecommendation[],
  picks: AiPick[],
  limit = 2,
): DateRecommendation[] {
  if (!Array.isArray(candidates) || candidates.length === 0) return [];
  if (!Array.isArray(picks) || picks.length === 0) return [];

  const byMoment = new Map(candidates.map((c) => [c.momentId, c]));
  const seen = new Set<string>();
  const out: DateRecommendation[] = [];

  for (const pick of picks) {
    if (!pick || typeof pick.momentId !== 'string') continue;
    const candidate = byMoment.get(pick.momentId);
    if (!candidate || seen.has(pick.momentId)) continue;
    seen.add(pick.momentId);

    const why = cleanWhy(pick.why);
    const signalsUsed = cleanSignals(pick.signalsUsed);

    out.push({
      ...candidate,
      // Facts/price/place/freshness stay curated. Only the warm rationale and the
      // (already truthful) signal list may be reworded by the model.
      why: why ?? candidate.why,
      signalsUsed: signalsUsed ?? candidate.signalsUsed,
      isAlternative: out.length > 0,
    });

    if (out.length >= limit) break;
  }

  return out;
}
