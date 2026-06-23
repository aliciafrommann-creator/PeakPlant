import { CHALLENGES, progressFor } from './challenges';
import type { Enrollment } from './challenges';

/** ISO week number (1–53) for a given date. */
function isoWeekNumber(d: Date): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Which challenge is highlighted this week (rotates every 7 days). */
export function currentWeeklyChallenge(): typeof CHALLENGES[0] {
  const week = isoWeekNumber(new Date());
  return CHALLENGES[week % CHALLENGES.length];
}

/** Count of enrollments where the challenge goal has been reached. */
export function completedCount(
  enrollments: Enrollment[],
  memoryDates: string[],
): number {
  return enrollments.filter((enr) => {
    const challenge = CHALLENGES.find((c) => c.id === enr.challengeId);
    if (!challenge) return false;
    return progressFor(challenge, enr.joinedAt, memoryDates).complete;
  }).length;
}
