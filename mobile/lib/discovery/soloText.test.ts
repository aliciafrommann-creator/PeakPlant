import { describe, it, expect } from 'vitest';
import { CURATED_MOMENTS } from './curatedMoments';
import { IDEA_CATALOG } from './ideaCatalog';
import { WEEKLY_CHALLENGES, CHALLENGES } from '../challenges';
import type { LocalizedText, SpaceType } from '../types';

/** Beide Sprachen prüfen — ein „euch" im Deutschen wäre genauso falsch. */
function beideSprachen(t: LocalizedText): string {
  return typeof t === 'string' ? t : `${t.en} ${t.de}`;
}

/**
 * Der Wächter für „voll solo".
 *
 * Ein dritter Space-Typ ist billig; ehrliche Inhalte dafür sind es nicht. Zwei
 * Arten, es zu verpfuschen, und beide wären auf dem Gerät sofort spürbar:
 *
 *  1. Man führt `solo` ein und markiert nichts — dann ist Entdecken leer, und
 *     die App hat eine Tür ohne Raum dahinter.
 *  2. Man markiert alles — dann liest eine Person allein „schreibt euch
 *     gegenseitig einen Brief, tauscht ihn". Das ist kein Vorschlag mehr,
 *     sondern eine Erinnerung daran, allein zu sein (MANIFESTO §1, §3).
 *
 * Gegen 2 hilft kein Auge, sondern eine Liste: Wendungen, die zwei Menschen
 * voraussetzen. Findet der Test eine in einem Solo-Inhalt, ist die Markierung
 * falsch — nicht der Test.
 */

/** Wendungen, die im Englischen zwei Menschen voraussetzen. */
const ZU_ZWEIT = [
  'each other',
  'one another',
  'you two',
  'you both',
  'both of you',
  'neither of you',
  'the other',
  'together',
  'swap',
  'trade',
  'take turns',
  'taking turns',
  'your partner',
  'side by side',
  'friends welcome',
  'yourselves',
  'your families',
  'new to you both',
  'you can get the most',
  // Deutsch: die Anredeform verrät es genauso.
  ' euch',
  'ihr beide',
  'zusammen',
  'gegenseitig',
  'einander',
  'zu zweit',
];

function verstoss(text: string): string | null {
  const t = text.toLowerCase();
  return ZU_ZWEIT.find((w) => t.includes(w)) ?? null;
}

function istSolo(types: SpaceType[]): boolean {
  return types.includes('solo');
}

describe('Solo-Inhalte sind für eine Person geschrieben', () => {
  it('kein kuratierter Solo-Moment spricht zwei Menschen an', () => {
    const falsch = CURATED_MOMENTS.filter((m) => istSolo(m.spaceTypes))
      .map((m) => {
        const w = verstoss(`${m.title} ${m.idea}`);
        return w ? `${m.id}: „${w}"` : null;
      })
      .filter(Boolean);
    expect(falsch, `als solo markiert, aber zu zweit formuliert: ${falsch.join(' · ')}`).toEqual([]);
  });

  it('keine Solo-Idee aus dem Katalog spricht zwei Menschen an', () => {
    const falsch = IDEA_CATALOG.filter((i) => istSolo(i.spaceTypes))
      .map((i) => {
        const w = verstoss(`${i.title} ${i.idea}`);
        return w ? `${i.id}: „${w}"` : null;
      })
      .filter(Boolean);
    expect(falsch, `als solo markiert, aber zu zweit formuliert: ${falsch.join(' · ')}`).toEqual([]);
  });

  it('keine Solo-Challenge spricht zwei Menschen an', () => {
    const alle = [...WEEKLY_CHALLENGES, ...CHALLENGES];
    const falsch = alle
      .filter((c) => istSolo(c.spaceTypes))
      .map((c) => {
        const w = verstoss(`${beideSprachen(c.title)} ${beideSprachen(c.subtitle)}`);
        return w ? `${c.id}: „${w}"` : null;
      })
      .filter(Boolean);
    expect(falsch, `als solo markiert, aber zu zweit formuliert: ${falsch.join(' · ')}`).toEqual([]);
  });
});

describe('Solo ist kein leerer Raum', () => {
  const TYPEN: SpaceType[] = ['couple', 'friends', 'solo'];

  it('jeder Space-Typ hat genug kuratierte Momente', () => {
    for (const typ of TYPEN) {
      const n = CURATED_MOMENTS.filter((m) => m.spaceTypes.includes(typ)).length;
      expect(n, `${typ} hat nur ${n} kuratierte Momente`).toBeGreaterThanOrEqual(30);
    }
  });

  it('jeder Space-Typ hat in jeder Kategorie etwas', () => {
    const kategorien = [...new Set(CURATED_MOMENTS.map((m) => m.category))];
    const luecken: string[] = [];
    for (const typ of TYPEN) {
      for (const k of kategorien) {
        const n = CURATED_MOMENTS.filter(
          (m) => m.spaceTypes.includes(typ) && m.category === k,
        ).length;
        if (n < 4) luecken.push(`${typ}/${k}: ${n}`);
      }
    }
    expect(luecken, `zu dünn: ${luecken.join(' · ')}`).toEqual([]);
  });

  it('jeder Space-Typ hat eine Wochen-Challenge', () => {
    for (const typ of TYPEN) {
      const n = WEEKLY_CHALLENGES.filter((c) => c.spaceTypes.includes(typ)).length;
      expect(n, `${typ} hat ${n} Wochen-Challenges`).toBeGreaterThanOrEqual(3);
    }
  });

  it('jeder Space-Typ findet etwas im großen Katalog', () => {
    for (const typ of TYPEN) {
      const n = IDEA_CATALOG.filter((i) => i.spaceTypes.includes(typ)).length;
      expect(n, `${typ} hat ${n} Katalog-Ideen`).toBeGreaterThanOrEqual(100);
    }
  });
});
