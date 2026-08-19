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
    // Der Schlüssel heißt aus Kompatibilitätsgründen weiter 'streaks' (er liegt
    // so in den Einstellungen der bestehenden Nutzer). Eine Serie ist es seit
    // dem 17.08.2026 nicht mehr — siehe lib/streaks.ts.
    key: 'streaks',
    label: 'weeks together',
    labelDe: 'gemeinsame Wochen',
    description:
      'counts the weeks that hold a moment you kept. it only ever goes up — a skipped week costs nothing.',
    descriptionDe:
      'zählt die Wochen, in denen ihr etwas festgehalten habt. Die Zahl kann nur steigen — eine ausgelassene Woche kostet nichts.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'rituals',
    label: 'rituals',
    labelDe: 'Rituale',
    description: 'turn a moment you loved into something you come back to together.',
    // Unpersönlich formuliert, weil dieser Katalog keinen Space kennt: Er
    // beschreibt die Funktion, nicht die Menschen davor. „ihr … gemeinsam"
    // behauptete eine zweite Person, die es in einem Solo-Space nicht gibt.
    descriptionDe: 'macht aus einem geliebten Moment etwas, zu dem man zurückkehrt.',
    status: 'soon',
    defaultEnabled: false,
  },
  {
    key: 'missions',
    label: 'moments to do together',
    labelDe: 'gemeinsame Momente',
    description: 'small real-world things to do as a space, suggested for you.',
    descriptionDe: 'kleine reale Dinge, die ihr als Space tun könnt — für euch vorgeschlagen.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'localShops',
    label: 'local places',
    labelDe: 'lokale Orte',
    description: 'discover current nearby spots to share a moment in.',
    descriptionDe: 'entdeckt aktuelle Orte in der Nähe, um dort einen Moment zu teilen.',
    status: 'live',
    defaultEnabled: true,
  },
  {
    key: 'challenges',
    label: 'challenges',
    labelDe: 'Herausforderungen',
    description: 'finite, no-pressure challenges you can take on as a space.',
    descriptionDe: 'zeitlich begrenzte, entspannte Herausforderungen, die ihr als Space annehmen könnt.',
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
    descriptionDe: 'ein begrenzter, privater Feed, was in deinen Spaces zuletzt passiert ist.',
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
