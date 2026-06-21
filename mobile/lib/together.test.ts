import { describe, it, expect } from 'vitest';
import {
  TOGETHER_MOMENTS,
  LOCAL_PLACES,
  momentsForSpaceType,
  momentById,
  placeById,
  pickTogetherMoment,
} from './together';

describe('momentsForSpaceType', () => {
  it('only returns moments valid for the space type', () => {
    const couple = momentsForSpaceType('couple');
    expect(couple.length).toBeGreaterThan(0);
    expect(couple.every((m) => m.spaceTypes.includes('couple'))).toBe(true);

    const friends = momentsForSpaceType('friends');
    expect(friends.every((m) => m.spaceTypes.includes('friends'))).toBe(true);
  });
});

describe('lookups', () => {
  it('finds a moment and a place by id', () => {
    expect(momentById('tm-1')?.title).toBe('one slow coffee');
    expect(placeById('pl-1')?.name).toBe('Café Katzung');
  });

  it('returns undefined for unknown or missing ids', () => {
    expect(momentById('nope')).toBeUndefined();
    expect(placeById(undefined)).toBeUndefined();
    expect(placeById('nope')).toBeUndefined();
  });
});

describe('pickTogetherMoment', () => {
  it('prefers a moment matching a selected goal', () => {
    const candidates = momentsForSpaceType('friends');
    const pick = pickTogetherMoment(candidates, ['playful moments']);
    expect(pick?.category).toBe('play');
  });

  it('falls back to the first candidate when no goal matches', () => {
    const candidates = momentsForSpaceType('couple');
    const pick = pickTogetherMoment(candidates, []);
    expect(pick).toBe(candidates[0]);
  });

  it('handles an empty candidate list', () => {
    expect(pickTogetherMoment([], ['playful moments'])).toBeUndefined();
  });
});

describe('data integrity', () => {
  it('every linked placeId resolves to a real place', () => {
    for (const m of TOGETHER_MOMENTS) {
      if (m.placeId) expect(placeById(m.placeId)).toBeDefined();
    }
  });

  it('only partner places carry a perk', () => {
    for (const p of LOCAL_PLACES) {
      if (p.perk) expect(p.isPartner).toBe(true);
    }
  });
});
