import { describe, it, expect } from 'vitest';
import { computeSharedWeeks, weekKey } from './streaks';

// Juni 2026: der 1. ist ein Montag, Dienstage fallen also auf 2, 9, 16, 23, 30.
// Lokale Zeitangaben mitten am Tag (ohne Z) halten weekKey zeitzonenstabil.
const tue = (day: number) => `2026-06-${String(day).padStart(2, '0')}T12:00:00`;
const NOW = new Date(2026, 5, 23, 12, 0, 0); // Di 23. Juni 2026, Woche ab Mo 22.

describe('weekKey', () => {
  it('bildet einen Tag auf den Montag seiner Woche ab', () => {
    expect(weekKey(new Date(2026, 5, 23, 12))).toBe('2026-06-22');
    expect(weekKey(new Date(2026, 5, 22, 0))).toBe('2026-06-22');
  });

  it('behält das lokale Kalenderdatum, statt es über UTC zu drehen', () => {
    expect(weekKey(new Date(2026, 5, 21, 0, 30))).toBe('2026-06-15');
  });
});

describe('computeSharedWeeks', () => {
  it('gibt nichts zurück, wenn es keine Momente gibt', () => {
    expect(computeSharedWeeks([], NOW)).toEqual({ count: 0, active: false, thisWeek: false });
  });

  it('zählt jede Woche mit mindestens einem Moment', () => {
    const r = computeSharedWeeks([tue(9), tue(16), tue(23)], NOW);
    expect(r).toEqual({ count: 3, active: true, thisWeek: true });
  });

  it('zählt zwei Momente derselben Woche nur einmal', () => {
    const r = computeSharedWeeks([tue(23), '2026-06-24T09:00:00'], NOW);
    expect(r.count).toBe(1);
  });

  // Die vier Tests, die das Verhalten festhalten, wegen dem diese Datei
  // umgebaut wurde (MANIFESTO §3, Entscheidung Alicia 17.08.2026): eine
  // ausgelassene Woche darf nichts kosten.
  it('verliert bei einer Lücke nichts — anders als die frühere Serie', () => {
    // Vorher: 1 (Zählung brach an der Lücke ab). Jetzt: beide Wochen zählen.
    const r = computeSharedWeeks([tue(23), tue(9)], NOW);
    expect(r.count).toBe(2);
  });

  it('behält alles, auch wenn die laufende Woche leer ist', () => {
    // Vorher: „atRisk" — eine Warnung. Jetzt nur noch eine Tatsache.
    const r = computeSharedWeeks([tue(16)], NOW);
    expect(r).toEqual({ count: 1, active: true, thisWeek: false });
  });

  it('behält alles, auch wenn die letzte Woche lange her ist', () => {
    // Vorher: 0 — die Serie war gerissen und alles Gesammelte weg.
    const r = computeSharedWeeks([tue(2)], NOW);
    expect(r).toEqual({ count: 1, active: true, thisWeek: false });
  });

  it('kann durch Nichtstun nie kleiner werden', () => {
    const dates = [tue(2), tue(9), tue(16)];
    const early = computeSharedWeeks(dates, new Date(2026, 5, 16, 12));
    const muchLater = computeSharedWeeks(dates, new Date(2026, 11, 1, 12));
    expect(muchLater.count).toBe(early.count);
  });
});
