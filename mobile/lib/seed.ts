import { Edition, Memory, MomentCard, Space, SpaceMember, User } from './types';

export const SEED_USER: User = {
  id: 'user-01',
  name: 'Alicia',
};

/**
 * The current user belongs to two spaces: a couple space and a friends space.
 * This demonstrates multi-space membership — the same model, different type.
 */
export const SEED_SPACES: Space[] = [
  {
    id: 'space-couple-01',
    type: 'couple',
    name: 'Alicia & Partner',
    inviteCode: 'PEAK-7842',
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'space-friends-01',
    type: 'friends',
    name: 'The Saturday People',
    inviteCode: 'PEAK-3310',
    createdAt: '2026-04-02T18:00:00Z',
  },
];

export const SEED_MEMBERS: SpaceMember[] = [
  { id: 'm-1', spaceId: 'space-couple-01', userId: 'user-01', name: 'Alicia', role: 'owner', joinedAt: '2026-03-15T10:00:00Z' },
  { id: 'm-2', spaceId: 'space-couple-01', userId: 'user-02', name: 'Partner', role: 'member', joinedAt: '2026-03-15T11:00:00Z' },
  { id: 'm-3', spaceId: 'space-friends-01', userId: 'user-01', name: 'Alicia', role: 'member', joinedAt: '2026-04-02T18:00:00Z' },
  { id: 'm-4', spaceId: 'space-friends-01', userId: 'user-03', name: 'Jonas', role: 'owner', joinedAt: '2026-04-02T18:00:00Z' },
  { id: 'm-5', spaceId: 'space-friends-01', userId: 'user-04', name: 'Mira', role: 'member', joinedAt: '2026-04-02T18:05:00Z' },
];

const CARD_PROMPTS: Array<{ number: number; prompt: string; type: 'question' | 'action' }> = [
  { number: 1, prompt: 'what makes you feel seen by me?', type: 'question' },
  { number: 2, prompt: 'when do you feel most alive with me?', type: 'question' },
  { number: 3, prompt: 'what helps you open up to me?', type: 'question' },
  { number: 4, prompt: 'what makes our relationship feel warm?', type: 'question' },
  { number: 5, prompt: 'where do you need more light from me?', type: 'question' },
  { number: 6, prompt: 'when do you feel safe enough to fully bloom?', type: 'question' },
  { number: 7, prompt: 'where do you need space to grow on your own?', type: 'question' },
  { number: 8, prompt: 'what are we still growing into together?', type: 'question' },
  { number: 9, prompt: 'how do we find our way back to each other?', type: 'question' },
  { number: 10, prompt: 'what have we helped each other become?', type: 'question' },
  { number: 11, prompt: 'cook something neither of us has ever made. eat it together before it cools.', type: 'action' },
  { number: 12, prompt: 'take a walk with no destination. stop when something catches your attention.', type: 'action' },
  { number: 13, prompt: 'put your phones in another room for two hours. do something with your hands.', type: 'action' },
  { number: 14, prompt: 'write one thing you love about this person. give it to them without explanation.', type: 'action' },
  { number: 15, prompt: "find a place you haven't been together. spend at least an hour there.", type: 'action' },
  { number: 16, prompt: 'sit in silence for five minutes. just be next to each other.', type: 'action' },
  { number: 17, prompt: 'tell each other what you were afraid of as a child. listen without fixing.', type: 'action' },
  { number: 18, prompt: "make something together. it doesn't have to be good.", type: 'action' },
  { number: 19, prompt: "one thing you've never said out loud. say it tonight.", type: 'action' },
  { number: 20, prompt: 'take one photo of something that represents where you are right now.', type: 'action' },
];

export const SEED_CARDS: MomentCard[] = CARD_PROMPTS.map((c) => ({
  id: `card-${String(c.number).padStart(2, '0')}`,
  number: c.number,
  prompt: c.prompt,
  type: c.type,
  edition: 'edition-01',
  // Base status is always 'sealed'; activation is tracked per space (see SEED_ACTIVATIONS).
  status: 'sealed',
}));

/** Which cards each space has already preserved a moment for (spaceId → cardIds). */
export const SEED_ACTIVATIONS: Record<string, string[]> = {
  'space-couple-01': ['card-01', 'card-02', 'card-03', 'card-04', 'card-05'],
  'space-friends-01': ['card-12'],
};

/**
 * Couples editions roadmap. Only edition-01 ships with its 20 cards today
 * (status: available); the rest are on the public roadmap (status: upcoming)
 * so a space can see what's coming. Friends editions are intentionally not a
 * product line — friends still use the available couples-neutral editions in a
 * friends space (see PRODUCT.md / decision register).
 */
