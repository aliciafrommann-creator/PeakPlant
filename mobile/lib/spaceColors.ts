import { Accents } from '../constants/colors';

/**
 * Die Identitätsfarbe eines Space, stabil nach Position.
 *
 * WARUM DAS IN `lib/` LIEGT: Bis zum 18.08.2026 stand die Liste direkt im
 * `SpacePicker`. Für die zwölf Editionsfarben gab es einen Wächtertest, für
 * diese sieben nicht — und genau darin steckten zwei Farben, auf denen KEINE
 * der beiden Tinten die 4,5:1 erreichte. Ein Wächter kann nur prüfen, was er
 * importieren kann; eine Komponente mit JSX kann er nicht. Also hierher.
 */
export const SPACE_COLORS = [
  Accents.chili,
  Accents.blossom,
  Accents.sunflower,
  Accents.ember,
  Accents.apricot,
  Accents.terracotta,
  Accents.sage,
] as const;

export function colorForSpace(index: number): string {
  return SPACE_COLORS[index % SPACE_COLORS.length];
}
