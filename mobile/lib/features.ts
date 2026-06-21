/**
 * Feature catalog — the backbone of a customizable app.
 *
 * Every optional capability is a flag a user can turn on or off. Nothing here is
 * a "must": the core (collecting moments together) always works. Flags let the
 * app grow from a calm diary into a fuller platform without forcing any of it.
 */

export type FeatureKey =
  | 'streaks'
  | 'rituals'
  | 'missions'
  | 'localShops'
  | 'challenges'
  | 'communities'
  | 'feed';

export type FeatureStatus = 'live' | 'soon';

export interface FeatureMeta {
  key: FeatureKey;
  label: string;
  description: string;
  status: FeatureStatus;
  defaultEnabled: boolean;
}

export const FEATURES: FeatureMeta[] = [
  {
    key: 'streaks',
    label: 'shared rhythm',
    description:
      'collect the weeks you share moments in — a gentle nudge to do more together. never a must.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'rituals',
    label: 'rituals',
    description: 'turn a moment you loved into something you come back to together.',
    status: 'soon',
    defaultEnabled: false,
  },
  {
    key: 'missions',
    label: 'moments to do together',
    description: 'small real-world things to do as a space, suggested for you.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'localShops',
    label: 'local places',
    description: 'discover nearby spots and partner places to share a moment in.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'challenges',
    label: 'challenges',
    description: 'finite, no-pressure challenges you can take on as a space.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'communities',
    label: 'communities',
    description: 'optional circles beyond your private spaces.',
    status: 'soon',
    defaultEnabled: false,
  },
  {
    key: 'feed',
    label: 'shared feed',
    description: 'a finite, private feed of what your spaces have been up to.',
    status: 'soon',
    defaultEnabled: false,
  },
];

export const DEFAULT_FEATURES: Record<FeatureKey, boolean> = FEATURES.reduce(
  (acc, f) => {
    acc[f.key] = f.defaultEnabled;
    return acc;
  },
  {} as Record<FeatureKey, boolean>,
);
