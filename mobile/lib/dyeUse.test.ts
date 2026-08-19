import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Der Wächter für „Batik leise".
 *
 * Alicia hat unter fünf Entwürfen den gewählt, bei dem die Färbung NICHT den
 * ganzen Bildschirm trägt: „Papier bleibt der Grund. Skaliert besser: bei
 * vierzig Momenten erschlägt einen keine Farbfläche."
 *
 * Genau das ist die Sorte Entscheidung, die beim nächsten schönen Einfall
 * still verwässert — eine Färbung hier, eine dort, und nach drei Runden ist
 * der Bildschirm ein Farbkasten. Also steht sie als Zahl im Test: höchstens
 * ZWEI gefärbte Flächen je Datei (zwei, weil eine Liste ihre Kachel pro
 * Eintrag rendert und das eine Fläche ist, kein Bildschirm voll).
 *
 * Was der Test NICHT kann: sehen, wie groß die Flächen sind. Ein `DyeField`,
 * das den halben Bildschirm füllt, zählt hier wie ein Kopfband. Das bleibt
 * Urteilsfrage im Skill `klarheit`.
 */
const WURZEL = path.resolve(__dirname, '..');

function dateien(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...dateien(p));
    else if (/\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
}

const QUELLEN = ['app', 'components']
  .flatMap((d) => dateien(path.join(WURZEL, d)))
  // Die Fläche selbst darf sich natürlich benutzen.
  .filter((f) => !f.endsWith('DyeField.tsx'));

describe('Batik leise — die Färbung bleibt selten', () => {
  it('höchstens zwei gefärbte Flächen je Bildschirm', () => {
    const zuViel: string[] = [];
    for (const f of QUELLEN) {
      const n = (fs.readFileSync(f, 'utf8').match(/<DyeField\b/g) ?? []).length;
      if (n > 2) zuViel.push(`${path.relative(WURZEL, f)}: ${n}`);
    }
    expect(zuViel, `zu viele Färbungen: ${zuViel.join(' · ')}`).toEqual([]);
  });

  it('keine Schrift in fester Farbe auf einer Färbung', () => {
    // Die Tinte auf einer Färbung wird IMMER gerechnet (`editionInk`), weil
    // die Fläche je Edition eine andere ist. Eine fest gesetzte Farbe darauf
    // stimmt höchstens für eine der dreizehn Welten — das ist die Falle, die
    // im Kontrast-Durchgang fünf Runden gekostet hat.
    const verdaechtig: string[] = [];
    for (const f of QUELLEN) {
      const quelle = fs.readFileSync(f, 'utf8');
      if (!quelle.includes('<DyeField')) continue;
      // Innerhalb eines DyeField-Blocks: eine feste Farbe aus der Palette.
      for (const block of quelle.split('<DyeField').slice(1)) {
        const bis = block.indexOf('</DyeField>');
        const inhalt = bis === -1 ? block.slice(0, 900) : block.slice(0, bis);
        const treffer = inhalt.match(/color:\s*Colors\.(white|text|textMuted|textSubtle|textFaint)/);
        if (treffer) verdaechtig.push(`${path.relative(WURZEL, f)}: ${treffer[0]}`);
      }
    }
    expect(
      verdaechtig,
      `feste Schriftfarbe auf einer Färbung — gehört durch editionInk(): ${verdaechtig.join(' · ')}`,
    ).toEqual([]);
  });

  it('findet überhaupt Färbungen (sonst prüft der Test nichts)', () => {
    const mit = QUELLEN.filter((f) => fs.readFileSync(f, 'utf8').includes('<DyeField'));
    expect(mit.length, 'keine einzige gefärbte Fläche gefunden').toBeGreaterThanOrEqual(5);
  });
});
