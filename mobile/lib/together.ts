import type { SpaceType } from './types';

/**
 * "Moments to do together" — small real-world things a space can do together,
 * optionally tied to a local place. This is the first revenue surface beyond
 * product sales: local partner places offer a small perk. Nothing here ever
 * requires a purchase to participate (PP-020 guardrail).
 *
 * Phase 2 (Date Discovery) enriches each moment/place with structured fields
 * (duration, budget, indoor/outdoor, time-of-day, weather fit, energy) so the
 * recommender can match them to a couple's situation. Every fact carries a
 * `provenance` label — for the MVP the data is hand-curated, so the honest
 * label is `curated` (never `verified-live`). See DATE_DISCOVERY_STRATEGY §9/§15.
 */

/** How confident we are in a given fact — shown to the user, never faked. */
export type Provenance =
  | 'verified-live' // fetched live from a provider (Phase 3+)
  | 'estimated' // derived/approximate
  | 'curated' // hand-verified by PeakPlant (MVP default)
  | 'ai-interpretation' // produced by the model, labelled as such
  | 'needs-confirmation'; // user should double-check before relying on it

export type PriceBand = 'free' | '€' | '€€' | '€€€';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'flexible';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type Weather = 'sunny' | 'rain' | 'cold' | 'any';
export type Energy = 'low' | 'medium' | 'high';

export type MomentCategory = 'food' | 'outdoors' | 'create' | 'calm' | 'play';

export interface TogetherMoment {
  id: string;
  title: string;
  idea: string;
  category: MomentCategory;
  spaceTypes: SpaceType[];
  placeId?: string;
  // ── Phase 2 structured fields (curated) ──
  /** Typical cost of doing this activity, independent of any specific venue. */
  priceBand: PriceBand;
  /** Where it happens — drives weather/season suitability. */
  indoorOutdoor: IndoorOutdoor;
  /** Roughly how long it takes, in minutes. */
  avgDurationMin: number;
  /** Physical/social energy it asks for. */
  energy: Energy;
  /** Times of day it works best. */
  idealTimeOfDay: TimeOfDay[];
  /** Weather it suits (`any` = weather-independent). */
  weatherFit: Weather[];
  /** Cards whose theme this moment pairs with (closes the card↔discovery loop). */
  linkedCardIds: string[];
}

export interface LocalPlace {
  id: string;
  name: string;
  category: string;
  area: string;
  isPartner: boolean;
  /** Partner-only: a small, transparent perk. Never required to take part. */
  perk?: string;
  // ── Phase 2 structured fields (curated) ──
  priceBand: PriceBand;
  /** Short accessibility notes, e.g. 'step-free', 'quiet'. */
  accessibility: string[];
  /** Free-text descriptors for filtering/search. */
  tags: string[];
  provenance: Provenance;
  /** ISO date this entry was last hand-verified. */
  lastVerifiedAt: string;
  /** Coordinates land with the Places API (Phase 3); omitted while curated. */
  lat?: number;
  lng?: number;
}

const VERIFIED = '2026-06-01';

