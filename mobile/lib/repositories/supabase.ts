/**
 * Supabase repository stubs — not yet wired.
 * TODO: Replace localMemoryRepository with these when Supabase is configured.
 */

import type { IMemoryRepository, ICardRepository } from './interfaces';
import type { Memory, MomentCard } from '../types';

export const supabaseMemoryRepository: IMemoryRepository = {
  async getAll(_coupleId: string): Promise<Memory[]> {
    throw new Error('Supabase not configured. Use localMemoryRepository.');
  },
  async getById(_id: string): Promise<Memory | null> {
    throw new Error('Supabase not configured.');
  },
  async create(_data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory> {
    throw new Error('Supabase not configured.');
  },
  async update(_id: string, _updates: Partial<Pick<Memory, 'note' | 'photoUri'>>): Promise<Memory> {
    throw new Error('Supabase not configured.');
  },
  async delete(_id: string): Promise<void> {
    throw new Error('Supabase not configured.');
  },
};

export const supabaseCardRepository: ICardRepository = {
  async getAll(_editionId: string): Promise<MomentCard[]> {
    throw new Error('Supabase not configured.');
  },
  async getById(_id: string): Promise<MomentCard | null> {
    throw new Error('Supabase not configured.');
  },
  async activate(_id: string): Promise<MomentCard> {
    throw new Error('Supabase not configured.');
  },
};
