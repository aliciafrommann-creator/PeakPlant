/**
 * Supabase client.
 *
 * Reads credentials from public env vars (see .env.example). Returns `null` when
 * unconfigured so the app keeps running on local repositories until a real EU
 * project + keys exist (O-001). The service-role key is NEVER referenced here —
 * only the public anon key, which is safe to ship.
 *
 * SECURITY (B1/M8, applied): the auth session persists in **SecureStore**
 * (encrypted, hardware-backed where available), chunked because a Supabase
 * session JSON can exceed SecureStore's ~2KB per-item limit. Sessions that an
 * older build left in AsyncStorage are migrated on first read and removed from
 * AsyncStorage. `expo-secure-store` is a native module: it needs
 * `npx expo install expo-secure-store` + a new native build (EAS/TestFlight) —
 * documented operator step. Where the module is unavailable (unit tests,
 * Expo Go without the module) the adapter falls back to AsyncStorage and says
 * so, instead of crashing the app.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

type SecureStoreModule = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

// Lazy + guarded: expo-secure-store is a native module. In a node test run or
// a build without the module, require() throws — then we keep the old
// AsyncStorage behaviour (loudly) rather than taking the whole app down.
let SecureStore: SecureStoreModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SecureStore = require('expo-secure-store');
} catch {
  SecureStore = null;
}
if (!SecureStore && process.env.NODE_ENV !== 'test') {
  console.warn('[auth] expo-secure-store unavailable — session falls back to AsyncStorage (unencrypted). Run `npx expo install expo-secure-store` and rebuild.');
}

// SecureStore rejects values over ~2048 bytes; a session JSON is larger.
const CHUNK = 2000;

async function secureRead(store: SecureStoreModule, key: string): Promise<string | null> {
  const n = await store.getItemAsync(`${key}__n`);
  if (!n) return store.getItemAsync(key); // single-value back-compat
  let out = '';
  for (let i = 0; i < Number(n); i++) out += (await store.getItemAsync(`${key}__${i}`)) ?? '';
  return out;
}

async function secureWrite(store: SecureStoreModule, key: string, value: string): Promise<void> {
  const parts = value.match(new RegExp(`.{1,${CHUNK}}`, 'g')) ?? [''];
  // Remove stale higher chunks from a previously longer value first.
  const oldN = Number((await store.getItemAsync(`${key}__n`)) ?? 0);
  for (let i = parts.length; i < oldN; i++) await store.deleteItemAsync(`${key}__${i}`);
  await Promise.all(parts.map((p, i) => store.setItemAsync(`${key}__${i}`, p)));
  await store.setItemAsync(`${key}__n`, String(parts.length));
}

async function secureRemove(store: SecureStoreModule, key: string): Promise<void> {
  const n = await store.getItemAsync(`${key}__n`);
  await store.deleteItemAsync(`${key}__n`);
  for (let i = 0; i < (n ? Number(n) : 0); i++) await store.deleteItemAsync(`${key}__${i}`);
  await store.deleteItemAsync(key);
}

const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (!SecureStore) return AsyncStorage.getItem(key);
    const secure = await secureRead(SecureStore, key);
    if (secure !== null && secure !== '') return secure;
    // One-time migration: an older build persisted the session in
    // AsyncStorage. Move it over, then remove the unencrypted copy.
    const legacy = await AsyncStorage.getItem(key);
    if (legacy !== null) {
      await secureWrite(SecureStore, key, legacy);
      await AsyncStorage.removeItem(key);
    }
    return legacy;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!SecureStore) return AsyncStorage.setItem(key, value);
    await secureWrite(SecureStore, key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (!SecureStore) return AsyncStorage.removeItem(key);
    await secureRemove(SecureStore, key);
    // Also clear any legacy unencrypted copy, so sign-out really signs out.
    await AsyncStorage.removeItem(key);
  },
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        // Mobile uses deep links, not URL session detection.
        detectSessionInUrl: false,
      },
    })
  : null;
