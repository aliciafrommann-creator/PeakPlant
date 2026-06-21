import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'peakplant:';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // silently fail in demo
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch {
      // silently fail
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter((k) => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch {
      // silently fail
    }
  },
};
