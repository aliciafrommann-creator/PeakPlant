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
 * der Bildschirm ein Farbkasten. Also steht sie als Zahl im Test.
 *
 * DIESE FASSUNG IST DIE ZWEITE. Die erste hatte drei Löcher, die ein Prüfer
 * am 19.08.2026 mit Rot-Beweisen aufgemacht hat — alle drei blieben grün,
 * obwohl sie genau das Verbotene taten:
 *   1. `color: "#FFFFFF"` als Literal (der Regex kannte nur `Colors.…`),
 *   2. `color: Colors.accentInk` (nicht in der Aufzählung),
 *   3. die Farbe im StyleSheet statt inline — die häufigste Schreibweise in
 *      diesem Repo überhaupt.
 * Dazu zählte er pro DATEI und übersah deshalb, dass der Startbildschirm zwei
 * gefärbte Flächen hatte (Vorschlagszeile plus Knopf in einer anderen Datei).
 *
 * Was der Test weiterhin NICHT kann: sehen, wie groß eine Fläche ist. Ein
 * `DyeField` über den halben Bildschirm zählt wie ein Kopfband. Das bleibt
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

/** Die Blöcke zwischen `<DyeField` und `</DyeField>`. Selbstschließende sind leer. */
function faerbungsBloecke(quelle: string): string[] {
  const out: string[] = [];
  for (const roh of quelle.split('<DyeField').slice(1)) {
    const zu = roh.indexOf('</DyeField>');
    const selbstschliessend = roh.slice(0, roh.indexOf('>') + 1).trimEnd().endsWith('/>');
    // Ohne schließendes Tag NICHT blind 900 Zeichen mitlesen — das hat fremden
    // Code in die Prüfung gezogen und wäre irgendwann ein Fehlalarm geworden.
    out.push(selbstschliessend ? '' : zu === -1 ? roh : roh.slice(0, zu));
  }
  return out;
}

/**
 * Eine feste Schriftfarbe: ein Literal (`'#FFF'`) oder ein Griff in eine
 * Palette (`Colors.x`, `Accents.x`, `AccentInks.x`, `Sections.x`,
 * `SectionInks.x`). Gerechnete Werte (`fg`, `tinte`, `editionInk(...)`)
 * bleiben erlaubt — sie sind ja genau der richtige Weg.
 */