export const SEED_EDITIONS: Edition[] = [
  {
    id: 'edition-01',
    order: 1,
    name: 'Grow Together',
    subtitle: 'Edition 01 — Sunflower',
    description: 'twenty moments to collect, in any order. choose what feels right.',
    symbol: '🌻',
    status: 'available',
    cardCount: SEED_CARDS.length,
    cards: SEED_CARDS,
  },
  {
    id: 'edition-02',
    order: 2,
    name: 'Love Languages',
    subtitle: 'Edition 02 — Letters',
    description: 'discover how each of you gives and receives love.',
    symbol: '💬',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-03',
    order: 3,
    name: 'In Presence',
    subtitle: 'Edition 03 — Stillness',
    description: 'phones away, fully here. moments of undivided attention.',
    symbol: '🌿',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-04',
    order: 4,
    name: 'Deep Spice',
    subtitle: 'Edition 04 — Ember',
    description: 'playful heat and honest desire, just for the two of you.',
    symbol: '🌶️',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-05',
    order: 5,
    name: 'Far Away',
    subtitle: 'Edition 05 — Horizon',
    description: 'for the distance — staying close across the miles.',
    symbol: '✈️',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-06',
    order: 6,
    name: 'Lovemaxing',
    subtitle: 'Edition 06 — Bloom',
    description: 'small daily acts that compound into closeness.',
    symbol: '✨',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-07',
    order: 7,
    name: 'Self Worth',
    subtitle: 'Edition 07 — Mirror',
    description: 'grow as individuals, so you grow as a pair.',
    symbol: '🪞',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-08',
    order: 8,
    name: 'Wild Cards',
    subtitle: 'Edition 08 — Spark',
    description: 'unexpected dares and spontaneous detours.',
    symbol: '🎲',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-09',
    order: 9,
    name: 'Hideout',
    subtitle: 'Edition 09 — Nest',
    description: 'slow, cozy moments to retreat into together.',
    symbol: '🏕️',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  // Life-stage editions — for a specific season of a relationship.
  {
    id: 'edition-10',
    order: 10,
    name: 'Just Started',
    subtitle: 'Edition 10 — Seedling',
    description: 'for the early days — getting to know each other, one moment at a time.',
    symbol: '🌱',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-11',
    order: 11,
    name: 'After Hours',
    subtitle: 'Edition 11 — Lantern',
    description: 'for busy lives — small moments that fit between everything else.',
    symbol: '🌙',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
  {
    id: 'edition-12',
    order: 12,
    name: 'After Bedtime',
    subtitle: 'Edition 12 — Hearth',
    description: 'for parents — staying a couple, not just a team.',
    symbol: '🧸',
    status: 'upcoming',
    cardCount: 20,
    cards: [],
  },
];

/** Back-compat: the launch edition. Prefer SEED_EDITIONS / getEdition(id). */
export const SEED_EDITION: Edition = SEED_EDITIONS[0];

export function getEdition(editionId: string): Edition | undefined {
  return SEED_EDITIONS.find((e) => e.id === editionId);
}

export const SEED_MEMORIES: Memory[] = [
  {
    id: 'memory-01',
    cardId: 'card-01',
    spaceId: 'space-couple-01',
    note: 'we talked until 2am about the little things — the way you notice when i go quiet, the way you always make sure i eat. i feel seen in the smallest moments.',
    createdAt: '2026-04-03T21:30:00Z',
    updatedAt: '2026-04-03T21:30:00Z',
  },
  {
    id: 'memory-02',
    cardId: 'card-02',
    spaceId: 'space-couple-01',
    note: 'hiking to the summit. the wind, the silence, the way we just stood there without needing to say anything. that morning felt infinite.',
    photoUri: undefined,
    createdAt: '2026-04-20T09:15:00Z',
    updatedAt: '2026-04-20T09:15:00Z',
  },
  {
    id: 'memory-03',
    cardId: 'card-03',
    spaceId: 'space-couple-01',
    note: 'you asked me what i needed instead of guessing. that was it. that was all i ever needed.',
    createdAt: '2026-05-10T19:45:00Z',
    updatedAt: '2026-05-10T19:45:00Z',
  },
  {
    id: 'memory-04',
    cardId: 'card-12',
    spaceId: 'space-friends-01',
    note: 'no destination, just walked the river until it got dark. jonas found that tiny bakery. we stayed way too long. easy day, good people.',
    createdAt: '2026-05-24T16:20:00Z',
    updatedAt: '2026-05-24T16:20:00Z',
  },
  {
    id: 'memory-05',
    cardId: 'card-05',
    spaceId: 'space-couple-01',
    note: 'told you where i needed more light. you just listened, then changed something the next day. quietly. that meant everything.',
    createdAt: '2026-06-09T20:10:00Z',
    updatedAt: '2026-06-09T20:10:00Z',
  },
  {
    id: 'memory-06',
    cardId: 'card-04',
    spaceId: 'space-couple-01',
    note: 'sunday morning, nowhere to be. coffee, the window open, your feet on my lap. warm. that\'s the word.',
    createdAt: '2026-06-16T09:30:00Z',
    updatedAt: '2026-06-16T09:30:00Z',
  },
];

export const ONBOARDING_GOALS = [
  { id: 'g1', label: 'deeper conversations', description: 'go beyond day-to-day talk' },
  { id: 'g2', label: 'shared adventures', description: 'discover new places and things together' },
  { id: 'g3', label: 'more presence', description: 'be fully here, phones away' },
  { id: 'g4', label: 'understanding each other', description: 'know what the other person carries' },
  { id: 'g5', label: 'playful moments', description: 'laugh more, create more' },
  { id: 'g6', label: 'quiet closeness', description: 'just being, without doing' },
];
