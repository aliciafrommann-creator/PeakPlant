import { NextResponse } from 'next/server'
import { verifyUnsubToken } from '../../../lib/serverSecrets'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()
  const token = searchParams.get('token') ?? ''

  // verifyUnsubToken is fail-closed: a missing NEWSLETTER_SECRET verifies
  // nothing (finding H3 — the old 'dev-secret' default made every token
  // forgeable). The visitor sees the honest error page either way.
  if (!email || !email.includes('@') || !verifyUnsubToken(email, token)) {
    return NextResponse.redirect(new URL('/unsubscribe?error=1', req.url))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Service role only: with the anon key this DELETE was a silent no-op (RLS
  // filtered every row, PostgREST still answered 200) — the one request that
  // must never fail quietly. Missing key now reports the error honestly.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('[Unsubscribe] Supabase env vars missing (need SUPABASE_SERVICE_ROLE_KEY) — cannot delete')
    return NextResponse.redirect(new URL('/unsubscribe?error=1', req.url))
  }

  // Delete the row rather than flag it. `subscribers` has no `status`
  // column, so the previous PATCH was rejected with a 400 and every
  // unsubscribe silently did nothing — the one request that must never
  // fail quietly. Removing the address is also the cleaner answer to
  // "stop writing to me": nothing is left behind to write to.
  const res = await fetch(
    `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
    }
  )
  if (!res.ok) {
    // Loud, because an unsubscribe that fails is a legal problem, not a bug.
    console.error('[Unsubscribe] failed:', res.status, await res.text().catch(() => ''))
    return NextResponse.redirect(new URL('/unsubscribe?error=1', req.url))
  }

  return NextResponse.redirect(new URL('/unsubscribe?done=1', req.url))
}
