import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Wächter für die Klarheits-Regeln (.claude/skills/klarheit/SKILL.md).
 *
 * WARUM ES DIESE DATEI GIBT: Am 18.08.2026 hat Alicia die App zum ersten Mal
 * auf einem echten Gerät benutzt und gesagt „das Modell funktioniert, aber die
 * UX nicht". Der Vergleich mit Instagram, Strava und BeReal ergab acht Regeln.
 * Sechs davon sind Urteilsfragen und bleiben es. Die hier sind es nicht — und
 * eine Regel, die nur in einem Dokument steht, ist bis zur nächsten Sitzung
 * eine Meinung. Als Test ist sie ein Gesetz.
 *
 * Diese Tests lesen QUELLTEXT, nicht Verhalten. Das ist grob und mit Absicht:
 * sie sollen einen Rückfall auffällig machen, nicht Korrektheit beweisen. Wer
 * eine Regel bewusst bricht, trägt die Datei unten in die jeweilige
 * Ausnahmeliste ein — MIT Begründung. Eine Ausnahme ohne Grund ist ein Rückbau
 * auf Raten.
 */

const MOBILE = join(__dirname, '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.expo' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const SOURCES = [...walk(join(MOBILE, 'app')), ...walk(join(MOBILE, 'lib')), ...walk(join(MOBILE, 'components'))];
const rel = (f: string) => f.slice(MOBILE.length + 1);
const read = (f: string) => readFileSync(f, 'utf8');

// ---------------------------------------------------------------------------
// K5 — eine Null, die „wir wissen es nicht" heißt, ist eine Scheinzahl.
// K4 — „kaputt" ist nicht „leer".
// ---------------------------------------------------------------------------
describe('K4/K5 — Ladefehler dürfen nicht wie Leerzustände aussehen', () => {
  /**
   * Wer `useMemories` benutzt und Zahlen oder Leerzustände daraus baut, muss
   * `error` auslesen. Genau dieses Weglassen ließ die Geschichte-Seite sagen
   * „eure Geschichte beginnt hier" — auch bei vierzig Momenten offline.
   */
  const ERLAUBT_OHNE_ERROR = new Set<string>([
    // Zeigt weder Zahl noch Leerzustand aus den Momenten, sondern nur die
    // Wochen-Sammlung — ein Fehler führt dort zu „noch nichts gesammelt",
    // was in beiden Fällen dieselbe wahre Aussage ist.
    'app/(tabs)/discover.tsx',
  ]);

  it('jeder Bildschirm, der useMemories nutzt, liest auch error aus', () => {
    const suender = SOURCES.filter((f) => {
      const s = read(f);
      if (!/useMemories\(/.test(s)) return false;
      if (ERLAUBT_OHNE_ERROR.has(rel(f))) return false;
      // Der Hook gibt `error` zurück; wer es nicht destrukturiert, kann den
      // Fehlerfall gar nicht vom Leerfall unterscheiden.
      return !/\berror\b/.test(s);
    }).map(rel);

    expect(suender, `liest useMemories ohne error: ${suender.join(', ')}`).toEqual([]);
  });

  it('kein Hook lädt ohne catch — sonst hängt der Ladezustand für immer', () => {
    const hooks = SOURCES.filter((f) => rel(f).startsWith('lib/hooks/'));
    const suender = hooks
      .filter((f) => {
        const s = read(f);
        const laedt = /await\s+\w+Repository\.|\.then\(/.test(s);
        return laedt && !/catch\b/.test(s);
      })
      .map(rel);

    expect(suender, `lädt ohne catch: ${suender.join(', ')}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// K7 — die Schrift-Leiter gilt, oder sie gilt nicht.
// ---------------------------------------------------------------------------
describe('K7 — Schrift und Kontrast', () => {
  it('keine Schrift unter 11 pt', () => {
    // Instagram und Strava setzen ihre kleinste Schrift bei 11–12 pt. Alles
    // darunter war bei uns nicht Stil, sondern unter dem Mindestmaß: 60
    // Stellen lagen bei 9 pt, drei sogar bei 7.
    const treffer: string[] = [];
    for (const f of SOURCES) {
      for (const m of read(f).matchAll(/fontSize:\s*(\d+(?:\.\d+)?)/g)) {
        if (Number(m[1]) < 11) treffer.push(`${rel(f)} → ${m[1]}pt`);
      }
    }
    expect(treffer, `zu klein: ${treffer.join(' · ')}`).toEqual([]);
  });

  it('der gestapelte Titel bleibt ein Titel — nie unter 24 pt', () => {
    // `Typography.stack` ist die gestapelte Serife nach Alicias Vorbild
    // („schrift teils in die richtung wäre mega", 19.08.2026): 700er Georgia,
    // Sperrung -1, Zeilen dichter als die Schrift hoch ist. Das trägt eine
    // Überschrift und erschlägt einen Fließtext.
    //
    // Die Regel steht seit dem ersten Tag in `constants/typography.ts` — und
    // wurde beim ERSTEN Anwenden gebrochen: Auf dem Startbildschirm saß sie
    // auf der Notiz des anderen Menschen, bei 16 pt. Eine Regel, die nur als
    // Kommentar dasteht, hält genau bis zur nächsten schnellen Zeile.
    const treffer: string[] = [];
    for (const f of SOURCES) {
      const quelle = read(f);
      for (const m of quelle.matchAll(/\.\.\.Typography\.stack\b/g)) {
        // Der Style-Rumpf ab dem Spread bis zur schließenden Klammer.
        const rest = quelle.slice(m.index!);
        const ende = rest.indexOf('},');
        const rumpf = ende === -1 ? rest.slice(0, 300) : rest.slice(0, ende);
        const eigen = rumpf.match(/fontSize:\s*(\d+(?:\.\d+)?)/);
        if (eigen && Number(eigen[1]) < 24) treffer.push(`${rel(f)} → ${eigen[1]}pt`);
      }
    }
    expect(
      treffer,
      `gestapelter Titel unter 24 pt — dort gehört Typography.editorial hin: ${treffer.join(' · ')}`,
    ).toEqual([]);
  });

  it('enge Zeilen tragen auf Android kein Polster', () => {
    // Android legt um jede Textzeile ein Polster für Ober- und Unterlängen.
    // Ist die Zeile NIEDRIGER als die Schrift hoch ist, beschneidet Android
    // Auf- und Abstriche, statt sie überlappen zu lassen — genau das, was der
    // gestapelte Titel absichtlich tut. `includeFontPadding: false` schaltet
    // das Polster ab.
    //
    // EHRLICH: Diese Regel ist Vorsorge nach dokumentiertem RN-Verhalten,
    // nicht nach einer Messung auf einem Gerät. Sie kostet nichts und
    // verhindert eine Klasse von Fehlern, die man erst auf Android sieht.
    const treffer: string[] = [];
    for (const f of [...SOURCES, join(MOBILE, 'constants/typography.ts')]) {
      const quelle = read(f);
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
        const rumpf = quelle.slice(start, i);
        const gr = rumpf.match(/fontSize:\s*(\d+(?:\.\d+)?)/);
        const zh = rumpf.match(/lineHeight:\s*(\d+(?:\.\d+)?)/);
        if (!gr || !zh) continue;
        if (Number(zh[1]) >= Number(gr[1])) continue;
        if (/includeFontPadding:\s*false/.test(rumpf)) continue;
        treffer.push(`${rel(f)} → ${m[1]}: ${gr[1]}pt auf ${zh[1]}pt`);
      }
    }
    expect(
      treffer,
      `Zeile enger als die Schrift, ohne includeFontPadding: false — Android schneidet dort Unterlängen ab: ${treffer.join(' · ')}`,
    ).toEqual([]);
  });

  /**
   * KONTRAST BLEIBT HIER UNGEPRÜFT — und das ist eine Entscheidung, keine Lücke.
   *
   * Die alten Werte (`textSubtle` 3,51:1, `textFaint` 2,41:1) sind seit dem
   * 17.08.2026 korrigiert; heute stehen sie bei 4,55:1 und 3,03:1 auf dem
   * Papierton. Die leiseste Stufe besteht damit für Großes und Nicht-Text,
   * nicht für kleine Schrift — welcher Fall vorliegt, hängt am UNTERGRUND.
   * Die verbliebenen Dunkel-Fälle sind `language.tsx`, `onboarding.tsx` und
   * `space/new.tsx` (dort 4,97:1 gegen `Colors.text`, also richtig).
   *
   * Was mechanisch geprüft WIRD, steht in `lib/palette.test.ts`: dort ist die
   * Frage umgedreht — nicht „welcher Farbname", sondern „welche Farbe unter
   * 24 pt", geprüft gegen den hellen Grund, mit sichtbar markierten Ausnahmen
   * für dunkle Flächen. Dazu rechnet `lib/contrast.ts` die Verhältnisse und
   * `lib/editionInk.test.ts` hält die zwölf Editionsfarben fest.
   *
   * Hier bleibt die Untergrenze der Schriftgröße — die gilt auf jedem Grund.
   */
});

// ---------------------------------------------------------------------------
// K2 — keine Abschnitts-Überschriften auf dem Startbildschirm.
// ---------------------------------------------------------------------------
describe('K2 — der Startbildschirm bleibt ein Bildschirm', () => {
  it('trägt höchstens zwei Abschnitts-Etiketten', () => {
    /**
     * Dreizehn Großbuchstaben-Überschriften machten aus dem Startbildschirm
     * ein Inhaltsverzeichnis: jede ist das Versprechen, dass hier ein neues
     * Thema beginnt. Instagram hat auf seinem Startbildschirm null.
     *
     * Gezählt wird `styles.sectionLabel`-artiger Gebrauch, nicht jeder
     * Großbuchstabentext — Knopfbeschriftungen sind keine Themen.
     */
    const home = read(join(MOBILE, 'app/(tabs)/home.tsx'));
    const etiketten = [...home.matchAll(/styles\.(section|feed)Label\w*/g)].length;
    expect(etiketten, `Abschnitts-Etiketten auf Home: ${etiketten}`).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// K8 / MANIFESTO §3 — es gibt keine Kante von Mensch zu Mensch.
// ---------------------------------------------------------------------------
describe('§3 — was nicht ausdrückbar sein soll, bleibt es', () => {
  it('kein Folgen von Personen im Client', () => {
    // Die Datenbank kann es nicht (audiences.kind kennt kein 'person',
    // follows hat keine Spalte dafür). Dieser Test hält die App-Seite
    // dagegen, damit der Begriff nicht über eine Hilfsfunktion zurückkommt.
    const treffer = SOURCES.filter((f) =>
      /\bfollowUser\b|\bfollowers?Count\b|\bfollowedUserId\b/.test(read(f)),
    ).map(rel);
    expect(treffer, `Personen-Folgen aufgetaucht in: ${treffer.join(', ')}`).toEqual([]);
  });

  it('keine Streak- oder Verfallsmechanik', () => {
    // „gemeinsame Wochen" dürfen nur steigen (siehe lib/streaks.ts). Ein
    // `atRisk`, `expires` oder `streak` wäre der Rückweg in den Druck.
    const treffer: string[] = [];
    for (const f of SOURCES) {
      if (rel(f) === 'lib/streaks.ts' || rel(f) === 'lib/features.ts') continue;
      if (/\batRisk\b|\bstreakCount\b|\bstreakBroken\b/.test(read(f))) treffer.push(rel(f));
    }
    expect(treffer, `Verlust-Mechanik aufgetaucht in: ${treffer.join(', ')}`).toEqual([]);
  });
});
