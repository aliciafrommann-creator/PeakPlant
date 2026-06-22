import { storage } from '../storage';
import type { Memory, MomentCard, Space, SpaceMember, SavedDate, DateFeedback } from '../types';
import {
  SEED_MEMORIES,
  SEED_CARDS,
  SEED_SPACES,
  SEED_MEMBERS,
  SEED_ACTIVATIONS,
} from '../seed';
import type {
  IMemoryRepository,
  ICardRepository,
  ISpaceRepository,
  ISavedDateRepository,
  IDateFeedbackRepository,
  CreateSpaceInput,
} from './interfaces';

const MEMORIES_KEY = 'memories';
const ACTIVATIONS_KEY = 'cardActivations';
const SPACES_KEY = 'spaces';
const MEMBERS_KEY = 'spaceMembers';
const SAVED_DATES_KEY = 'savedDates';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function generateInviteCode(): string {
  // 6 chars from an unambiguous alphabet (~1e9 combos) — a 4-digit code was
  // brute-forceable to join a stranger's private space.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PEAK-${code}`;
}

async function loadActivations(): Promise<Record<string, string[]>> {
  return (await storage.get<Record<string, string[]>>(ACTIVATIONS_KEY)) ?? SEED_ACTIVATIONS;
}

export const localMemoryRepository: IMemoryRepository = {
  async getAll(spaceId: string): Promise<Memory[]> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? SEED_MEMORIES;
    return memories
      .filter((m) => m.spaceId === spaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      id: generateId('memory'),
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
  async getAll(editionId: string, spaceId: string): Promise<MomentCard[]> {
    const activations = await loadActivations();
    const activated = new Set(activations[spaceId] ?? []);
    return SEED_CARDS.filter((c) => c.edition === editionId).map((c) => ({
      ...c,
      status: activated.has(c.id) ? 'activated' : 'sealed',
    }));
  },

  async getById(id: string, spaceId: string): Promise<MomentCard | null> {
    const activations = await loadActivations();
    const activated = new Set(activations[spaceId] ?? []);
    const card = SEED_CARDS.find((c) => c.id === id);
    if (!card) return null;
    return { ...card, status: activated.has(card.id) ? 'activated' : 'sealed' };
  },

  async activate(cardId: string, spaceId: string): Promise<MomentCard> {
    const card = SEED_CARDS.find((c) => c.id === cardId);
    if (!card) throw new Error(`Card ${cardId} not found`);
    const activations = await loadActivations();
    const current = activations[spaceId] ?? [];
    if (!current.includes(cardId)) {
      await storage.set(ACTIVATIONS_KEY, { ...activations, [spaceId]: [...current, cardId] });
    }
    return { ...card, status: 'activated' };
  },
};

async function loadSpaces(): Promise<Space[]> {
  return (await storage.get<Space[]>(SPACES_KEY)) ?? SEED_SPACES;
}

async function loadMembers(): Promise<SpaceMember[]> {
  return (await storage.get<SpaceMember[]>(MEMBERS_KEY)) ?? SEED_MEMBERS;
}

export const localSpaceRepository: ISpaceRepository = {
  async getAllForUser(userId: string): Promise<Space[]> {
    const spaces = await loadSpaces();
    const members = await loadMembers();
    const mySpaceIds = new Set(members.filter((m) => m.userId === userId).map((m) => m.spaceId));
    return spaces
      .filter((s) => mySpaceIds.has(s.id))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async getById(id: string): Promise<Space | null> {
    const spaces = await loadSpaces();
    return spaces.find((s) => s.id === id) ?? null;
  },

  async getMembers(spaceId: string): Promise<SpaceMember[]> {
    const members = await loadMembers();
    return members.filter((m) => m.spaceId === spaceId);
  },

  async create({ type, name, ownerUserId, ownerName }: CreateSpaceInput): Promise<Space> {
    const spaces = await loadSpaces();
    const members = await loadMembers();
    const space: Space = {
      id: generateId('space'),
      type,
      name: name.trim() || (type === 'couple' ? 'Our space' : 'Friends'),
      inviteCode: generateInviteCode(),
      createdAt: now(),
    };
    const ownerMember: SpaceMember = {
      id: generateId('m'),
      spaceId: space.id,
      userId: ownerUserId,
      name: ownerName,
      role: 'owner',
      joinedAt: now(),
    };
    await storage.set(SPACES_KEY, [...spaces, space]);
    await storage.set(MEMBERS_KEY, [...members, ownerMember]);
    return space;
  },

  async joinByCode(code: string, userId: string, userName: string): Promise<Space> {
    const spaces = await loadSpaces();
    const members = await loadMembers();
    const normalized = code.trim().toUpperCase();
    let space = spaces.find((s) => s.inviteCode.toUpperCase() === normalized) ?? null;

    if (!space) {
      // Mock: no server to validate against, so represent the joined space locally.
      space = {
        id: generateId('space'),
        type: 'friends',
        name: 'Joined space',
        inviteCode: normalized || generateInviteCode(),
        createdAt: now(),
      };
      await storage.set(SPACES_KEY, [...spaces, space]);
    }

    const alreadyMember = members.some((m) => m.spaceId === space!.id && m.userId === userId);
    if (!alreadyMember) {
      const member: SpaceMember = {
        id: generateId('m'),
        spaceId: space.id,
        userId,
        name: userName,
        role: 'member',
        joinedAt: now(),
      };
      await storage.set(MEMBERS_KEY, [...members, member]);
    }
    return space;
  },
};

export const localSavedDateRepository: ISavedDateRepository = {
  async getAll(spaceId: string): Promise<SavedDate[]> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    return (stored ?? [])
      .filter((d) => d.spaceId === spaceId)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  },

  async save(item: Omit<SavedDate, 'id' | 'savedAt'>): Promise<SavedDate> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const all = stored ?? [];
    const entry: SavedDate = { ...item, id: generateId('sd'), savedAt: now() };
    await storage.set(SAVED_DATES_KEY, [...all, entry]);
    return entry;
  },

  async update(
    id: string,
    updates: Partial<
      Pick<SavedDate, 'status' | 'plannedFor' | 'planningNotes' | 'completedAt' | 'memoryId'>
    >,
  ): Promise<SavedDate> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const all = stored ?? [];
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`SavedDate ${id} not found`);
    const updated: SavedDate = { ...all[idx], ...updates };
    all[idx] = updated;
    await storage.set(SAVED_DATES_KEY, all);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const all = stored ?? [];
    await storage.set(SAVED_DATES_KEY, all.filter((d) => d.id !== id));
  },
};

const FEEDBACK_KEY = 'dateFeedback';

export const localDateFeedbackRepository: IDateFeedbackRepository = {
  async getAll(spaceId: string): Promise<DateFeedback[]> {
    const stored = await storage.get<DateFeedback[]>(FEEDBACK_KEY);
    return (stored ?? []).filter((f) => f.spaceId === spaceId);
  },

  async getByMoment(spaceId: string, momentId: string): Promise<DateFeedback | null> {
    const stored = await storage.get<DateFeedback[]>(FEEDBACK_KEY);
    return (stored ?? []).find((f) => f.spaceId === spaceId && f.momentId === momentId) ?? null;
  },

  async save(item: Omit<DateFeedback, 'id' | 'createdAt'>): Promise<DateFeedback> {
    const stored = await storage.get<DateFeedback[]>(FEEDBACK_KEY);
    const all = stored ?? [];
    const entry: DateFeedback = { ...item, id: generateId('fb'), createdAt: now() };
    await storage.set(FEEDBACK_KEY, [...all, entry]);
    return entry;
  },
};
