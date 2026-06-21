import { create } from 'zustand';
import { storage } from './storage';
import { DEFAULT_FEATURES, type FeatureKey } from './features';
import type { Lang } from './types';

const ONBOARDED_KEY = 'onboarded';
const GOALS_KEY = 'goals';
const ACTIVE_SPACE_KEY = 'activeSpaceId';
const FEATURES_KEY = 'enabledFeatures';
const LANGUAGE_KEY = 'language';

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  language: Lang;
  goals: string[];
  activeSpaceId: string | null;
  features: Record<FeatureKey, boolean>;
  hydrate: () => Promise<void>;
  setLanguage: (lang: Lang) => void;
  setGoals: (goals: string[]) => void;
  setActiveSpace: (id: string) => void;
  toggleFeature: (key: FeatureKey, enabled: boolean) => void;
  completeOnboarding: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  onboarded: false,
  language: 'en',
  goals: [],
  activeSpaceId: null,
  features: { ...DEFAULT_FEATURES },

  hydrate: async () => {
    const onboarded = (await storage.get<boolean>(ONBOARDED_KEY)) ?? false;
    const language = (await storage.get<Lang>(LANGUAGE_KEY)) ?? 'en';
    const goals = (await storage.get<string[]>(GOALS_KEY)) ?? [];
    const activeSpaceId = (await storage.get<string>(ACTIVE_SPACE_KEY)) ?? null;
    const storedFeatures = await storage.get<Record<string, boolean>>(FEATURES_KEY);
    // Merge defaults with stored so newly-added features get their default.
    const features = { ...DEFAULT_FEATURES, ...(storedFeatures ?? {}) };
    set({ onboarded, language, goals, activeSpaceId, features, hydrated: true });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    void storage.set(LANGUAGE_KEY, lang);
  },

  setGoals: (goals) => {
    set({ goals });
    void storage.set(GOALS_KEY, goals);
  },

  setActiveSpace: (id) => {
    set({ activeSpaceId: id });
    void storage.set(ACTIVE_SPACE_KEY, id);
  },

  toggleFeature: (key, enabled) => {
    const features = { ...get().features, [key]: enabled };
    set({ features });
    void storage.set(FEATURES_KEY, features);
  },

  completeOnboarding: async () => {
    await storage.set(ONBOARDED_KEY, true);
    set({ onboarded: true });
  },

  reset: async () => {
    await storage.remove(ONBOARDED_KEY);
    await storage.remove(GOALS_KEY);
    await storage.remove(ACTIVE_SPACE_KEY);
    await storage.remove(FEATURES_KEY);
    await storage.remove(LANGUAGE_KEY);
    set({ onboarded: false, language: 'en', goals: [], activeSpaceId: null, features: { ...DEFAULT_FEATURES } });
  },
}));

export { GOALS_KEY, ONBOARDED_KEY, ACTIVE_SPACE_KEY, FEATURES_KEY, LANGUAGE_KEY };
