import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHmac } from 'crypto'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 3
const RATE_WINDOW = 10 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return false
  }
  if (entry.count >= RATE_LIMIT) return true
  entry.count++
  return false
}

function makeUnsubToken(email: string): string {
  const secret = process.env.NEWSLETTER_SECRET ?? 'dev-secret'
  return createHmac('sha256', secret).update(email).digest('base64url')
}

const CONFIRMATION_EN = (unsubUrl: string) => `∧ peakplant

thank you for being here.
we'll reach out when edition 01 drops in august 2026.
until then — slow down a little.

one question while you wait:
when did you last feel truly close to someone?

safe. soft. wild.
∧ peakplant

—
unsubscribe: ${unsubUrl}`

const CONFIRMATION_DE = (unsubUrl: string) => `∧ peakplant

danke, dass du dabei bist.
wir melden uns, wenn edition 01 im august 2026 startet.
bis dahin — nimm dir ein bisschen zeit.

eine frage für die zwischenzeit:
wann hast du das letzte mal wirklich gespürt, dass du jemandem nahe bist?

safe. soft. wild.
∧ peakplant

—
abmelden: ${unsubUrl}`

function supabaseHeaders(key: string) {
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=minimal',
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { email, source, locale } = await req.json()
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const sanitized = email.trim().toLowerCase()
    const isDE = locale === 'de'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Waitlist] Supabase env vars missing — logging only:', sanitized)
    } else {
      const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscribers`, {
        method: 'POST',
        headers: supabaseHeaders(supabaseKey),
        body: JSON.stringify({ email: sanitized, source: source ?? 'homepage', edition: 'edition_01' }),
      })

      if (res.status === 409) return NextResponse.json({ duplicate: true })

      if (!res.ok) {
        const body = await res.text()
        console.error(`[Waitlist] Supabase ${res.status}:`, body)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com'
        const token = makeUnsubToken(sanitized)
        const unsubUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(sanitized)}&token=${encodeURIComponent(token)}`
        await resend.emails.send({
          from: 'alicia@peak-plant.com',
          to: sanitized,
          subject: isDE ? 'du bist dabei.' : "you're in.",
          text: isDE ? CONFIRMATION_DE(unsubUrl) : CONFIRMATION_EN(unsubUrl),
        })
      } catch (err) {
        console.error('[Waitlist] Resend error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Waitlist] Uncaught error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
