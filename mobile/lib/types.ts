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

/**
 * `available` editions have their cards in the catalog and can be opened today.
 * `upcoming` editions are on the public roadmap but not shipped yet — shown so
 * a space can see what's coming, but not openable.
 */
export type EditionStatus = 'available' | 'upcoming';

export interface Edition {
  id: string;
  /** Roadmap position, e.g. 1 for "Edition 01". */
  order: number;
  name: string;
  subtitle: string;
  description: string;
  /** Symbol/emoji used as the edition's visual marker (e.g. 🌻 for Sunflower). */
  symbol: string;
  /** The edition's signature color — themes its diary when opened. */
  color: string;
  /** Whether text/foreground on `color` should be dark or light (for contrast). */
  ink: 'dark' | 'light';
  status: EditionStatus;
  /**
   * Number of cards in this edition's deck. A deck holds 15–20 cards
   * (see DECK_SIZE_RANGE). 0 means the deck isn't finalized yet — cards are
   * assigned to editions (and their QR codes generated) incrementally.
   */
  cardCount: number;
  cards: MomentCard[];
  coverImage?: string;
}

export interface Goal {
  id: string;
  label: string;
  description: string;
}
