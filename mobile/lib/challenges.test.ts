import { describe, it, expect } from 'vitest';
import {
  CHALLENGES,
  challengesForSpaceType,
  challengeById,
  progressFor,
} from './challenges';

describe('challengesForSpaceType', () => {
  it('filters by space type', () => {
    expect(challengesForSpaceType('couple').every((c) => c.spaceTypes.includes('couple'))).toBe(true);
    expect(challengesForSpaceType('friends').every((c) => c.spaceTypes.includes('friends'))).toBe(true);
  });
});

describe('challengeById', () => {
  it('finds and misses', () => {
    expect(challengeById('ch-1')?.title).toBe('a season together');
    expect(challengeById('nope')).toBeUndefined();
  });
});

describe('progressFor', () => {
  const ch = CHALLENGES[0]; // goalCount 4
  const joined = '2026-06-01T00:00:00';

  it('counts only moments on/after joining', () => {
    const dates = ['2026-05-30T10:00:00', '2026-06-02T10:00:00', '2026-06-10T10:00:00'];
    expect(progressFor(ch, joined, dates)).toEqual({ count: 2, goal: 4, complete: false });
  });

  it('marks complete when the goal is reached', () => {
    const dates = ['2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'];
    expect(progressFor(ch, joined, dates).complete).toBe(true);
  });

  it('is zero when nothing qualifies', () => {
    expect(progressFor(ch, joined, ['2026-05-01']).count).toBe(0);
  });
});

describe('badge integrity', () => {
  it('every challenge has a badge and a positive goal', () => {
    for (const c of CHALLENGES) {
      expect(c.badge.length).toBeGreaterThan(0);
      expect(c.goalCount).toBeGreaterThan(0);
    }
  });
});
