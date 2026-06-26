import { describe, it, expect } from 'vitest';
import { relativeDay, formatAbsoluteDate } from './relativeTime';

const NOW = new Date('2026-06-26T12:00:00');

describe('relativeDay', () => {
  it('says today for the same calendar day', () => {
    expect(relativeDay('2026-06-26T08:00:00', 'en', NOW)).toBe('today');
    expect(relativeDay('2026-06-26T23:30:00', 'de', NOW)).toBe('heute');
  });

  it('says yesterday for one day back', () => {
    expect(relativeDay('2026-06-25T22:00:00', 'en', NOW)).toBe('yesterday');
    expect(relativeDay('2026-06-25T01:00:00', 'de', NOW)).toBe('gestern');
  });

  it('counts days within the past week', () => {
    expect(relativeDay('2026-06-23T12:00:00', 'en', NOW)).toBe('3 days ago');
    expect(relativeDay('2026-06-23T12:00:00', 'de', NOW)).toBe('vor 3 Tagen');
    expect(relativeDay('2026-06-20T12:00:00', 'en', NOW)).toBe('6 days ago');
  });

  it('falls back to an absolute date beyond a week', () => {
    expect(relativeDay('2026-06-19T12:00:00', 'en', NOW)).toBe('june 19');
    expect(relativeDay('2026-01-02T12:00:00', 'en', NOW)).toBe('january 2');
  });

  it('treats future dates (clock skew) as today', () => {
    expect(relativeDay('2026-06-27T12:00:00', 'en', NOW)).toBe('today');
  });
});

describe('formatAbsoluteDate', () => {
  it('drops the year in the current year', () => {
    expect(formatAbsoluteDate('2026-03-12T00:00:00', 'en', NOW)).toBe('march 12');
  });

  it('keeps the year for other years', () => {
    expect(formatAbsoluteDate('2025-03-12T00:00:00', 'en', NOW)).toBe('march 12, 2025');
  });
});
