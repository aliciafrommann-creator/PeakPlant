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
  return getMockUser();
}
