/**
 * Supabase repository stubs — not yet wired.
 * TODO: Replace the local repositories with these when Supabase is configured.
 * Every personal table is space-scoped under deny-by-default RLS (see SECURITY).
 */

import type {
  IMemoryRepository,
  ICardRepository,
  ISpaceRepository,
  CreateSpaceInput,
} from './interfaces';
import type { Memory, MomentCard, Space, SpaceMember } from '../types';

export const supabaseMemoryRepository: IMemoryRepository = {
  async getAll(_spaceId: string): Promise<Memory[]> {
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
  async getAll(_editionId: string, _spaceId: string): Promise<MomentCard[]> {
    throw new Error('Supabase not configured.');
  },
  async getById(_id: string, _spaceId: string): Promise<MomentCard | null> {
    throw new Error('Supabase not configured.');
  },
  async activate(_cardId: string, _spaceId: string): Promise<MomentCard> {
    throw new Error('Supabase not configured.');
  },
};

export const supabaseSpaceRepository: ISpaceRepository = {
  async getAllForUser(_userId: string): Promise<Space[]> {
    throw new Error('Supabase not configured.');
  },
  async getById(_id: string): Promise<Space | null> {
    throw new Error('Supabase not configured.');
  },
  async getMembers(_spaceId: string): Promise<SpaceMember[]> {
    throw new Error('Supabase not configured.');
  },
  async create(_input: CreateSpaceInput): Promise<Space> {
    throw new Error('Supabase not configured.');
  },
  async joinByCode(_code: string, _userId: string, _userName: string): Promise<Space> {
    throw new Error('Supabase not configured.');
  },
};
