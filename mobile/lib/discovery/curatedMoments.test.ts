import { describe, it, expect } from 'vitest';
import { CURATED_MOMENTS } from './curatedMoments';
import { TOGETHER_MOMENTS } from '../together';

const CATEGORIES = ['food', 'outdoors', 'create', 'calm', 'play'] as const;

describe('curated moments', () => {
  it('adds real depth (80-150 total in the recommender pool)', () => {
    expect(TOGETHER_MOMENTS.length).toBeGreaterThanOrEqual(80);
    expect(TOGETHER_MOMENTS.length).toBeLessThanOrEqual(150);
  });

  it('has unique ids across the whole pool', () => {
    const ids = TOGETHER_MOMENTS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique, non-empty titles in the curated set', () => {
    const titles = CURATED_MOMENTS.map((m) => m.title);
    expect(titles.every((t) => t.length > 0)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('spreads across every category', () => {
    for (const cat of CATEGORIES) {
      const n = TOGETHER_MOMENTS.filter((m) => m.category === cat).length;
      expect(n).toBeGreaterThanOrEqual(8);
    }
  });

  it('keeps both space types well served', () => {
    expect(TOGETHER_MOMENTS.filter((m) => m.spaceTypes.includes('couple')).length).toBeGreaterThan(40);
    expect(TOGETHER_MOMENTS.filter((m) => m.spaceTypes.includes('friends')).length).toBeGreaterThan(40);
  });

  it('gives every curated moment complete, valid metadata', () => {
    for (const m of CURATED_MOMENTS) {
      expect(m.idea.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(m.category);
      expect(m.spaceTypes.length).toBeGreaterThan(0);
      expect(m.avgDurationMin).toBeGreaterThan(0);
      expect(m.idealTimeOfDay.length).toBeGreaterThan(0);
      expect(m.weatherFit.length).toBeGreaterThan(0);
    }
  });
});
