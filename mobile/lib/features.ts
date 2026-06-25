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
  labelDe: string;
  description: string;
  descriptionDe: string;
  status: FeatureStatus;
  defaultEnabled: boolean;
}

export const FEATURES: FeatureMeta[] = [
  {
    key: 'streaks',
    label: 'shared rhythm',
    labelDe: 'gemeinsamer Rhythmus',
    description:
      'collect the weeks you share moments in — a gentle nudge to do more together. never a must.',
    descriptionDe:
      'sammelt die Wochen, in denen ihr Momente teilt - ein sanfter Anstoss, mehr gemeinsam zu tun. Nie ein Muss.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'rituals',
    label: 'rituals',
    labelDe: 'Rituale',
    description: 'turn a moment you loved into something you come back to together.',
    descriptionDe: 'macht aus einem Moment, den ihr geliebt habt, etwas, zu dem ihr gemeinsam zuruckkehrt.',
    status: 'soon',
    defaultEnabled: false,
  },
  {
    key: 'missions',
    label: 'moments to do together',
    labelDe: 'gemeinsame Momente',
    description: 'small real-world things to do as a space, suggested for you.',
    descriptionDe: 'kleine reale Dinge, die ihr als Space tun konnt - fur euch vorgeschlagen.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'localShops',
    label: 'local places',
    labelDe: 'lokale Orte',
    description: 'discover current nearby spots to share a moment in.',
    descriptionDe: 'entdeckt aktuelle Orte in der Nahe, um dort einen Moment zu teilen.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'challenges',
    label: 'challenges',
    labelDe: 'Herausforderungen',
    description: 'finite, no-pressure challenges you can take on as a space.',
    descriptionDe: 'zeitlich begrenzte, entspannte Herausforderungen, die ihr als Space annehmen konnt.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'communities',
    label: 'communities',
    labelDe: 'Communities',
    description: 'optional circles beyond your private spaces.',
    descriptionDe: 'optionale Kreise jenseits eurer privaten Spaces.',
    status: 'soon',
    defaultEnabled: false,
  },
  {
    key: 'feed',
    label: 'shared feed',
    labelDe: 'geteilter Feed',
    description: 'a finite, private feed of what your spaces have been up to.',
    descriptionDe: 'ein begrenzter, privater Feed, was eure Spaces zuletzt erlebt haben.',
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
