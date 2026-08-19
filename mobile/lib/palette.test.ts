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
 * ZWEI REGELN, beide ohne Kenntnis des Untergrunds prüfbar:
 *
 *   **A — Ein Akzent ist eine Füllung, keine Schrift.** `Accents.*` und
 *   `Sections.*` dürfen unter 24 pt nicht als `color:` stehen; dafür gibt es
 *   `AccentInks` / `SectionInks`. Das ist die Regel, die alle elf Funde vom
 *   18.08.2026 mechanisch fängt — von `Accents.apricot` mit 2,14:1 bis
 *   `Sections.grow` mit 3,27:1 — und zwar unabhängig davon, ob sie auf Papier,
 *   Creme oder Warm liegen. Sie greift auch über einfache lokale Konstanten
 *   (`const TOGETHER = Sections.together`), an denen ein erster Anlauf
 *   vorbeigesehen hat — mit den Grenzen, die unten stehen.
 *
 *   **B — Eine Schriftfarbe aus `Colors` muss zu einem der beiden Gründe
 *   gehören.** Entweder sie besteht auf dem PAPIERTON (#F3F1EC, der dunkelste
 *   der hellen Gründe), oder sie ist eine ausdrücklich für dunklen Grund
 *   gedachte Tinte (`white`, `onDark`, `onDarkStrong`). Eine Farbe, die zu
 *   keinem von beiden gehört, ist überall falsch.
 *
 * Warum B die hellen Tinten durchlässt, statt für jede einen Marker zu
 * verlangen: Sie stehen an rund fünfzig Stellen auf gefüllten
 * Bedienelementen. Ein Test mit fünfzig Ausnahmen ist ein abgeschalteter Test
 * im Kostüm — und die Frage, ob
 * die Füllung darunter wirklich dunkel ist, kann er ohnehin nicht beantworten.
 * Diese Lücke ist real und hat gekostet: Zwei der 52 lagen auf HELLER Füllung
 * — die Haupthandlung des Startbildschirms bei 4,47:1 und das Space-Zeichen
 * bei bis zu 1,96:1. Gefunden hat sie ein Mensch, nicht dieser Test.
 *
 * WAS ER NICHT KANN, damit niemand mehr erwartet als da ist:
 *   · Er weiß nicht, WELCHE Fläche unter einem Text liegt. Weiße Schrift auf
 *     einer hellen Füllung bleibt Menschenarbeit (Skill `klarheit`) — genau so
 *     ein Fall war der Scanner über dem Live-Kamerabild.
 *   · Er sieht keine Inline-Styles, keine `color={…}`-Props im JSX und keine
 *     Farben aus `constants/typography.ts`.
 *   · Er kennt Style-Blöcke nur in `StyleSheet.create`-Form mit zwei Leerzeichen
 *     Einrückung, und keine berechneten oder roh als Hex geschriebenen Farben.
 *   · Er löst lokale Konstanten auf — aber nur EINSTUFIG, nur in
 *     GROSSSCHREIBUNG (`const TOGETHER = Sections.together`) und nur innerhalb
 *     derselben Datei. Eine Kette (`const B = A`), ein kleingeschriebener
 *     Alias, ein Objektfeld (`OBJ.ink`) oder ein Import aus einer anderen
 *     Datei gehen still durch.
 *   · Ein Block, der nur eine Farbe überschreibt (`actionTextDone`), hat kein
 *     eigenes `fontSize` — er wird über den `fontSize`-losen Zweig mitgeprüft.
 *
 * Eine frühere Fassung prüfte `max(Papier, Dunkel)` und ließ ausgerechnet die
 * Akzente durch: `Accents.apricot` besteht auf Dunkel mit 6,40:1 und wäre nie
 * gemeldet worden, obwohl 2,35:1 auf Papier der schlechteste Textwert der App
 * war.
 *
 * Ausnahmen brauchen `// kontrast-ok: <Begründung>` im Style-Block (oder in den
 * drei Zeilen darüber) und werden gezählt — steigt die Zahl deutlich, ist die
 * Regel falsch, nicht der Code.
 *
 * Größenordnung 18.08.2026: gut tausend Style-Blöcke, davon knapp fünfhundert
 * mit auflösbarer Schriftfarbe geprüft, eine Handvoll begründete Ausnahmen.
 * BEWUSST GERUNDET: Die genauen Zahlen standen hier zweimal falsch — beide
 * Male, weil derselbe Commit, der sie aufschrieb, im selben Zug einen Block
 * änderte. Eine Zahl, die bei jeder Farbänderung wandert, gehört nicht in
 * einen Kommentar; die harte Untergrenze steht im Test darunter.
 */

