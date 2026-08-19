import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { DYES, HOUSE_DYE } from '../constants/dyes';
import { contrastRatio, AA_SMALL_TEXT } from './contrast';
import { editionInk } from './editionInk';

/**
 * Der Wächter, der beinahe gefehlt hätte — und der teuerste Fund dieser Runde.
 *
 * Alle Kontrast-Wächter bis hierher rechneten gegen den GRUNDTON. Eine Färbung
 * ist aber ein BILD: Die Lichter sind heller als der Grund, die Störung hebt
 * und senkt zusätzlich. Schrift sitzt nicht auf dem Grund, sondern auf dem
 * Bild.
 *
 * Am 19.08.2026 zum ersten Mal am echten PNG nachgemessen: Die Gründe trugen
 * ihre Tinte mit 5–13:1, die hellsten Punkte der Bilder aber nur mit
 * 1,55–3,94:1. ZWÖLF von dreizehn Welten wären an ihrer schlechtesten Stelle
 * durchgefallen, und kein Test hätte angeschlagen.
 *
 * Deshalb prüft dieser hier nicht das Rezept, sondern das AUSGELIEFERTE BILD,
 * Punkt für Punkt. Das ist der einzige Ort, an dem die Frage „kann man das
 * lesen?" wirklich beantwortet wird.
 */
const ORDNER = path.resolve(__dirname, '..', 'assets', 'dyes');

/** PNG lesen. Der Drucker schreibt mit Filter 0, also ist jede Zeile roh. */
function punkte(datei: string): [number, number, number][] {
  const buf = fs.readFileSync(datei);
  let off = 8;
  let w = 0;
  let h = 0;
  const idat: Buffer[] = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const typ = buf.toString('ascii', off + 4, off + 8);
    const daten = buf.subarray(off + 8, off + 8 + len);
    if (typ === 'IHDR') {
      w = daten.readUInt32BE(0);
      h = daten.readUInt32BE(4);
    }
    if (typ === 'IDAT') idat.push(daten);
    off += 12 + len;
  }
  const roh = zlib.inflateSync(Buffer.concat(idat));
  const out: [number, number, number][] = [];
  for (let y = 0; y < h; y++) {
    const zeile = y * (w * 3 + 1);
    // Ein anderer Filter würde hier still falsche Farben ergeben — lieber laut.
    if (roh[zeile] !== 0) throw new Error(`${path.basename(datei)}: Filter ${roh[zeile]}, erwartet 0`);
    for (let x = 0; x < w; x++) {
      const i = zeile + 1 + x * 3;
      out.push([roh[i], roh[i + 1], roh[i + 2]]);
    }
  }
  return out;
}

const WELTEN = [...Object.entries(DYES), ['house', HOUSE_DYE] as const];

describe('Die gedruckten Färbungen tragen ihre Schrift überall', () => {
  it('jeder einzelne Punkt jedes Bildes', () => {
    const durchgefallen: string[] = [];
    for (const [id, dye] of WELTEN) {
      const tinte = editionInk(dye.ground);
      let schlechtest = Infinity;
      for (const p of punkte(path.join(ORDNER, `${id}.png`))) {
        const v = contrastRatio(tinte, `#${p.map((c) => c.toString(16).padStart(2, '0')).join('')}`);
        if (v < schlechtest) schlechtest = v;
      }
      if (schlechtest < AA_SMALL_TEXT) {
        durchgefallen.push(`${id}: schlechtester Punkt ${schlechtest.toFixed(2)}:1`);
      }
    }
    expect(
      durchgefallen,
      `Schrift bricht an der hellsten/dunkelsten Stelle ein:\n  ${durchgefallen.join('\n  ')}`,
    ).toEqual([]);
  });

  it('die Bilder sind trotzdem lebendig, nicht flachgebügelt', () => {
    // Die Gegenrichtung, und sie ist genauso wichtig: Man könnte jedes Bild
    // sicher machen, indem man es zur Fläche zusammenzieht. Dann wäre es keine
    // Batik mehr, sondern ein Rechteck. Also muss ein Bild auch Spannweite
    // haben.
    const flach: string[] = [];
    for (const [id] of WELTEN) {
      const ps = punkte(path.join(ORDNER, `${id}.png`));
      const summe = ps.map((p) => p[0] + p[1] + p[2]);
      const spanne = (Math.max(...summe) - Math.min(...summe)) / 765;
      if (spanne < 0.12) flach.push(`${id}: Spannweite nur ${spanne.toFixed(2)}`);
    }
    expect(flach, `zu flach — das ist keine Färbung mehr: ${flach.join(' · ')}`).toEqual([]);
  });
});
