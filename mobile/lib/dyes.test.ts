import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DYES, HOUSE_DYE, dyeFor, worldFor, worldForCategory, WORLD_BY_CATEGORY, FREIE_WELTEN } from '../constants/dyes';
import { SEED_EDITIONS } from './seed';
import { CHALLENGES, WEEKLY_CHALLENGES } from './challenges';
import { CATEGORY_EMOJI } from './discovery/ideaCatalog';
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

  it('ein Zeichen je Edition — Rezept und Seed sagen dasselbe', () => {
    // In der ersten Fassung trug die Färbung ein EIGENES Emoji, neben dem
    // `symbol` der Edition aus `lib/seed.ts`. Die Sammlung zeigte das eine,
    // die Detailseite das andere: Wer auf 🌹 tippte, landete bei 🌻 — und 🌹
    // markierte in der Liste Edition 01, in der Detailansicht Edition 02.
    // Ein Zeichen, das zwei Dinge bedeutet, ist schlimmer als keines.
    const uneins = SEED_EDITIONS.filter((e) => dyeFor(e.id)?.emoji !== e.symbol).map(
      (e) => `${e.id}: Rezept ${dyeFor(e.id)?.emoji} ≠ Seed ${e.symbol}`,
    );
    expect(uneins, `zwei Zeichen für dieselbe Edition: ${uneins.join(' · ')}`).toEqual([]);
  });
});

