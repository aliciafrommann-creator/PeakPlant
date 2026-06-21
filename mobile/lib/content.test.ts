import { describe, it, expect } from 'vitest';
import { SEED_CARDS, SEED_EDITIONS, DECK_SIZE_RANGE } from './seed';
import { EDITION_01_CARDS } from './content/edition01';
import { EDITION_02_CARDS } from './content/edition02';

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
