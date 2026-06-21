/**
 * Supabase auth — email OTP (6-digit code). Only used when configured; the app
 * falls back to mock auth otherwise. See docs/BACKEND.md.
 */

import { supabase } from './client';

export interface SessionUser {
  id: string;
  name: string;
}

function client() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

/** Send a one-time login code to the email. */
export async function sendEmailCode(email: string): Promise<void> {
  const { error } = await client().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
  });
  if (error) throw error;
}

/** Verify the emailed code and establish a session. */
export async function verifyEmailCode(email: string, token: string): Promise<void> {
  const { error } = await client().auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });
  if (error) throw error;
}

/** Current signed-in user (with profile name), or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();
  const fallback = user.email ? user.email.split('@')[0] : '';
  return { id: user.id, name: profile?.name?.trim() || fallback };
}

/** Create or update the caller's profile row. */
export async function ensureProfile(name: string): Promise<void> {
  const { data } = await client().auth.getUser();
  const user = data.user;
  if (!user) return;
  await client().from('profiles').upsert({ id: user.id, name: name.trim() });
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}
