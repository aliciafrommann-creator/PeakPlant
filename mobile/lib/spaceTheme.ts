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
};

export function spaceTheme(type: SpaceType): SpaceTheme {
  return THEMES[type];
}
