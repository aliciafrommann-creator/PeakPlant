/**
 * Welche Tinte auf einer Editionsfarbe liest — gerechnet, nicht geschätzt.
 *
 * WARUM ES DAS GIBT: Der Editions-Kopf und die Kartenansicht legten Text auf
 * `edition.color` — zwölf verschiedene Untergründe — und schwächten ihn mit
 * Deckkraft ab (`rgba(26,26,26,0.62)`, `rgba(...,0.5)`). Am 18.08.2026 gegen
 * WCAG gerechnet: die abgeschwächte Stufe scheiterte auf **elf von zwölf**
 * Editionen, die leiseste auf **allen zwölf** — auch auf den drei, die es
 * heute wirklich gibt. Deckkraft ist hier keine Nuance, sondern der Unterschied
 * zwischen lesbar und nicht (MANIFESTO §1: was man nicht lesen kann, hält sein
 * Versprechen nicht).
 *
 * Zweitens war `edition.ink` von Hand gesetzt und bei Edition 08 schlicht
 * falsch — hell markiert, obwohl Dunkel dort 5,20:1 statt 3,13:1 erreicht.
 * Eine Handangabe wird bei jeder neuen Farbe still falsch. Diese Datei rechnet
 * sie stattdessen aus; `lib/editionInk.test.ts` hält fest, dass die Angabe im
 * Seed dazu passt und dass jede Editionsfarbe überhaupt eine Tinte hat, die
 * für kleine Schrift reicht.
 *
 * Hierarchie auf dem Editionskopf entsteht deshalb über Schriftgewicht,
 * Sperrung und Größe — nie über Deckkraft.
 */
import { AA_SMALL_TEXT, bestInk, contrastRatio } from './contrast';

/** Die zwei Tinten, zwischen denen eine Editionsfläche wählen kann. */
export const EDITION_INK_DARK = '#1A1A1A';
export const EDITION_INK_LIGHT = '#FAF7F0';

/** Die besser lesbare der beiden Tinten auf dieser Editionsfarbe. */
export function editionInk(color: string): string {
  return bestInk(color, EDITION_INK_DARK, EDITION_INK_LIGHT);
}

/** `'dark' | 'light'` — dieselbe Wahl, im Vokabular des Seeds. */
export function editionInkName(color: string): 'dark' | 'light' {
  return editionInk(color) === EDITION_INK_DARK ? 'dark' : 'light';
}

/** Reicht die bestmögliche Tinte auf dieser Farbe für kleine Schrift (AA)? */
export function editionInkPassesAA(color: string): boolean {
  return contrastRatio(color, editionInk(color)) >= AA_SMALL_TEXT;
}
