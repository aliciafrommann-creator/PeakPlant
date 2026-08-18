import { describe, it, expect } from 'vitest';
import { computePeaks, PEAK_ROW_MAX } from './peaks';

describe('computePeaks', () => {
  it('zählt einen Peak pro festgehaltenem Moment', () => {
    expect(computePeaks(0).count).toBe(0);
    expect(computePeaks(1).count).toBe(1);
    expect(computePeaks(7).count).toBe(7);
  });

  it('deckelt die sichtbare Reihe und weist den Rest aus', () => {
    const r = computePeaks(PEAK_ROW_MAX + 5);
    expect(r.visible).toBe(PEAK_ROW_MAX);
    expect(r.overflow).toBe(5);
    expect(r.visible + r.overflow).toBe(r.count);
  });

  it('zeigt keinen Überhang, solange die Reihe reicht', () => {
    const r = computePeaks(3);
    expect(r.visible).toBe(3);
    expect(r.overflow).toBe(0);
  });

  // Die Grenze aus MANIFESTO §3, als Test festgehalten: Peaks dürfen nie
  // kleiner werden. Wer eine Verfalls- oder Abzugsregel einbaut, bricht hier.
  it('kann durch mehr Momente nie kleiner werden', () => {
    let last = -1;
    for (let moments = 0; moments <= 40; moments++) {
      const now = computePeaks(moments).count;
      expect(now).toBeGreaterThanOrEqual(last);
      last = now;
    }
  });

  it('erfindet bei kaputten Eingaben nichts, sondern zeigt null', () => {
    expect(computePeaks(-3).count).toBe(0);
    expect(computePeaks(Number.NaN).count).toBe(0);
    expect(computePeaks(2.7).count).toBe(2);
  });
});
