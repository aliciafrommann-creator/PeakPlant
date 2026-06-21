/**
 * MOCK AUTH — development and demo only.
 * Never import this in production paths.
 * Replace with real Supabase auth before launch.
 */

import { SEED_USER } from './seed';
import type { User } from './types';

export interface MockSession {
  user: User;
  isAuthenticated: true;
}

export function getMockSession(): MockSession {
  return {
    user: SEED_USER,
    isAuthenticated: true,
  };
}

export function getMockUser(): User {
  return SEED_USER;
}
