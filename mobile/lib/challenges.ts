import { storage } from './storage';
import { supabase, isSupabaseConfigured } from './supabase/client';
import type { LocalizedText, SpaceType } from './types';
import type { IdeaCategory } from './discovery/ideaCatalog';

/**
 * Challenges — finite, opt-in, badge-not-score (PP-024).
 *
 * A challenge is a gentle goal a space can take on: preserve N moments within a
 * season. Completing it earns a collectible badge. No leaderboard, no ranking,
 * no countdown, no score — just a warm "you did this together".
 */

export interface Challenge {
  id: string;
  /** Bilingual — resolve with `l()` before rendering (never render raw). */
  title: LocalizedText;
  subtitle: LocalizedText;
  /** How many moments to preserve to complete it. */
  goalCount: number;
  spaceTypes: SpaceType[];
  /** Collectible badge shown on completion. */
  badge: string;
  /** A soft, finite duration label — never a ticking countdown. */
  durationLabel: LocalizedText;
  /**
   * Das Thema — dieselbe Sprache wie die Ideen (`IdeaCategory`) und die
   * Filter. Sie bestimmt die Färbung der Karte (Entscheidung 028, Alicia:
   * „sie gehört ja immer zu einer Emoji-Kategorie, wie alles andere auch").
   *
   * ABSICHTLICH OPTIONAL: Drei Challenges haben kein Thema, sondern sind die
   * Sammel-Challenges („vier Momente, welche Karten ist euch überlassen").
   * Ihnen eine Kategorie anzudichten, damit die Tabelle voll aussieht, wäre
   * eine erfundene Angabe — sie bekommen eine der themenfreien Welten.
   */
  category?: IdeaCategory;
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

const SEASON: LocalizedText = { en: 'this season', de: 'diese saison' };

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: { en: 'a season together', de: 'eine saison zusammen' },
    subtitle: {
      en: 'preserve four moments this season — any cards, any order.',
      de: 'haltet vier momente in dieser saison fest — welche karten, welche reihenfolge, ganz euch überlassen.',
    },
    goalCount: 4, spaceTypes: ['couple', 'friends'], badge: '🌻', durationLabel: SEASON,
  },
  {
    id: 'ch-2',
    title: { en: 'slow weeks', de: 'langsame wochen' },
    subtitle: {
      en: 'three calm, unhurried moments. no plans, just presence.',
      de: 'drei ruhige momente ohne eile. keine pläne, einfach da sein.',
    },
    goalCount: 3, spaceTypes: ['couple', 'friends'], badge: '🌙',
    durationLabel: { en: 'over a few weeks', de: 'über ein paar wochen' },
    category: 'calm',
  },
  {
    id: 'ch-s1',
    title: { en: 'a season of your own', de: 'eine saison für dich' },
    subtitle: {
      en: 'preserve four moments this season. any card, any order, nobody waiting.',
      de: 'halte vier momente in dieser saison fest — welche karte, welche reihenfolge, niemand wartet.',
    },
    goalCount: 4, spaceTypes: ['solo'], badge: '🪨', durationLabel: SEASON,
  },
  {
    id: 'ch-s2',
    title: { en: 'three quiet ones', de: 'drei ruhige' },
    subtitle: {
      en: 'three unhurried moments with nothing to show for them.',
      de: 'drei momente ohne eile, aus denen nichts vorzuzeigen ist.',
    },
    goalCount: 3, spaceTypes: ['solo'], badge: '🌙',
    durationLabel: { en: 'over a few weeks', de: 'über ein paar wochen' },
    category: 'calm',
  },
  {
    id: 'ch-3',
    title: { en: 'out in the world', de: 'raus in die welt' },
    subtitle: {
      en: 'five moments made somewhere new together.',
      de: 'fünf momente an orten, an denen ihr noch nie wart.',
    },
    goalCount: 5, spaceTypes: ['couple', 'friends'], badge: '🧭',
    durationLabel: { en: 'whenever it fits', de: 'wann immer es passt' },
    category: 'adventure',
  },
  {
    id: 'ch-4',
    title: { en: 'the spice run', de: 'ein bisschen schärfe' },
    subtitle: {
      en: 'six bold, playful moments. turn up the heat a little.',
      de: 'sechs mutige, verspielte momente. dreht die wärme ein wenig hoch.',
    },
    goalCount: 6, spaceTypes: ['couple'], badge: '🌶️',
    durationLabel: { en: 'no rush', de: 'ohne eile' },
    category: 'play',
  },
  {
    id: 'ch-5',
    title: { en: 'the crew', de: 'die ganze runde' },
    subtitle: {
      en: 'four moments with the whole group.',
      de: 'vier momente mit allen zusammen.',
    },
    goalCount: 4, spaceTypes: ['friends'], badge: '✨', durationLabel: SEASON,
  },
];

