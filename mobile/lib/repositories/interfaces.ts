import type { Memory, MomentCard } from '../types';

export interface IMemoryRepository {
  getAll(coupleId: string): Promise<Memory[]>;
  getById(id: string): Promise<Memory | null>;
  create(memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory>;
  update(id: string, updates: Partial<Pick<Memory, 'note' | 'photoUri'>>): Promise<Memory>;
  delete(id: string): Promise<void>;
}

export interface ICardRepository {
  getAll(editionId: string): Promise<MomentCard[]>;
  getById(id: string): Promise<MomentCard | null>;
  activate(id: string): Promise<MomentCard>;
}
