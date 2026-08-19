import { describe, it, expect } from 'vitest';
import { SEED_EDITIONS } from './seed';
import { composite, contrastRatio, AA_SMALL_TEXT } from './contrast';
import {
  editionInk,
  editionInkName,
  editionInkPassesAA,
  EDITION_INK_DARK,
  EDITION_INK_LIGHT,
} from './editionInk';

/**
 * Der Wächter für den Editions-Kopf und die Kartenfläche.
 *
 * Am 18.08.2026 lag auf beiden Flächen kleine Schrift mit abgeschwächter
 * Deckkraft auf zwölf verschiedenen Untergründen. Nachgerechnet: die mittlere
 * Stufe scheiterte auf elf von zwölf, die leiseste auf allen zwölf — auch auf
 * den drei Editionen, die es heute wirklich gibt. Von Hand ist das nicht zu
 * halten; ab hier rechnet es der Test.
 */
describe('Editionsfarben tragen ihre Schrift', () => {
  it('jede Editionsfarbe hat eine Tinte, die für kleine Schrift reicht', () => {
    const durchgefallen = SEED_EDITIONS.filter((e) => !editionInkPassesAA(e.color)).map(
      (e) => `${e.id} ${e.color} → ${contrastRatio(e.color, editionInk(e.color)).toFixed(2)}:1`,
    );
    expect(
      durchgefallen,
      `unter ${AA_SMALL_TEXT}:1, selbst mit der besseren Tinte: ${durchgefallen.join(' · ')}`,
    ).toEqual([]);
  });

  it('das `ink`-Feld im Seed stimmt mit der gerechneten Tinte überein', () => {
    // Das Feld ist eine Handangabe und wird bei einer neuen Farbe still
    // falsch — bei Edition 08 war es das (hell markiert, obwohl Dunkel dort
    // 5,20:1 statt 3,13:1 erreicht). Die Bildschirme rechnen die Tinte
    // inzwischen selbst; dieser Test hält das Feld ehrlich dazu.
    const falsch = SEED_EDITIONS.filter((e) => e.ink !== editionInkName(e.color)).map(
      (e) => `${e.id} sagt ${e.ink}, gerechnet ist ${editionInkName(e.color)}`,
    );
    expect(falsch, falsch.join(' · ')).toEqual([]);
  });

  it('wählt zwischen genau den zwei Tinten der Kartenfläche', () => {
    for (const e of SEED_EDITIONS) {
      expect([EDITION_INK_DARK, EDITION_INK_LIGHT]).toContain(editionInk(e.color));
    }
  });

  it('abgeschwächte Tinte wäre auf den heute erhältlichen Editionen zu wenig', () => {
    // Der eigentliche Fund, als Zahl festgehalten: dieselbe Farbe mit 62 %
    // Deckkraft ist NICHT dieselbe Farbe. Auf jeder heute erhältlichen Edition
    // fällt sie unter AA — genau das stand bis 18.08.2026 im Editions-Kopf.
    const live = SEED_EDITIONS.filter((e) => e.status === 'available');
    expect(live.length).toBeGreaterThan(0);
    for (const e of live) {
      const ink = editionInk(e.color);
      expect(contrastRatio(e.color, ink)).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
      const abgeschwaecht = composite(ink, 0.62, e.color);
      expect(
        contrastRatio(e.color, abgeschwaecht),
        `${e.id}: 62 % Deckkraft würde hier reichen — dann ist dieser Test veraltet`,
      ).toBeLessThan(AA_SMALL_TEXT);
    }
  });
});
