export type CardType = 'question' | 'action';
export type CardStatus = 'sealed' | 'activated';

/**
 * A Space is the shared container two-or-more people preserve moments in.
 * The original couple is just one kind of space; friends spaces use the exact
 * same model. A single user can belong to several spaces at once.
 */
export type SpaceType = 'couple' | 'friends';

export interface Space {
  id: string;
  type: SpaceType;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export type SpaceRole = 'owner' | 'member';

export interface SpaceMember {
  id: string;
  spaceId: string;
  userId: string;
  name: string;
  role: SpaceRole;
  joinedAt: string;
}

export interface MomentCard {
  id: string;
  number: number;
  prompt: string;
  type: CardType;
  edition: string;
  /** Derived per space: a card is `activated` once that space preserves a moment for it. */
  status: CardStatus;
}

export interface Memory {
  id: string;
  cardId: string;
  spaceId: string;
  note: string;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Edition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  cards: MomentCard[];
  coverImage?: string;
}

export interface Goal {
  id: string;
  label: string;
  description: string;
}
