import { storage } from '../storage';
import type { Daily,
  Audience,
  AudienceKind,
  Share,
  Memory,
  MomentCard,
  Space,
  SpaceMember,
  SavedDate,
  DateFeedback,
  PublicPlaceSpot,
  PublicPlaceFeedback,
  Ritual,
  PartnerNote,
} from '../types';
import { sanitiseTip } from '../privacy/boundaries';
import { savedDateCache, memoryCache } from '../cache';
import {
  SEED_MEMORIES,
  SEED_CARDS,
  SEED_SPACES,
  SEED_MEMBERS,
  SEED_ACTIVATIONS,
} from '../seed';
import type { IDailyRepository,
  IShareRepository,
  IMemoryRepository,
  ICardRepository,
  ISpaceRepository,
  ISavedDateRepository,
  IDateFeedbackRepository,
  IPublicPlaceFeedbackRepository,
  IRitualRepository,
  INoteRepository,
  CreateSpaceInput,
} from './interfaces';
import { generateInviteCode, normalizeInviteCode } from '../invite';
import { defaultSpaceName } from './spaceCreation';

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


async function loadActivations(): Promise<Record<string, string[]>> {
  return (await storage.get<Record<string, string[]>>(ACTIVATIONS_KEY)) ?? SEED_ACTIVATIONS;
}

export const localMemoryRepository: IMemoryRepository = {
  async getAll(spaceId: string): Promise<Memory[]> {
    const cacheKey = `memories:${spaceId}`;
    const cached = memoryCache.get(cacheKey) as Memory[] | null;
    if (cached) return cached;
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? SEED_MEMORIES;
    const result = memories
      .filter((m) => m.spaceId === spaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    memoryCache.set(cacheKey, result);
    return result;
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
    memoryCache.invalidatePrefix('memories:');
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
    memoryCache.invalidatePrefix('memories:');
    return updated;
  },

  async delete(id: string): Promise<void> {
    const stored = await storage.get<Memory[]>(MEMORIES_KEY);
    const memories = stored ?? [...SEED_MEMORIES];
    await storage.set(MEMORIES_KEY, memories.filter((m) => m.id !== id));
    memoryCache.invalidatePrefix('memories:');
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

  async leave(spaceId: string, userId: string): Promise<void> {
    const members = await loadMembers();
    await storage.set(
      MEMBERS_KEY,
      members.filter((m) => !(m.spaceId === spaceId && m.userId === userId)),
    );
  },

  async openSpace(spaceId: string, type: 'couple' | 'friends'): Promise<Space> {
    const spaces = await loadSpaces();
    const found = spaces.find((s) => s.id === spaceId);
    if (!found) throw new Error('space not found');
    // Dieselbe Regel wie in der Datenbank (Migration 0024): nur aus solo
    // heraus. Zwei Wahrheiten an zwei Orten wären eine zu viel.
    if (found.type !== 'solo') throw new Error('space is already shared');
    const updated: Space = { ...found, type };
    await storage.set(SPACES_KEY, spaces.map((s) => (s.id === spaceId ? updated : s)));
    return updated;
  },

  async create({ type, name, ownerUserId, ownerName }: CreateSpaceInput): Promise<Space> {
    const spaces = await loadSpaces();
    const members = await loadMembers();
    const space: Space = {
      id: generateId('space'),
      type,
      name: name.trim() || defaultSpaceName(type),
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
    const normalized = normalizeInviteCode(code);
    let space = spaces.find((s) => s.inviteCode.toUpperCase() === normalized) ?? null;

    if (!space) {
      // Honest failure: without a server there is nobody to join. Inventing a
      // "Joined space" here faked the most sensitive success in the product —
      // the pairing (audit A2-3.1, MANIFESTO §1).
      throw new Error('unknown invite code');
    }

    // Dieselbe Regel wie in der Datenbank (Migration 0024): In einen
    // Solo-Space kommt niemand hinein. Ohne diese Zeile gäbe es zwei
    // Wahrheiten — und die lokale wäre die falsche.
    if (space.type === 'solo' && !members.some((m) => m.spaceId === space!.id && m.userId === userId)) {
      throw new Error('space is solo');
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

  async update(
    spaceId: string,
    updates: Partial<Pick<Space, 'name' | 'emoji' | 'avatarPath' | 'collectibleEmoji'>>,
  ): Promise<Space> {
    const spaces = await loadSpaces();
    const idx = spaces.findIndex((s) => s.id === spaceId);
    if (idx === -1) throw new Error(`Space ${spaceId} not found`);
    const current = spaces[idx];
    const updated: Space = {
      ...current,
      ...(updates.name !== undefined ? { name: updates.name.trim() || current.name } : {}),
      ...(updates.emoji !== undefined ? { emoji: updates.emoji } : {}),
      ...(updates.avatarPath !== undefined ? { avatarPath: updates.avatarPath } : {}),
      ...(updates.collectibleEmoji !== undefined ? { collectibleEmoji: updates.collectibleEmoji } : {}),
    };
    const next = [...spaces];
    next[idx] = updated;
    await storage.set(SPACES_KEY, next);
    return updated;
  },
};

export const localSavedDateRepository: ISavedDateRepository = {
  async getAll(spaceId: string): Promise<SavedDate[]> {
    const cacheKey = `saved:${spaceId}`;
    const cached = savedDateCache.get(cacheKey) as SavedDate[] | null;
    if (cached) return cached;
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const result = (stored ?? [])
      .filter((d) => d.spaceId === spaceId)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    savedDateCache.set(cacheKey, result);
    return result;
  },

  async save(item: Omit<SavedDate, 'id' | 'savedAt'>): Promise<SavedDate> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const all = stored ?? [];
    const entry: SavedDate = { ...item, id: generateId('sd'), savedAt: now() };
    await storage.set(SAVED_DATES_KEY, [...all, entry]);
    savedDateCache.invalidatePrefix('saved:');
    return entry;
  },

  async update(
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
  ): Promise<SavedDate> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const all = stored ?? [];
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`SavedDate ${id} not found`);
    const updated: SavedDate = { ...all[idx], ...updates };
    all[idx] = updated;
    await storage.set(SAVED_DATES_KEY, all);
    savedDateCache.invalidatePrefix('saved:');
    return updated;
  },

  async remove(id: string): Promise<void> {
    const stored = await storage.get<SavedDate[]>(SAVED_DATES_KEY);
    const all = stored ?? [];
    await storage.set(SAVED_DATES_KEY, all.filter((d) => d.id !== id));
    savedDateCache.invalidatePrefix('saved:');
  },
};

const FEEDBACK_KEY = 'dateFeedback';
const PUBLIC_PLACE_FEEDBACK_KEY = 'publicPlaceFeedback';
const PUBLIC_PLACE_SPOTS_KEY = 'publicPlaceSpots';

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
    const entry: DateFeedback = {
      ...item,
      tip: sanitiseTip(item.tip),
      id: generateId('fb'),
      createdAt: now(),
    };
    await storage.set(FEEDBACK_KEY, [...all, entry]);
    return entry;
  },
};

