/**
 * Supabase repository implementations (active when EXPO_PUBLIC_SUPABASE_* are set).
 * Cards/editions stay a static in-app catalog (SEED_CARDS); only per-space
 * activation state lives in the DB. Everything is space-scoped under RLS.
 */

import { supabase } from '../supabase/client';
import { deleteMemoryPhoto, uploadMemoryPhoto, signedPhotoUrl } from '../supabase/storage';
import { SEED_CARDS } from '../seed';
import type {
  Memory,
  MomentCard,
  Space,
  SpaceMember,
  SavedDate,
  PublicPlaceSpot,
  PublicPlaceFeedback,
  PartnerNote,
} from '../types';
import type {
  IMemoryRepository,
  ICardRepository,
  ISpaceRepository,
  ISavedDateRepository,
  IPublicPlaceFeedbackRepository,
  INoteRepository,
  CreateSpaceInput,
} from './interfaces';
import { buildCreateSpaceRpcArgs } from './spaceCreation';
import { generateInviteCode, normalizeInviteCode } from '../invite';
import { sanitiseTip } from '../privacy/boundaries';

function db() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSpace(r: any): Space {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    inviteCode: r.invite_code,
    createdAt: r.created_at,
    emoji: r.emoji ?? undefined,
    avatarPath: r.avatar_path ?? undefined,
    collectibleEmoji: r.collectible_emoji ?? undefined,
  };
}
function mapMember(r: any): SpaceMember {
  return { id: r.id, spaceId: r.space_id, userId: r.user_id, name: r.name, role: r.role, joinedAt: r.joined_at };
}
function mapMemory(r: any): Memory {
  return {
    id: r.id,
    spaceId: r.space_id,
    cardId: r.card_id,
    note: r.note,
    photoUri: r.photo_path ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Replace the stored photo path with a short-lived signed URL for display. */
async function withSignedPhoto(m: Memory): Promise<Memory> {
  if (!m.photoUri) return m;
  const url = await signedPhotoUrl(m.photoUri).catch(() => undefined);
  return { ...m, photoUri: url };
}

export const supabaseMemoryRepository: IMemoryRepository = {
  async getAll(spaceId: string): Promise<Memory[]> {
    const { data, error } = await db()
      .from('memories')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Promise.all((data ?? []).map(mapMemory).map(withSignedPhoto));
  },

  async getById(id: string): Promise<Memory | null> {
    const { data, error } = await db().from('memories').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? withSignedPhoto(mapMemory(data)) : null;
  },

  async create(data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory> {
    const { data: user } = await db().auth.getUser();
    // A picked photo is a local file uri — upload it (EXIF stripped) and store the path.
    let photoPath: string | null = null;
    if (data.photoUri) {
      photoPath = await uploadMemoryPhoto(data.spaceId, data.photoUri);
    }
    const { data: row, error } = await db()
      .from('memories')
      .insert({
        space_id: data.spaceId,
        card_id: data.cardId,
        note: data.note,
        photo_path: photoPath,
        created_by: user.user?.id ?? null,
      })
      .select()
      .single();
    if (error) {
      if (photoPath) await deleteMemoryPhoto(photoPath).catch(() => undefined);
      throw error;
    }
    return withSignedPhoto(mapMemory(row));
  },

  async update(id: string, updates: Partial<Pick<Memory, 'note' | 'photoUri'>>): Promise<Memory> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.note !== undefined) patch.note = updates.note;
    if (updates.photoUri !== undefined) patch.photo_path = updates.photoUri;
    const { data, error } = await db().from('memories').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return mapMemory(data);
  },

  async delete(id: string): Promise<void> {
    const { data: memory, error: readError } = await db()
      .from('memories')
      .select('photo_path')
      .eq('id', id)
      .maybeSingle();
    if (readError) throw readError;

    const { error } = await db().from('memories').delete().eq('id', id);
    if (error) throw error;

    if (memory?.photo_path) {
      // The database row is already gone. A storage outage must not make the UI
      // claim the moment still exists; storage cleanup remains best-effort here.
      await deleteMemoryPhoto(memory.photo_path).catch(() => undefined);
    }
  },
};

async function activatedSet(spaceId: string): Promise<Set<string>> {
  const { data, error } = await db().from('card_activations').select('card_id').eq('space_id', spaceId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.card_id as string));
}

