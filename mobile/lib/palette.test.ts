import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { Colors, Accents, AccentInks, Sections, SectionInks, Status } from '../constants/colors';
import { contrastRatio, AA_SMALL_TEXT } from './contrast';

/**
 * Der Wächter, der beim ersten Kontrast-Durchgang gefehlt hat.
 *
 * Am 18.08.2026 lief eine Durchsicht nach FARBNAMEN — alle Stellen mit
 * `Colors.textFaint`, dann alle `placeholderTextColor`. Sie fand echte Fehler
 * und übersah die schlimmeren, weil die einen anderen Namen trugen:
 *
 *   · `permissionButtonText` stand in `Colors.text` auf dunklem Grund: 1,00:1.
 *     Die Beschriftung „KAMERA ERLAUBEN" war unsichtbar.
 *   · elf Stellen setzten `Accents.*` oder `Sections.*` als 11–13-pt-Schrift,
 *     zwischen 2,14:1 und 4,28:1 — obwohl es mit `accentInk` seit einem Monat
 *     die Ink-Fassung genau dieses Gedankens gab.
 *
 * Deshalb ist die Frage hier umgedreht: nicht „wo steht dieser Farbname",
 * sondern „welche Farbe steht unter 24 pt".
 *
 * WAS DER TEST KANN UND WAS NICHT — ehrlich, sonst ist er schlimmer als
 * keiner: Ein Quelltext-Test sieht den UNTERGRUND nicht. Er kann deshalb nicht
 * sagen, ob eine helle Schrift auf einer dunklen Fläche sitzt. Was er sagen
 * kann, ist das hier, und das reicht überraschend weit:
 *
 *   **Eine Schriftfarbe unter 24 pt muss auf MINDESTENS EINEM der beiden
 *   Gründe der App bestehen — Papier (#F3F1EC) oder dunkel (#1E1C1A).**
 *
 * Eine Farbe, die auf beiden durchfällt, ist überall falsch; da braucht es
 * keinen Untergrund, um es zu wissen. Genau in diese Klasse fielen alle elf
 * Akzent-Funde (`Accents.apricot` 2,38 / 2,14, `Sections.grow` 3,27,
 * `Accents.chili` 3,96 …). `Colors.white` besteht auf Dunkel und wird
 * durchgelassen — dass es auf der RICHTIGEN Fläche sitzt, prüft weiter ein
 * Mensch (Skill `klarheit`).
 *
 * Ausnahmen sind erlaubt und müssen SICHTBAR sein: eine Zeile
 * `// kontrast-ok: <Begründung>` im selben Style-Block. Der Test zählt sie mit
 * — steigt die Zahl deutlich, ist die Regel falsch, nicht der Code.
 */

const WURZEL = path.resolve(__dirname, '..');
const ORDNER = ['app', 'components'];
const PAPIER = Colors.background;
const DUNKEL = Colors.backgroundDark;

/** Jede Farbe, die in einem Style-Block als `color:` vorkommen kann. */
const PALETTE: Record<string, string> = {
  ...Object.fromEntries(Object.entries(Colors).map(([k, v]) => [`Colors.${k}`, v])),
  ...Object.fromEntries(Object.entries(Accents).map(([k, v]) => [`Accents.${k}`, v])),
  ...Object.fromEntries(Object.entries(AccentInks).map(([k, v]) => [`AccentInks.${k}`, v])),
  ...Object.fromEntries(Object.entries(Sections).map(([k, v]) => [`Sections.${k}`, v])),
  ...Object.fromEntries(Object.entries(SectionInks).map(([k, v]) => [`SectionInks.${k}`, v])),
  ...Object.fromEntries(Object.entries(Status).map(([k, v]) => [`Status.${k}`, v])),
};

function dateien(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...dateien(p));
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const QUELLEN = ORDNER.flatMap((d) => dateien(path.join(WURZEL, d)));
const rel = (f: string) => path.relative(WURZEL, f);

