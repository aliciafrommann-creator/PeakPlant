import { describe, it, expect } from 'vitest';
import { SEED_EDITIONS, SEED_CARDS, findCard, isSampleCard, sampleCardFor } from '../seed';
import { SAMPLE_CARDS, SAMPLE_CARD_BY_EDITION } from './samples';

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
