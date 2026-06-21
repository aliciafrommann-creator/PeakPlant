import type { Memory, MomentCard, Space, SpaceMember, SpaceType } from '../types';

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
