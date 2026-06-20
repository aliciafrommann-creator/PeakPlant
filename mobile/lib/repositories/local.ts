import { storage } from '../storage';
import type { Memory, MomentCard } from '../types';
import { SEED_MEMORIES, SEED_CARDS } from '../seed';
import type { IMemoryRepository, ICardRepository } from './interfaces';

const MEMORIES_KEY = 'memories';
const CARDS_KEY = 'cards';

function generateId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const localMemoryRepository: IMemoryRepository = {
  async getAll(coupleId: string): Promise<Memory[]> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? SEED_MEMORIES;
    return memories.filter((m) => m.coupleId === coupleId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<Memory | null> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? SEED_MEMORIES;
    return memories.find((m) => m.id === id) ?? null;
  },

  async create(data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? [...SEED_MEMORIES];
    const newMemory: Memory = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    await storage.set(MEMORIES_KEY, [...memories, newMemory]);
    return newMemory;
  },

  async update(id: string, updates: Partial<Pick<Memory, 'note' | 'photoUri'>>): Promise<Memory> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? [...SEED_MEMORIES];
    const idx = memories.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Memory ${id} not found`);
    const updated: Memory = { ...memories[idx], ...updates, updatedAt: now() };
    memories[idx] = updated;
    await storage.set(MEMORIES_KEY, memories);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? [...SEED_MEMORIES];
    await storage.set(MEMORIES_KEY, memories.filter((m) => m.id !== id));
  },
};

export const localCardRepository: ICardRepository = {
  async getAll(editionId: string): Promise<MomentCard[]> {
    const stored = await storage.get<MomentCard[]>(CARDS_KEY);
    const cards = stored ?? SEED_CARDS;
    return cards.filter((c) => c.edition === editionId);
  },

  async getById(id: string): Promise<MomentCard | null> {
    const stored = await storage.get<MomentCard[]>(CARDS_KEY);
    const cards = stored ?? SEED_CARDS;
    return cards.find((c) => c.id === id) ?? null;
  },

  async activate(id: string): Promise<MomentCard> {
    const stored = await storage.get<MomentCard[]>(CARDS_KEY);
    const cards = stored ?? [...SEED_CARDS];
    const idx = cards.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Card ${id} not found`);
    const updated: MomentCard = { ...cards[idx], status: 'activated' };
    cards[idx] = updated;
    await storage.set(CARDS_KEY, cards);
    return updated;
  },
};
