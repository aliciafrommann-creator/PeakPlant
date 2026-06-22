import { describe, it, expect } from 'vitest';
import { recommendDates } from './recommend';
import { TOGETHER_MOMENTS, LOCAL_PLACES } from '../together';

describe('recommendDates', () => {
  it('returns a primary pick and one alternative for a couple', () => {
    const recs = recommendDates({ spaceType: 'couple' });
    expect(recs.length).toBe(2);
    expect(recs[0].isAlternative).toBeFalsy();
    expect(recs[1].isAlternative).toBe(true);
    // The alternative is a genuinely different idea.
    expect(recs[1].momentId).not.toBe(recs[0].momentId);
  });

  it('only suggests moments valid for the space type', () => {
    // tm-6 (swim) is friends-only; tm-4 (watch the light) is couple-only.
    const couple = recommendDates({ spaceType: 'couple' }, {});
    const friends = recommendDates({ spaceType: 'friends' }, {});
    expect(couple.every((r) => r.momentId !== 'tm-6')).toBe(true);
    expect(friends.every((r) => r.momentId !== 'tm-4')).toBe(true);
  });

  it('respects the budget ceiling (hard filter)', () => {
    const recs = recommendDates({ spaceType: 'couple', maxBudget: 'free' });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.priceBand === 'free')).toBe(true);
  });

  it('respects the max duration', () => {
    const recs = recommendDates({ spaceType: 'couple', maxDurationMin: 45 });
    expect(recs.every((r) => r.estDurationMin <= 45)).toBe(true);
  });

  it('never suggests a rain-only-bad outdoor moment when it is raining', () => {
    const recs = recommendDates({ spaceType: 'friends', weather: 'rain' });
    // tm-6 swim fits only sunny → must be excluded in the rain.
    expect(recs.every((r) => r.momentId !== 'tm-6')).toBe(true);
  });

  it('keeps indoor results when the user asks to stay in', () => {
    const recs = recommendDates({ spaceType: 'couple', indoorOutdoor: 'indoor' });
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.indoorOutdoor === 'indoor' || r.indoorOutdoor === 'flexible')).toBe(
      true,
    );
  });

  it('personalizes by goal and explains why', () => {
    const recs = recommendDates({ spaceType: 'couple', goals: ['playful moments'] });
    // 'playful moments' → category 'play'. tm-8 is the couple-eligible play moment.
    expect(recs[0].momentId).toBe('tm-8');
    expect(recs[0].why.toLowerCase()).toContain('playful moments');
    expect(recs[0].signalsUsed.some((s) => s.includes('playful moments'))).toBe(true);
  });

  it('is honest about signals it cannot use', () => {
    const recs = recommendDates({ spaceType: 'couple' });
    expect(recs[0].signalsNotUsed).toContain('live weather');
    expect(recs[0].signalsNotUsed).toContain('your device location');
  });

  it('labels every fact with a provenance and never claims verified-live', () => {
    const recs = recommendDates({ spaceType: 'couple' });
    for (const rec of recs) {
      expect(rec.facts.length).toBeGreaterThan(0);
      for (const fact of rec.facts) {
        expect(fact.provenance).toBeTruthy();
        expect(fact.provenance).not.toBe('verified-live');
      }
    }
  });

  it('returns an empty list when over-constrained (caller shows the empty state)', () => {
    const recs = recommendDates({
      spaceType: 'couple',
      maxBudget: 'free',
      maxDurationMin: 10, // nothing is this short
    });
    expect(recs).toEqual([]);
  });

  it('is deterministic for identical input', () => {
    const a = recommendDates({ spaceType: 'couple', goals: ['quiet closeness'] });
    const b = recommendDates({ spaceType: 'couple', goals: ['quiet closeness'] });
    expect(a.map((r) => r.momentId)).toEqual(b.map((r) => r.momentId));
  });

  it('skips excluded moments (powers "show another")', () => {
    const first = recommendDates({ spaceType: 'couple' })[0];
    const next = recommendDates({ spaceType: 'couple', excludeIds: [first.momentId] });
    expect(next.every((r) => r.momentId !== first.momentId)).toBe(true);
  });

  it('does not boost partner places in ranking', () => {
    // With no preferences, the top pick is the first eligible moment (tm-1),
    // proving partner-ness is not a ranking factor.
    const recs = recommendDates({ spaceType: 'couple' });
    expect(recs[0].momentId).toBe(TOGETHER_MOMENTS.filter((m) => m.spaceTypes.includes('couple'))[0].id);
    // sanity: partner places exist in the catalog
    expect(LOCAL_PLACES.some((p) => p.isPartner)).toBe(true);
  });
});