const WURZEL = path.resolve(__dirname, '..');
const ORDNER = ['app', 'components'];
const PAPIER = Colors.background;

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
  /** Nur der Block selbst — hier wird die Farbe gesucht. */
  inhalt: string;
  /** Block plus die drei Zeilen darüber — hier wird der Marker gesucht. */
  kontext: string;
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
    // Die drei Zeilen ÜBER dem Block zählen für den Ausnahme-Marker: bei
    // einem Einzeiler (`sheetStarOn: { color: … },`) steht die Begründung
    // zwangsläufig davor. Für die FARBE zählen sie nicht — sonst erbt jeder
    // Block die Farbe seines Vorgängers.
    const davor = quelle.slice(0, m.index).split('\n').slice(-4).join('\n');
    const inhalt = quelle.slice(m.index, i);
    out.push({ datei, name: m[1], inhalt, kontext: `${davor}\n${inhalt}` });
  }
  return out;
}

interface Fund {
  ort: string;
  farbe: string;
  groesse: number;
  verhaeltnis: number;
  grund: string;
}

const alleBloecke: Block[] = [];
for (const f of QUELLEN) alleBloecke.push(...bloecke(fs.readFileSync(f, 'utf8'), f));

const AUSNAHME = /kontrast-ok:/;

/**
 * Lokale Aliase auflösen: `const TOGETHER = Sections.together;`
 *
 * Vier echte Fehler standen genau hinter solchen Konstanten und wurden vom
 * Wächter still übersprungen — ein übersprungener Fund sieht aus wie keiner.
 */
function aliase(quelle: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /^const\s+([A-Za-z0-9_]+)\s*=\s*((?:Colors|Accents|AccentInks|Sections|SectionInks|Status)\.[A-Za-z0-9_]+)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(quelle))) out[m[1]] = m[2];
  return out;
}

const ALIASE = new Map<string, Record<string, string>>();
for (const f of QUELLEN) ALIASE.set(f, aliase(fs.readFileSync(f, 'utf8')));

/**
 * Tinten, die ausdrücklich für dunklen Grund gedacht sind (Regel B).
 * Sie können auf Papier nicht bestehen und sollen es auch nicht.
 */
const TINTEN_FUER_DUNKEL = ['Colors.white', 'Colors.onDark', 'Colors.onDarkStrong'];

/** Der Farbausdruck eines Blocks, Alias aufgelöst. */
function farbeVon(b: Block): string | null {
  const m = b.inhalt.match(
    /(?<![A-Za-z])color:\s*((?:Colors|Accents|AccentInks|Sections|SectionInks|Status)\.[A-Za-z0-9_]+|[A-Z][A-Z0-9_]*)/,
  );
  if (!m) return null;
  const roh = m[1];
  if (roh.includes('.')) return roh;
  return ALIASE.get(b.datei)?.[roh] ?? null;
}

/**
 * Die Schriftgröße eines Blocks. Ein reiner Überschreibungs-Block
 * (`actionTextDone: { color: … }`) hat keine — dann zählt er trotzdem als
 * kleine Schrift, denn er überschreibt einen Stil, der eine hat. Lieber einmal
 * zu oft geprüft als eine ganze Klasse still übersprungen.
 */
