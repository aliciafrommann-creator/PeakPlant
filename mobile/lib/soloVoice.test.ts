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
// `lib` gehört dazu: Dort stehen die Teilen-Texte („a shared diary for two")
// und die Push-Nachrichten („In eurem Space liegt ein neuer Moment") — beides
// Sätze, die ein Mensch liest, und beides bis 18.08.2026 außer Reichweite
// dieses Wächters.
const ORDNER = ['app', 'components', 'lib'];

/**
 * Was NICHT geprüft wird und warum.
 *
 * `lib/content` und `lib/discovery` tragen die Karten- und Ideentexte. Die
 * sind absichtlich zweipersonig — sie gehören zu Paar- und Freundes-Spaces —
 * und werden über `spaceTypes` gefiltert. Dafür ist
 * `lib/discovery/soloText.test.ts` zuständig, das genau die als `solo`
 * markierten Einträge prüft. Hier würden sie nur Lärm machen.
 *
 * Bewusst NICHT ausgenommen: `lib/shareText.ts` und `lib/notifications` —
 * das sind Sätze, die ein Mensch liest.
 */
const AUSGENOMMEN = [
  'lib/content',
  'lib/discovery',
  // Die getypten Inhalte: Challenges tragen `spaceTypes` und werden von
  // `soloText.test.ts` geprüft — die Paar-Fassungen SOLLEN „zusammen" sagen.
  'lib/challenges.ts',
  // Und die Anrede-Datei selbst: Dort steht die geteilte Fassung absichtlich
  // neben der Solo-Fassung. Sie hier zu melden hieße, die Lösung als Fehler
  // zu zählen. `lib/voice.test.ts` prüft dafür die Solo-Seite Wort für Wort.
  'lib/voice.ts',
];

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
  // Nachgetragen am 18.08.2026: Mit der ersten, engen Liste blieben rund
  // achtzig Stellen grün — darunter die Überschriften von Momente-,
  // Geschichte- und Entdecken-Reiter. Eine Wortliste, die nur die Wörter
  // kennt, die man schon gefunden hat, findet nichts Neues.
  'gemeinsam',
  'zusammen',
  'miteinander',
  'euch beide',
  'eure',
  'euren',
  'eurem',
  'euer',
  'für zwei',
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

const QUELLEN = ORDNER.flatMap((d) => dateien(path.join(WURZEL, d))).filter(
  (f) => !AUSGENOMMEN.some((a) => path.relative(WURZEL, f).startsWith(a)),
);

/** Kommentarzeilen zählen nicht — dort steht oft die Begründung selbst. */
function istKommentar(zeile: string): boolean {
  return /^\s*(\/\/|\*|\/\*)/.test(zeile);
}

/**
 * Welche Zeilen einer Datei in einem MEHRZEILIGEN Kommentar liegen.
 *
 * `istKommentar` sieht nur den Zeilenanfang. Ein `{/* … *\/}`-Block, dessen
 * zweite Zeile mit einem normalen Wort beginnt, rutschte deshalb durch — genau
 * so eine Zeile stand am 19.08.2026 in `editions.tsx` und wurde als echte
 * Fundstelle gezählt. Ein Wächter, der Erklärungen als Fehler meldet, erzieht
 * dazu, Erklärungen wegzulassen.
 */
