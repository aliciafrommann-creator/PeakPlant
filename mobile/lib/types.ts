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
  /**
   * Shared space emoji. Synced via the `spaces.emoji` column when Supabase is
   * configured (migration 0012); falls back to local storage otherwise so both
   * members see the same mark.
   */
  emoji?: string;
  /** Shared avatar storage path in the `space-avatars` bucket (server). */
  avatarPath?: string;
  /** Transient, client-only signed URL resolved from `avatarPath` for display. */
  avatarUrl?: string;
  /** Local-only: the collectible emoji stamped per completed challenge. */
  collectibleEmoji?: string;
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
 * A short, dedicated note one member leaves for their space — a love message
 * to the partner. Space-scoped under the same RLS as memories: both members
 * read every note, only the author writes their own. `authorId`/`authorName`
 * let the UI distinguish "your note" from "from your partner".
 */
export interface PartnerNote {
  id: string;
  spaceId: string;
  text: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
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

/**
 * Lifecycle of a saved date idea — moves only on explicit user action, never
 * auto-advances. `cancelled` = a plan that was called off. The legal moves
 * between these are defined in lib/savedDates/status.ts.
 */
export type SavedDateStatus =
  | 'idea'
  | 'saved'
  | 'planned'
  | 'cancelled'
  | 'completed'
  | 'dismissed';

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
  /** Optional live/public place snapshot. Kept separate from private notes. */
  placeId?: string;
  placeName?: string;
  placeAddress?: string;
  placeLat?: number;
  placeLng?: number;
  placeCategory?: string;
  placeMapsUrl?: string;
  plannedFor?: string;
  /** Optional free-text logistics for a plan (who's booking, what to bring). */
  planningNotes?: string;
  completedAt?: string;
  memoryId?: string;
}

/**
 * How often a couple wants to come back to a ritual. 'whenever' = no cadence,
 * just a saved practice they can revisit anytime.
 */
export type RitualCadence = 'weekly' | 'monthly' | 'seasonally' | 'whenever';

/**
 * A ritual is a moment a space loved, turned into something they return to.
 * Space-scoped under the same RLS as memories. It may originate from a memory
 * (sourceMemoryId) or a curated idea (sourceMomentId), or be created free-form.
 * Private to the space — never shared, never surfaced publicly.
 */
export interface Ritual {
  id: string;
  spaceId: string;
  title: string;
  /** Optional: why this matters to us. Private. */
  note?: string;
  cadence: RitualCadence;
  /** Optional origin memory this ritual grew from. */
  sourceMemoryId?: string;
  /** Optional curated idea this ritual grew from. */
  sourceMomentId?: string;
  createdAt: string;
  /** Last time the couple marked they came back to it. */
  lastRevisitedAt?: string;
}

/**
 * Practical feedback left after completing a date idea.
 * Intentionally separate from the private diary memory.
 * Beta storage is private, device-local, and space-scoped. `tip` may become
 * eligible for a future moderated community only after explicit consent.
 * `rating` is a simple 1-5 star score.
 */
export interface DateFeedback {
  id: string;
  savedDateId: string;
  spaceId: string;
  momentId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Optional practical tip (max 280 chars). No diary content here. */
  tip?: string;
  createdAt: string;
}

/**
 * Public, anonymized map spot. This stores venue facts needed to show a pin; it
 * carries no user, space, partner, diary, plan-note, or photo data.
 */
export interface PublicPlaceSpot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
  mapsUrl?: string;
  sourceId?: string;
  createdAt: string;
}

/**
 * Explicitly shared, anonymized place feedback. This is intentionally separate
 * from DateFeedback and from the private diary memory: only a rating, optional
 * practical tip, place id, and timestamp are public.
 */
export interface PublicPlaceFeedback {
  id: string;
  placeId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  tip?: string;
  createdAt: string;
}
