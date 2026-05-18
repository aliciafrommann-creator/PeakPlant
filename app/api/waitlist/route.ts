import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const CONFIRMATION = `∧ peakplant

thank you for being here.
we'll reach out when edition 01 drops in august 2026.
until then — slow down a little.

safe. soft. wild.
∧ peakplant`

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const sanitized = email.trim().toLowerCase()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Log env var presence for debugging
    console.log('[Waitlist] env check — url:', !!supabaseUrl, 'key:', !!supabaseKey)

    if (supabaseUrl && supabaseKey) {
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/subscribers`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          email: sanitized,
          source: source ?? 'homepage',
          edition: 'edition_01',
        }),
      })

      if (res.status === 409) {
        return NextResponse.json({ duplicate: true })
      }

      if (!res.ok) {
        const body = await res.text()
        console.error(`[Waitlist] Supabase ${res.status}:`, body)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
    } else {
      console.warn('[Waitlist] Supabase env vars missing — logging only:', sanitized)
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'hello@peakplant.com',
          to: sanitized,
          subject: "you're in.",
          text: CONFIRMATION,
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
