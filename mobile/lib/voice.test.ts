import { describe, it, expect } from 'vitest';
import { voice } from './voice';
import { glyphForSpace, spaceTheme } from './spaceTheme';
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
    // Mit Wortgrenzen: „ne-uer Moment" enthält „euer" als Zeichenkette und ist
    // trotzdem richtig. Ein Wächter, der so etwas meldet, wird abgeschaltet.
    const verboten = ['euch', 'eurem', 'euren', 'euer', 'eure', 'ihr beide', 'you two', 'both of you', 'each other'];
    const muster = verboten.map((w) => ({
      wort: w,
      re: new RegExp(`\\b${w}\\b`, 'i'),
    }));
    const funde: string[] = [];
    for (const k of schluessel) {
      const p = solo[k];
      const text = `${p.en} ${p.de}`;
      const treffer = muster.find((m) => m.re.test(text));
      if (treffer) funde.push(`${k}: „${treffer.wort}"`);
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

/**
 * Der Wächter gegen den eigentlichen Solo-Bugtyp.
 *
 * Nicht die Sätze waren das Problem, sondern die VERZWEIGUNGEN: Ein binäres
 * `type === 'friends' ? … : …` liefert für einen dritten Wert still den
 * Else-Zweig. So bekam der Solo-Space das ♥ des Paar-Space, das 🌶️ des
 * Paar-Sammelstücks, das Etikett „Freunde-Space" und den Satz „Eure Beziehung
 * ist nichts zum Optimieren" — vier Fehler, kein einziger Testausfall.
 *
 * Was hier geprüft wird, ist die Regel dahinter: Eine Funktion, die vom
 * Space-Typ abhängt, muss für alle drei Typen etwas EIGENES liefern.
 */
describe('Verzweigungen nach Space-Typ kennen alle drei', () => {
  it('das Zeichen unterscheidet die drei Arten', () => {
    const zeichen = new Set([glyphForSpace('couple'), glyphForSpace('friends'), glyphForSpace('solo')]);
    expect(zeichen.size, `nur ${zeichen.size} verschiedene Zeichen für drei Arten`).toBe(3);
  });

  it('das Sammelstück unterscheidet die drei Arten', () => {
    const emojis = new Set([spaceTheme('couple').emoji, spaceTheme('friends').emoji, spaceTheme('solo').emoji]);
    expect(emojis.size).toBe(3);
  });

  it('die Anrede unterscheidet allein von geteilt', () => {
    // Paar und Freunde teilen sich die Anrede — das ist gewollt. Solo nicht.
    expect(voice('solo')).not.toEqual(voice('couple'));
    expect(voice('friends')).toEqual(voice('couple'));
  });
});