export const LOCAL_PLACES: LocalPlace[] = [
  {
    id: 'pl-1',
    name: 'Café Katzung',
    category: 'café',
    area: 'Innsbruck · Altstadt',
    isPartner: true,
    perk: 'a shared slice of cake on us',
    priceBand: '€€',
    accessibility: ['step-free', 'quiet'],
    tags: ['coffee', 'cosy', 'conversation', 'classic'],
    provenance: 'curated',
    lastVerifiedAt: VERIFIED,
    lat: 47.2681634,
    lng: 11.3931386,
  },
  {
    id: 'pl-2',
    name: 'Hofgarten',
    category: 'park',
    area: 'Innsbruck · Saggen',
    isPartner: false,
    priceBand: 'free',
    accessibility: ['step-free', 'dog-friendly'],
    tags: ['nature', 'walk', 'green', 'calm'],
    provenance: 'curated',
    lastVerifiedAt: VERIFIED,
    lat: 47.271399,
    lng: 11.3971442,
  },
  {
    id: 'pl-3',
    name: 'Markthalle',
    category: 'market',
    area: 'Innsbruck · Innrain',
    isPartner: true,
    perk: '2 for 1 fresh juice',
    priceBand: '€€',
    accessibility: ['step-free'],
    tags: ['food', 'local', 'fresh', 'lively'],
    provenance: 'curated',
    lastVerifiedAt: VERIFIED,
    lat: 47.267186,
    lng: 11.3895995,
  },
  {
    id: 'pl-4',
    name: 'Nordkette viewpoint',
    category: 'outdoors',
    area: 'above Innsbruck',
    isPartner: false,
    priceBand: '€€€',
    accessibility: ['cable-car access'],
    tags: ['view', 'mountains', 'sunset', 'awe'],
    provenance: 'curated',
    lastVerifiedAt: VERIFIED,
    lat: 47.3169606,
    lng: 11.4055396,
  },
  {
    id: 'pl-5',
    name: 'Die Bäckerei',
    category: 'culture',
    area: 'Innsbruck · Wilten',
    isPartner: true,
    perk: 'free filter coffee with any workshop',
    priceBand: '€€',
    accessibility: ['step-free'],
    tags: ['creative', 'workshop', 'community', 'making'],
    provenance: 'curated',
    lastVerifiedAt: VERIFIED,
    lat: 47.2688441,
    lng: 11.4047938,
  },
  {
    id: 'pl-6',
    name: 'Baggersee',
    category: 'lake',
    area: 'Rossau',
    isPartner: false,
    priceBand: 'free',
    accessibility: ['dog-friendly'],
    tags: ['swim', 'water', 'summer', 'play'],
    provenance: 'curated',
    lastVerifiedAt: VERIFIED,
    lat: 47.2654976,
    lng: 11.4419156,
  },
];

