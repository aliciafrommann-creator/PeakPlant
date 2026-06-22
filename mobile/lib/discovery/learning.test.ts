import { describe, it, expect } from 'vitest';
import {
  summarizeLearning,
  affinityWeights,
  EMPTY_LEARNING,
  type LearnOptions,
} from './learning';
import type { SavedDate, SavedDateStatus } from '../types';
import type { MomentCategory } from '../together';

let seq = 0;
function sd(momentId: string, status: SavedDateStatus): SavedDate {
  seq += 1;
  return {
    id: `s${seq}`,
    spaceId: 'space-1',
    momentId,
    title: 't',
    concept: 'c',
    priceBand: '€',
    estDurationMin: 60,
    status,
    savedAt: '2026-06-01T00:00:00Z',
  };
}

// momentId encodes its category for the test, e.g. "m:food".
const categoryOf = (id: string): MomentCategory | undefined => {
  const c = id.split(':')[1];
  return (['food', 'outdoors', 'create', 'calm', 'play'] as MomentCategory[]).find((x) => x === c);
};
const opts: LearnOptions = { categoryOf };

describe('summarizeLearning', () => {
  it('is empty for no saved dates', () => {
    expect(summarizeLearning([], opts)).toEqual(EMPTY_LEARNING);
  });

  it('weights completed > planned > saved and accumulates per category', () => {
    const summary = summarizeLearning(
      [sd('m:food', 'completed'), sd('m:food', 'saved'), sd('m:calm', 'planned')],
      opts,
    );
    // food: 3 + 1 = 4 (2 signals); calm: 2 (1 signal)
    expect(summary.liked).toEqual([
      { category: 'food', score: 4, signals: 2 },
      { category: 'calm', score: 2, signals: 1 },
    ]);
    expect(summary.disliked).toEqual([]);
    expect(summary.total).toBe(3);
  });

  it('treats dismissed as a bounded negative and splits liked/disliked', () => {
    const summary = summarizeLearning(
      [sd('m:play', 'completed'), sd('m:create', 'dismissed')],
      opts,
    );
    expect(summary.liked).toEqual([{ category: 'play', score: 3, signals: 1 }]);
    expect(summary.disliked).toEqual([{ category: 'create', score: -2, signals: 1 }]);
  });

  it('nets positive and negative actions in one category', () => {
    // food: completed(3) + dismissed(-2) = 1 → liked
    const summary = summarizeLearning(
      [sd('m:food', 'completed'), sd('m:food', 'dismissed')],
      opts,
    );
    expect(summary.liked).toEqual([{ category: 'food', score: 1, signals: 2 }]);
    expect(summary.disliked).toEqual([]);
  });

  it('ignores idea-status placeholders and unknown momentIds', () => {
    const summary = summarizeLearning(
      [sd('m:food', 'idea'), sd('m:unknown', 'completed')],
      opts,
    );
    expect(summary).toEqual(EMPTY_LEARNING);
  });

  it('returns empty when personalization is disabled', () => {
    const summary = summarizeLearning([sd('m:food', 'completed')], { ...opts, enabled: false });
    expect(summary).toEqual(EMPTY_LEARNING);
  });

  it('ignores actions on or before a reset (since), keeping later ones', () => {
    const old: SavedDate = { ...sd('m:food', 'completed'), savedAt: '2026-01-01T00:00:00Z' };
    const recent: SavedDate = { ...sd('m:calm', 'completed'), savedAt: '2026-07-01T00:00:00Z' };
    const summary = summarizeLearning([old, recent], { ...opts, since: '2026-06-01T00:00:00Z' });
    expect(summary.liked).toEqual([{ category: 'calm', score: 3, signals: 1 }]);
  });

  it('uses completedAt over savedAt for the reset cutoff', () => {
    // Saved before the reset, but completed after it → still counts.
    const d: SavedDate = {
      ...sd('m:play', 'completed'),
      savedAt: '2026-01-01T00:00:00Z',
      completedAt: '2026-07-01T00:00:00Z',
    };
    const summary = summarizeLearning([d], { ...opts, since: '2026-06-01T00:00:00Z' });
    expect(summary.liked).toEqual([{ category: 'play', score: 3, signals: 1 }]);
  });
});

describe('affinityWeights', () => {
  it('bounds weights to +/-1 regardless of raw score', () => {
    const summary = summarizeLearning(
      [
        sd('m:food', 'completed'),
        sd('m:food', 'completed'),
        sd('m:create', 'dismissed'),
        sd('m:create', 'dismissed'),
      ],
      opts,
    );
    expect(affinityWeights(summary)).toEqual({ food: 1, create: -1 });
  });

  it('is empty for an empty summary', () => {
    expect(affinityWeights(EMPTY_LEARNING)).toEqual({});
  });
});
