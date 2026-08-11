import { WEEKLY_CHALLENGES, challengeById, progressFor } from './challenges';
import type { Enrollment, ChallengeProgress } from './challenges';
import type { SpaceType } from './types';

/** ISO week number (1–53) for a given date. */
function isoWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Stable key for an ISO week, year-aware (e.g. "2026-W33"). */
export function isoWeekKey(d: Date): string {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  return `${target.getUTCFullYear()}-W${String(isoWeekNumber(d)).padStart(2, '0')}`;
}

/** True when the ISO date string falls in the same ISO week as `ref`. */
export function inSameIsoWeek(isoDate: string, ref: Date): boolean {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  return isoWeekKey(d) === isoWeekKey(ref);
}

/** Which lightweight weekly challenge is highlighted this week (one shared
 *  moment completes it). Rotates every 7 days by ISO week. Pass the space
 *  type so couple-only weeklies never surface in a friends space. */
export function currentWeeklyChallenge(spaceType?: SpaceType): typeof WEEKLY_CHALLENGES[0] {
  const pool = spaceType
    ? WEEKLY_CHALLENGES.filter((c) => c.spaceTypes.includes(spaceType))
    : WEEKLY_CHALLENGES;
  const source = pool.length > 0 ? pool : WEEKLY_CHALLENGES;
  const week = isoWeekNumber(new Date());
  return source[week % source.length];
}

/**
 * Weekly progress is week-scoped: an enrollment only counts moments preserved
 * in the SAME ISO week it was joined. Without this, a weekly enrollment from
 * months ago would auto-complete the instant its challenge rotates back in
 * (audit A4-06) — a fake "done" the couple never did that week.
 */
export function weeklyProgressFor(
  challenge: NonNullable<ReturnType<typeof challengeById>>,
  joinedAt: string,
  memoryDates: string[],
): ChallengeProgress {
  const joined = new Date(joinedAt);
  const windowed = memoryDates.filter((d) => inSameIsoWeek(d, joined));
  return progressFor(challenge, joinedAt, windowed);
}

/** Count of enrollments where the challenge goal has been reached.
 *  Weekly challenges use the week-scoped progress rule. */
export function completedCount(
  enrollments: Enrollment[],
  memoryDates: string[],
): number {
  return enrollments.filter((enr) => {
    const challenge = challengeById(enr.challengeId);
    if (!challenge) return false;
    const progress = enr.challengeId.startsWith('wk-')
      ? weeklyProgressFor(challenge, enr.joinedAt, memoryDates)
      : progressFor(challenge, enr.joinedAt, memoryDates);
    return progress.complete;
  }).length;
}
