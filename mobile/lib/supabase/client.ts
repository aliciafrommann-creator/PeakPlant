/**
 * Supabase client scaffold.
 *
 * Reads credentials from public env vars (see .env.example). Returns `null` when
 * unconfigured so the app keeps running on local repositories until a real EU
 * project + keys exist (O-001). The service-role key is NEVER referenced here —
 * only the public anon key, which is safe to ship.
 *
 * Not yet imported by app screens. The next increment wires the Supabase
 * repositories (see docs/BACKEND.md) behind this client.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Mobile uses deep links, not URL session detection.
        detectSessionInUrl: false,
      },
    })
  : null;
