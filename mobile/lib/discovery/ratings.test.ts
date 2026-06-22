import { describe, it, expect } from 'vitest';
import { aggregateRatings, ratingsForMoment } from './ratings';
import type { DateFeedback } from '../types';

function fb(over: Partial<DateFeedback>): DateFeedback {
  return {
    id: 'fb-x',
    savedDateId: 'sd-x',
    spaceId: 'space-1',
    momentId: 'moment-1',
    rating: 4,
    createdAt: '2026-06-01T00:00:00Z',
    ...over,
  };
}

describe('aggregateRatings', () => {
  it('returns a zero summary for no feedback', () => {
    const s = aggregateRatings([]);
    expect(s.count).toBe(0);
    expect(s.average).toBe(0);
    expect(s.latestRating).toBeUndefined();
  });

  it('computes count and average', () => {
    const s = aggregateRatings([fb({ rating: 5 }), fb({ rating: 4 }), fb({ rating: 3 })]);
    expect(s.count).toBe(3);
    expect(s.average).toBe(4);
  });

  it('rounds the average to one decimal', () => {
    const s = aggregateRatings([fb({ rating: 5 }), fb({ rating: 4 })]); // 4.5
    expect(s.average).toBe(4.5);
    const s2 = aggregateRatings([fb({ rating: 5 }), fb({ rating: 4 }), fb({ rating: 4 })]); // 4.33
    expect(s2.average).toBe(4.3);
  });

  it('surfaces the most recent rating', () => {
    const s = aggregateRatings([
      fb({ rating: 2, createdAt: '2026-01-01T00:00:00Z' }),
      fb({ rating: 5, createdAt: '2026-06-01T00:00:00Z' }),
    ]);
    expect(s.latestRating).toBe(5);
  });

  it('surfaces the most recent non-empty tip', () => {
    const s = aggregateRatings([
      fb({ tip: 'older tip', createdAt: '2026-01-01T00:00:00Z' }),
      fb({ tip: 'newer tip', createdAt: '2026-06-01T00:00:00Z' }),
      fb({ tip: undefined, createdAt: '2026-07-01T00:00:00Z' }),
    ]);
    expect(s.latestTip).toBe('newer tip');
  });

  it('ignores empty/whitespace tips when choosing latestTip', () => {
    const s = aggregateRatings([
      fb({ tip: 'real tip', createdAt: '2026-01-01T00:00:00Z' }),
      fb({ tip: '   ', createdAt: '2026-06-01T00:00:00Z' }),
    ]);
    expect(s.latestTip).toBe('real tip');
  });
});

describe('ratingsForMoment', () => {
  it('filters feedback to a single moment', () => {
    const all = [fb({ momentId: 'm1' }), fb({ momentId: 'm2' }), fb({ momentId: 'm1' })];
    expect(ratingsForMoment(all, 'm1')).toHaveLength(2);
    expect(ratingsForMoment(all, 'm2')).toHaveLength(1);
    expect(ratingsForMoment(all, 'm3')).toHaveLength(0);
  });
});
