import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DYES, HOUSE_DYE, dyeFor } from '../constants/dyes';
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

  it('jede Welt bringt ihr Zeichen mit', () => {
    // Alicia zu den Entwürfen: „mit den emojis haaammmer". Also gehört das
    // Zeichen zum Rezept — und keine zwei Welten teilen sich eins, sonst
    // sagt es nichts mehr.
    const zeichen = [...Object.values(DYES), HOUSE_DYE].map((d) => d.emoji);
    expect(zeichen.every((e) => e.trim().length > 0)).toBe(true);
    expect(new Set(zeichen).size, 'doppelte Zeichen').toBe(zeichen.length);
  });

  it('das Haus-Rezept trägt Schrift und ist keine Editionswelt', () => {
    // Ohne eigenes Rezept müsste sich der Startbildschirm die Welt einer
    // fremden Edition borgen — eine Aussage, die nicht stimmt.
    expect(editionInkPassesAA(HOUSE_DYE.ground)).toBe(true);
    expect(Object.values(DYES).some((d) => d.ground === HOUSE_DYE.ground)).toBe(false);
    expect(HOUSE_DYE.namedByAlicia).toBe(false);
  });

  it('Alicias vier Welten sind als ihre gekennzeichnet', () => {
    // Damit später niemand meine abgeleiteten Rezepte für ihre Entscheidung
    // hält — und damit man sieht, welche acht noch auf sie warten.
    const ihre = Object.entries(DYES).filter(([, d]) => d.namedByAlicia).map(([id]) => id);
    expect(ihre).toEqual(['edition-01', 'edition-02', 'edition-03', 'edition-04']);
    expect(DYES['edition-02'].name).toBe('Cyber Midnight');
  });
});

describe('Die gedruckten Färbungen', () => {
  /**
   * WARUM DAS GEPRÜFT WIRD: Die Färbung ist ein Bild, das aus dem Rezept
   * gerendert wurde (`scripts/renderDyes.mjs`). Rezept und Bild können
   * auseinanderlaufen — jemand ändert eine Welt und vergisst, neu zu drucken.
   * Dann zeigt die App eine Färbung, die es im Code nicht mehr gibt.
   */
  const ORDNER = path.resolve(__dirname, '..', 'assets', 'dyes');

  it('zu jeder Welt gibt es ein Bild, und zum Haus auch', () => {
    const fehlend = [...Object.keys(DYES), 'house'].filter(
      (id) => !fs.existsSync(path.join(ORDNER, `${id}.png`)),
    );
    expect(fehlend, `nicht gedruckt: ${fehlend.join(', ')}`).toEqual([]);
  });

  it('kein Bild ohne Rezept', () => {
    const erlaubt = new Set([...Object.keys(DYES), 'house']);
    const verwaist = fs
      .readdirSync(ORDNER)
      .filter((f) => f.endsWith('.png'))
      .map((f) => f.replace('.png', ''))
      .filter((id) => !erlaubt.has(id));
    expect(verwaist, `Bild ohne Rezept: ${verwaist.join(', ')}`).toEqual([]);
  });

  it('die Bilder bleiben klein genug fürs Bundle', () => {
    // Bei voller Auflösung waren die dreizehn zusammen 1,5 MB. Das ist die
    // Grenze, ab der eine Färbung teuer wird statt schön.
    const gesamt = fs
      .readdirSync(ORDNER)
      .filter((f) => f.endsWith('.png'))
      .reduce((summe, f) => summe + fs.statSync(path.join(ORDNER, f)).size, 0);
    expect(gesamt / 1024, `${(gesamt / 1024).toFixed(0)} KB`).toBeLessThan(400);
  });
});
