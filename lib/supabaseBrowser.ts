'use client'
/**
 * The one browser-side Supabase client for the website.
 *
 * Anon key only — it is designed to be public and is constrained by RLS. The
 * service_role key never appears here (MANIFESTO §2); anything that needs it
 * stays in a server route.
 *
 * `isSupabaseConfigured` exists so pages can tell the truth when the env vars
 * are missing (a fresh deployment, a preview without secrets): they render an
 * honest "not configured" note instead of a form whose submit can only fail
 * (MANIFESTO §1). Checking here, once, beats every page re-deriving it.
 *
 * The client is created lazily and memoised: module scope runs during the
 * server render too, and constructing a client with empty strings there would
 * throw before the page could show its honest fallback.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

let client: SupabaseClient | null = null

/**
 * Returns the shared client, or null when the env vars are missing. Callers
 * must handle null — that is the "show the honest message" branch, not an
 * error to swallow.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!client) client = createClient(url as string, anonKey as string)
  return client
}
