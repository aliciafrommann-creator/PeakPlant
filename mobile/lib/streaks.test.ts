import { describe, it, expect } from 'vitest';
import { computeWeeklyStreak, weekKey } from './streaks';

// June 2026: the 1st is a Monday, so Tuesdays fall on 2, 9, 16, 23, 30.
// Using mid-week local datetimes (no trailing Z) keeps weekKey timezone-stable.
const tue = (day: number) => `2026-06-${String(day).padStart(2, '0')}T12:00:00`;
const NOW = new Date(2026, 5, 23, 12, 0, 0); // Tue 23 Jun 2026, week of Mon 22

describe('weekKey', () => {
  it('maps a day to the Monday of its week', () => {
    expect(weekKey(new Date(2026, 5, 23, 12))).toBe('2026-06-22');
    expect(weekKey(new Date(2026, 5, 22, 0))).toBe('2026-06-22');
  });
});

describe('computeWeeklyStreak', () => {
  it('returns nothing for no moments', () => {
    expect(computeWeeklyStreak([], NOW)).toEqual({ count: 0, atRisk: false, active: false });
  });

  it('counts consecutive weeks including the current one', () => {
    const r = computeWeeklyStreak([tue(9), tue(16), tue(23)], NOW);
    expect(r).toEqual({ count: 3, atRisk: false, active: true });
  });

  it('keeps the streak alive but at risk when only last week is present', () => {
    const r = computeWeeklyStreak([tue(16)], NOW);
    expect(r).toEqual({ count: 1, atRisk: true, active: true });
  });

  it('breaks when neither this week nor last week has a moment', () => {
    const r = computeWeeklyStreak([tue(2)], NOW);
    expect(r).toEqual({ count: 0, atRisk: false, active: false });
  });

  it('stops counting at the first gap', () => {
    const r = computeWeeklyStreak([tue(23), tue(9)], NOW);
    expect(r).toEqual({ count: 1, atRisk: false, active: true });
  });

  it('does not double-count two moments in the same week', () => {
    const r = computeWeeklyStreak([tue(23), '2026-06-24T09:00:00'], NOW);
    expect(r.count).toBe(1);
  });
});