describe('Die gedruckten Färbungen', () => {
  /**
   * WARUM DAS GEPRÜFT WIRD: Die Färbung ist ein Bild, das aus dem Rezept
   * gerendert wurde (`scripts/renderDyes.mjs`). Rezept und Bild können
   * auseinanderlaufen — jemand ändert eine Welt und vergisst, neu zu drucken.
   * Dann zeigt die App eine Färbung, die es im Code nicht mehr gibt. Genau das
   * hält der Fingerabdruck-Test unten fest; bis zum 19.08.2026 stand hier nur
   * die Behauptung, geprüft wurde es nicht.
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

  it('kein Bild, das zu einem alten Rezept gehört', () => {
    // DER TEUERSTE WÄCHTER HIER. Vorher stand nur als Kommentar da, dass
    // Rezept und Bild auseinanderlaufen können — geprüft wurde es nie. Ein
    // Prüfer hat am 19.08.2026 einen Grundton auf Knallgrün gedreht, ohne neu
    // zu drucken: dreizehn von dreizehn Tests blieben grün, und die App hätte
    // eine Färbung gezeigt, die es im Code nicht mehr gibt.
    //
    // Seitdem trägt jedes PNG den Fingerabdruck seines Rezepts in einem
    // `tEXt`-Stück (`scripts/renderDyes.mjs`). Hier wird er nachgerechnet.
    const abdruck = (d: { ground: string; lights: readonly string[] }) =>
      crypto.createHash('sha256').update(`${d.ground}|${d.lights.join(',')}`).digest('hex').slice(0, 16);

    /** Liest das `tEXt`-Stück mit dem Schlüsselwort `rezept` aus einem PNG. */
    const gedruckt = (datei: string): string | null => {
      const buf = fs.readFileSync(datei);
      let i = 8; // Signatur überspringen
      while (i + 8 <= buf.length) {
        const len = buf.readUInt32BE(i);
        const typ = buf.toString('ascii', i + 4, i + 8);
        if (typ === 'tEXt') {
          const roh = buf.toString('latin1', i + 8, i + 8 + len);
          const [schluessel, wert] = roh.split('\0');
          if (schluessel === 'rezept') return wert;
        }
        i += 12 + len;
      }
      return null;
    };

    const alt: string[] = [];
    const welten: [string, { ground: string; lights: readonly string[] }][] = [
      ...Object.entries(DYES),
      ['house', HOUSE_DYE],
    ];
    for (const [id, dye] of welten) {
      const ist = gedruckt(path.join(ORDNER, `${id}.png`));
      const soll = abdruck(dye);
      if (ist !== soll) alt.push(`${id}: Bild ${ist ?? 'ohne Fingerabdruck'}, Rezept ${soll}`);
    }
    expect(
      alt,
      `Rezept geändert, aber nicht neu gedruckt (\`node scripts/renderDyes.mjs\`): ${alt.join(' · ')}`,
    ).toEqual([]);
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

describe('Welten nach Thema (Entscheidung 028)', () => {
  it('jede Kategorie hat eine Welt, und keine teilt sich eine', () => {
    // Die Farbe ist eine zweite Beschriftung. Zwei Kategorien in derselben
    // Welt hieße: zwei Bedeutungen, ein Zeichen — schlimmer als gar keine
    // Farbe, weil es Ordnung vortäuscht.
    const kategorien = Object.keys(CATEGORY_EMOJI);
    const ohne = kategorien.filter((k) => !WORLD_BY_CATEGORY[k]);
    expect(ohne, `Kategorie ohne Welt: ${ohne.join(', ')}`).toEqual([]);

    const welten = kategorien.map((k) => WORLD_BY_CATEGORY[k]);
    expect(new Set(welten).size, 'zwei Kategorien in derselben Welt').toBe(kategorien.length);

    const unbekannt = welten.filter((w) => !DYES[w]);
    expect(unbekannt, `Welt gibt es nicht: ${unbekannt.join(', ')}`).toEqual([]);
  });

  it('die themenfreien Welten sind wirklich frei', () => {
    // Eine Fläche ohne Thema darf nie zufällig aussehen wie „Essen".
    expect(FREIE_WELTEN.length, 'keine themenfreie Welt übrig').toBeGreaterThan(0);
    const kollision = FREIE_WELTEN.filter((w) => Object.values(WORLD_BY_CATEGORY).includes(w));
    expect(kollision, `belegt und frei zugleich: ${kollision.join(', ')}`).toEqual([]);
  });

  it('eine Challenge ohne Thema landet in einer freien Welt', () => {
    const ohneThema = [...CHALLENGES, ...WEEKLY_CHALLENGES].filter((c) => !c.category);
    expect(ohneThema.length, 'keine themenlose Challenge zum Prüfen').toBeGreaterThan(0);
    for (const c of ohneThema) {
      expect(FREIE_WELTEN, `${c.id} bekäme eine Themen-Welt`).toContain(
        worldForCategory(c.category, c.id),
      );
    }
  });

  it('fest, nicht zufällig — derselbe Schlüssel gibt immer dieselbe Welt', () => {
    // Eine Fläche, die bei jedem Laden die Farbe wechselt, fühlt sich kaputt
    // an. Deshalb ist hier ein Hash und kein Zufall.
    for (const k of ['ch-1', 'wk-3', 'space-42']) {
      expect(worldFor(k)).toBe(worldFor(k));
      expect(worldForCategory(undefined, k)).toBe(worldForCategory(undefined, k));
    }
    expect(DYES[worldFor('irgendwas')]).toBeDefined();
  });

  it('keine zwei Challenges NEBENEINANDER teilen sich eine Welt', () => {
    // DAS ist der eigentliche Punkt: Nicht Farbe in einer Liste war das
    // Problem, sondern DIESELBE Farbe untereinander.
    //
    // Geprüft wird die Liste, die ein Mensch WIRKLICH sieht — nach Space-Art
    // gefiltert. Der erste Anlauf prüfte die Rohliste; darin stehen Solo- und
    // Paar-Challenges verschränkt, und zwei Nachbarn dort landen im Betrieb
    // nie untereinander. Ein Wächter, der etwas anderes prüft als das, was
    // gezeigt wird, findet die falschen Fehler.
    for (const typ of ['couple', 'friends', 'solo'] as const) {
      for (const liste of [CHALLENGES, WEEKLY_CHALLENGES]) {
        const sichtbar = liste.filter((c) => c.spaceTypes.includes(typ));
        const doppelt: string[] = [];
        for (let i = 1; i < sichtbar.length; i++) {
          const a = worldForCategory(sichtbar[i - 1].category, sichtbar[i - 1].id);
          const b = worldForCategory(sichtbar[i].category, sichtbar[i].id);
          if (a === b) doppelt.push(`${sichtbar[i - 1].id} und ${sichtbar[i].id} (${typ})`);
        }
        expect(doppelt, `gleiche Welt direkt untereinander: ${doppelt.join(' · ')}`).toEqual([]);
      }
    }
  });

  it('das Thema einer Challenge gibt es wirklich', () => {
    // Eine Kategorie, die der Ideen-Katalog nicht kennt, wäre eine tote
    // Angabe — die Färbung fiele still auf eine freie Welt zurück und sähe
    // aus wie „kein Thema".
    const erfunden = [...CHALLENGES, ...WEEKLY_CHALLENGES]
      .filter((c) => c.category && !CATEGORY_EMOJI[c.category])
      .map((c) => `${c.id}: ${c.category}`);
    expect(erfunden, `Kategorie gibt es nicht: ${erfunden.join(', ')}`).toEqual([]);
  });
});
