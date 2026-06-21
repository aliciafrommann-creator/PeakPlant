import { create } from 'zustand';
import { storage } from './storage';

const ONBOARDED_KEY = 'onboarded';
const GOALS_KEY = 'goals';
const ACTIVE_SPACE_KEY = 'activeSpaceId';

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  goals: string[];
  activeSpaceId: string | null;
  hydrate: () => Promise<void>;
  setGoals: (goals: string[]) => void;
  setActiveSpace: (id: string) => void;
  completeOnboarding: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  hydrated: false,
  onboarded: false,
  goals: [],
  activeSpaceId: null,

  hydrate: async () => {
    const onboarded = (await storage.get<boolean>(ONBOARDED_KEY)) ?? false;
    const goals = (await storage.get<string[]>(GOALS_KEY)) ?? [];
    const activeSpaceId = (await storage.get<string>(ACTIVE_SPACE_KEY)) ?? null;
    set({ onboarded, goals, activeSpaceId, hydrated: true });
  },

  setGoals: (goals) => {
    set({ goals });
    void storage.set(GOALS_KEY, goals);
  },

  setActiveSpace: (id) => {
    set({ activeSpaceId: id });
    void storage.set(ACTIVE_SPACE_KEY, id);
  },

  completeOnboarding: async () => {
    await storage.set(ONBOARDED_KEY, true);
    set({ onboarded: true });
  },

  reset: async () => {
    await storage.remove(ONBOARDED_KEY);
    await storage.remove(GOALS_KEY);
    await storage.remove(ACTIVE_SPACE_KEY);
    set({ onboarded: false, goals: [], activeSpaceId: null });
  },
}));

export { GOALS_KEY, ONBOARDED_KEY, ACTIVE_SPACE_KEY };
