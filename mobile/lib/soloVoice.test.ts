import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Der Wächter gegen die Rückkehr des „ihr".
 *
 * Am 18.08.2026 wurde `solo` ein echter Space-Typ. Damit ist jede fest
 * verdrahtete Zwei-Personen-Anrede in der Oberfläche eine Aussage, die für
 * einen Teil der Nutzer nicht stimmt — und Datenschutzsätze („bleibt privat in
 * eurem Space") sind ausgerechnet die Sätze, bei denen das am meisten wiegt
 * (MANIFESTO §1).
 *
 * Die Anrede gehört deshalb nach `lib/voice.ts`. Dieser Test hält die
 * Bildschirme davon frei. Er sucht nach Zeichenketten, nicht nach Bedeutung —
 * er kann also nicht alles, aber er kann genau das, was hier immer wieder
 * passiert: jemand schreibt „eurem Space" schnell direkt in ein `t(...)`.
 */

const WURZEL = path.resolve(__dirname, '..');
const ORDNER = ['app', 'components'];

/**
 * Wendungen, die eine zweite Person behaupten.
 *
 * Mit Wortgrenzen geprüft — „neuer Space" enthält „euer Space" als
 * Zeichenkette und ist trotzdem völlig in Ordnung. Ein Wächter, der so etwas
 * meldet, wird nach dem dritten Mal abgeschaltet.
 */
const ZWEI_PERSONEN = [
  'eurem Space',
  'euer Space',
  'euren Space',
  'eure Notiz',
  'zwischen euch',
  'nur für euch',
  'ihr beide',
  'you two',
  'both of you',
  'the two of you',
];

const MUSTER = ZWEI_PERSONEN.map((w) => ({
  wort: w,
  re: new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
}));

/**
 * Bewusste Ausnahme: `// anrede-ok` in derselben oder der Zeile davor.
 *
 * Es gibt sie wirklich — die Auswahl „ein Paar · nur ihr zwei" beim Anlegen
 * eines Space MUSS von zwei Menschen sprechen, sie beschreibt ja genau das.
 *
 * GRENZE, damit niemand mehr erwartet als da ist: Der Test sieht nur einzelne
 * Quellzeilen. Eine Wendung, die über ein `\n` mitten in einer Zeichenkette
 * verläuft (`'a space for\nthe two of you'`), erkennt er NICHT — genau so eine
 * stand am 18.08.2026 im Onboarding und wurde von Hand gefunden. Er ersetzt
 * das Lesen nicht, er hält nur den häufigen Fall draußen.
 */
const AUSNAHME = /anrede-ok/;

function dateien(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...dateien(p));
    else if (/\.tsx?$/.test(e.name) && !e.name.includes('.test.')) out.push(p);
  }
  return out;
}

const QUELLEN = ORDNER.flatMap((d) => dateien(path.join(WURZEL, d)));

/** Kommentarzeilen zählen nicht — dort steht oft die Begründung selbst. */
function istKommentar(zeile: string): boolean {
  return /^\s*(\/\/|\*|\/\*)/.test(zeile);
}

describe('Solo-Anrede — kein festverdrahtetes „ihr" in der Oberfläche', () => {
  it('findet überhaupt Dateien (sonst prüft der Test nichts)', () => {
    expect(QUELLEN.length).toBeGreaterThan(50);
  });

  it('keine Zwei-Personen-Wendung in einem Bildschirm', () => {
    const funde: string[] = [];
    for (const f of QUELLEN) {
      // Zeilennummern bleiben die der DATEI — ein Fund, den man nicht
      // aufschlagen kann, kostet mehr Zeit als er spart.
      const alleZeilen = fs.readFileSync(f, 'utf8').split('\n');
      alleZeilen.forEach((zeile, i) => {
          if (istKommentar(zeile) || zeile.trimStart().startsWith('{/*')) return;
          // Bis zu drei Zeilen darüber: eine Begründung braucht oft zwei
          // Zeilen, und dann steht sie sonst „zu weit weg".
          const davor = alleZeilen.slice(Math.max(0, i - 3), i).join('\n');
          if (AUSNAHME.test(zeile) || AUSNAHME.test(davor)) return;
          const treffer = MUSTER.find((m) => m.re.test(zeile));
          if (treffer) funde.push(`${path.relative(WURZEL, f)}:${i + 1} → „${treffer.wort}"`);
      });
    }
    expect(
      funde,
      `gehört nach lib/voice.ts:\n  ${funde.join('\n  ')}`,
    ).toEqual([]);
  });
});
