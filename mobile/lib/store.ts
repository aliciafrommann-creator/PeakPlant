import { create } from 'zustand';
import { storage } from './storage';
import { DEFAULT_FEATURES, type FeatureKey } from './features';
import type { Lang } from './types';

const ONBOARDED_KEY = 'onboarded';
const GOALS_KEY = 'goals';
const ACTIVE_SPACE_KEY = 'activeSpaceId';
const FEATURES_KEY = 'enabledFeatures';
const LANGUAGE_KEY = 'language';
const PERSONALIZATION_KEY = 'personalization';
const PERSONALIZATION_RESET_KEY = 'personalizationResetAt';

/**
 * UI-preference writes are fire-and-forget: the in-memory state already updated,
 * so a failed persist only means the choice won't survive a restart. We log it
 * instead of swallowing it (storage.set now throws on failure) so it surfaces in
 * dev without crashing the interaction.
 */
function warnWriteFailed(e: unknown): void {
  console.warn('[store] could not persist preference:', e);
}

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  language: Lang;
  goals: string[];
  activeSpaceId: string | null;
  features: Record<FeatureKey, boolean>;
  /** Behavioral personalization: learn gentle bias from explicit saves. */
  personalization: boolean;
  /** ISO of the last "forget what you've learned" reset (null = never). */
  personalizationResetAt: string | null;
  hydrate: () => Promise<void>;
  setLanguage: (lang: Lang) => void;
  setGoals: (goals: string[]) => void;
  setActiveSpace: (id: string) => void;
  toggleFeature: (key: FeatureKey, enabled: boolean) => void;
  setPersonalization: (enabled: boolean) => void;
  /** Forget everything learned so far without deleting the saved ideas. */
  resetLearning: () => void;
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
  personalization: true,
  personalizationResetAt: null,

  hydrate: async () => {
    const onboarded = (await storage.get<boolean>(ONBOARDED_KEY)) ?? false;
    const language = (await storage.get<Lang>(LANGUAGE_KEY)) ?? 'en';
    const goals = (await storage.get<string[]>(GOALS_KEY)) ?? [];
    const activeSpaceId = (await storage.get<string>(ACTIVE_SPACE_KEY)) ?? null;
    const storedFeatures = await storage.get<Record<string, boolean>>(FEATURES_KEY);
    // Merge defaults with stored so newly-added features get their default.
    const features = { ...DEFAULT_FEATURES, ...(storedFeatures ?? {}) };
    const personalization = (await storage.get<boolean>(PERSONALIZATION_KEY)) ?? true;
    const personalizationResetAt = (await storage.get<string>(PERSONALIZATION_RESET_KEY)) ?? null;
    set({
      onboarded,
      language,
      goals,
      activeSpaceId,
      features,
      personalization,
      personalizationResetAt,
      hydrated: true,
    });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    void storage.set(LANGUAGE_KEY, lang).catch(warnWriteFailed);
  },

  setGoals: (goals) => {
    set({ goals });
    void storage.set(GOALS_KEY, goals).catch(warnWriteFailed);
  },

  setActiveSpace: (id) => {
    set({ activeSpaceId: id });
    void storage.set(ACTIVE_SPACE_KEY, id).catch(warnWriteFailed);
  },

  toggleFeature: (key, enabled) => {
    const features = { ...get().features, [key]: enabled };
    set({ features });
    void storage.set(FEATURES_KEY, features).catch(warnWriteFailed);
  },

  setPersonalization: (enabled) => {
    set({ personalization: enabled });
    void storage.set(PERSONALIZATION_KEY, enabled).catch(warnWriteFailed);
  },

  resetLearning: () => {
    const at = new Date().toISOString();
    set({ personalizationResetAt: at });
    void storage.set(PERSONALIZATION_RESET_KEY, at).catch(warnWriteFailed);
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
    await storage.remove(PERSONALIZATION_KEY);
    await storage.remove(PERSONALIZATION_RESET_KEY);
    set({
      onboarded: false,
      language: 'en',
      goals: [],
      activeSpaceId: null,
      features: { ...DEFAULT_FEATURES },
      personalization: true,
      personalizationResetAt: null,
    });
  },
}));

export {
  GOALS_KEY,
  ONBOARDED_KEY,
  ACTIVE_SPACE_KEY,
  FEATURES_KEY,
  LANGUAGE_KEY,
  PERSONALIZATION_KEY,
  PERSONALIZATION_RESET_KEY,
};
