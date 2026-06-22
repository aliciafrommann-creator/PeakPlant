import { Edition, Memory, MomentCard, Space, SpaceMember, User } from './types';
import { EDITION_01_CARDS } from './content/edition01';
import { EDITION_02_CARDS } from './content/edition02';

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

/**
 * Every card across all editions. Card ids are globally unique (card-NN) so a
 * single QR format covers the whole catalog. Edition 01 is cards 01–20,
 * Edition 02 is cards 21–40; each card's `number` is its position in its deck.
 */
export const SEED_CARDS: MomentCard[] = [...EDITION_01_CARDS, ...EDITION_02_CARDS];

/** Which cards each space has already preserved a moment for (spaceId → cardIds). */
export const SEED_ACTIVATIONS: Record<string, string[]> = {
  'space-couple-01': ['card-11', 'card-12', 'card-14', 'card-15', 'card-16'],
  'space-friends-01': ['card-05'],
};

/**
 * A deck holds between 15 and 20 cards. Upcoming editions have cardCount 0
 * until their cards are assigned and QR codes generated (done incrementally).
 */
export const DECK_SIZE_RANGE = { min: 15, max: 20 } as const;

/**
 * Couples editions roadmap. Editions 01 (Grow Together) and 02 (Soft & Wild)
 * have finalized decks today (status: available); the rest are on the public
 * roadmap (status: upcoming) with cardCount 0 — their cards aren't assigned
 * yet. Friends editions are intentionally not a product line — friends still
 * use the available couples-neutral editions in a friends space (see
 * PRODUCT.md / decision register).
 */
