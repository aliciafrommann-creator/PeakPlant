import { describe, it, expect } from 'vitest';
import { contrastRatio, composite, bestInk, luminance, parseHex, AA_SMALL_TEXT } from './contrast';
import { Colors } from '../constants/colors';

/** Gegen bekannte Werte geeicht, bevor irgendetwas darauf aufbaut. */
describe('contrastRatio — geeicht', () => {
  it('trifft die Extreme exakt', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('ist symmetrisch', () => {
    expect(contrastRatio('#F2B705', '#1A1A1A')).toBeCloseTo(contrastRatio('#1A1A1A', '#F2B705'), 10);
  });

  it('trifft die von Hand gerechneten Werte aus constants/colors.ts', () => {
    const papier = Colors.background;
    expect(contrastRatio(Colors.text, papier)).toBeCloseTo(15.05, 1);
    expect(contrastRatio(Colors.textMuted, papier)).toBeCloseTo(6.54, 1);
    expect(contrastRatio(Colors.textSubtle, papier)).toBeCloseTo(4.55, 1);
    expect(contrastRatio(Colors.textFaint, papier)).toBeCloseTo(3.03, 1);
    expect(contrastRatio(Colors.textFaint, Colors.text)).toBeCloseTo(4.97, 1);
  });

  it('versteht Kurzform und weist Unsinn ab', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(() => parseHex('rot')).toThrow();
  });

  it('luminanz steigt monoton mit Helligkeit', () => {
    expect(luminance('#000000')).toBeLessThan(luminance('#808080'));
    expect(luminance('#808080')).toBeLessThan(luminance('#FFFFFF'));
  });
});

describe('composite — der Fehler, wegen dem es diese Datei gibt', () => {
  it('volle Deckkraft ändert nichts, null Deckkraft ist der Grund', () => {
    expect(composite('#000000', 1, '#FFFFFF')).toEqual({ r: 0, g: 0, b: 0 });
    expect(composite('#000000', 0, '#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });

  /**
   * Teiltransparenz senkt den Kontrast, ohne dass ein Farbname sich ändert —
   * genau daran ist der erste Kontrast-Durchgang vorbeigelaufen.
   */
  it('zeigt, dass Transparenz den Kontrast frisst', () => {
    const voll = contrastRatio('#1A1A1A', '#F2B705');
    const halb = contrastRatio(composite('#1A1A1A', 0.5, '#F2B705'), '#F2B705');
    expect(voll).toBeGreaterThan(AA_SMALL_TEXT);
    expect(halb).toBeLessThan(AA_SMALL_TEXT);
  });
});

describe('bestInk', () => {
  it('wählt hell auf dunkel und dunkel auf hell', () => {
    expect(bestInk('#1A1A1A', '#1A1A1A', '#FAF7F0')).toBe('#FAF7F0');
    expect(bestInk('#F2B705', '#1A1A1A', '#FAF7F0')).toBe('#1A1A1A');
  });

  it('schlägt eine von Hand gesetzte Tinte, wo diese falsch liegt', () => {
    // Edition 08 (#E8633A) TRUG im Seed ink='light'; gerechnet ist dunkel klar
    // besser (5,20 statt 3,13). Die Handangabe ist seit dem 18.08.2026
    // korrigiert — dieser Test hält die Rechnung fest, die das gefunden hat.
    // (Dass Seed und Rechnung übereinstimmen, prüft lib/editionInk.test.ts.)
    expect(bestInk('#E8633A', '#1A1A1A', '#FAF7F0')).toBe('#1A1A1A');
  });
});
