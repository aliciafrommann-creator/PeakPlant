import { NextResponse } from 'next/server'
import { sendMail } from '../../../lib/email'
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

// Alicia's own letter. Written by her, not assembled from product copy —
// that is the point of it. Translated, not rewritten.
const BODY_EN = (unsubUrl: string) => `∧ peakplant

Hi,

thank you so much for joining our community.

I'm Alicia, and for the past six months I've been building on the things I'm
most passionate about. PeakPlant is one of them, because I firmly believe that
loving — a partner, a friend, strangers, the world, ourselves, and so much
more — makes life so much better. But it asks a lot of us. It asks that we
look at ourselves and at each other. Sometimes that's exhausting. It's also
wonderfully eye-opening, and intimate.

How much love can a person feel in one lifetime? Sometimes it feels like my
heart is bursting with it. Part of that is you, wanting to be part of
PeakPlant.

I hope you like what I'm making. Either way, what's in it is the belief in a
world we share.

Read my newsletters and journal entries if you like — and tell someone about
them.

See you soon, with more.
Alicia

edition 01 — the sunflower — ships october 2026.

mind the moment. max the love.

—
unsubscribe: ${unsubUrl}`

const BODY_DE = (unsubUrl: string) => `∧ peakplant

Hi,

vielen Dank, dass du dich zu unserer Community angemeldet hast.

Ich bin Alicia und baue seit einem halben Jahr an meinen Passion-Themen.
PeakPlant gehört dazu, weil ich der festen Überzeugung bin, dass zu lieben —
Partner*in, Freund*in, Fremde, die Welt, uns selbst und so vieles mehr — das
Leben so viel besser macht. Aber es setzt ganz viele Faktoren voraus, die
voraussetzen, dass wir uns mit uns selbst und miteinander auseinandersetzen.
Manchmal anstrengend, aber wundervoll augenöffnend und intim.

Wie viel Liebe kann man in einem Leben fühlen? Ich habe manchmal das Gefühl,
mein Herz bricht aus vor Liebe. Auch, weil du Teil von PeakPlant sein magst.

Ich hoffe, dir gefällt, was ich mache. Auf jeden Fall steckt die Überzeugung
einer gemeinsamen Welt darin.

Lies gerne meine Newsletter und Journals, wenn du magst, und erzähl davon.

Bis bald mit mehr Informationen,
Alicia

edition 01 — die sonnenblume — erscheint im oktober 2026.

mind the moment. max the love.

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

    // Fail closed. Without a store the address is simply gone, and answering
    // "success" would tell a real visitor they are on a list that does not
    // exist. Better a visible error she can retry than a silent loss.
    if (!supabaseUrl || !supabaseKey) {
      console.error('[Waitlist] Supabase env vars missing — cannot store:', sanitized)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscribers`, {
      method: 'POST',
      headers: supabaseHeaders(supabaseKey),
      body: JSON.stringify({ email: sanitized, source: source ?? 'homepage', edition: 'edition_01', status: 'active', locale: isDE ? 'de' : 'en' }),
    })
    if (res.status === 409) return NextResponse.json({ duplicate: true })
    if (!res.ok) {
      console.error(`[Waitlist] Supabase ${res.status}:`, await res.text())
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    // The address is stored — that part is done and must not be rolled back if
    // the welcome mail fails. But we report honestly whether it went out, so
    // the page never says "check your inbox" when nothing was sent.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com'
    const token = makeUnsubToken(sanitized)
    const unsubUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(sanitized)}&token=${encodeURIComponent(token)}`
    const mail = await sendMail({
      to: sanitized,
      subject: isDE ? 'du bist dabei.' : "you're in.",
      text: isDE ? BODY_DE(unsubUrl) : BODY_EN(unsubUrl),
    })

    return NextResponse.json({ success: true, mailed: mail.sent })
  } catch (err) {
    console.error('[Waitlist] Uncaught error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
