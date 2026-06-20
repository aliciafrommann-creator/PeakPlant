/**
 * MOCK AUTH — development and demo only.
 * Never import this in production paths.
 * Replace with real Supabase auth before launch.
 */

import { SEED_COUPLE, SEED_USER } from './seed';
import type { Couple, User } from './types';

export interface MockSession {
  user: User;
  couple: Couple;
  isAuthenticated: true;
}

export function getMockSession(): MockSession {
  return {
    user: SEED_USER,
    couple: SEED_COUPLE,
    isAuthenticated: true,
  };
}

export function getMockUser(): User {
  return SEED_USER;
}

export function getMockCouple(): Couple {
  return SEED_COUPLE;
}
