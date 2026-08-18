import { describe, it, expect } from 'vitest';
import { voice } from './voice';
import type { Voice } from './voice';

describe('Anrede je Space-Art', () => {
  const solo = voice('solo');
  const paar = voice('couple');
  const freunde = voice('friends');
  const unbekannt = voice(undefined);

  const schluessel = Object.keys(paar) as (keyof Voice)[];

  it('kein Solo-Satz behauptet eine zweite Person', () => {
    // Dieselbe Liste wie in lib/discovery/soloText.test.ts, auf die Oberfläche
    // angewandt: „euch", „ihr beide", „zusammen" haben in einem Raum für eine
    // Person nichts zu suchen (MANIFESTO §1).
    const verboten = [' euch', 'eurem', 'euren', 'euer', 'eure ', 'ihr beide', 'zwischen euch', 'you two', 'both of you', 'each other'];
    const funde: string[] = [];
    for (const k of schluessel) {
      const p = solo[k];
      const text = `${p.en} ${p.de}`.toLowerCase();
      const treffer = verboten.find((w) => text.includes(w));
      if (treffer) funde.push(`${k}: „${treffer}"`);
    }
    expect(funde, funde.join(' · ')).toEqual([]);
  });

  it('Paar und Freunde behalten die gemeinsame Anrede', () => {
    expect(paar).toEqual(freunde);
    expect(paar.privateToSpace.de).toContain('eurem');
  });

  it('unbekannter Typ fällt auf die geteilte Fassung zurück', () => {
    // Kein Flackern zwischen zwei Anreden, solange der Space lädt.
    expect(unbekannt).toEqual(paar);
  });

  it('jede Anrede hat beide Sprachen und keinen leeren Satz', () => {
    for (const k of schluessel) {
      for (const v of [solo, paar]) {
        expect(v[k].en.trim().length, `${k}.en`).toBeGreaterThan(0);
        expect(v[k].de.trim().length, `${k}.de`).toBeGreaterThan(0);
      }
    }
  });
});
