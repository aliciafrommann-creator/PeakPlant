/**
 * Active repositories. Supabase when configured (EXPO_PUBLIC_SUPABASE_*),
 * otherwise the local AsyncStorage repos. Screens/hooks import from here so the
 * data source swaps in one place.
 */
import { isSupabaseConfigured } from '../supabase/client';
import {
  localMemoryRepository,
  localCardRepository,
  localSpaceRepository,
  localSavedDateRepository,
  localDateFeedbackRepository,
  localPublicPlaceFeedbackRepository,
  localRitualRepository,
  localNoteRepository,
} from './local';
import {
  supabaseMemoryRepository,
  supabaseCardRepository,
  supabaseSpaceRepository,
  supabaseSavedDateRepository,
  supabasePublicPlaceFeedbackRepository,
  supabaseNoteRepository,
} from './supabase';

export const memoryRepository = isSupabaseConfigured ? supabaseMemoryRepository : localMemoryRepository;
export const cardRepository = isSupabaseConfigured ? supabaseCardRepository : localCardRepository;
export const spaceRepository = isSupabaseConfigured ? supabaseSpaceRepository : localSpaceRepository;
export const savedDateRepository = isSupabaseConfigured
  ? supabaseSavedDateRepository
  : localSavedDateRepository;

// Feedback is local-only for the beta; community integration is post-beta.
export const feedbackRepository = localDateFeedbackRepository;

// Explicit opt-in anonymous place feedback can be public when the Supabase
// migration is applied; otherwise screens catch failures and keep private flow.
export const publicPlaceFeedbackRepository = isSupabaseConfigured
  ? supabasePublicPlaceFeedbackRepository
  : localPublicPlaceFeedbackRepository;

// Rituals are local-only for the beta; the supabase adapter + migration are
// post-beta (rituals are private, space-scoped — no cross-device need yet).
export const ritualRepository = localRitualRepository;

// Partner notes sync across devices so a note really reaches the partner. Uses
// the Supabase adapter when configured (requires migration 0011), local
// otherwise. The hook degrades to empty on read error, so the home tab stays
// intact even before the migration is applied.
export const noteRepository = isSupabaseConfigured ? supabaseNoteRepository : localNoteRepository;
