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

/**
 * Alicia's own letter. Written by her, not assembled from product copy — that
 * is the point of it.
 *
 * Instagram only. The WhatsApp invite is deliberately not in here: a group
 * link in a mail to every subscriber can be forwarded to anyone, so it lives
 * behind the login instead (decision Alicia, 12.08.).
 *
 * Public brand address, so it belongs in the code rather than in an env var
 * someone has to remember to set in two environments. The share tracking
 * parameter from the app link is stripped — it identifies the sharing session
 * and has no business in a mail to thousands of people.
 */
const INSTAGRAM_URL = 'https://www.instagram.com/peak.plant'
const BODY_EN = (unsubUrl: string) => `∧ peakplant

Hi,

Thank you so much for joining our community.

I’m Alicia, and for the past six months I’ve been building around the things
I’m deeply passionate about. PeakPlant is one of them.

I truly believe that loving — a partner, a friend, a stranger, the world,
ourselves — can make life so much richer. But love also asks something of us.
It asks us to look at ourselves, at each other, and at the world around us.
Sometimes that can be challenging. But it can also be wonderfully eye-opening,
intimate, and transformative.

How much love can one life hold? Sometimes I feel like my heart could burst
from it.

And honestly, that feeling is part of why I’m so happy that you want to be
part of PeakPlant, too.

I hope you’ll enjoy what I’m creating. At its heart is a simple belief: that
we can create a more connected, loving world together — by paying attention to
the moments that matter and making a little more room for love.

Mind the Moment.
Max the Love.

If you’d like, come along for a bit: read my newsletters and journals and
follow PeakPlant on Instagram. And if any of it speaks to you, tell someone
about it.

${INSTAGRAM_URL}

More from PeakPlant soon.

Alicia

edition 01 — the sunflower — ships october 2026.

—
unsubscribe: ${unsubUrl}`

const BODY_DE = (unsubUrl: string) => `∧ peakplant

Hi,

vielen Dank, dass du dich für unsere Community angemeldet hast.

Ich bin Alicia und arbeite seit einem halben Jahr an den Themen, für die ich
wirklich brenne. PeakPlant gehört dazu.

Ich bin fest davon überzeugt, dass Lieben unser Leben unglaublich viel schöner
machen kann. Einen Partner oder eine Partnerin zu lieben. Freund. Fremde
Menschen. Die Welt. Und nicht zuletzt uns selbst.

Aber Liebe passiert nicht einfach nebenbei. Sie braucht Aufmerksamkeit.
Offenheit. Mut. Und manchmal auch die Bereitschaft, uns mit uns selbst und
miteinander auseinanderzusetzen.

Das kann anstrengend sein. Aber gleichzeitig ist es eines der schönsten Dinge,
die ich kenne: wundervoll augenöffnend, ehrlich und intim.

Manchmal frage ich mich, wie viel Liebe eigentlich in ein einziges Leben
passt. Und manchmal habe ich das Gefühl, mein Herz könnte daran zerbrechen,
weil so viel davon da ist.

Vielleicht auch deshalb freue ich mich so sehr, dass du Teil von PeakPlant
sein möchtest.

Ich hoffe, dir gefällt, was ich hier erschaffe. Im Kern steckt eine ganz
einfache Überzeugung: Dass wir unsere gemeinsame Welt ein kleines Stück
liebevoller machen können, wenn wir bewusster wahrnehmen, was gerade da ist,
und ein bisschen mehr Raum für Liebe schaffen.

Mind the Moment.
Max the Love.

Wenn du magst, begleite mich ein Stück auf diesem Weg: Lies meine Newsletter
und Journals und folge PeakPlant auf Instagram. Und wenn dir etwas davon
gefällt, erzähl gerne jemandem davon.

${INSTAGRAM_URL}

Mehr von PeakPlant kommt ganz bald.

Alicia

edition 01 — die sonnenblume — erscheint im oktober 2026.

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
