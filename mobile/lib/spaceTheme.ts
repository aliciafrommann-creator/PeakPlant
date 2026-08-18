import type { SpaceType } from './types';

/**
 * Per-space-type flavour. Couples collect chillis (spice); friends collect
 * sunflowers (growth). Used for the shared-rhythm collectible, never for scoring.
 */
export interface SpaceTheme {
  emoji: string;
  /** The thing you collect, singular/plural. */
  unit: string;
  units: string;
}

const THEMES: Record<SpaceType, SpaceTheme> = {
  couple: { emoji: '🌶️', unit: 'chilli', units: 'chillis' },
  friends: { emoji: '🌻', unit: 'sunflower', units: 'sunflowers' },
  // Ein Solo-Space sammelt Steine: etwas, das man aufhebt, weil man an dem Tag
  // dort war. Kein Wachstumsbild, das nach Fortschritt aussieht (MANIFESTO §3).
  solo: { emoji: '🪨', unit: 'stone', units: 'stones' },
};

export function spaceTheme(type: SpaceType): SpaceTheme {
  return THEMES[type];
}

/**
 * Das Zeichen eines Space, wenn er kein eigenes Emoji hat.
 *
 * Als Funktion und nicht als Ternär im Bildschirm: Genau solche
 * `type === 'friends' ? … : …` haben beim Hinzufügen von `solo` an vier
 * Stellen still das Falsche geliefert — der Solo-Space bekam das Herz und das
 * Chili des Paar-Space (18.08.2026).
 */
export function glyphForSpace(type: SpaceType | undefined): string {
  if (type === 'couple') return '♥';
  if (type === 'solo') return '🪨';
  if (type === 'friends') return '✦';
  // Unbekannt heißt unbekannt — kein Zeichen, das etwas behauptet.
  return '✦';
}
