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
} from './local';
import {
  supabaseMemoryRepository,
  supabaseCardRepository,
  supabaseSpaceRepository,
  supabaseSavedDateRepository,
} from './supabase';

export const memoryRepository = isSupabaseConfigured ? supabaseMemoryRepository : localMemoryRepository;
export const cardRepository = isSupabaseConfigured ? supabaseCardRepository : localCardRepository;
export const spaceRepository = isSupabaseConfigured ? supabaseSpaceRepository : localSpaceRepository;
export const savedDateRepository = isSupabaseConfigured
  ? supabaseSavedDateRepository
  : localSavedDateRepository;