/** Ein Style-Eintrag: `name: { … }` innerhalb einer StyleSheet.create-Datei. */
interface Block {
  datei: string;
  name: string;
  inhalt: string;
}

/**
 * Style-Blöcke einsammeln. Bewusst simpel: `name: {` bis zur passenden
 * schließenden Klammer, keine Verschachtelung tiefer als eine Ebene nötig.
 */
function bloecke(quelle: string, datei: string): Block[] {
  const out: Block[] = [];
  const re = /^\s{2}([A-Za-z0-9_]+):\s*\{/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(quelle))) {
    let tiefe = 1;
    let i = re.lastIndex;
    while (i < quelle.length && tiefe > 0) {
      if (quelle[i] === '{') tiefe++;
      else if (quelle[i] === '}') tiefe--;
      i++;
    }
    out.push({ datei, name: m[1], inhalt: quelle.slice(m.index, i) });
  }
  return out;
}

interface Fund {
  ort: string;
  farbe: string;
  groesse: number;
  verhaeltnis: number;
}

const alleBloecke: Block[] = [];
for (const f of QUELLEN) alleBloecke.push(...bloecke(fs.readFileSync(f, 'utf8'), f));

const AUSNAHME = /kontrast-ok:/;

function pruefe(): { funde: Fund[]; ausnahmen: number } {
  const funde: Fund[] = [];
  let ausnahmen = 0;
  for (const b of alleBloecke) {
    const groesse = b.inhalt.match(/fontSize:\s*(\d+(?:\.\d+)?)/);
    const farbe = b.inhalt.match(/(?<!background)[cC]olor:\s*((?:Colors|Accents|AccentInks|Sections|SectionInks|Status)\.[A-Za-z0-9_]+)/);
    if (!groesse || !farbe) continue;
    const pt = Number(groesse[1]);
    // WCAG: ab 24 pt normal genügen 3:1. Fett lassen wir bewusst aus — ein
    // `fontWeight` im selben Block heißt nicht, dass der Text auch fett ist.
    if (pt >= 24) continue;
    const hex = PALETTE[farbe[1]];
    if (!hex || !hex.startsWith('#')) continue;
    const aufPapier = contrastRatio(hex, PAPIER);
    const aufDunkel = contrastRatio(hex, DUNKEL);
    const v = Math.max(aufPapier, aufDunkel);
    if (v >= AA_SMALL_TEXT) continue;
    if (AUSNAHME.test(b.inhalt)) {
      ausnahmen++;
      continue;
    }
    funde.push({ ort: `${rel(b.datei)} → ${b.name}`, farbe: farbe[1], groesse: pt, verhaeltnis: v });
  }
  return { funde, ausnahmen };
}

describe('K7 — kleine Schrift trägt auf hellem Grund', () => {
  it('keine Farbe unter 24 pt, die auf BEIDEN Gründen durchfällt', () => {
    const { funde } = pruefe();
    const zeilen = funde.map(
      (f) => `${f.ort}: ${f.farbe} bei ${f.groesse}pt = bestenfalls ${f.verhaeltnis.toFixed(2)}:1`,
    );
    expect(
      zeilen,
      `unter ${AA_SMALL_TEXT}:1 auf Papier UND auf Dunkel:\n  ${zeilen.join('\n  ')}`,
    ).toEqual([]);
  });

  it('die Ausnahmen bleiben eine Handvoll, keine Gewohnheit', () => {
    // Eine Ausnahme ist ehrlich (dunkle Fläche, Nicht-Text). Dreißig wären ein
    // abgeschalteter Test im Kostüm — dann stimmt die Regel nicht mehr.
    const { ausnahmen } = pruefe();
    expect(ausnahmen).toBeLessThanOrEqual(12);
  });

  it('findet überhaupt Style-Blöcke (sonst prüft der Test nichts)', () => {
    // Ohne diese Zeile wäre ein kaputter Parser ein grüner Test.
    expect(alleBloecke.length).toBeGreaterThan(400);
  });
});
