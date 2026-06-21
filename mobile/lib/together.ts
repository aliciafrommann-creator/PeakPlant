import type { SpaceType } from './types';

/**
 * "Moments to do together" — small real-world things a space can do together,
 * optionally tied to a local place. This is the first revenue surface beyond
 * product sales: local partner places offer a small perk. Nothing here ever
 * requires a purchase to participate (PP-020 guardrail).
 */

export interface TogetherMoment {
  id: string;
  title: string;
  idea: string;
  category: 'food' | 'outdoors' | 'create' | 'calm' | 'play';
  spaceTypes: SpaceType[];
  placeId?: string;
}

export interface LocalPlace {
  id: string;
  name: string;
  category: string;
  area: string;
  isPartner: boolean;
  /** Partner-only: a small, transparent perk. Never required to take part. */
  perk?: string;
}

export const LOCAL_PLACES: LocalPlace[] = [
  { id: 'pl-1', name: 'Café Katzung', category: 'café', area: 'Innsbruck · Altstadt', isPartner: true, perk: 'a shared slice of cake on us' },
  { id: 'pl-2', name: 'Hofgarten', category: 'park', area: 'Innsbruck · Saggen', isPartner: false },
  { id: 'pl-3', name: 'Markthalle', category: 'market', area: 'Innsbruck · Innrain', isPartner: true, perk: '2 for 1 fresh juice' },
  { id: 'pl-4', name: 'Nordkette viewpoint', category: 'outdoors', area: 'above Innsbruck', isPartner: false },
  { id: 'pl-5', name: 'Die Bäckerei', category: 'culture', area: 'Innsbruck · Wilten', isPartner: true, perk: 'free filter coffee with any workshop' },
  { id: 'pl-6', name: 'Baggersee', category: 'lake', area: 'Rossau', isPartner: false },
];

export const TOGETHER_MOMENTS: TogetherMoment[] = [
  { id: 'tm-1', title: 'one slow coffee', idea: 'no phones, one coffee, one real conversation. leave when it feels done.', category: 'calm', spaceTypes: ['couple', 'friends'], placeId: 'pl-1' },
  { id: 'tm-2', title: 'walk with no plan', idea: 'pick a direction and walk until something makes you stop.', category: 'outdoors', spaceTypes: ['couple', 'friends'], placeId: 'pl-2' },
  { id: 'tm-3', title: 'cook from the market', idea: 'buy whatever looks good, make something with it together.', category: 'food', spaceTypes: ['couple', 'friends'], placeId: 'pl-3' },
  { id: 'tm-4', title: 'watch the light change', idea: 'be up high as the day ends. say less than usual.', category: 'calm', spaceTypes: ['couple'], placeId: 'pl-4' },
  { id: 'tm-5', title: 'make something badly', idea: 'a workshop, a craft, anything. it does not have to be good.', category: 'create', spaceTypes: ['couple', 'friends'], placeId: 'pl-5' },
  { id: 'tm-6', title: 'first swim of the week', idea: 'cold water, loud laughs. the reset you keep forgetting about.', category: 'play', spaceTypes: ['friends'], placeId: 'pl-6' },
  { id: 'tm-7', title: 'trade a small fear', idea: 'each say one thing you were scared of as a kid. just listen.', category: 'calm', spaceTypes: ['couple', 'friends'] },
  { id: 'tm-8', title: 'plan one tiny adventure', idea: 'thirty minutes, one map, one plan for next weekend.', category: 'play', spaceTypes: ['couple', 'friends'] },
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
