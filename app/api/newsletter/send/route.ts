import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHmac } from 'crypto'
import { articleForMonth } from '../../../../lib/journal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com').replace(/\/$/, '')

function headers(key: string) {
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  }
}

function unsubToken(email: string): string {
  const secret = process.env.NEWSLETTER_SECRET ?? process.env.CRON_SECRET ?? 'dev-secret'
  return createHmac('sha256', secret).update(email).digest('base64url')
}

// ── the monthly letter, sunflower style — warm cream + gold ──────────
function buildHtml(email: string, isDE: boolean): string {
  const article = articleForMonth()
  const articleUrl = `${SITE}/journal/${article.slug}`
  const unsubUrl = `${SITE}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(unsubToken(email))}`

  const t = isDE
    ? {
        kicker: 'der monatsbrief',
        hello: 'hallo du,',
        intro:
          'einmal im monat ein brief — kein lärm, kein verkaufen. nur ein gedanke, ein stück aus dem journal, und wo wir mit peakplant gerade stehen.',
        founderLabel: 'aus meinem notizbuch',
        founderNote:
          'edition 01 ist die sonnenblume. sie steht für wärme, treue und gemeinsames wachsen — und für etwas, das ich gerade selbst lerne: einander licht zu geben, ohne dem anderen das eigene zu nehmen. genau darum drehen sich die zehn fragen dieser edition.',
        readLabel: 'aus dem journal',
        read: 'lesen (auf englisch) →',
        editionLine: 'edition 01 — die sonnenblume — erscheint mitte august 2026.',
        signoff: 'bis nächsten monat,\nalicia',
        unsub: 'abmelden',
      }
    : {
        kicker: 'the monthly',
        hello: 'hello you,',
        intro:
          'once a month, a letter — no noise, no selling. just one thought, a piece from the journal, and where peakplant stands right now.',
        founderLabel: 'from my notebook',
        founderNote:
          'edition 01 is the sunflower. it stands for warmth, loyalty and growing together — and for something i am learning myself right now: giving each other light without taking the other’s. that is what the ten questions of this edition are about.',
        readLabel: 'from the journal',
        read: 'read it →',
        editionLine: 'edition 01 — the sunflower — ships mid-august 2026.',
        signoff: 'until next month,\nalicia',
        unsub: 'unsubscribe',
      }

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f1ea">
  <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fffdf8;color:#2a2620">
    <!-- header -->
    <div style="padding:48px 40px 0;text-align:center">
      <div style="font-size:40px;color:#CF4B2C;line-height:1">∧</div>
      <p style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#b9ad95;margin:18px 0 0">peakplant · ${t.kicker}</p>
    </div>

    <!-- intro -->
    <div style="padding:40px 40px 0">
      <p style="font-size:20px;font-weight:300;letter-spacing:-0.01em;margin:0 0 18px;color:#2a2620">${t.hello}</p>
      <p style="font-size:15px;line-height:1.85;font-weight:300;color:#6b6457;margin:0">${t.intro}</p>
    </div>

    <!-- founder note -->
    <div style="padding:36px 40px 0">
      <div style="border-left:2px solid #CF4B2C;padding:4px 0 4px 22px">
        <p style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#b9ad95;margin:0 0 12px">${t.founderLabel}</p>
        <p style="font-size:15px;line-height:1.85;font-weight:300;font-style:italic;color:#4a4438;margin:0">${t.founderNote}</p>
      </div>
    </div>

    <!-- journal piece of the month -->
    <div style="padding:40px 40px 0">
      <div style="background:#faf6ec;border:1px solid #ece4d2;border-radius:2px;padding:30px 28px">
        <p style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#CF4B2C;margin:0 0 14px">${t.readLabel} · ${article.category}</p>
        <p style="font-size:22px;font-weight:300;letter-spacing:-0.02em;line-height:1.25;margin:0 0 14px;color:#2a2620">${article.title}</p>
        <p style="font-size:14px;line-height:1.8;font-weight:300;color:#6b6457;margin:0 0 22px">${article.excerpt}</p>
        <a href="${articleUrl}" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:13px 26px;background:#2a2620;color:#fffdf8;text-decoration:none">${t.read}</a>
      </div>
    </div>

    <!-- edition line -->
    <div style="padding:40px 40px 0;text-align:center">
      <p style="font-size:12px;letter-spacing:0.12em;color:#b9ad95;margin:0">${t.editionLine}</p>
    </div>

    <!-- signoff -->
    <div style="padding:36px 40px 0">
      <p style="font-size:15px;line-height:1.8;font-weight:300;color:#4a4438;margin:0;white-space:pre-line">${t.signoff}</p>
    </div>

    <!-- footer -->
    <div style="padding:44px 40px 48px;margin-top:32px;text-align:center;border-top:1px solid #ece4d2">
      <p style="font-size:13px;font-weight:300;color:#2a2620;margin:0 0 4px">mind the moment.</p>
      <p style="font-size:13px;font-weight:300;color:#CF4B2C;margin:0 0 24px">max the love.</p>
      <a href="${unsubUrl}" style="font-size:11px;letter-spacing:0.1em;color:#b9ad95;text-decoration:underline">${t.unsub}</a>
    </div>
  </div>
  </body></html>`
}

async function sendNewsletter(): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const resendKey = process.env.RESEND_API_KEY

  if (!supabaseUrl || !supabaseKey || !resendKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const subsRes = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscribers?status=eq.active&select=email,locale`,
    { headers: headers(supabaseKey) }
  )
  if (!subsRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
  const subscribers: { email: string; locale: string | null }[] = await subsRes.json()
  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No active subscribers' })
  }

  const now = new Date()
  const month = now.toLocaleString('en', { month: 'long' })
  const edition = 'edition 01'
  const resend = new Resend(resendKey)
  let sent = 0
  const errors: string[] = []

  for (const { email, locale } of subscribers) {
    const isDE = locale === 'de'
    const subject = isDE ? `∧ peakplant — der monatsbrief` : `∧ peakplant — the monthly`
    try {
      await resend.emails.send({
        from: 'alicia@peak-plant.com',
        to: email,
        subject,
        html: buildHtml(email, isDE),
      })
      sent++
    } catch (err) {
      errors.push(email)
      console.error('[Newsletter] Failed to send to', email, err)
    }
  }

  await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/newsletter_sends`, {
    method: 'POST',
    headers: { ...headers(supabaseKey), Prefer: 'return=minimal' },
    body: JSON.stringify({ subject: `∧ peakplant — ${month}`, recipient_count: sent, edition }),
  })

  return NextResponse.json({ sent, errors: errors.length > 0 ? errors : undefined })
}

function isAuthorized(req: Request): boolean {
  // Vercel cron sends `Authorization: Bearer $CRON_SECRET`; manual triggers may
  // use NEWSLETTER_SECRET. Accept either so the cron works even when both are set.
  const auth = req.headers.get('authorization') ?? ''
  const accepted = [process.env.CRON_SECRET, process.env.NEWSLETTER_SECRET].filter(Boolean)
  return accepted.some(s => auth === `Bearer ${s}`)
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return sendNewsletter()
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return sendNewsletter()
}
