import { describe, it, expect } from 'vitest';
import { currentWeeklyChallenge, completedCount } from './weeklyChallenge';
import { WEEKLY_CHALLENGES } from './challenges';

describe('weekly challenge', () => {
  it('is lightweight — one shared moment completes it', () => {
    expect(WEEKLY_CHALLENGES.length).toBeGreaterThan(0);
    expect(WEEKLY_CHALLENGES.every((c) => c.goalCount === 1)).toBe(true);
    // durationLabel is bilingual now — check both languages resolve to the
    // soft "this week" label (never a ticking countdown).
    expect(
      WEEKLY_CHALLENGES.every(
        (c) =>
          typeof c.durationLabel === 'object' &&
          c.durationLabel.en === 'this week' &&
          c.durationLabel.de === 'diese woche',
      ),
    ).toBe(true);
  });

  it('picks a weekly challenge (goal 1)', () => {
    const w = currentWeeklyChallenge();
    expect(w.id.startsWith('wk-')).toBe(true);
    expect(w.goalCount).toBe(1);
  });

  it('counts a weekly as collected after a single moment', () => {
    const w = currentWeeklyChallenge();
    const enrollments = [{ challengeId: w.id, joinedAt: '2026-06-01T00:00:00Z' }];
    // No moment yet → not collected.
    expect(completedCount(enrollments, [])).toBe(0);
    // One moment after joining → collected.
    expect(completedCount(enrollments, ['2026-06-02T10:00:00Z'])).toBe(1);
  });
});
