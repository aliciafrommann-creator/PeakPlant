import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Gives a signed-in member the WhatsApp community link — and nobody else.
 *
 * Why a server route at all: a WhatsApp group link is a bearer secret. Anyone
 * holding it can join. Put into the client bundle (NEXT_PUBLIC_*) or into a
 * mail, it can be extracted or forwarded to arbitrary strangers (decision
 * Alicia, 12.08.: the invite lives behind the login, not in the letter).
 * So the link lives ONLY in the server env var WHATSAPP_COMMUNITY_URL —
 * never NEXT_PUBLIC, never in git — and is handed out here after the caller
 * proved they own a session.
 *
 * Token check: `supabase.auth.getUser(token)` sends the JWT to Supabase Auth,
 * which validates signature and expiry server-side. Anon key is enough for
 * that — deliberately no service_role here (MANIFESTO §2: that key stays out
 * of everything that does not strictly need it).
 *
 * `{ url: null }` (200) vs 401: a logged-in member whose link is not
 * configured yet is not an auth failure — the page turns null into an honest
 * "access is coming soon". 401 is reserved for "we do not know who you are".
 */
export async function GET(req: Request) {
  // Token check FIRST: a caller without a bearer token is unauthenticated
  // (401) no matter how the server is configured. Only when someone actually
  // presents a token do we need Supabase to verify it — and only then is a
  // missing auth config a server-side failure (500, fail closed).
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    // Without auth config we cannot verify anyone — fail closed, loudly.
    console.error('[Community/whatsapp] Supabase env vars missing — cannot verify caller')
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  try {
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      // Log the provider's reason (expired, malformed, revoked) — a silent 401
      // is undebuggable from the outside.
      console.error('[Community/whatsapp] token rejected:', error?.message ?? 'no user in response')
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const url = process.env.WHATSAPP_COMMUNITY_URL
    if (!url) {
      // Not an error: the group may simply not exist yet. The page renders
      // this as "access is coming soon" — honest, no dead button.
      return NextResponse.json({ url: null })
    }
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[Community/whatsapp] threw:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
