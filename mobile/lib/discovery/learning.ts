/**
 * Privacy-safe personalization from explicit behavior (PP-014, AI_SAFETY).
 *
 * The ONLY inputs are actions the user took on purpose: ideas they saved,
 * planned, completed, or dismissed. From those we derive a gentle per-category
 * affinity that can (a) be shown back to the user verbatim ("what PeakPlant has
 * learned"), (b) be edited/reset, and (c) nudge — never dominate — the
 * deterministic recommender.
 *
 * We never infer sensitive attributes, never read diary content, and never use
 * anything the user didn't explicitly do. Pure (no I/O) so it is unit-tested and
 * reused as the offline path. When personalization is disabled the summary is
 * empty and the recommender behaves exactly as before.
 */

import type { SavedDate, SavedDateStatus } from '../types';
import type { MomentCategory } from '../together';

/**
 * How strongly each explicit action speaks. Completing a date is the strongest
 * positive signal; dismissing is a clear (but bounded) negative. `idea` is a
 * pre-save placeholder and carries no weight.
 */
const STATUS_WEIGHT: Record<SavedDateStatus, number> = {
  completed: 3,
  planned: 2,
  saved: 1,
  idea: 0,
  dismissed: -2,
};

export interface CategoryAffinity {
  category: MomentCategory;
  /** Net signed score across all of this category's contributing actions. */
  score: number;
  /** How many saved-date actions contributed (for honest "from N ideas" copy). */
  signals: number;
}

export interface LearningSummary {
  /** Categories with net-positive affinity, strongest first. */
  liked: CategoryAffinity[];
  /** Categories with net-negative affinity, most-disliked first. */
  disliked: CategoryAffinity[];
  /** Total saved-date actions that contributed any weight. */
  total: number;
}

export interface LearnOptions {
  /** Resolve a saved date's momentId to its category. Injected for testing. */
  categoryOf: (momentId: string) => MomentCategory | undefined;
  /** When false, personalization is off and the summary is empty. */
  enabled?: boolean;
  /**
   * ISO timestamp of the last "forget what you've learned" reset. Actions whose
   * effective date is on or before this are ignored — a genuine, non-destructive
   * reset that keeps the saved ideas themselves.
   */
  since?: string;
}

/** The action's effective date: when it was completed, else when it was saved. */
function effectiveDate(d: SavedDate): string {
  return d.completedAt ?? d.savedAt;
}

/** The neutral, "we've learned nothing yet" summary. */
export const EMPTY_LEARNING: LearningSummary = { liked: [], disliked: [], total: 0 };

/**
 * Aggregate explicit saved-date actions into a per-category affinity summary.
 */
export function summarizeLearning(saved: SavedDate[], opts: LearnOptions): LearningSummary {
  if (opts.enabled === false) return EMPTY_LEARNING;

  const acc = new Map<MomentCategory, { score: number; signals: number }>();
  let total = 0;

  for (const d of saved) {
    const weight = STATUS_WEIGHT[d.status];
    if (weight === 0) continue;
    if (opts.since && effectiveDate(d) <= opts.since) continue;
    const category = opts.categoryOf(d.momentId);
    if (!category) continue;
    const cur = acc.get(category) ?? { score: 0, signals: 0 };
    cur.score += weight;
    cur.signals += 1;
    acc.set(category, cur);
    total += 1;
  }

  const entries: CategoryAffinity[] = [...acc.entries()].map(([category, v]) => ({
    category,
    score: v.score,
    signals: v.signals,
  }));

  const liked = entries
    .filter((e) => e.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.category.localeCompare(b.category)));
  const disliked = entries
    .filter((e) => e.score < 0)
    .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.category.localeCompare(b.category)));

  return { liked, disliked, total };
}

/**
 * Turn a summary into bounded scoring weights for the recommender. Kept gentle
 * (+/-1) so explicit, in-the-moment constraints always outrank past behavior —
 * personalization nudges, it does not decide.
 */
export function affinityWeights(summary: LearningSummary): Partial<Record<MomentCategory, number>> {
  const weights: Partial<Record<MomentCategory, number>> = {};
  for (const e of summary.liked) weights[e.category] = 1;
  for (const e of summary.disliked) weights[e.category] = -1;
  return weights;
}
