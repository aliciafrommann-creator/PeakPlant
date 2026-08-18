import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SEED_EDITIONS, SEED_CARDS, findCard, isSampleCard, sampleCardFor } from '../seed';
import { SAMPLE_CARDS, SAMPLE_CARD_BY_EDITION, sampleNotice } from './samples';

/** Die Bildschirme, die eine Karte öffnen können. */
const QUELLEN = [
  'app/card/[id].tsx',
  'app/c/[id].tsx',
  'app/(tabs)/scan.tsx',
  'app/editions/[id].tsx',
  'app/memory/create.tsx',
];

/**
 * Der Wächter für die Beispielkarten.
 *
 * Die Editionsseite zeigte zwölf nummerierte Umrisse — bei den angekündigten
 * Editionen war das buchstäblich alles, was es zu sehen gab. Seit dem
 * 18.08.2026 hat jede Edition genau eine offen lesbare Karte.
 *
 * „Genau eine" ist der Punkt, in beide Richtungen: keine ohne (sonst kommt die
 * leere Seite zurück), und keine, die versehentlich zur Deck-Karte wird
 * (sonst zählt eine Edition Karten, die niemand gekauft hat — und Entscheidung
 * 024 sagt, dass der Kauf mehr Inhalt bringt).
 */
describe('Beispielkarten', () => {
  it('jede Edition hat genau eine, und sie ist auffindbar', () => {
    for (const e of SEED_EDITIONS) {
      const id = SAMPLE_CARD_BY_EDITION[e.id];
      expect(id, `${e.id} hat keine Beispielkarte`).toBeTruthy();
      const karte = sampleCardFor(e.id);
      expect(karte, `${e.id}: Beispielkarte ${id} ist nicht auffindbar`).toBeDefined();
      expect(karte?.edition, `${e.id}: Beispielkarte gehört zu ${karte?.edition}`).toBe(e.id);
    }
  });

  it('keine Beispielkarte einer angekündigten Edition landet im Deck', () => {
    // Sonst stünde in der Sammlung Inhalt, den niemand gekauft hat, und die
    // Kartenzahl einer Edition wäre eine Zahl, die nichts bedeutet.
    for (const k of SAMPLE_CARDS) {
      expect(SEED_CARDS.some((c) => c.id === k.id), `${k.id} steckt in SEED_CARDS`).toBe(false);
    }
  });

  it('bei erschienenen Editionen ist die Beispielkarte eine echte Deck-Karte', () => {
    // Der Kauf bringt weiterhin mehr Inhalt: neunzehn der zwanzig bleiben zu.
    for (const e of SEED_EDITIONS.filter((x) => x.status === 'available')) {
      const id = SAMPLE_CARD_BY_EDITION[e.id];
      expect(SEED_CARDS.some((c) => c.id === id), `${e.id}: ${id} ist keine Deck-Karte`).toBe(true);
      expect(isSampleCard(id), `${e.id}: ${id} zählt fälschlich als reine Beispielkarte`).toBe(false);
    }
  });

  it('jede Beispielkarte trägt echten Inhalt, keinen Platzhalter', () => {
    // Eine Beispielkarte, die nur einen Titel hat, belegt nichts — sie wäre
    // wieder nur eine Behauptung.
    for (const e of SEED_EDITIONS) {
      const k = sampleCardFor(e.id);
      expect(k?.content, `${e.id}: kein content`).toBeDefined();
      const abschnitte = k?.content?.sections ?? [];
      expect(abschnitte.length, `${e.id}: nur ${abschnitte.length} Abschnitte`).toBeGreaterThanOrEqual(3);
      expect(
        abschnitte.some((a) => a.preserveHere),
        `${e.id}: kein „festhalten"-Abschnitt`,
      ).toBe(true);
      const fragen = abschnitte.flatMap((a) => a.bullets ?? []);
      expect(fragen.length, `${e.id}: keine Fragen`).toBeGreaterThanOrEqual(3);
    }
  });

  it('die angekündigten Editionen halten Nummer 1 für ihre Beispielkarte frei', () => {
    for (const k of SAMPLE_CARDS) expect(k.number).toBe(1);
  });

  it('`findCard` findet Deck- und Beispielkarten, `isSampleCard` trennt sie', () => {
    expect(findCard('card-01')?.id).toBe('card-01');
    expect(findCard('card-e04-s')?.id).toBe('card-e04-s');
    expect(findCard('gibt-es-nicht')).toBeUndefined();
    expect(findCard(undefined)).toBeUndefined();
    expect(isSampleCard('card-e04-s')).toBe(true);
    expect(isSampleCard('card-01')).toBe(false);
  });
});

