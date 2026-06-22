export type CardType = 'question' | 'action';
export type CardStatus = 'sealed' | 'activated';
/**
 * The three universal groupings inside every edition. Each edition gives them
 * its own display label (see Edition.groupLabels) — e.g. for Grow Together a
 * `date` is a "Grow Date", for Soft & Wild it's an "Intimacy Date".
 */
export type CardGroup = 'date' | 'act' | 'question';
export type Lang = 'en' | 'de';

/** Text that is either English-only (string) or fully bilingual. */
export type LocalizedText = string | { en: string; de: string };

/**
 * One block of the in-app card experience (e.g. "Before you begin",
 * "Talk about it", "Keep the moment"). A section can carry a paragraph,
 * a bullet list, and a closing paragraph — in that order.
 */
export interface CardSection {
  heading: LocalizedText;
  /** Lead paragraph(s); use \n\n between paragraphs. */
  body?: LocalizedText;
  /** Optional bullet list. */
  bullets?: LocalizedText[];
  /** Optional closing paragraph(s) after the bullets. */
  footer?: LocalizedText;
  /** When true, the "preserve this moment" CTA is rendered right after this section. */
  preserveHere?: boolean;
}

export interface CardContent {
  /** In-app title (the physical card carries the short `prompt`). */
  title: LocalizedText;
  sections: CardSection[];
}

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
  /** Short physical-card prompt (EN, printed on the card). Used for sharing. */
  prompt: string;
  type: CardType;
  /** Which of the edition's three groups this card belongs to. */
  group?: CardGroup;
  /** Full content for the in-app card detail experience (shown after scanning). */
  content?: CardContent;
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
  /** Per-edition display names for the three card groups. */
  groupLabels?: { date: LocalizedText; act: LocalizedText; question: LocalizedText };
  /**
   * Intimate editions (e.g. Soft & Wild) carry extra privacy treatment in the
   * UI — quieter previews, "stays private" affordances. See PRODUCT.md.
   */
  sensitive?: boolean;
}

export interface Goal {
  id: string;
  label: string;
  description: string;
}

/** Lifecycle of a saved date idea — progresses forward; never auto-advances. */
export type SavedDateStatus = 'idea' | 'saved' | 'planned' | 'completed' | 'dismissed';

/**
 * A date idea the user saved from the Discover feed for their space.
 * Space-scoped under RLS. The recommendation snapshot (title, concept, priceBand,
 * estDurationMin) is stored so the card renders without re-running the recommender.
 * `memoryId` closes the loop when a completed date becomes a diary memory.
 */
export interface SavedDate {
  id: string;
  spaceId: string;
  momentId: string;
  title: string;
  concept: string;
  priceBand: string;
  estDurationMin: number;
  status: SavedDateStatus;
  savedAt: string;
  plannedFor?: string;
  completedAt?: string;
  memoryId?: string;
}
