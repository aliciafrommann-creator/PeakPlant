/**
 * Active identity: the real Supabase user when configured + signed in,
 * otherwise the mock user (local-first dev/demo).
 */
import { isSupabaseConfigured } from './supabase/client';
import { getSessionUser } from './supabase/auth';
import { getMockUser } from './mock-auth';

export interface ActiveUser {
  id: string;
  name: string;
}

export async function getActiveUser(): Promise<ActiveUser | null> {
  if (isSupabaseConfigured) {
    return await getSessionUser();
  }
  // Fail closed in release builds: a production bundle missing its Supabase
  // env must NEVER silently sign people in as the seed user with invented
  // data (audit A5-10.1, MANIFESTO §1/§2). Mock identity is dev-only.
  if (!__DEV__) return null;
  return getMockUser();
}
