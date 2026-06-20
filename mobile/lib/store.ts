import { create } from 'zustand';
import { storage } from './storage';

const ONBOARDED_KEY = 'onboarded';
const GOALS_KEY = 'goals';

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  goals: string[];
  hydrate: () => Promise<void>;
  setGoals: (goals: string[]) => void;
  completeOnboarding: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  onboarded: false,
  goals: [],

  hydrate: async () => {
    const onboarded = (await storage.get<boolean>(ONBOARDED_KEY)) ?? false;
    const goals = (await storage.get<string[]>(GOALS_KEY)) ?? [];
    set({ onboarded, goals, hydrated: true });
  },

  setGoals: (goals) => {
    set({ goals });
    void storage.set(GOALS_KEY, goals);
  },

  completeOnboarding: async () => {
    await storage.set(ONBOARDED_KEY, true);
    set({ onboarded: true });
  },

  reset: async () => {
    await storage.remove(ONBOARDED_KEY);
    await storage.remove(GOALS_KEY);
    set({ onboarded: false, goals: [] });
  },
}));

export { GOALS_KEY, ONBOARDED_KEY };
