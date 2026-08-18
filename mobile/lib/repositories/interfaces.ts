import type {
  Audience,
  AudienceKind,
  Share,
  Memory,
  MomentCard,
  Space,
  SpaceMember,
  SpaceType,
  SavedDate,
  SavedDateStatus,
  DateFeedback,
  PublicPlaceSpot,
  PublicPlaceFeedback,
  Ritual,
  PartnerNote,
} from '../types';

export interface IMemoryRepository {
  getAll(spaceId: string): Promise<Memory[]>;
  getById(id: string): Promise<Memory | null>;
  create(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory>;
  update(id: string, updates: Partial<Pick<Memory, 'note' | 'photoUri'>>): Promise<Memory>;
  delete(id: string): Promise<void>;
}

export interface ICardRepository {
  /** Cards for an edition, with `status` derived for the given space. */
  getAll(editionId: string, spaceId: string): Promise<MomentCard[]>;
  getById(id: string, spaceId: string): Promise<MomentCard | null>;
  /** Mark a card activated for one space (idempotent). */
  activate(cardId: string, spaceId: string): Promise<MomentCard>;
}

export interface CreateSpaceInput {
  type: SpaceType;
  name: string;
  ownerUserId: string;
  ownerName: string;
}

export interface ISpaceRepository {
  getAllForUser(userId: string): Promise<Space[]>;
  getById(id: string): Promise<Space | null>;
  getMembers(spaceId: string): Promise<SpaceMember[]>;
  /** Remove the given user's own membership. Diary content stays with the
   *  space — leaving takes away access, it deletes nothing shared. */
  leave(spaceId: string, userId: string): Promise<void>;
  create(input: CreateSpaceInput): Promise<Space>;
  /** Mock join-by-code: links the user into the matching space (or a new one). */
  joinByCode(code: string, userId: string, userName: string): Promise<Space>;
  /**
   * Macht aus einem Solo-Space einen geteilten (Migration 0024, `open_space`).
   *
   * Bewusst nur in diese Richtung: zurück würde eine bereits beigetretene
   * Person aus einem gemeinsamen Tagebuch aussperren. Es geht dabei nichts
   * verloren — es ist derselbe Space, dieselben Momente, derselbe Code.
   */
  openSpace(spaceId: string, type: Exclude<SpaceType, 'solo'>): Promise<Space>;
  /**
   * Update a space's shared identity. Both members can update (RLS: migration
   * 0012). `emoji`/`avatarPath` are persisted server-side when configured.
   */
  update(
    spaceId: string,
    updates: Partial<Pick<Space, 'name' | 'emoji' | 'avatarPath' | 'collectibleEmoji'>>,
  ): Promise<Space>;
}

export interface ISavedDateRepository {
  getAll(spaceId: string): Promise<SavedDate[]>;
  save(item: Omit<SavedDate, 'id' | 'savedAt'>): Promise<SavedDate>;
  update(
    id: string,
    updates: Partial<
      Pick<
        SavedDate,
        | 'status'
        | 'plannedFor'
        | 'planningNotes'
        | 'completedAt'
        | 'memoryId'
        | 'placeId'
        | 'placeName'
        | 'placeAddress'
        | 'placeLat'
        | 'placeLng'
        | 'placeCategory'
        | 'placeMapsUrl'
      >
    >,
  ): Promise<SavedDate>;
  remove(id: string): Promise<void>;
}

export interface IDateFeedbackRepository {
  getAll(spaceId: string): Promise<DateFeedback[]>;
  getByMoment(spaceId: string, momentId: string): Promise<DateFeedback | null>;
  save(item: Omit<DateFeedback, 'id' | 'createdAt'>): Promise<DateFeedback>;
}

export interface IPublicPlaceFeedbackRepository {
  getSpots(): Promise<PublicPlaceSpot[]>;
  saveSpot(item: Omit<PublicPlaceSpot, 'createdAt'>): Promise<PublicPlaceSpot>;
  getByPlaceIds(placeIds: string[]): Promise<PublicPlaceFeedback[]>;
  save(item: Omit<PublicPlaceFeedback, 'id' | 'createdAt'>): Promise<PublicPlaceFeedback>;
}

export interface INoteRepository {
  getAll(spaceId: string): Promise<PartnerNote[]>;
  create(item: Omit<PartnerNote, 'id' | 'createdAt'>): Promise<PartnerNote>;
  remove(id: string): Promise<void>;
}

/**
 * Freigaben und Publika (Migrationen 0022/0023).
 *
 * `forMemory` und `remove` arbeiten auf `shares` — der privaten Seite, die nur
 * Mitglieder des Space sehen. Was ANDERE lesen, ist `share_cards`, und das
 * liest diese Schnittstelle bewusst NICHT: solange es keinen Feed gibt, gibt
 * es keinen Grund, fremde Freigaben zu holen. Wer ihn baut, ergaenzt hier eine
 * eigene Methode — und stolpert dabei ueber diesen Kommentar.
 */
export interface IShareRepository {
  /** Das Publikum zu einem Anker, oder null wenn es (noch) keines gibt. */
  audienceFor(kind: AudienceKind, anchor: string): Promise<Audience | null>;
  /** Die eigenen Freigaben zu einem Moment. */
  forMemory(memoryId: string): Promise<Share[]>;
  /** Legt eine Freigabe an. Der Titel ist bereits geprueft (lib/sharing.ts). */
  create(input: {
    memoryId: string;
    audienceId: string;
    spaceId: string;
    title: string;
    photoPath?: string;
  }): Promise<Share>;
  /** Widerruft. Der Moment bleibt unberuehrt. */
  remove(id: string): Promise<void>;
}

export interface IRitualRepository {
  getAll(spaceId: string): Promise<Ritual[]>;
  create(item: Omit<Ritual, 'id' | 'createdAt'>): Promise<Ritual>;
  update(
    id: string,
    updates: Partial<Pick<Ritual, 'title' | 'note' | 'cadence' | 'lastRevisitedAt'>>,
  ): Promise<Ritual>;
  remove(id: string): Promise<void>;
}
