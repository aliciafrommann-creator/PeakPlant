import { WEEKLY_CHALLENGES, challengeById, progressFor } from './challenges';
import type { Enrollment } from './challenges';

/** ISO week number (1–53) for a given date. */
function isoWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Which lightweight weekly challenge is highlighted this week (one shared
 *  moment completes it). Rotates every 7 days by ISO week. */
export function currentWeeklyChallenge(): typeof WEEKLY_CHALLENGES[0] {
  const week = isoWeekNumber(new Date());
  return WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
}

/** Count of enrollments where the challenge goal has been reached. */
export function completedCount(
  enrollments: Enrollment[],
  memoryDates: string[],
): number {
  return enrollments.filter((enr) => {
    const challenge = challengeById(enr.challengeId);
    if (!challenge) return false;
    return progressFor(challenge, enr.joinedAt, memoryDates).complete;
  }).length;
}
