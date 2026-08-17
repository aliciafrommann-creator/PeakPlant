import { describe, it, expect } from 'vitest';
import { SEED_CARDS, SEED_EDITIONS, DECK_SIZE_RANGE } from './seed';
import { EDITION_01_CARDS } from './content/edition01';
import { EDITION_02_CARDS } from './content/edition02';
import { EDITION_03_CARDS } from './content/edition03';

/**
 * Alicias Bedingung für die neuen Editionen (17.08.): „es darf sich nichts
 * doppeln". Als Vorsatz hält das nur bis Edition 05 — als Test hält es für
 * immer. Beim Schreiben von 04 und 05 schlägt hier an, was schon existiert.
 */
describe('keine Doppelungen zwischen Editionen', () => {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9äöüß ]/g, '').replace(/\s+/g, ' ').trim();

  it('kein Prompt kommt zweimal vor', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const c of SEED_CARDS) {
      const key = norm(c.prompt);
      const first = seen.get(key);
      if (first) dupes.push(`${first} + ${c.id}: "${c.prompt}"`);
      else seen.set(key, c.id);
    }
    expect(dupes).toEqual([]);
  });

  it('jede Edition behält den Aufbau 5 Dates, 5 Acts, 10 Questions', () => {
    for (const e of SEED_EDITIONS.filter((e) => e.status === 'available')) {
      const by = (g: string) => e.cards.filter((c) => c.group === g).length;
      expect({ edition: e.id, date: by('date'), act: by('act'), question: by('question') })
        .toEqual({ edition: e.id, date: 5, act: 5, question: 10 });
    }
  });

  it('jede Karte gehört zu ihrer eigenen Edition und trägt einen echten Prompt', () => {
    for (const [id, cards] of Object.entries({
      'edition-01': EDITION_01_CARDS,
      'edition-02': EDITION_02_CARDS,
      'edition-03': EDITION_03_CARDS,
    })) {
      for (const c of cards) {
        expect(c.edition).toBe(id);
        expect(c.prompt.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('Edition 03 stellt ihre eigene Frage — die Übersetzung zwischen zwei Menschen', () => {
    // Die Kernkarte der Edition. Verschwindet sie, ist die Edition austauschbar
    // geworden und doppelt sich mit 01 (Wachstum) oder 02 (Nähe).
    const core = EDITION_03_CARDS.find((c) => c.id === 'card-53');
    expect(core?.prompt).toMatch(/almost missed you/i);
  });
});

describe('card catalog', () => {
  it('has globally unique card ids in the card-NN format', () => {
    const ids = SEED_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^card-\d{1,4}$/);
    }
  });

  it('gives every available edition a deck within the allowed size range', () => {
    for (const e of SEED_EDITIONS.filter((e) => e.status === 'available')) {
      expect(e.cards.length).toBe(e.cardCount);
      expect(e.cardCount).toBeGreaterThanOrEqual(DECK_SIZE_RANGE.min);
      expect(e.cardCount).toBeLessThanOrEqual(DECK_SIZE_RANGE.max);
      expect(e.groupLabels).toBeDefined();
    }
  });

  it('leaves upcoming editions empty until their decks are finalized', () => {
    for (const e of SEED_EDITIONS.filter((e) => e.status === 'upcoming')) {
      expect(e.cardCount).toBe(0);
      expect(e.cards.length).toBe(0);
    }
  });

  it('builds the 5 + 5 + 10 structure for both finalized editions', () => {
    for (const cards of [EDITION_01_CARDS, EDITION_02_CARDS]) {
      const counts = { date: 0, act: 0, question: 0 };
      for (const c of cards) {
        expect(c.group).toBeDefined();
        counts[c.group!] += 1;
      }
      expect(counts).toEqual({ date: 5, act: 5, question: 10 });
    }
  });

  it('gives every card a prompt, a title, and at least one section', () => {
    for (const c of SEED_CARDS) {
      expect(c.prompt.trim().length).toBeGreaterThan(0);
      expect(c.content).toBeDefined();
      expect(c.content!.title).toBeTruthy();
      expect(c.content!.sections.length).toBeGreaterThan(0);
    }
  });

  it('marks exactly one "keep the moment" section per card for the preserve CTA', () => {
    for (const c of SEED_CARDS) {
      const keeps = c.content!.sections.filter((s) => s.preserveHere);
      expect(keeps.length).toBe(1);
    }
  });

  it('flags the intimate edition as sensitive', () => {
    const softWild = SEED_EDITIONS.find((e) => e.id === 'edition-02');
    expect(softWild?.sensitive).toBe(true);
  });
});
