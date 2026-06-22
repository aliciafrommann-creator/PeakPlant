import { describe, it, expect } from 'vitest';
import { mergeAiRanking, AI_WHY_MAX } from './aiRecommend';
import type { DateRecommendation } from '../discovery/types';

function rec(over: Partial<DateRecommendation>): DateRecommendation {
  return {
    id: 'm1',
    momentId: 'm1',
    title: 'Sunset walk',
    concept: 'a slow walk as the light goes',
    why: 'curated why',
    signalsUsed: ['curated signal'],
    signalsNotUsed: ['live weather'],
    facts: [{ label: 'how long', value: 'about 60 min', provenance: 'curated' }],
    estDurationMin: 60,
    priceBand: 'free',
    indoorOutdoor: 'outdoor',
    freshnessAt: '2026-06-01',
    ...over,
  };
}

describe('mergeAiRanking', () => {
  const candidates = [
    rec({ id: 'm1', momentId: 'm1', title: 'Walk' }),
    rec({ id: 'm2', momentId: 'm2', title: 'Cook' }),
    rec({ id: 'm3', momentId: 'm3', title: 'Museum' }),
  ];

  it('returns empty for empty candidates or picks', () => {
    expect(mergeAiRanking([], [{ momentId: 'm1' }])).toEqual([]);
    expect(mergeAiRanking(candidates, [])).toEqual([]);
  });

  it('reorders candidates to match the AI pick order', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm2' }, { momentId: 'm1' }]);
    expect(out.map((r) => r.momentId)).toEqual(['m2', 'm1']);
  });

  it('drops ids that are not in the curated candidate pool (no fabrication)', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'ghost' }, { momentId: 'm3' }]);
    expect(out.map((r) => r.momentId)).toEqual(['m3']);
  });

  it('overrides the warm why but keeps curated facts/price/place', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm1', why: 'because you love slow evenings' }]);
    expect(out[0].why).toBe('because you love slow evenings');
    expect(out[0].facts).toEqual(candidates[0].facts);
    expect(out[0].priceBand).toBe('free');
  });

  it('keeps the candidate why when the AI why is empty/whitespace', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm1', why: '   ' }]);
    expect(out[0].why).toBe('curated why');
  });

  it('caps the why length', () => {
    const long = 'x'.repeat(400);
    const out = mergeAiRanking(candidates, [{ momentId: 'm1', why: long }]);
    expect(out[0].why.length).toBeLessThanOrEqual(AI_WHY_MAX);
  });

  it('uses curated signals when AI signals are missing or empty', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm1', signalsUsed: [] }]);
    expect(out[0].signalsUsed).toEqual(['curated signal']);
  });

  it('marks everything after the first as an alternative', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm1' }, { momentId: 'm2' }]);
    expect(out[0].isAlternative).toBe(false);
    expect(out[1].isAlternative).toBe(true);
  });

  it('de-duplicates repeated ids', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm1' }, { momentId: 'm1' }, { momentId: 'm2' }]);
    expect(out.map((r) => r.momentId)).toEqual(['m1', 'm2']);
  });

  it('respects the limit', () => {
    const out = mergeAiRanking(candidates, [{ momentId: 'm1' }, { momentId: 'm2' }, { momentId: 'm3' }], 2);
    expect(out).toHaveLength(2);
  });
});
