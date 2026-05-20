import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const CONFIRMATION_EN = `∧ peakplant

thank you for being here.
we'll reach out when edition 01 drops in august 2026.
until then — slow down a little.

safe. soft. wild.
∧ peakplant`

const CONFIRMATION_DE = `∧ peakplant

danke, dass du dabei bist.
wir melden uns, wenn edition 01 im august 2026 startet.
bis dahin — nimm dir ein bisschen zeit.

safe. soft. wild.
∧ peakplant`

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
    const { email, source, locale } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
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
        await resend.emails.send({
          from: 'hello@peak-plant.com',
          to: sanitized,
          subject: isDE ? 'du bist dabei.' : "you're in.",
          text: isDE ? CONFIRMATION_DE : CONFIRMATION_EN,
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
