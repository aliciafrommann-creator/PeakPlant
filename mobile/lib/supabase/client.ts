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

// SECURITY (B1, pre-launch): the auth session currently persists in
// AsyncStorage (unencrypted). To harden, install `expo-secure-store` and swap
// `storage` below for a chunked SecureStore adapter (a Supabase session can
// exceed SecureStore's ~2KB per-item limit, so split across keys):
//
//   import * as SecureStore from 'expo-secure-store';
//   const CHUNK = 2000;
//   const SecureStoreAdapter = {
//     getItem: async (k) => {
//       const n = await SecureStore.getItemAsync(`${k}__n`);
//       if (!n) return SecureStore.getItemAsync(k);            // single-value back-compat
//       let out = ''; for (let i = 0; i < +n; i++) out += (await SecureStore.getItemAsync(`${k}__${i}`)) ?? '';
//       return out;
//     },
//     setItem: async (k, v) => {
//       const parts = v.match(new RegExp(`.{1,${CHUNK}}`, 'g')) ?? [''];
//       await SecureStore.setItemAsync(`${k}__n`, String(parts.length));
//       await Promise.all(parts.map((p, i) => SecureStore.setItemAsync(`${k}__${i}`, p)));
//     },
//     removeItem: async (k) => {
//       const n = await SecureStore.getItemAsync(`${k}__n`);
//       await SecureStore.deleteItemAsync(`${k}__n`);
//       for (let i = 0; i < (n ? +n : 0); i++) await SecureStore.deleteItemAsync(`${k}__${i}`);
//       await SecureStore.deleteItemAsync(k);
//     },
//   };
//
// Then pass `storage: SecureStoreAdapter`. Left as AsyncStorage here because the
// native module isn't installed in this environment (offline); activate it with
// `npx expo install expo-secure-store` + a build. See HANDOVER.
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