describe('Der Hinweis auf einer Beispielkarte', () => {
  it('verspricht bei einer angekündigten Edition kein Deck', () => {
    // „Das gedruckte Deck bringt den Rest" war für die Editionen 04–12 falsch:
    // Es gibt kein Deck und keinen Rest — die Beispielkarte IST alles.
    for (const sprache of ['en', 'de'] as const) {
      const kommend = sampleNotice('Hideout', 'upcoming')[sprache].toLowerCase();
      expect(kommend).not.toContain(sprache === 'de' ? 'deck bringt' : 'deck brings');
    }
  });

  it('nennt bei einer erschienenen Edition das Deck', () => {
    expect(sampleNotice('Grow Together', 'available').de).toContain('Deck');
    expect(sampleNotice('Grow Together', 'available').en).toContain('deck');
  });

  it('nennt immer die Edition beim Namen', () => {
    for (const status of ['available', 'upcoming'] as const) {
      expect(sampleNotice('Soft & Wild', status).en).toContain('Soft & Wild');
      expect(sampleNotice('Soft & Wild', status).de).toContain('Soft & Wild');
    }
  });

  it('spricht niemanden als zwei Menschen an', () => {
    // Seit dem Solo-Space (Entscheidung 027) gilt das auch hier — der erste
    // Entwurf sagte „damit ihr seht".
    const verboten = [' euch', 'eurem', 'ihr beide', 'you two'];
    for (const status of ['available', 'upcoming'] as const) {
      const text = `${sampleNotice('X', status).en} ${sampleNotice('X', status).de}`.toLowerCase();
      for (const w of verboten) expect(text, `„${w}" in ${status}`).not.toContain(w);
    }
  });
});

describe('Beispielkarten-Inhalt hält die Produktregeln', () => {
  it('keine offene Flamme in der Decken-Höhle', () => {
    // Eine Höhle aus Decken und Kissen, ein ganzer Abend darin — die einzige
    // Stelle im Kartensatz mit echtem Risiko.
    const nest = SAMPLE_CARDS.find((k) => k.edition === 'edition-09');
    const text = JSON.stringify(nest?.content ?? {}).toLowerCase();
    expect(text).not.toMatch(/\bor candles\b/);
  });

  it('die Fragekarten haben eine Entschärfung vorweg', () => {
    // So machen es die echten Fragekarten in Edition 01: erst „Before you
    // begin", das den Druck herausnimmt, dann die Frage.
    for (const k of SAMPLE_CARDS.filter((x) => x.type === 'question')) {
      const ueberschriften = (k.content?.sections ?? []).map((a) =>
        (typeof a.heading === 'string' ? a.heading : a.heading.en).toLowerCase(),
      );
      expect(ueberschriften[0], `${k.id}: erster Abschnitt ist „${ueberschriften[0]}"`).toContain('before');
    }
  });

  it('keine Schuld- oder Bewertungssprache', () => {
    // MANIFESTO §3: einladen, nie drängen. „The Yes You Owe Each Other" und
    // „is that fair?" luden zum Aufrechnen zwischen zwei Menschen ein.
    const verboten = [' owe ', 'is that fair', 'you should', 'you must'];
    const funde: string[] = [];
    for (const k of SAMPLE_CARDS) {
      const text = `${k.prompt} ${JSON.stringify(k.content ?? {})}`.toLowerCase();
      for (const w of verboten) if (text.includes(w)) funde.push(`${k.id}: „${w.trim()}"`);
    }
    expect(funde, funde.join(' · ')).toEqual([]);
  });
});

describe('Der Riegel: eine Beispielkarte füllt keine Sammlung', () => {
  /**
   * WARUM DIESER TEST DEN QUELLTEXT LIEST: Die erste Fassung des Riegels hing
   * an einem URL-Parameter, den zwei von sechs Aufrufern setzten. Der
   * Demo-Knopf im Scanner und der geteilte Link `/c/card-01` setzten ihn
   * nicht — vier Tipps ohne Deck ergaben „1 von 20 Karten geöffnet". Und kein
   * Test hätte das gemerkt: Man konnte den ganzen `alsBeispiel`-Zweig löschen,
   * und alles blieb grün, während AGENTS.md die Grenze als gehalten führte.
   *
   * Grob, aber es hält genau die Aussage: Der Nachweis wird an EINER Stelle
   * gesetzt, und ohne ihn hängt `memory/create` den Moment an keine Karte.
   */
  const lies = (rel: string) => fs.readFileSync(path.resolve(__dirname, '../..', rel), 'utf8');

  it('`scanned` wird nur in der Kartenansicht gesetzt', () => {
    const treffer = QUELLEN.filter((f) => /scanned:\s*'1'/.test(lies(f)));
    expect(treffer, `setzt den Nachweis: ${treffer.join(', ')}`).toEqual(['app/card/[id].tsx']);
  });

  it('ohne Nachweis hängt `memory/create` den Moment an keine Karte', () => {
    const quelle = lies('app/memory/create.tsx');
    expect(quelle).toMatch(/scanned === '1'[\s\S]{0,120}cardId/);
  });

  it('jeder Weg in die Kartenansicht ist entschieden, keiner vergessen', () => {
    // Jeder `router.push`/`Redirect` nach `/card/` setzt entweder `sample`
    // (dann ist es kein Scan) oder steht hier mit Begründung.
    const OHNE_SAMPLE_ERLAUBT: Record<string, string> = {
      // Der einzige echte Scan: Hier hatte jemand die gedruckte Karte in der Hand.
      'app/(tabs)/scan.tsx': 'Scanner-Erfolg',
    };
    const offen: string[] = [];
    for (const f of QUELLEN) {
      const quelle = lies(f);
      for (const m of quelle.matchAll(/(?:router\.push|Redirect href)[^\n]*\/card\/[^\n]*/g)) {
        const zeile = m[0];
        if (zeile.includes("sample: '1'") || zeile.includes('sample=1')) continue;
        if (OHNE_SAMPLE_ERLAUBT[f]) continue;
        offen.push(`${f}: ${zeile.trim().slice(0, 90)}`);
      }
    }
    expect(offen, `Weg in die Kartenansicht ohne Entscheidung:\n  ${offen.join('\n  ')}`).toEqual([]);
  });
});