/**
 * Lightweight weekly challenges — a single shared moment is the whole goal, so a
 * couple can finish "this week's" challenge in one go and collect that week's
 * mark. Kept separate from the season-long CHALLENGES above so the challenges
 * list stays uncluttered; both are resolvable via challengeById/ALL_CHALLENGES.
 */
const THIS_WEEK: LocalizedText = { en: 'this week', de: 'diese woche' };

export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'wk-1',
    title: { en: 'one soft evening', de: 'ein sanfter abend' },
    subtitle: { en: 'do one calm, unhurried thing together this week.', de: 'macht diese woche eine ruhige sache zusammen, ganz ohne eile.' },
    goalCount: 1, spaceTypes: ['couple', 'friends'], badge: '🌙', durationLabel: THIS_WEEK,
    category: 'calm',
  },
  {
    id: 'wk-2',
    title: { en: 'one out the door', de: 'einmal vor die tür' },
    subtitle: { en: 'get outside together once this week — however small.', de: 'geht diese woche einmal zusammen raus — und sei es nur kurz.' },
    goalCount: 1, spaceTypes: ['couple', 'friends'], badge: '🌿', durationLabel: THIS_WEEK,
    category: 'outdoors',
  },
  {
    id: 'wk-3',
    title: { en: 'one good laugh', de: 'einmal richtig lachen' },
    subtitle: { en: 'do one playful thing that makes you laugh together.', de: 'macht etwas verspieltes, bei dem ihr zusammen lachen müsst.' },
    goalCount: 1, spaceTypes: ['couple', 'friends'], badge: '✨', durationLabel: THIS_WEEK,
    category: 'play',
  },
  {
    id: 'wk-4',
    title: { en: 'one new thing', de: 'einmal etwas neues' },
    subtitle: { en: 'try one small thing neither of you has done.', de: 'probiert eine kleine sache, die ihr beide noch nie gemacht habt.' },
    goalCount: 1, spaceTypes: ['couple', 'friends'], badge: '🧭', durationLabel: THIS_WEEK,
    category: 'adventure',
  },
  {
    id: 'wk-5',
    title: { en: 'one slow meal', de: 'einmal in ruhe essen' },
    subtitle: { en: 'share one unhurried meal together, no phones.', de: 'esst einmal in ruhe zusammen — ohne handys.' },
    goalCount: 1, spaceTypes: ['couple', 'friends'], badge: '🍽️', durationLabel: THIS_WEEK,
    category: 'food',
  },
  {
    id: 'wk-6',
    title: { en: 'one little adventure', de: 'ein kleines abenteuer' },
    subtitle: { en: 'one tiny adventure, somewhere not far.', de: 'ein winziges abenteuer, irgendwo ganz in der nähe.' },
    goalCount: 1, spaceTypes: ['couple', 'friends'], badge: '🗺️', durationLabel: THIS_WEEK,
    category: 'adventure',
  },
  {
    id: 'wk-7',
    title: { en: 'one kind word', de: 'ein liebes wort' },
    subtitle: { en: 'tell or write each other one real thank-you.', de: 'sagt oder schreibt euch ein ehrliches dankeschön.' },
    goalCount: 1, spaceTypes: ['couple'], badge: '💛', durationLabel: THIS_WEEK,
    category: 'wellness',
  },
  // ── SOLO ──────────────────────────────────────────────────────────────
  // Eigene Wochen-Anlässe für einen Space mit einer Person. Bewusst NICHT die
  // Paar-Anlässe mit gestrichenem „zusammen": „ein sanfter abend" allein ist
  // etwas anderes als zu zweit, und der Text darf das sagen. Ziel bleibt 1 —
  // ein Anlass, keine Quote (MANIFESTO §3).
  {
    id: 'wk-s1',
    title: { en: 'one hour that is yours', de: 'eine stunde, die dir gehört' },
    subtitle: { en: 'take one unhurried hour this week and spend it on nothing useful.', de: 'nimm dir diese woche eine stunde ohne eile — für nichts nützliches.' },
    goalCount: 1, spaceTypes: ['solo'], badge: '🌙', durationLabel: THIS_WEEK,
    category: 'calm',
  },
  {
    id: 'wk-s2',
    title: { en: 'one door, once', de: 'einmal raus' },
    subtitle: { en: 'get outside once this week with nowhere to be.', de: 'geh diese woche einmal raus, ohne ein ziel zu haben.' },
    goalCount: 1, spaceTypes: ['solo'], badge: '🌿', durationLabel: THIS_WEEK,
    category: 'outdoors',
  },
  {
    id: 'wk-s3',
    title: { en: 'one thing done badly', de: 'einmal etwas schlecht machen' },
    subtitle: { en: 'make something clumsy this week and keep it anyway.', de: 'mach diese woche etwas ungeschickt — und heb es trotzdem auf.' },
    goalCount: 1, spaceTypes: ['solo'], badge: '✨', durationLabel: THIS_WEEK,
    category: 'create',
  },
  {
    id: 'wk-s4',
    title: { en: 'one first time', de: 'einmal zum ersten mal' },
    subtitle: { en: 'try one small thing you have never done.', de: 'probier eine kleine sache, die du noch nie gemacht hast.' },
    goalCount: 1, spaceTypes: ['solo'], badge: '🧭', durationLabel: THIS_WEEK,
    category: 'adventure',
  },
  {
    id: 'wk-s5',
    title: { en: 'one meal at a table', de: 'einmal am tisch essen' },
    subtitle: { en: 'eat one meal at a proper table, no screen, no rush.', de: 'iss einmal an einem richtigen tisch — ohne bildschirm, ohne eile.' },
    goalCount: 1, spaceTypes: ['solo'], badge: '🍽️', durationLabel: THIS_WEEK,
    category: 'food',
  },
  // Copy is explicitly two-people — couple only (audit A4-10).
  {
    id: 'wk-8',
    title: { en: 'one cosy night in', de: 'ein gemütlicher abend zu hause' },
    subtitle: { en: 'one cosy night in, just the two of you.', de: 'ein gemütlicher abend zu hause, nur ihr zwei.' },
    goalCount: 1, spaceTypes: ['couple'], badge: '🕯️', durationLabel: THIS_WEEK,
    category: 'home',
  },
];

