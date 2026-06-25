import type {
  Memory,
  MomentCard,
  Space,
  SpaceMember,
  SpaceType,
  SavedDate,
  SavedDateStatus,
  DateFeedback,
  PublicPlaceFeedback,
  Ritual,
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
  create(input: CreateSpaceInput): Promise<Space>;
  /** Mock join-by-code: links the user into the matching space (or a new one). */
  joinByCode(code: string, userId: string, userName: string): Promise<Space>;
}

export interface ISavedDateRepository {
  getAll(spaceId: string): Promise<SavedDate[]>;
  save(item: Omit<SavedDate, 'id' | 'savedAt'>): Promise<SavedDate>;
  update(
    id: string,
    updates: Partial<
      Pick<SavedDate, 'status' | 'plannedFor' | 'planningNotes' | 'completedAt' | 'memoryId'>
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
  getByPlaceIds(placeIds: string[]): Promise<PublicPlaceFeedback[]>;
  save(item: Omit<PublicPlaceFeedback, 'id' | 'createdAt'>): Promise<PublicPlaceFeedback>;
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