const FESTE_FARBE = /(?:^|[^a-zA-Z])color:\s*(['"`]#?[^'"`]*['"`]|(?:Colors|Accents|AccentInks|Sections|SectionInks)\.[A-Za-z0-9_]+)/;

/**
 * Die Style-Einträge einer Datei: Name -> Rumpf.
 *
 * Klammern werden GEZÄHLT, nicht per Regex gesucht. Der erste Versuch nahm
 * `/^\s{2}(name):\s*\{([\s\S]*?)^\s{2}\},$/` — und las bei einzeiligen
 * Einträgen (`symbol: { fontSize: 36 },`) über das Ende hinaus bis zum
 * nächsten mehrzeiligen Eintrag. Ergebnis: zwei Fehlalarme, die aussahen wie
 * echte Funde. Ein Wächter, der falsch anschlägt, wird abgeschaltet.
 */
function styleEintraege(quelle: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /^ {2}([A-Za-z0-9_]+):\s*\{/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(quelle))) {
    let tiefe = 0;
    let i = m.index + m[0].length - 1;
    const start = i + 1;
    for (; i < quelle.length; i++) {
      if (quelle[i] === '{') tiefe++;
      else if (quelle[i] === '}' && --tiefe === 0) break;
    }
    map.set(m[1], quelle.slice(start, i));
  }
  return map;
}

/**
 * Trägt dieser Style-Eintrag eine Schriftfarbe — direkt oder über einen
 * Spread wie `...Typography.stack` (der `color: Colors.text` mitbringt)?
 */
function traegtFarbe(rumpf: string, quelle: string): boolean {
  if (FESTE_FARBE.test(rumpf)) return true;
  for (const sp of rumpf.match(/\.\.\.Typography\.[A-Za-z0-9_]+/g) ?? []) {
    const name = sp.split('.').pop()!;
    const typo = fs.readFileSync(path.join(WURZEL, 'constants/typography.ts'), 'utf8');
    const eintrag = styleEintraege(typo).get(name);
    if (eintrag && FESTE_FARBE.test(eintrag)) return true;
  }
  void quelle;
  return false;
}

describe('Batik leise — die Färbung bleibt selten', () => {
  it('höchstens EINE gefärbte Fläche je Datei', () => {
    const zuViel: string[] = [];
    for (const f of QUELLEN) {
      const n = (fs.readFileSync(f, 'utf8').match(/<DyeField\b/g) ?? []).length;
      if (n > 1) zuViel.push(`${path.relative(WURZEL, f)}: ${n}`);
    }
    expect(zuViel, `zu viele Färbungen: ${zuViel.join(' · ')}`).toEqual([]);
  });

  it('keine Schrift in fester Farbe auf einer Färbung — auch nicht über das StyleSheet', () => {
    // Die Tinte auf einer Färbung wird IMMER gerechnet (`editionInk`), weil
    // die Fläche je Edition eine andere ist. Eine fest gesetzte Farbe darauf
    // stimmt höchstens für eine der dreizehn Welten — das ist die Falle, die
    // im Kontrast-Durchgang fünf Runden gekostet hat.
    const verdaechtig: string[] = [];
    for (const f of QUELLEN) {
      const quelle = fs.readFileSync(f, 'utf8');
      if (!quelle.includes('<DyeField')) continue;
      const eintraege = styleEintraege(quelle);
      for (const inhalt of faerbungsBloecke(quelle)) {
        const t = inhalt.match(FESTE_FARBE);
        if (t) verdaechtig.push(`${path.relative(WURZEL, f)}: ${t[1]} (direkt)`);

        // Der Umweg über das StyleSheet — die häufigste Schreibweise hier und
        // bis heute der blinde Fleck. `styles.x` darf eine Farbe mitbringen,
        // WENN die Stelle sie inline überschreibt (`[styles.x, { color: fg }]`).
        for (const ref of inhalt.match(/styles\.[A-Za-z0-9_]+/g) ?? []) {
          const name = ref.split('.')[1];
          const rumpf = eintraege.get(name);
          if (!rumpf || !traegtFarbe(rumpf, quelle)) continue;
          const ueberschrieben = new RegExp(
            `\\[\\s*styles\\.${name}\\s*,[^\\]]*\\bcolor:`,
          ).test(inhalt);
          if (!ueberschrieben) {
            verdaechtig.push(`${path.relative(WURZEL, f)}: ${ref} (über das StyleSheet)`);
          }
        }
      }
    }
    expect(
      verdaechtig,
      `feste Schriftfarbe auf einer Färbung — gehört durch editionInk(): ${verdaechtig.join(' · ')}`,
    ).toEqual([]);
  });

  it('kein backgroundColor im Style, der an eine Färbung übergeben wird', () => {
    // `DyeField` legt den Grundton unter das Bild, damit Schrift beim Laden
    // nie auf Weiß sitzt. Ein `backgroundColor` im übergebenen Style hat genau
    // das ausgeschaltet: Auf dem Editions-Kopf lag `backgroundDark` darunter,
    // und die gerechnete Tinte stand für zehn von zwölf Editionen bei 1,02:1.
    // Seitdem gewinnt der Grundton im Style-Array — aber die Absicht des
    // Aufrufers soll trotzdem sichtbar bleiben, statt still zu verpuffen.
    const verdaechtig: string[] = [];
    for (const f of QUELLEN) {
      const quelle = fs.readFileSync(f, 'utf8');
      if (!quelle.includes('<DyeField')) continue;
      const eintraege = styleEintraege(quelle);
      for (const roh of quelle.split('<DyeField').slice(1)) {
        const kopf = roh.slice(0, roh.indexOf('>') + 1);
        for (const ref of kopf.match(/styles\.[A-Za-z0-9_]+/g) ?? []) {
          const rumpf = eintraege.get(ref.split('.')[1]);
          if (rumpf && /backgroundColor:/.test(rumpf)) {
            verdaechtig.push(`${path.relative(WURZEL, f)}: ${ref}`);
          }
        }
        if (/backgroundColor:/.test(kopf)) {
          verdaechtig.push(`${path.relative(WURZEL, f)}: inline`);
        }
      }
    }
    expect(
      verdaechtig,
      `backgroundColor überdeckt den Grundton der Färbung: ${verdaechtig.join(' · ')}`,
    ).toEqual([]);
  });

  it('das Bild füllt seine Fläche wirklich', () => {
    // DER FEHLER, DER ZWEI ANLÄUFE GEBRAUCHT HAT. Alicia auf ihrem iPhone:
    // erst „die Hintergründe reichen immer nur ein wenig", dann — nach dem
    // ersten Fix — „immer noch die Banner, in den Farben leider nicht alle
    // covered".
    //
    // Anlauf 1: `StyleSheet.absoluteFill` allein. Setzt Kanten, keine Größe;
    //           ein `Image` nimmt seine Dateigröße (200 × 140).
    // Anlauf 2: `width: '100%'` dazu. Eine Prozentbreite misst sich am
    //           INHALTSBEREICH, `left/right: 0` am RAHMEN — jedes Band mit
    //           Polsterung behielt rechts einen flachen Streifen.
    // Anlauf 3: `ImageBackground`. Dafür gebaut, kein Prozentwert nötig.
    //
    // Der Test hält deshalb das WERKZEUG fest, nicht die Zahlen: Wer zurück
    // auf ein nacktes `<Image>` mit absoluteFill geht, holt sich beide alten
    // Fehler zurück.
    const quelle = fs.readFileSync(path.join(WURZEL, 'components/ui/DyeField.tsx'), 'utf8');
    expect(quelle, 'DyeField zeichnet die Färbung nicht mehr mit ImageBackground').toMatch(
      /<ImageBackground/,
    );
    expect(
      quelle.includes('<Image\n') || /<Image\s/.test(quelle),
      'nacktes <Image> zurück in DyeField — es nimmt seine Dateigröße',
    ).toBe(false);
  });

  it('findet überhaupt Färbungen (sonst prüft der Test nichts)', () => {
    const mit = QUELLEN.filter((f) => fs.readFileSync(f, 'utf8').includes('<DyeField'));
    expect(mit.length, 'keine einzige gefärbte Fläche gefunden').toBeGreaterThanOrEqual(5);
  });
});
