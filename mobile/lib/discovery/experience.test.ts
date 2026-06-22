import { describe, it, expect } from 'vitest';
import { experienceProfile, experienceTags } from './experience';
import type { TogetherMoment } from '../together';

function moment(over: Partial<TogetherMoment> = {}): TogetherMoment {
  return {
    id: 'm',
    title: 't',
    idea: 'i',
    category: 'calm',
    spaceTypes: ['couple'],
    priceBand: '€€',
    indoorOutdoor: 'flexible',
    avgDurationMin: 60,
    energy: 'low',
    idealTimeOfDay: ['evening'],
    weatherFit: ['any'],
    linkedCardIds: [],
    ...over,
  };
}

describe('experienceProfile', () => {
  it('reads a calm, low-energy idea as quiet, relaxing, good for talking + reconnecting', () => {
    const p = experienceProfile(moment({ category: 'calm', energy: 'low' }));
    expect(p).toMatchObject({
      conversation: true,
      pace: 'quiet',
      effort: 'relaxing',
      reconnecting: true,
    });
  });

  it('reads a high-energy idea as lively + active, not quiet/relaxing', () => {
    const p = experienceProfile(moment({ category: 'play', energy: 'high' }));
    expect(p.pace).toBe('lively');
    expect(p.effort).toBe('active');
    expect(p.conversation).toBe(false);
  });

  it('marks short, cheap ideas as spontaneous', () => {
    expect(experienceProfile(moment({ avgDurationMin: 60, priceBand: 'free' })).spontaneous).toBe(true);
    expect(experienceProfile(moment({ avgDurationMin: 180, priceBand: 'free' })).spontaneous).toBe(false);
    expect(experienceProfile(moment({ avgDurationMin: 60, priceBand: '€€€' })).spontaneous).toBe(false);
  });

  it('marks gentle, affordable, not-too-long ideas as first-date friendly', () => {
    expect(experienceProfile(moment({ energy: 'low', avgDurationMin: 90, priceBand: '€' })).firstDate).toBe(true);
    expect(experienceProfile(moment({ energy: 'high' })).firstDate).toBe(false);
    expect(experienceProfile(moment({ priceBand: '€€€' })).firstDate).toBe(false);
    expect(experienceProfile(moment({ avgDurationMin: 200 })).firstDate).toBe(false);
  });

  it('leaves pace/effort null for medium energy', () => {
    const p = experienceProfile(moment({ energy: 'medium', category: 'create' }));
    expect(p.pace).toBeNull();
    expect(p.effort).toBeNull();
  });
});

describe('experienceTags', () => {
  it('labels every tag as estimated and bilingual', () => {
    const tags = experienceTags(moment());
    expect(tags.length).toBeGreaterThan(0);
    for (const tg of tags) {
      expect(tg.provenance).toBe('estimated');
      expect(tg.label).toHaveLength(2);
    }
  });

  it('never claims live provenance', () => {
    for (const tg of experienceTags(moment({ energy: 'high', category: 'play' }))) {
      expect(tg.provenance).not.toBe('verified-live');
    }
  });

  it('does not include contradictory pace tags', () => {
    const keys = experienceTags(moment({ energy: 'low' })).map((tg) => tg.key);
    expect(keys).toContain('quiet');
    expect(keys).not.toContain('lively');
  });
});
