import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

function verifyToken(email: string, token: string): boolean {
  const secret = process.env.NEWSLETTER_SECRET ?? 'dev-secret'
  const expected = createHmac('sha256', secret).update(email).digest('base64url')
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()
  const token = searchParams.get('token') ?? ''

  if (!email || !email.includes('@') || !verifyToken(email, token)) {
    return NextResponse.redirect(new URL('/unsubscribe?error=1', req.url))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
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
  }

  return NextResponse.redirect(new URL('/unsubscribe?done=1', req.url))
}
