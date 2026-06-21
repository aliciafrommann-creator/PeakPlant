import { storage } from './storage';
import { supabase, isSupabaseConfigured } from './supabase/client';
import type { SpaceType } from './types';

/**
 * Challenges — finite, opt-in, badge-not-score (PP-024).
 *
 * A challenge is a gentle goal a space can take on: preserve N moments within a
 * season. Completing it earns a collectible badge. No leaderboard, no ranking,
 * no countdown, no score — just a warm "you did this together".
 */

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  /** How many moments to preserve to complete it. */
  goalCount: number;
  spaceTypes: SpaceType[];
  /** Collectible badge shown on completion. */
  badge: string;
  /** A soft, finite duration label — never a ticking countdown. */
  durationLabel: string;
}

export interface Enrollment {
  challengeId: string;
  joinedAt: string;
}

export interface ChallengeProgress {
  count: number;
  goal: number;
  complete: boolean;
}

export const CHALLENGES: Challenge[] = [
  { id: 'ch-1', title: 'a season together', subtitle: 'preserve four moments this season — any cards, any order.', goalCount: 4, spaceTypes: ['couple', 'friends'], badge: '🌻', durationLabel: 'this season' },
  { id: 'ch-2', title: 'slow weeks', subtitle: 'three calm, unhurried moments. no plans, just presence.', goalCount: 3, spaceTypes: ['couple', 'friends'], badge: '🌙', durationLabel: 'over a few weeks' },
  { id: 'ch-3', title: 'out in the world', subtitle: 'five moments made somewhere new together.', goalCount: 5, spaceTypes: ['couple', 'friends'], badge: '🧭', durationLabel: 'whenever it fits' },
  { id: 'ch-4', title: 'the spice run', subtitle: 'six bold, playful moments. turn up the heat a little.', goalCount: 6, spaceTypes: ['couple'], badge: '🌶️', durationLabel: 'no rush' },
  { id: 'ch-5', title: 'the crew', subtitle: 'four moments with the whole group.', goalCount: 4, spaceTypes: ['friends'], badge: '✨', durationLabel: 'this season' },
];

export function challengesForSpaceType(type: SpaceType): Challenge[] {
  return CHALLENGES.filter((c) => c.spaceTypes.includes(type));
}

export function challengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}

/** Pure progress: count moments preserved on/after joining, against the goal. */
export function progressFor(
  challenge: Challenge,
  joinedAt: string,
  memoryDates: string[],
): ChallengeProgress {
  const since = new Date(joinedAt).getTime();
  const count = memoryDates.filter((d) => new Date(d).getTime() >= since).length;
  return { count, goal: challenge.goalCount, complete: count >= challenge.goalCount };
}

// --- enrollment persistence (local; becomes a table in the Supabase phase) ---

const ENROLLMENTS_KEY = 'challengeEnrollments';

type EnrollmentMap = Record<string, Enrollment[]>;

async function loadAll(): Promise<EnrollmentMap> {
  return (await storage.get<EnrollmentMap>(ENROLLMENTS_KEY)) ?? {};
}

export async function getEnrollments(spaceId: string): Promise<Enrollment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('challenge_enrollments')
      .select('challenge_id, joined_at')
      .eq('space_id', spaceId);
    if (error) throw error;
    return (data ?? []).map((r) => ({ challengeId: r.challenge_id as string, joinedAt: r.joined_at as string }));
  }
  const all = await loadAll();
  return all[spaceId] ?? [];
}

export async function joinChallenge(spaceId: string, challengeId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('challenge_enrollments')
      .upsert({ space_id: spaceId, challenge_id: challengeId }, { onConflict: 'space_id,challenge_id', ignoreDuplicates: true });
    if (error) throw error;
    return;
  }
  const all = await loadAll();
  const current = all[spaceId] ?? [];
  if (current.some((e) => e.challengeId === challengeId)) return;
  all[spaceId] = [...current, { challengeId, joinedAt: new Date().toISOString() }];
  await storage.set(ENROLLMENTS_KEY, all);
}

export async function leaveChallenge(spaceId: string, challengeId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('challenge_enrollments')
      .delete()
      .eq('space_id', spaceId)
      .eq('challenge_id', challengeId);
    if (error) throw error;
    return;
  }
  const all = await loadAll();
  all[spaceId] = (all[spaceId] ?? []).filter((e) => e.challengeId !== challengeId);
  await storage.set(ENROLLMENTS_KEY, all);
}
