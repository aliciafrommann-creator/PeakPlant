/**
 * Batik-Farbwelten — eine Färbung je Edition.
 *
 * ENTSCHEIDUNG (Alicia, 19.08.2026): Jede Edition bekommt eine eigene Färbung
 * statt einer flachen Farbe. „einfach verschiedene batik themes je nach
 * edition" — die Sammlung wird dadurch lebendig, ohne dass sich ein Layout
 * ändert. Die vier ersten Welten hat Alicia benannt; die übrigen acht sind aus
 * der bestehenden Editionsfarbe im selben Rezept abgeleitet und warten auf ihr
 * Wort (siehe `abgeleitet` unten).
 *
 * DAS REZEPT: ein GRUNDTON plus vier LICHTER. Ein einzelner Verlauf zwischen
 * zwei Farben sieht sofort nach Software aus; erst mehrere überlagerte Lichter
 * und eine Störung darüber wirken wie gefärbter Stoff.
 *
 * HELL, NICHT DUNKEL — und das war eine Korrektur. Der erste Anlauf machte
 * jeden Grund fast schwarz, damit helle Schrift darauf trägt. Alicias Urteil:
 * „ein bisschen extrem batik dunkel". Sie hatte recht, und ihre Vorbilder
 * machen es genau andersherum: „LIEBE" von beherzt ist knallgelb mit
 * SCHWARZER Schrift. Die Färbung darf also leuchten; was sich anpasst, ist die
 * Tinte.
 *
 * Deshalb schreibt diese Datei die Tinte NICHT vor. `lib/editionInk.ts`
 * rechnet je Fläche aus, welche der beiden besser liest — und
 * `lib/dyes.test.ts` hält fest, dass auf JEDEM Grundton eine von beiden 4,5:1
 * erreicht. Eine Welt darf hell sein, eine darf tief sein; keine darf
 * dazwischen hängen, wo keine Tinte mehr trägt.
 *
 * WAS HIER NICHT STEHT: wie die Färbung gerendert wird. Diese Datei ist das
 * Rezept, nicht das Bild. React Native kann von sich aus weder überlagerte
 * Verläufe noch eine Störung; der Weg dorthin ist eine eigene Entscheidung
 * (vorgerenderte Bilder je Edition oder zusätzliche Pakete). Bis dahin ist der
 * GRUND schon für sich brauchbar — er ist eine einzelne, flache Farbe und
 * ersetzt überall dort die alte `edition.color`, wo sie eine Fläche war.
 *
 * EHRLICH ZUR HERKUNFT (MANIFESTO §1): Alicia hat die vier Welten mit NAMEN
 * beschrieben („Cyan Electric, Midnight Violet, Deep Blue, Neon Pink"), nicht
 * mit Hex-Werten. Die Werte unten sind meine Lesart dieser Beschreibung. Wenn
 * ihre echten Codes kommen, werden sie hier ersetzt — eine Zeile je Welt.
 */

export interface Dye {
  /** Der Name der Farbwelt. */
  readonly name: string;
  /**
   * Der Grundton der Färbung — hell oder tief, je Welt.
   * Welche Tinte darauf liest, rechnet `editionInk()` aus.
   */
  readonly ground: string;
  /** Die vier Lichter, aus denen die Färbung entsteht. */
  readonly lights: readonly [string, string, string, string];
  /** Von Alicia benannt (true) oder aus der Editionsfarbe abgeleitet (false). */
  readonly namedByAlicia: boolean;
}

export const DYES: Readonly<Record<string, Dye>> = {
  // ── Alicias vier Welten (19.08.2026) ──────────────────────────────────
  'edition-01': {
    name: 'Velvet Passion',
    ground: '#F06AA8',
    lights: ['#FBC2DC', '#C0399B', '#F58A6E', '#F2C14E'],
    namedByAlicia: true,
  },
  'edition-02': {
    name: 'Cyber Midnight',
    ground: '#1D2B6B',
    lights: ['#22D3EE', '#8B5CF6', '#3B82F6', '#FF2D95'],
    namedByAlicia: true,
  },
  'edition-03': {
    name: 'Warm Ember',
    ground: '#F2A85E',
    lights: ['#FBD9A8', '#E8633A', '#D93B4E', '#F5C978'],
    namedByAlicia: true,
  },
  'edition-04': {
    name: 'Acid Electric',
    ground: '#C6F135',
    lights: ['#EAFCA0', '#E01E86', '#35E0E8', '#8B5CF6'],
    namedByAlicia: true,
  },

  // ── Abgeleitet aus der bestehenden Editionsfarbe, im selben Rezept ────
  // Diese acht warten auf Alicias Wort. Sie sind bewusst zurückhaltender als
  // die vier oben — es wäre falsch, ihr eine Handschrift unterzuschieben, die
  // sie nicht gewählt hat.
  'edition-05': {
    name: 'Horizon',
    ground: '#7FA8C9',
    lights: ['#D3E4F0', '#4F7593', '#9385AE', '#A8CBE0'],
    namedByAlicia: false,
  },
  'edition-06': {
    name: 'Bloom',
    ground: '#F0A070',
    lights: ['#FBD5BC', '#D9477E', '#E8A33C', '#CF4B2C'],
    namedByAlicia: false,
  },
  'edition-07': {
    name: 'Mirror',
    ground: '#B8A9C9',
    lights: ['#E4DCEC', '#7C6690', '#D9477E', '#CBBFD9'],
    namedByAlicia: false,
  },
  'edition-08': {
    name: 'Spark',
    ground: '#E8633A',
    lights: ['#F8C4AE', '#F2B705', '#CF4B2C', '#F09070'],
    namedByAlicia: false,
  },
  'edition-09': {
    name: 'Nest',
    ground: '#B79E85',
    lights: ['#E4D6C4', '#8D7B68', '#B5532E', '#CBB59B'],
    namedByAlicia: false,
  },
  'edition-10': {
    name: 'Seedling',
    ground: '#A3C9A8',
    lights: ['#DDEBDB', '#6F9C7A', '#C9DCC0', '#8FBF9A'],
    namedByAlicia: false,
  },
  'edition-11': {
    name: 'Lantern',
    ground: '#3D4A6B',
    lights: ['#7FA8C9', '#9AB4CE', '#5B4A7A', '#22D3EE'],
    namedByAlicia: false,
  },
  'edition-12': {
    name: 'Hearth',
    ground: '#D9A679',
    lights: ['#F0DCC2', '#CF4B2C', '#E8A33C', '#C08E5E'],
    namedByAlicia: false,
  },
};

/**
 * Die Färbung einer Edition.
 *
 * Fällt bewusst NICHT auf eine Standardfarbe zurück: Eine Edition ohne Rezept
 * ist ein Fehler, den `lib/dyes.test.ts` findet, keiner, den die Oberfläche
 * mit einem grauen Kasten überspielen soll.
 */
export function dyeFor(editionId: string): Dye | undefined {
  return DYES[editionId];
}
