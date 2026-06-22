import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'peakplant:';

/**
 * A write to local storage failed. This is surfaced (not swallowed) so the UI
 * can tell the user their moment/space/preference was not saved — a silently
 * dropped write looks identical to success and is the top data-loss risk for an
 * app whose promise is "preserve precious moments" (see DATE_DISCOVERY_STRATEGY §4).
 */
export class StorageWriteError extends Error {
  constructor(
    readonly key: string,
    readonly cause: unknown,
  ) {
    super(`Failed to persist "${key}"`);
    this.name = 'StorageWriteError';
  }
}

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      // A read failure (missing/corrupt value) is non-destructive: callers fall
      // back to seed/empty. We log it rather than crash a read path, but never
      // do this for writes.
      console.warn(`[storage] could not read "${key}":`, e);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      throw new StorageWriteError(key, e);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch (e) {
      throw new StorageWriteError(key, e);
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter((k) => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (e) {
      throw new StorageWriteError('*', e);
    }
  },
};
