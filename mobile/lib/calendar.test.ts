import { describe, it, expect } from 'vitest';
import { buildICS, formatPlanDate, parsePlanDate } from './calendar';

const now = new Date('2026-06-28T10:00:00Z');

describe('buildICS', () => {
  it('produces a valid VCALENDAR/VEVENT block', () => {
    const ics = buildICS({ title: 'Picnic in the park' }, now);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
  });

  it('includes the idea title as SUMMARY', () => {
    const ics = buildICS({ title: 'Sunset Hike' }, now);
    expect(ics).toContain('SUMMARY:Sunset Hike');
  });

  it('includes the deep link in DESCRIPTION but not planning notes', () => {
    const ics = buildICS({ title: 'Sunset Hike', dateText: 'Saturday', link: 'https://peak-plant.com/i/moment-42' }, now);
    expect(ics).toContain('https://peak-plant.com/i/moment-42');
    expect(ics).toContain('Saturday');
    expect(ics).not.toContain('planning_notes');
  });

  it('escapes semicolons and commas in the title', () => {
    const ics = buildICS({ title: 'Dinner, wine; cheese' }, now);
    expect(ics).toContain('SUMMARY:Dinner\\, wine\\; cheese');
  });

  it('uses full-day DTSTART;VALUE=DATE so no wrong timezone is assumed', () => {
    const ics = buildICS({ title: 'Movie night' }, now);
    expect(ics).toMatch(/DTSTART;VALUE=DATE:\d{8}/);
    expect(ics).toMatch(/DTEND;VALUE=DATE:\d{8}/);
  });

  it('DTEND is the day after DTSTART (single-day event)', () => {
    const ics = buildICS({ title: 'Hike' }, now);
    const dtstart = ics.match(/DTSTART;VALUE=DATE:(\d{8})/)?.[1];
    const dtend = ics.match(/DTEND;VALUE=DATE:(\d{8})/)?.[1];
    expect(dtstart).toBe('20260628');
    expect(dtend).toBe('20260629');
  });

  it('uses the planned ISO day instead of the export day', () => {
    const ics = buildICS({ title: 'Hike', dateText: '2026-07-04' }, now);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260704');
    expect(ics).toContain('DTEND;VALUE=DATE:20260705');
  });

  it('accepts common German dates and weekday shortcuts', () => {
    expect(formatPlanDate(parsePlanDate('04.07.2026', now)!)).toBe('2026-07-04');
    expect(formatPlanDate(parsePlanDate('Samstag', now)!)).toBe('2026-07-04');
    expect(formatPlanDate(parsePlanDate('morgen', now)!)).toBe('2026-06-29');
  });

  it('rejects impossible or ambiguous free text', () => {
    expect(parsePlanDate('31.02.2026', now)).toBeNull();
    expect(parsePlanDate('irgendwann im Sommer', now)).toBeNull();
    expect(() => buildICS({ title: 'Hike', dateText: 'irgendwann im Sommer' }, now)).toThrow();
  });

  it('has a unique UID per call', () => {
    const a = buildICS({ title: 'Walk' }, new Date('2026-06-28T10:00:00Z'));
    const b = buildICS({ title: 'Walk' }, new Date('2026-06-28T11:00:00Z'));
    const uidA = a.match(/UID:(.+)/)?.[1];
    const uidB = b.match(/UID:(.+)/)?.[1];
    expect(uidA).not.toBe(uidB);
  });
});
