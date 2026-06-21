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
  'space-couple-01': ['card-01', 'card-02', 'card-03'],
  'space-friends-01': ['card-12'],
};

export const SEED_EDITION: Edition = {
  id: 'edition-01',
  name: 'Grow Together',
  subtitle: 'Edition 01 — Sunflower',
  description: 'twenty moments to collect, in any order. choose what feels right.',
  cards: SEED_CARDS,
};

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
];

export const ONBOARDING_GOALS = [
  { id: 'g1', label: 'deeper conversations', description: 'go beyond day-to-day talk' },
  { id: 'g2', label: 'shared adventures', description: 'discover new places and things together' },
  { id: 'g3', label: 'more presence', description: 'be fully here, phones away' },
  { id: 'g4', label: 'understanding each other', description: 'know what the other person carries' },
  { id: 'g5', label: 'playful moments', description: 'laugh more, create more' },
  { id: 'g6', label: 'quiet closeness', description: 'just being, without doing' },
];
