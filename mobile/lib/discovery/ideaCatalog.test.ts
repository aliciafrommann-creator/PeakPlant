import { describe, expect, it } from 'vitest';
import {
  IDEA_CATALOG,
  ideaById,
  filterIdeas,
  activeFilterCount,
  CATEGORY_EMOJI,
} from './ideaCatalog';

describe('idea catalog', () => {
  it('builds a large catalog', () => {
    expect(IDEA_CATALOG.length).toBeGreaterThan(1000);
  });

  it('has unique ids and titles', () => {
    const ids = new Set(IDEA_CATALOG.map((i) => i.id));
    const titles = new Set(IDEA_CATALOG.map((i) => i.title));
    expect(ids.size).toBe(IDEA_CATALOG.length);
    expect(titles.size).toBe(IDEA_CATALOG.length);
  });

  it('never produces double articles or "a <vowel>" titles', () => {
    const base = (t: string) => t.replace(/ ·.*/, '');
    const bad = IDEA_CATALOG.filter((i) => {
      const t = base(i.title);
      return /\b(a|an|the) (a|an) /i.test(` ${t}`) || /\ba [aeiou]/i.test(t);
    });
    expect(bad.map((i) => i.title)).toEqual([]);
  });

  it('gives every idea complete, valid metadata', () => {
    for (const idea of IDEA_CATALOG) {
      expect(idea.title.length).toBeGreaterThan(0);
      expect(idea.idea.length).toBeGreaterThan(0);
      expect(idea.spaceTypes.length).toBeGreaterThan(0);
      expect(idea.idealTimeOfDay.length).toBeGreaterThan(0);
      expect(idea.season.length).toBeGreaterThan(0);
      expect(CATEGORY_EMOJI[idea.category]).toBeTruthy();
      expect(idea.avgDurationMin).toBeGreaterThan(0);
    }
  });

  it('looks up by id', () => {
    const first = IDEA_CATALOG[0];
    expect(ideaById(first.id)).toEqual(first);
    expect(ideaById('nope')).toBeUndefined();
  });

  it('returns the whole catalog for an empty filter', () => {
    expect(filterIdeas({}).length).toBe(IDEA_CATALOG.length);
  });

  it('filters by budget inclusively (cheaper passes a higher cap)', () => {
    const free = filterIdeas({ maxBudget: 'free' });
    expect(free.every((i) => i.priceBand === 'free')).toBe(true);
    const upToCheap = filterIdeas({ maxBudget: '€€' });
    expect(upToCheap.every((i) => ['free', '€', '€€'].includes(i.priceBand))).toBe(true);
    expect(upToCheap.length).toBeGreaterThan(free.length);
  });

  it('filters by space type, time, energy and category', () => {
    const r = filterIdeas({ spaceType: 'couple', timeOfDay: 'evening', energy: 'low', category: 'calm' });
    expect(r.length).toBeGreaterThan(0);
    for (const i of r) {
      expect(i.spaceTypes).toContain('couple');
      expect(i.idealTimeOfDay).toContain('evening');
      expect(i.energy).toBe('low');
      expect(i.category).toBe('calm');
    }
  });

  it('treats indoorOutdoor "flexible" ideas as always matching a setting filter', () => {
    const outdoor = filterIdeas({ indoorOutdoor: 'outdoor' });
    expect(outdoor.some((i) => i.indoorOutdoor === 'flexible')).toBe(true);
    expect(outdoor.every((i) => i.indoorOutdoor !== 'indoor')).toBe(true);
  });

  it('matches season including "any" ideas', () => {
    const summer = filterIdeas({ season: 'summer' });
    expect(summer.every((i) => i.season.includes('summer') || i.season.includes('any'))).toBe(true);
  });

  it('searches across title, idea text and tags', () => {
    const r = filterIdeas({ query: 'sourdough' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((i) => /sourdough/i.test(`${i.title} ${i.idea} ${i.tags.join(' ')}`))).toBe(true);
  });

  it('counts active facets', () => {
    expect(activeFilterCount({})).toBe(0);
    expect(activeFilterCount({ spaceType: 'couple', energy: 'low', query: 'x' })).toBe(3);
    expect(activeFilterCount({ query: '   ' })).toBe(0);
  });
});