/** Everything resolvable by id — season + weekly. */
export const ALL_CHALLENGES: Challenge[] = [...CHALLENGES, ...WEEKLY_CHALLENGES];

export function challengesForSpaceType(type: SpaceType): Challenge[] {
  return CHALLENGES.filter((c) => c.spaceTypes.includes(type));
}

export function challengeById(id: string): Challenge | undefined {
  return ALL_CHALLENGES.find((c) => c.id === id);
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
  // Weekly challenges rotate back in — accepting again in a NEW week must
  // restart the enrollment (fresh joined_at), or the challenge is dead after
  // one rotation cycle (audit A4-06). Season challenges stay join-once.
  const isWeekly = challengeId.startsWith('wk-');
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('challenge_enrollments')
      .upsert(
        isWeekly
          ? { space_id: spaceId, challenge_id: challengeId, joined_at: new Date().toISOString() }
          : { space_id: spaceId, challenge_id: challengeId },
        { onConflict: 'space_id,challenge_id', ignoreDuplicates: !isWeekly },
      );
    if (error) throw error;
    return;
  }
  const all = await loadAll();
  const current = all[spaceId] ?? [];
  const existing = current.find((e) => e.challengeId === challengeId);
  if (existing && !isWeekly) return;
  const next = current.filter((e) => e.challengeId !== challengeId);
  all[spaceId] = [...next, { challengeId, joinedAt: new Date().toISOString() }];
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