export const TOGETHER_MOMENTS: TogetherMoment[] = [
  {
    id: 'tm-1',
    title: 'one slow coffee',
    idea: 'no phones, one coffee, one real conversation. leave when it feels done.',
    category: 'calm',
    spaceTypes: ['couple', 'friends'],
    placeId: 'pl-1',
    priceBand: '€€',
    indoorOutdoor: 'indoor',
    avgDurationMin: 60,
    energy: 'low',
    idealTimeOfDay: ['morning', 'afternoon'],
    weatherFit: ['any', 'rain', 'cold'],
    linkedCardIds: ['card-01', 'card-04'],
  },
  {
    id: 'tm-2',
    title: 'walk with no plan',
    idea: 'pick a direction and walk until something makes you stop.',
    category: 'outdoors',
    spaceTypes: ['couple', 'friends'],
    placeId: 'pl-2',
    priceBand: 'free',
    indoorOutdoor: 'outdoor',
    avgDurationMin: 75,
    energy: 'medium',
    idealTimeOfDay: ['morning', 'afternoon', 'evening'],
    weatherFit: ['sunny', 'cold'],
    linkedCardIds: ['card-02', 'card-13'],
  },
  {
    id: 'tm-3',
    title: 'cook from the market',
    idea: 'buy whatever looks good, make something with it together.',
    category: 'food',
    spaceTypes: ['couple', 'friends'],
    placeId: 'pl-3',
    priceBand: '€€',
    indoorOutdoor: 'flexible',
    avgDurationMin: 150,
    energy: 'medium',
    idealTimeOfDay: ['afternoon', 'evening'],
    weatherFit: ['any', 'rain', 'cold'],
    linkedCardIds: ['card-12'],
  },
  {
    id: 'tm-4',
    title: 'watch the light change',
    idea: 'be up high as the day ends. say less than usual.',
    category: 'calm',
    spaceTypes: ['couple'],
    placeId: 'pl-4',
    priceBand: '€€€',
    indoorOutdoor: 'outdoor',
    avgDurationMin: 120,
    energy: 'low',
    idealTimeOfDay: ['evening'],
    weatherFit: ['sunny'],
    linkedCardIds: ['card-06', 'card-16'],
  },
  {
    id: 'tm-5',
    title: 'make something badly',
    idea: 'a workshop, a craft, anything. it does not have to be good.',
    category: 'create',
    spaceTypes: ['couple', 'friends'],
    placeId: 'pl-5',
    priceBand: '€€',
    indoorOutdoor: 'indoor',
    avgDurationMin: 120,
    energy: 'medium',
    idealTimeOfDay: ['afternoon', 'evening'],
    weatherFit: ['any', 'rain', 'cold'],
    linkedCardIds: ['card-11', 'card-18'],
  },
  {
    id: 'tm-6',
    title: 'first swim of the week',
    idea: 'cold water, loud laughs. the reset you keep forgetting about.',
    category: 'play',
    spaceTypes: ['friends'],
    placeId: 'pl-6',
    priceBand: 'free',
    indoorOutdoor: 'outdoor',
    avgDurationMin: 90,
    energy: 'high',
    idealTimeOfDay: ['morning', 'afternoon'],
    weatherFit: ['sunny'],
    linkedCardIds: ['card-19'],
  },
  {
    id: 'tm-7',
    title: 'trade a small fear',
    idea: 'each say one thing you were scared of as a kid. just listen.',
    category: 'calm',
    spaceTypes: ['couple', 'friends'],
    priceBand: 'free',
    indoorOutdoor: 'flexible',
    avgDurationMin: 30,
    energy: 'low',
    idealTimeOfDay: ['evening'],
    weatherFit: ['any', 'rain', 'cold', 'sunny'],
    linkedCardIds: ['card-03', 'card-07'],
  },
  {
    id: 'tm-8',
    title: 'plan one tiny adventure',
    idea: 'thirty minutes, one map, one plan for next weekend.',
    category: 'play',
    spaceTypes: ['couple', 'friends'],
    priceBand: 'free',
    indoorOutdoor: 'flexible',
    avgDurationMin: 30,
    energy: 'low',
    idealTimeOfDay: ['morning', 'afternoon', 'evening'],
    weatherFit: ['any', 'rain', 'cold', 'sunny'],
    linkedCardIds: ['card-15'],
  },
];

export function placeById(id?: string): LocalPlace | undefined {
  if (!id) return undefined;
  return LOCAL_PLACES.find((p) => p.id === id);
}

export function momentById(id: string): TogetherMoment | undefined {
  return TOGETHER_MOMENTS.find((m) => m.id === id);
}

export function momentsForSpaceType(type: SpaceType): TogetherMoment[] {
  return TOGETHER_MOMENTS.filter((m) => m.spaceTypes.includes(type));
}

const GOAL_CATEGORY_AFFINITY: Record<string, TogetherMoment['category']> = {
  'deeper conversations': 'calm',
  'shared adventures': 'outdoors',
  'more presence': 'calm',
  'understanding each other': 'calm',
  'playful moments': 'play',
  'quiet closeness': 'calm',
};

export function goalCategory(goal: string): MomentCategory | undefined {
  return GOAL_CATEGORY_AFFINITY[goal];
}

/**
 * Deterministic pick of a fitting moment given selected goals — used as the
 * non-AI fallback and reused by the AI's null implementation.
 */
export function pickTogetherMoment(
  candidates: TogetherMoment[],
  goals: string[],
): TogetherMoment | undefined {
  if (candidates.length === 0) return undefined;
  for (const goal of goals) {
    const cat = GOAL_CATEGORY_AFFINITY[goal];
    const match = candidates.find((m) => m.category === cat);
    if (match) return match;
  }
  return candidates[0];
}