export const supabaseCardRepository: ICardRepository = {
  async getAll(editionId: string, spaceId: string): Promise<MomentCard[]> {
    const activated = await activatedSet(spaceId);
    return SEED_CARDS.filter((c) => c.edition === editionId).map((c) => ({
      ...c,
      status: activated.has(c.id) ? 'activated' : 'sealed',
    }));
  },

  async getById(id: string, spaceId: string): Promise<MomentCard | null> {
    const card = SEED_CARDS.find((c) => c.id === id);
    if (!card) return null;
    const activated = await activatedSet(spaceId);
    return { ...card, status: activated.has(card.id) ? 'activated' : 'sealed' };
  },

  async activate(cardId: string, spaceId: string): Promise<MomentCard> {
    const card = SEED_CARDS.find((c) => c.id === cardId);
    if (!card) throw new Error(`Card ${cardId} not found`);
    const { error } = await db()
      .from('card_activations')
      .upsert({ space_id: spaceId, card_id: cardId }, { onConflict: 'space_id,card_id', ignoreDuplicates: true });
    if (error) throw error;
    return { ...card, status: 'activated' };
  },
};

export const supabaseSpaceRepository: ISpaceRepository = {
  async getAllForUser(userId: string): Promise<Space[]> {
    const { data, error } = await db()
      .from('space_members')
      .select('space:spaces(*)')
      .eq('user_id', userId);
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spaces = (data ?? []).map((r: any) => r.space).filter(Boolean).map(mapSpace);
    return spaces.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async getById(id: string): Promise<Space | null> {
    const { data, error } = await db().from('spaces').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapSpace(data) : null;
  },

  async getMembers(spaceId: string): Promise<SpaceMember[]> {
    const { data, error } = await db().from('space_members').select('*').eq('space_id', spaceId);
    if (error) throw error;
    return (data ?? []).map(mapMember);
  },

  async create(input: CreateSpaceInput): Promise<Space> {
    const { data: spaceRow, error: spaceErr } = await db()
      .rpc('create_space', buildCreateSpaceRpcArgs(input, generateInviteCode()))
      .single();
    if (spaceErr) throw spaceErr;
    return mapSpace(spaceRow);
  },

  async joinByCode(code: string): Promise<Space> {
    // redeem_invite is a SECURITY DEFINER RPC (migration 0002) so a non-member
    // can join without being able to read the space directly under RLS.
    const { data, error } = await db().rpc('redeem_invite', { code: normalizeInviteCode(code) });
    if (error) throw error;
    return mapSpace(data);
  },

  async update(
    spaceId: string,
    updates: Partial<Pick<Space, 'name' | 'emoji' | 'avatarPath' | 'collectibleEmoji'>>,
  ): Promise<Space> {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name.trim();
    if (updates.emoji !== undefined) patch.emoji = updates.emoji;
    if (updates.avatarPath !== undefined) patch.avatar_path = updates.avatarPath;
    if (updates.collectibleEmoji !== undefined) patch.collectible_emoji = updates.collectibleEmoji;
    const { data, error } = await db()
      .from('spaces')
      .update(patch)
      .eq('id', spaceId)
      .select()
      .single();
    if (error) throw error;
    return mapSpace(data);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSavedDate(r: any): SavedDate {
  return {
    id: r.id,
    spaceId: r.space_id,
    momentId: r.moment_id,
    title: r.title,
    concept: r.concept,
    priceBand: r.price_band,
    estDurationMin: r.est_duration_min,
    status: r.status,
    savedAt: r.saved_at,
    plannedFor: r.planned_for ?? undefined,
    planningNotes: r.planning_notes ?? undefined,
    placeId: r.place_id ?? undefined,
    placeName: r.place_name ?? undefined,
    placeAddress: r.place_address ?? undefined,
    placeLat: typeof r.place_lat === 'number' ? r.place_lat : undefined,
    placeLng: typeof r.place_lng === 'number' ? r.place_lng : undefined,
    placeCategory: r.place_category ?? undefined,
    placeMapsUrl: r.place_maps_url ?? undefined,
    completedAt: r.completed_at ?? undefined,
    memoryId: r.memory_id ?? undefined,
  };
}

export const supabaseSavedDateRepository: ISavedDateRepository = {
  async getAll(spaceId: string): Promise<SavedDate[]> {
    const { data, error } = await db()
      .from('saved_dates')
      .select('*')
      .eq('space_id', spaceId)
      .neq('status', 'dismissed')
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSavedDate);
  },

  async save(item: Omit<SavedDate, 'id' | 'savedAt'>): Promise<SavedDate> {
    const { data, error } = await db()
      .from('saved_dates')
      .insert({
        space_id: item.spaceId,
        moment_id: item.momentId,
        title: item.title,
        concept: item.concept,
        price_band: item.priceBand,
        est_duration_min: item.estDurationMin,
        status: item.status,
        place_id: item.placeId,
        place_name: item.placeName,
        place_address: item.placeAddress,
        place_lat: item.placeLat,
        place_lng: item.placeLng,
        place_category: item.placeCategory,
        place_maps_url: item.placeMapsUrl,
      })
      .select()
      .single();
    if (error) throw error;
    return mapSavedDate(data);
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
    const patch: Record<string, unknown> = {};
    if (updates.status !== undefined) patch.status = updates.status;
    // planned_for is free-text in the app (e.g. "this Saturday"); migration 0006
    // relaxes the column to text to match. Requires 0006 applied (backend mode).
    if (updates.plannedFor !== undefined) patch.planned_for = updates.plannedFor;
    if (updates.planningNotes !== undefined) patch.planning_notes = updates.planningNotes;
    if (updates.placeId !== undefined) patch.place_id = updates.placeId;
    if (updates.placeName !== undefined) patch.place_name = updates.placeName;
    if (updates.placeAddress !== undefined) patch.place_address = updates.placeAddress;
    if (updates.placeLat !== undefined) patch.place_lat = updates.placeLat;
    if (updates.placeLng !== undefined) patch.place_lng = updates.placeLng;
    if (updates.placeCategory !== undefined) patch.place_category = updates.placeCategory;
    if (updates.placeMapsUrl !== undefined) patch.place_maps_url = updates.placeMapsUrl;
    if (updates.completedAt !== undefined) patch.completed_at = updates.completedAt;
    if (updates.memoryId !== undefined) patch.memory_id = updates.memoryId;
    const { data, error } = await db().from('saved_dates').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return mapSavedDate(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await db().from('saved_dates').delete().eq('id', id);
    if (error) throw error;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPublicPlaceSpot(r: any): PublicPlaceSpot {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    lat: Number(r.lat),
    lng: Number(r.lng),
    category: r.category ?? undefined,
    mapsUrl: r.maps_url ?? undefined,
    sourceId: r.source_id ?? undefined,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPublicPlaceFeedback(r: any): PublicPlaceFeedback {
  return {
    id: r.id,
    placeId: r.place_id,
    rating: r.rating,
    tip: r.tip ?? undefined,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(r: any): PartnerNote {
  return {
    id: r.id,
    spaceId: r.space_id,
    text: r.text,
    authorId: r.author_id ?? undefined,
    authorName: r.author_name ?? undefined,
    createdAt: r.created_at,
  };
}

export const supabaseNoteRepository: INoteRepository = {
  async getAll(spaceId: string): Promise<PartnerNote[]> {
    const { data, error } = await db()
      .from('partner_notes')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapNote);
  },

  async create(item: Omit<PartnerNote, 'id' | 'createdAt'>): Promise<PartnerNote> {
    const { data: user } = await db().auth.getUser();
    const { data, error } = await db()
      .from('partner_notes')
      .insert({
        space_id: item.spaceId,
        text: item.text,
        author_id: user.user?.id ?? null,
        author_name: item.authorName ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapNote(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await db().from('partner_notes').delete().eq('id', id);
    if (error) throw error;
  },
};

export const supabasePublicPlaceFeedbackRepository: IPublicPlaceFeedbackRepository = {
  async getSpots(): Promise<PublicPlaceSpot[]> {
    const { data, error } = await db()
      .from('public_place_spots')
      .select('id,name,address,lat,lng,category,maps_url,source_id,created_at')
      .order('created_at', { ascending: false })
      .limit(120);
    if (error) throw error;
    return (data ?? []).map(mapPublicPlaceSpot).filter((spot) => Number.isFinite(spot.lat) && Number.isFinite(spot.lng));
  },

  async saveSpot(item: Omit<PublicPlaceSpot, 'createdAt'>): Promise<PublicPlaceSpot> {
    const { data, error } = await db()
      .from('public_place_spots')
      .upsert({
        id: item.id,
        name: item.name,
        address: item.address,
        lat: item.lat,
        lng: item.lng,
        category: item.category,
        maps_url: item.mapsUrl,
        source_id: item.sourceId,
      }, { onConflict: 'id' })
      .select('id,name,address,lat,lng,category,maps_url,source_id,created_at')
      .single();
    if (error) throw error;
    return mapPublicPlaceSpot(data);
  },

  async getByPlaceIds(placeIds: string[]): Promise<PublicPlaceFeedback[]> {
    if (placeIds.length === 0) return [];
    const { data, error } = await db()
      .from('public_place_feedback')
      .select('id,place_id,rating,tip,created_at')
      .in('place_id', placeIds)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapPublicPlaceFeedback);
  },

  async save(item: Omit<PublicPlaceFeedback, 'id' | 'createdAt'>): Promise<PublicPlaceFeedback> {
    const { data, error } = await db()
      .from('public_place_feedback')
      .insert({
        place_id: item.placeId,
        rating: item.rating,
        tip: sanitiseTip(item.tip),
      })
      .select('id,place_id,rating,tip,created_at')
      .single();
    if (error) throw error;
    return mapPublicPlaceFeedback(data);
  },
};
