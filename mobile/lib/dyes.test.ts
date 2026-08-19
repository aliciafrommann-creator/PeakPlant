import { describe, it, expect } from 'vitest';
import { DYES, dyeFor } from '../constants/dyes';
import { SEED_EDITIONS } from './seed';
import { Colors } from '../constants/colors';
import { contrastRatio, luminance } from './contrast';
import { editionInk, editionInkPassesAA } from './editionInk';

/**
 * Der Wächter für die Batik-Farbwelten.
 *
 * Eine Färbung ist hübsch und gefährlich zugleich: Sie ist der Untergrund für
 * Schrift, und ein Untergrund, den niemand nachrechnet, ist genau der Fehler,
 * der uns im Kontrast-Durchgang fünf Runden gekostet hat. Deshalb steht das
 * Rezept unter Prüfung, bevor es je einen Bildschirm erreicht.
 */
describe('Batik-Farbwelten', () => {
  it('jede Edition hat eine Färbung', () => {
    const ohne = SEED_EDITIONS.filter((e) => !dyeFor(e.id)).map((e) => e.id);
    expect(ohne, `ohne Färbung: ${ohne.join(', ')}`).toEqual([]);
  });

  it('keine Färbung ohne Edition', () => {
    // Eine Welt für eine Edition, die es nicht gibt, ist toter Code, der beim
    // nächsten Lesen wie eine Zusage aussieht.
    const ids = new Set(SEED_EDITIONS.map((e) => e.id));
    const verwaist = Object.keys(DYES).filter((k) => !ids.has(k));
    expect(verwaist, `ohne Edition: ${verwaist.join(', ')}`).toEqual([]);
  });

  it('auf jedem Grundton trägt EINE der beiden Tinten', () => {
    // Nicht „hell genug" und nicht „dunkel genug", sondern: nicht dazwischen.
    // Eine Welt darf leuchten (dunkle Schrift drauf) oder tief sein
    // (Papierschrift drauf) — hängen bleiben darf sie nicht.
    const durchgefallen = Object.entries(DYES)
      .filter(([, d]) => !editionInkPassesAA(d.ground))
      .map(([id, d]) => {
        const beste = contrastRatio(d.ground, editionInk(d.ground));
        return `${id} ${d.ground} → bestenfalls ${beste.toFixed(2)}:1`;
      });
    expect(durchgefallen, `keine Tinte trägt: ${durchgefallen.join(' · ')}`).toEqual([]);
  });

  it('die Färbungen leuchten mehrheitlich — sonst ist es keine Batik, sondern Nacht', () => {
    // Alicias Korrektur vom 19.08.2026 („ein bisschen extrem batik dunkel")
    // als Zahl festgehalten: Der erste Anlauf hatte ZWÖLF fast schwarze
    // Gründe. Ihre Vorbilder sind hell mit dunkler Schrift.
    const hell = Object.values(DYES).filter((d) => editionInk(d.ground) === '#1A1A1A').length;
    expect(hell, `nur ${hell} von ${Object.keys(DYES).length} Welten leuchten`).toBeGreaterThanOrEqual(8);
  });

  it('jede Welt hat Spannweite — sonst wirkt sie flach', () => {
    // Batik lebt davon, dass hell und tief nebeneinander liegen. Vier Lichter,
    // die alle so hell sind wie der Grund, ergeben eine Fläche, keinen Stoff.
    const flach: string[] = [];
    for (const [id, d] of Object.entries(DYES)) {
      const werte = [d.ground, ...d.lights].map(luminance);
      const spanne = Math.max(...werte) - Math.min(...werte);
      if (spanne < 0.18) flach.push(`${id}: Spannweite nur ${spanne.toFixed(2)}`);
    }
    expect(flach, flach.join(' · ')).toEqual([]);
  });

  it('vier verschiedene Lichter je Welt', () => {
    for (const [id, d] of Object.entries(DYES)) {
      expect(d.lights.length, id).toBe(4);
      expect(new Set(d.lights).size, `${id} hat doppelte Lichter`).toBe(4);
    }
  });

  it('jede Welt hat einen Namen, und keiner doppelt sich', () => {
    const namen = Object.values(DYES).map((d) => d.name);
    expect(namen.every((n) => n.trim().length > 0)).toBe(true);
    expect(new Set(namen).size, 'doppelte Namen').toBe(namen.length);
  });

  it('Alicias vier Welten sind als ihre gekennzeichnet', () => {
    // Damit später niemand meine abgeleiteten Rezepte für ihre Entscheidung
    // hält — und damit man sieht, welche acht noch auf sie warten.
    const ihre = Object.entries(DYES).filter(([, d]) => d.namedByAlicia).map(([id]) => id);
    expect(ihre).toEqual(['edition-01', 'edition-02', 'edition-03', 'edition-04']);
    expect(DYES['edition-02'].name).toBe('Cyber Midnight');
  });
});