function imKommentarblock(zeilen: string[]): boolean[] {
  const drin = new Array(zeilen.length).fill(false);
  let offen = false;
  zeilen.forEach((z, i) => {
    let rest = z;
    let hierDrin = offen;
    while (rest.length) {
      if (!offen) {
        const auf = rest.search(/\{?\/\*/);
        if (auf === -1) break;
        offen = true;
        hierDrin = true;
        rest = rest.slice(auf + 2);
      } else {
        const zu = rest.indexOf('*/');
        if (zu === -1) break;
        offen = false;
        rest = rest.slice(zu + 2);
      }
    }
    drin[i] = hierDrin;
  });
  return drin;
}

/**
 * DER RÜCKSTAND — leer, und das soll er bleiben.
 *
 * Beim Erweitern der Wortliste am 18.08.2026 fielen 67 Stellen an, die vorher
 * grün waren. Sie alle in einem Zug umzustellen war nicht ehrlich machbar; sie
 * stehen zu lassen und die Liste wieder zu verengen wäre ein abgeschalteter
 * Test im Kostüm gewesen. Also trug jede Datei die Zahl ihrer bekannten
 * Reststellen, und der Test scheiterte in DREI Richtungen — mehr Stellen als
 * eingetragen, eine neue Datei, oder WENIGER als eingetragen (sonst verwandelt
 * sich ein abgearbeiteter Rückstand still in einen Freibrief).
 *
 * Am 19.08.2026 ist er auf null. Von den 55 zuletzt offenen Stellen waren
 * 41 echte Umstellungen (jetzt in `lib/voice.ts`), 4 schlichte
 * Übersetzungsfehler (im Englischen stand nie eine zweite Person), 3 Sätze,
 * die vor der Wahl des Space-Typs laufen und deshalb die Person ansprechen,
 * die das Telefon hält, und 7 begründete Ausnahmen (`anrede-ok`) — Knöpfe und
 * Zweige, die den geteilten Space GERADE beschreiben.
 *
 * Ein Eintrag hier ist ab jetzt ein Rückschritt, kein Zwischenstand. Wer einen
 * braucht, schreibt den Grund dazu.
 */
const RUECKSTAND: Record<string, number> = {};


function funde(): Record<string, number> {
  const proDatei: Record<string, number> = {};
  for (const f of QUELLEN) {
    const alleZeilen = fs.readFileSync(f, 'utf8').split('\n');
    const imBlock = imKommentarblock(alleZeilen);
    alleZeilen.forEach((zeile, i) => {
      if (istKommentar(zeile) || imBlock[i]) return;
      // Fünf Zeilen zurück: Eine Begründung braucht oft drei, und dazwischen
      // steht noch die Zeile, die den Satz einleitet (`body: isDE ?`).
      const davor = alleZeilen.slice(Math.max(0, i - 5), i).join('\n');
      if (AUSNAHME.test(zeile) || AUSNAHME.test(davor)) return;
      if (!MUSTER.some((m) => m.re.test(zeile))) return;
      const rel = path.relative(WURZEL, f);
      proDatei[rel] = (proDatei[rel] ?? 0) + 1;
    });
  }
  return proDatei;
}

describe('Solo-Anrede — kein festverdrahtetes „ihr" in der Oberfläche', () => {
  it('findet überhaupt Dateien (sonst prüft der Test nichts)', () => {
    expect(QUELLEN.length).toBeGreaterThan(50);
  });

  it('keine neue Zwei-Personen-Wendung', () => {
    const jetzt = funde();
    const neu = Object.entries(jetzt)
      .filter(([datei, n]) => n > (RUECKSTAND[datei] ?? 0))
      .map(([datei, n]) => `${datei}: ${n} statt ${RUECKSTAND[datei] ?? 0}`);
    expect(
      neu,
      `neue oder zusätzliche Stellen — gehören nach lib/voice.ts:\n  ${neu.join('\n  ')}`,
    ).toEqual([]);
  });

  it('der Rückstand ist aktuell — abgearbeitetes wird auch abgeschrieben', () => {
    const jetzt = funde();
    const veraltet = Object.entries(RUECKSTAND)
      .filter(([datei, n]) => (jetzt[datei] ?? 0) < n)
      .map(([datei, n]) => `${datei}: nur noch ${jetzt[datei] ?? 0}, eingetragen ${n}`);
    expect(
      veraltet,
      `Rückstand zu hoch angesetzt — bitte senken (sonst wird daraus ein Freibrief):\n  ${veraltet.join('\n  ')}`,
    ).toEqual([]);
  });

  it('der Rückstand ist endlich und benannt', () => {
    // Eine Zahl, die niemand sieht, wächst. Diese hier steht im Test.
    const gesamt = Object.values(RUECKSTAND).reduce((a, b) => a + b, 0);
    expect(gesamt).toBeLessThanOrEqual(60);
  });
});
