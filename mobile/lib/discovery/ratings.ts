/**
 * Rating aggregation for date ideas.
 *
 * Beta honesty note: feedback is stored locally and space-scoped, so the ONLY
 * data available is the couple's OWN past feedback. We therefore surface "what
 * you thought last time", never a fabricated community average. When a real
 * community backend exists, `aggregateRatings` can take cross-space rows and the
 * same shape will represent a true community average — the UI label changes,
 * the math does not.
 */

import type { DateFeedback } from '../types';

export interface RatingSummary {
  /** Number of feedback entries. */
  count: number;
  /** Mean rating, rounded to 1 decimal. 0 when count is 0. */
  average: number;
  /** Most recent practical tip, if any. */
  latestTip?: string;
  /** Most recent rating, if any. */
  latestRating?: number;
}

/** Aggregate a set of feedback rows for a single idea into a summary. */
export function aggregateRatings(feedback: DateFeedback[]): RatingSummary {
  if (feedback.length === 0) return { count: 0, average: 0 };

  const sorted = [...feedback].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
  const average = Math.round((sum / feedback.length) * 10) / 10;
  const latestWithTip = sorted.find((f) => f.tip && f.tip.trim().length > 0);

  return {
    count: feedback.length,
    average,
    latestRating: sorted[0].rating,
    latestTip: latestWithTip?.tip,
  };
}

/** Filter feedback rows to a single idea (moment). */
export function ratingsForMoment(feedback: DateFeedback[], momentId: string): DateFeedback[] {
  return feedback.filter((f) => f.momentId === momentId);
}