function groesseVon(b: Block): number {
  const m = b.inhalt.match(/fontSize:\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function pruefe(): { funde: Fund[]; ausnahmen: number; geprueft: number } {
  const funde: Fund[] = [];
  let ausnahmen = 0;
  let geprueft = 0;
  for (const b of alleBloecke) {
    const farbe = farbeVon(b);
    if (!farbe) continue;
    const pt = groesseVon(b);
    // WCAG: ab 24 pt normal genügen 3:1. Fett lassen wir bewusst aus — ein
    // `fontWeight` im selben Block heißt nicht, dass der Text auch fett ist.
    if (pt >= 24) continue;
    const hex = PALETTE[farbe];
    if (!hex || !hex.startsWith('#')) continue;
    geprueft++;

    const istAkzent = farbe.startsWith('Accents.') || farbe.startsWith('Sections.') || farbe.startsWith('Status.');
    const istDunkelTinte = TINTEN_FUER_DUNKEL.includes(farbe);
    const v = contrastRatio(hex, PAPIER);

    // Regel A: Akzente füllen, sie schreiben nicht.
    // Regel B: alles andere muss auf Papier bestehen oder eine Dunkel-Tinte sein.
    const inOrdnung = istAkzent ? false : istDunkelTinte || v >= AA_SMALL_TEXT;
    if (inOrdnung) continue;

    if (AUSNAHME.test(b.kontext)) {
      ausnahmen++;
      continue;
    }
    funde.push({
      ort: `${rel(b.datei)} → ${b.name}`,
      farbe,
      groesse: pt,
      verhaeltnis: v,
      grund: istAkzent ? 'Akzent als Schrift — nimm die Ink-Fassung' : 'zu leise auf hellem Grund',
    });
  }
  return { funde, ausnahmen, geprueft };
}

describe('K7 — Farbe und Schriftgröße passen zusammen', () => {
  it('kein Akzent als kleine Schrift, keine zu leise Tinte auf hellem Grund', () => {
    const { funde } = pruefe();
    const zeilen = funde.map(
      (f) =>
        `${f.ort}: ${f.farbe} bei ${f.groesse || '?'}pt = ${f.verhaeltnis.toFixed(2)}:1 auf Papier — ${f.grund}`,
    );
    expect(zeilen, `\n  ${zeilen.join('\n  ')}`).toEqual([]);
  });

  it('die Ausnahmen bleiben eine Handvoll, keine Gewohnheit', () => {
    // Eine Ausnahme ist ehrlich. Dreißig wären ein abgeschalteter Test im
    // Kostüm — dann stimmt die Regel nicht mehr, nicht der Code.
    const { ausnahmen } = pruefe();
    expect(ausnahmen).toBeLessThanOrEqual(12);
  });

  it('prüft wirklich etwas — Blöcke gefunden, Farben aufgelöst', () => {
    // Ohne diese zwei Zahlen wäre ein kaputter Parser ein grüner Test. Der
    // erste Anlauf übersprang sechs Blöcke still; „übersprungen" sah aus wie
    // „in Ordnung".
    const { geprueft, ausnahmen } = pruefe();
    expect(alleBloecke.length).toBeGreaterThan(400);
    expect(geprueft).toBeGreaterThan(400);
    // Die Zahlen im Dateikopf sind zweimal veraltet gewesen, beide Male durch
    // denselben Commit, der sie aufgeschrieben hat. Also stehen sie jetzt hier
    // als Test statt als Kommentar — dann kann sie niemand mehr übersehen.
    expect(ausnahmen).toBeGreaterThan(0);
  });

  it('löst lokale Alias-Konstanten auf', () => {
    // Vier echte Fehler standen hinter `const TOGETHER = Sections.together`.
    const mitAlias = [...ALIASE.values()].filter((m) => Object.keys(m).length > 0);
    expect(mitAlias.length).toBeGreaterThan(3);
  });
});
