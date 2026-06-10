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
    await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ status: 'unsubscribed' }),
      }
    )
  }

  return NextResponse.redirect(new URL('/unsubscribe?done=1', req.url))
}