export const localPublicPlaceFeedbackRepository: IPublicPlaceFeedbackRepository = {
  async getSpots(): Promise<PublicPlaceSpot[]> {
    const stored = await storage.get<PublicPlaceSpot[]>(PUBLIC_PLACE_SPOTS_KEY);
    return (stored ?? [])
      .filter((spot) => Number.isFinite(spot.lat) && Number.isFinite(spot.lng))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveSpot(item: Omit<PublicPlaceSpot, 'createdAt'>): Promise<PublicPlaceSpot> {
    const stored = await storage.get<PublicPlaceSpot[]>(PUBLIC_PLACE_SPOTS_KEY);
    const all = stored ?? [];
    const existing = all.find((spot) => spot.id === item.id);
    if (existing) return existing;
    const entry: PublicPlaceSpot = { ...item, createdAt: now() };
    await storage.set(PUBLIC_PLACE_SPOTS_KEY, [...all, entry]);
    return entry;
  },

  async getByPlaceIds(placeIds: string[]): Promise<PublicPlaceFeedback[]> {
    const ids = new Set(placeIds);
    const stored = await storage.get<PublicPlaceFeedback[]>(PUBLIC_PLACE_FEEDBACK_KEY);
    return (stored ?? [])
      .filter((f) => ids.has(f.placeId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async save(item: Omit<PublicPlaceFeedback, 'id' | 'createdAt'>): Promise<PublicPlaceFeedback> {
    const stored = await storage.get<PublicPlaceFeedback[]>(PUBLIC_PLACE_FEEDBACK_KEY);
    const all = stored ?? [];
    const entry: PublicPlaceFeedback = {
      ...item,
      tip: sanitiseTip(item.tip),
      id: generateId('pfb'),
      createdAt: now(),
    };
    await storage.set(PUBLIC_PLACE_FEEDBACK_KEY, [...all, entry]);
    return entry;
  },
};

const RITUALS_KEY = 'rituals';
const NOTES_KEY = 'partnerNotes';

export const localRitualRepository: IRitualRepository = {
  async getAll(spaceId: string): Promise<Ritual[]> {
    const stored = await storage.get<Ritual[]>(RITUALS_KEY);
    return (stored ?? [])
      .filter((r) => r.spaceId === spaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(item: Omit<Ritual, 'id' | 'createdAt'>): Promise<Ritual> {
    const stored = await storage.get<Ritual[]>(RITUALS_KEY);
    const all = stored ?? [];
    const entry: Ritual = { ...item, id: generateId('ritual'), createdAt: now() };
    await storage.set(RITUALS_KEY, [...all, entry]);
    return entry;
  },

  async update(
    id: string,
    updates: Partial<Pick<Ritual, 'title' | 'note' | 'cadence' | 'lastRevisitedAt'>>,
  ): Promise<Ritual> {
    const stored = await storage.get<Ritual[]>(RITUALS_KEY);
    const all = stored ?? [];
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Ritual ${id} not found`);
    const updated: Ritual = { ...all[idx], ...updates };
    all[idx] = updated;
    await storage.set(RITUALS_KEY, all);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const stored = await storage.get<Ritual[]>(RITUALS_KEY);
    const all = stored ?? [];
    await storage.set(RITUALS_KEY, all.filter((r) => r.id !== id));
  },
};

export const localNoteRepository: INoteRepository = {
  async getAll(spaceId: string): Promise<PartnerNote[]> {
    const stored = await storage.get<PartnerNote[]>(NOTES_KEY);
    return (stored ?? [])
      .filter((n) => n.spaceId === spaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(item: Omit<PartnerNote, 'id' | 'createdAt'>): Promise<PartnerNote> {
    const stored = await storage.get<PartnerNote[]>(NOTES_KEY);
    const all = stored ?? [];
    const entry: PartnerNote = { ...item, id: generateId('note'), createdAt: now() };
    await storage.set(NOTES_KEY, [entry, ...all]);
    return entry;
  },

  async remove(id: string): Promise<void> {
    const stored = await storage.get<PartnerNote[]>(NOTES_KEY);
    const all = stored ?? [];
    await storage.set(NOTES_KEY, all.filter((n) => n.id !== id));
  },
};


/* ---------------------------------------------------------------------------
 * Tageskarten — lokaler Rueckfall
 *
 * Auch ohne Server gilt die Regel: EINE Karte je Person und Tag. `upsert`
 * ersetzt deshalb, statt anzulegen. Ohne das haette der lokale Betrieb eine
 * andere Wahrheit als der echte, und der Fehler faellt erst auf, wenn zwei
 * Menschen wirklich zusammen schreiben.
 * ------------------------------------------------------------------------ */
const DAILIES_KEY = 'peakplant.dailies';

export const localDailyRepository: IDailyRepository = {
  async getAll(spaceId: string): Promise<Daily[]> {
    const stored = await storage.get<Daily[]>(DAILIES_KEY);
    return (stored ?? [])
      .filter((d) => d.spaceId === spaceId)
      .sort((a, b) => b.day.localeCompare(a.day) || a.createdAt.localeCompare(b.createdAt));
  },

  async upsert(item: Omit<Daily, 'id' | 'createdAt' | 'updatedAt'>): Promise<Daily> {
    const stored = (await storage.get<Daily[]>(DAILIES_KEY)) ?? [];
    const vorhanden = stored.find(
      (d) => d.spaceId === item.spaceId && d.authorId === item.authorId && d.day === item.day,
    );
    const jetzt = now();
    const eintrag: Daily = vorhanden
      ? { ...vorhanden, ...item, updatedAt: jetzt }
      : { ...item, id: generateId('daily'), createdAt: jetzt, updatedAt: jetzt };
    const rest = stored.filter((d) => d.id !== eintrag.id);
    await storage.set(DAILIES_KEY, [eintrag, ...rest]);
    return eintrag;
  },

  async remove(id: string): Promise<void> {
    const stored = (await storage.get<Daily[]>(DAILIES_KEY)) ?? [];
    await storage.set(DAILIES_KEY, stored.filter((d) => d.id !== id));
  },
};

/* ---------------------------------------------------------------------------
 * Freigaben — lokaler Rueckfall
 *
 * Im lokalen Modus gibt es keine anderen Menschen, also auch niemanden, der
 * eine Freigabe sehen koennte. Sie wird trotzdem gespeichert, damit der
 * Bildschirm dieselbe Schleife durchlaeuft (anlegen, anzeigen, widerrufen) und
 * beim Wechsel auf Supabase nichts anders funktioniert.
 * -------------------------------------------------------------------------*/

const SHARES_KEY = 'peakplant.shares.v1';

export const localShareRepository: IShareRepository = {
  async audienceFor(kind: AudienceKind, anchor: string): Promise<Audience | null> {
    // Lokal gibt es keine Publikums-Tabelle: der Anker IST das Publikum.
    return { id: `${kind}:${anchor}`, kind, anchor, title: anchor };
  },

  async forMemory(memoryId: string): Promise<Share[]> {
    const all = (await storage.get<Share[]>(SHARES_KEY)) ?? [];
    return all.filter((entry) => entry.memoryId === memoryId);
  },

  async create(input): Promise<Share> {
    const all = (await storage.get<Share[]>(SHARES_KEY)) ?? [];
    const share: Share = {
      id: generateId('share'),
      memoryId: input.memoryId,
      audienceId: input.audienceId,
      title: input.title,
      photoPath: input.photoPath,
      createdAt: new Date().toISOString(),
    };
    await storage.set(SHARES_KEY, [share, ...all]);
    return share;
  },

  async remove(id: string): Promise<void> {
    const all = (await storage.get<Share[]>(SHARES_KEY)) ?? [];
    await storage.set(SHARES_KEY, all.filter((entry) => entry.id !== id));
  },
};
