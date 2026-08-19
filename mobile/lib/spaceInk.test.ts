import { describe, it, expect } from 'vitest';
import { SPACE_COLORS } from './spaceColors';
import { Colors } from '../constants/colors';
import { bestInk, contrastRatio, AA_SMALL_TEXT } from './contrast';

/**
 * Der Wächter für die Space-Punkte — das Gegenstück zu `editionInk.test.ts`.
 *
 * WARUM ER FEHLTE UND WAS DAS GEKOSTET HAT: Für die zwölf Editionsfarben gab
 * es diesen Test seit dem 18.08.2026, und er hat Edition 09 gefunden (eine
 * Farbe, auf der KEINE Tinte reicht). Für die sieben Space-Farben gab es ihn
 * nicht — und genau dasselbe Problem stand dort zweimal drin: Auf Chili
 * (3,80 / 4,47) und Blossom (4,17 / 4,08) blieb mit `Colors.text` als dunkler
 * Tinte beides unter 4,5:1. Aufgefallen ist es einem Menschen beim
 * Gegenlesen, nicht dem Test.
 *
 * Die Lösung war nicht, die Farben zu ändern, sondern die dunkle Tinte:
 * `Colors.black` statt des wärmeren `Colors.text`. Das Zeichen im Punkt trägt
 * Bedeutung (♥ heißt Paar) — also gilt die Textschwelle, nicht die 3:1 für
 * reine Grafik.
 */
describe('Space-Punkte tragen ihr Zeichen', () => {
  const DUNKEL = Colors.black;
  const HELL = Colors.white;

  it('auf jeder Punktfarbe reicht eine der beiden Tinten', () => {
    const durchgefallen = SPACE_COLORS.filter(
      (c) => contrastRatio(c, bestInk(c, DUNKEL, HELL)) < AA_SMALL_TEXT,
    ).map((c) => `${c} → ${contrastRatio(c, bestInk(c, DUNKEL, HELL)).toFixed(2)}:1`);
    expect(
      durchgefallen,
      `unter ${AA_SMALL_TEXT}:1, selbst mit der besseren Tinte: ${durchgefallen.join(' · ')}`,
    ).toEqual([]);
  });

  it('mit dem wärmeren `Colors.text` würden zwei Farben durchfallen', () => {
    // Der Fund als Zahl festgehalten: Wer hier auf `Colors.text` zurückgeht,
    // soll sehen, was das kostet — und nicht glauben, die Wahl sei beliebig.
    const mitText = SPACE_COLORS.filter(
      (c) => contrastRatio(c, bestInk(c, Colors.text, HELL)) < AA_SMALL_TEXT,
    );
    expect(mitText.length).toBe(2);
  });

  it('es gibt überhaupt Punktfarben (sonst prüft der Test nichts)', () => {
    expect(SPACE_COLORS.length).toBeGreaterThanOrEqual(5);
  });
});