export const SEED_EDITIONS: Edition[] = [
  {
    id: 'edition-01',
    order: 1,
    name: 'Grow Together',
    subtitle: 'Edition 01 — Sunflower',
    description: 'noticing how you grow, alone and together. dates, small acts and questions.',
    symbol: '🌻',
    color: '#F2B705',
    ink: 'dark',
    status: 'available',
    cardCount: EDITION_01_CARDS.length,
    cards: EDITION_01_CARDS,
    groupLabels: {
      date: 'Grow Date',
      act: 'Small Act of Growth',
      question: 'Growing Question',
    },
  },
  {
    id: 'edition-02',
    order: 2,
    name: 'Soft & Wild',
    subtitle: 'Edition 02 — Ember',
    description: 'intimacy without pressure. desire without performance. curiosity with consent.',
    symbol: '🌹',
    color: '#B23A48',
    ink: 'light',
    status: 'available',
    sensitive: true,
    cardCount: EDITION_02_CARDS.length,
    cards: EDITION_02_CARDS,
    groupLabels: {
      date: 'Intimacy Date',
      act: 'Small Spark',
      question: 'Closer Question',
    },
  },
  {
    id: 'edition-03',
    order: 3,
    name: 'Love Languages',
    subtitle: 'Edition 03 — Letters',
    description: 'discover how each of you gives and receives love.',
    symbol: '💬',
    color: '#E8A0A0',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-04',
    order: 4,
    name: 'In Presence',
    subtitle: 'Edition 04 — Stillness',
    description: 'phones away, fully here. moments of undivided attention.',
    symbol: '🌿',
    color: '#9CAF88',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-05',
    order: 5,
    name: 'Far Away',
    subtitle: 'Edition 05 — Horizon',
    description: 'for the distance — staying close across the miles.',
    symbol: '✈️',
    color: '#7FA8C9',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-06',
    order: 6,
    name: 'Lovemaxing',
    subtitle: 'Edition 06 — Bloom',
    description: 'small daily acts that compound into closeness.',
    symbol: '✨',
    color: '#F0A070',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-07',
    order: 7,
    name: 'Self Worth',
    subtitle: 'Edition 07 — Mirror',
    description: 'grow as individuals, so you grow as a pair.',
    symbol: '🪞',
    color: '#B8A9C9',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-08',
    order: 8,
    name: 'Wild Cards',
    subtitle: 'Edition 08 — Spark',
    description: 'unexpected dares and spontaneous detours.',
    symbol: '🎲',
    color: '#E8633A',
    ink: 'light',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-09',
    order: 9,
    name: 'Hideout',
    subtitle: 'Edition 09 — Nest',
    description: 'slow, cozy moments to retreat into together.',
    symbol: '🏕️',
    color: '#8D7B68',
    ink: 'light',
    status: 'upcoming',
    cardCount: 0,
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
    color: '#A3C9A8',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-11',
    order: 11,
    name: 'After Hours',
    subtitle: 'Edition 11 — Lantern',
    description: 'for busy lives — small moments that fit between everything else.',
    symbol: '🌙',
    color: '#3D4A6B',
    ink: 'light',
    status: 'upcoming',
    cardCount: 0,
    cards: [],
  },
  {
    id: 'edition-12',
    order: 12,
    name: 'After Bedtime',
    subtitle: 'Edition 12 — Hearth',
    description: 'for parents — staying a couple, not just a team.',
    symbol: '🧸',
    color: '#D9A679',
    ink: 'dark',
    status: 'upcoming',
    cardCount: 0,
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
    cardId: 'card-11',
    spaceId: 'space-couple-01',
    note: 'we talked until 2am about the little things — the way you notice when i go quiet, the way you always make sure i eat. i feel seen in the smallest moments.',
    createdAt: '2026-04-03T21:30:00Z',
    updatedAt: '2026-04-03T21:30:00Z',
  },
  {
    id: 'memory-02',
    cardId: 'card-12',
    spaceId: 'space-couple-01',
    note: 'i said i feel most myself when i am making something with my hands, no one watching. you just nodded — you already knew.',
    createdAt: '2026-04-20T09:15:00Z',
    updatedAt: '2026-04-20T09:15:00Z',
  },
  {
    id: 'memory-03',
    cardId: 'card-14',
    spaceId: 'space-couple-01',
    note: 'i am slowly becoming someone who asks for what she needs instead of waiting to be guessed. writing it down made it feel real.',
    createdAt: '2026-05-10T19:45:00Z',
    updatedAt: '2026-05-10T19:45:00Z',
  },
  {
    id: 'memory-04',
    cardId: 'card-05',
    spaceId: 'space-friends-01',
    note: 'we finally planned the cabin weekend we keep talking about. jonas put down a date. mira is bringing the playlist. it is actually happening.',
    createdAt: '2026-05-24T16:20:00Z',
    updatedAt: '2026-05-24T16:20:00Z',
  },
  {
    id: 'memory-05',
    cardId: 'card-15',
    spaceId: 'space-couple-01',
    note: 'told you where i needed more light. you just listened, then changed something the next day. quietly. that meant everything.',
    createdAt: '2026-06-09T20:10:00Z',
    updatedAt: '2026-06-09T20:10:00Z',
  },
  {
    id: 'memory-06',
    cardId: 'card-16',
    spaceId: 'space-couple-01',
    note: 'sunday morning, nowhere to be. coffee, the window open, your feet on my lap. what is already blooming? this. exactly this.',
    createdAt: '2026-06-16T09:30:00Z',
    updatedAt: '2026-06-16T09:30:00Z',
  },
];

export const ONBOARDING_GOALS = [
  { id: 'g1', label: 'deeper conversations', description: 'go beyond day-to-day talk', labelDe: 'tiefere Gesprache', descriptionDe: 'uber den Alltag hinausdenken' },
  { id: 'g2', label: 'shared adventures', description: 'discover new places and things together', labelDe: 'gemeinsame Abenteuer', descriptionDe: 'neue Orte und Dinge zusammen entdecken' },
  { id: 'g3', label: 'more presence', description: 'be fully here, phones away', labelDe: 'mehr Prasenz', descriptionDe: 'ganz da sein, Handys weg' },
  { id: 'g4', label: 'understanding each other', description: 'know what the other person carries', labelDe: 'einander verstehen', descriptionDe: 'wissen, was den anderen bewegt' },
  { id: 'g5', label: 'playful moments', description: 'laugh more, create more', labelDe: 'spielerische Momente', descriptionDe: 'mehr lachen, mehr erschaffen' },
  { id: 'g6', label: 'quiet closeness', description: 'just being, without doing', labelDe: 'stille Nahe', descriptionDe: 'einfach sein, ohne zu tun' },
];
