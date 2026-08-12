import { describe, it, expect } from 'vitest';
import {
  daysCollecting,
  busiestMonth,
  mostReturnedPlace,
  buildStoryInsights,
} from './storyInsights';

const NOW = new Date('2026-08-12T12:00:00Z');

function memoryOn(iso: string, photo = false) {
  return { createdAt: iso, note: 'x', photoUri: photo ? 'file://p.jpg' : undefined };
}

describe('daysCollecting', () => {
  it('is 0 without any moments', () => {
    expect(daysCollecting([], NOW)).toBe(0);
  });

  it('counts from the FIRST moment, inclusive', () => {
    const days = daysCollecting([memoryOn('2026-08-10T12:00:00Z'), memoryOn('2026-08-01T12:00:00Z')], NOW);
    expect(days).toBe(12);
  });

  it('never returns 0 for a moment kept today', () => {
    expect(daysCollecting([memoryOn('2026-08-12T09:00:00Z')], NOW)).toBe(1);
  });

  it('ignores unparseable dates instead of producing NaN', () => {
    expect(daysCollecting([memoryOn('not-a-date')], NOW)).toBe(0);
  });
});

describe('busiestMonth', () => {
  it('is null without moments', () => {
    expect(busiestMonth([])).toBeNull();
  });

  it('picks the month with the most moments', () => {
    const result = busiestMonth([
      memoryOn('2026-07-01T12:00:00Z'),
      memoryOn('2026-07-09T12:00:00Z'),
      memoryOn('2026-08-02T12:00:00Z'),
    ]);
    expect(result).toEqual({ month: 6, year: 2026, count: 2 });
  });

  it('breaks ties toward the more recent month', () => {
    const result = busiestMonth([memoryOn('2026-07-01T12:00:00Z'), memoryOn('2026-08-02T12:00:00Z')]);
    expect(result?.month).toBe(7);
  });
});

describe('mostReturnedPlace', () => {
  it('needs at least two visits — one visit is not a pattern', () => {
    expect(
      mostReturnedPlace([{ status: 'completed', placeName: 'Café Nordwind' }]),
    ).toBeNull();
  });

  it('counts only completed dates', () => {
    expect(
      mostReturnedPlace([
        { status: 'planned', placeName: 'Café Nordwind' },
        { status: 'planned', placeName: 'Café Nordwind' },
      ]),
    ).toBeNull();
  });

  it('returns the place with the most completed visits', () => {
    expect(
      mostReturnedPlace([
        { status: 'completed', placeName: 'Café Nordwind' },
        { status: 'completed', placeName: 'Café Nordwind' },
        { status: 'completed', placeName: 'Seebrücke' },
      ]),
    ).toEqual({ name: 'Café Nordwind', times: 2 });
  });
});

describe('buildStoryInsights', () => {
  it('says nothing at all without moments — an empty story is honest', () => {
    expect(buildStoryInsights([], [], NOW)).toEqual([]);
  });

  it('stays quiet about a favourite month until it really stands out', () => {
    const insights = buildStoryInsights(
      [memoryOn('2026-08-01T12:00:00Z'), memoryOn('2026-08-02T12:00:00Z')],
      [],
      NOW,
    );
    expect(insights.some((i) => i.de.includes('die meisten'))).toBe(false);
  });

  it('reports a favourite month, photos and a returning place from real data', () => {
    const memories = [
      memoryOn('2026-07-01T12:00:00Z', true),
      memoryOn('2026-07-08T12:00:00Z', true),
      memoryOn('2026-07-20T12:00:00Z', true),
      memoryOn('2026-08-02T12:00:00Z'),
    ];
    const dates = [
      { status: 'completed', placeName: 'Café Nordwind' },
      { status: 'completed', placeName: 'Café Nordwind' },
    ];
    const insights = buildStoryInsights(memories, dates, NOW);
    const de = insights.map((i) => i.de).join(' | ');
    expect(de).toContain('Juli');
    expect(de).toContain('3'); // three photos
    expect(de).toContain('Café Nordwind');
    // every insight has both languages filled
    expect(insights.every((i) => i.en.length > 0 && i.de.length > 0)).toBe(true);
  });
});
