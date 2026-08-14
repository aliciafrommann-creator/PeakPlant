import { NextRequest, NextResponse } from 'next/server'
import { mailProvider, sendMail } from '../../../lib/email'
import { safeEqual } from '../../../lib/serverSecrets'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Operator diagnostic: is production actually wired up?
 *
 * The waitlist depends on env vars that only exist in Vercel, so "it works on
 * my machine" says nothing. Open
 *   https://peak-plant.com/api/health?key=<ADMIN_SECRET>
 * to see which pieces are configured. Reports presence only — never a value —
 * and requires the admin secret, so a missing key is not a public signal.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  const secret = process.env.ADMIN_SECRET
  // Constant-time comparison — a plain !== leaks how many leading characters
  // match, and this endpoint is reachable without any other auth.
  if (!secret || !key || !safeEqual(key, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const has = (name: string) => Boolean(process.env[name])

  // ?testmail=you@example.com sends one real mail and hands back the
  // provider's own answer. Configuring a mail provider otherwise means
  // guessing from the outside whether it works; this makes it a 10-second
  // check, and a rejection comes back with the provider's exact wording.
  const testTo = req.nextUrl.searchParams.get('testmail')
  if (testTo) {
    const result = await sendMail({
      to: testTo,
      subject: 'peakplant — test',
      text: 'Wenn diese Mail ankommt, ist der Versand richtig eingerichtet.\n\n∧ peakplant',
    })
    return NextResponse.json({ test: true, to: testTo, ...result })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Service role only — the same key the waitlist actually stores with. With
  // the anon fallback this check could report "reachable" for a key the write
  // path never uses, which is a diagnostic that lies.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Actually talk to the database — a set variable can still be the wrong one.
  let subscribersReachable = false
  let subscriberCount: number | null = null
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscribers?select=id`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact',
          'Range': '0-0',
        },
      })
      subscribersReachable = res.ok
      if (res.ok) {
        subscriberCount = parseInt((res.headers.get('content-range') ?? '').split('/')[1] ?? '0') || 0
      }
    } catch {
      subscribersReachable = false
    }
  }

  return NextResponse.json({
    waitlistCanStore: subscribersReachable,
    waitlistCanMail: mailProvider() !== null,
    // Which provider will actually be used — Brevo wins when both keys exist.
    mailProvider: mailProvider(),
    subscriberCount,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: has('NEXT_PUBLIC_SUPABASE_URL'),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: has('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: has('SUPABASE_SERVICE_ROLE_KEY'),
      BREVO_API_KEY: has('BREVO_API_KEY'),
      RESEND_API_KEY: has('RESEND_API_KEY'),
      NEWSLETTER_SECRET: has('NEWSLETTER_SECRET'),
      NEXT_PUBLIC_SITE_URL: has('NEXT_PUBLIC_SITE_URL'),
      STRIPE_SECRET_KEY: has('STRIPE_SECRET_KEY'),
      STRIPE_WEBHOOK_SECRET: has('STRIPE_WEBHOOK_SECRET'),
    },
  })
}
