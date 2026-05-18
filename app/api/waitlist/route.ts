import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const CONFIRMATION = `∧ peakplant

thank you for being here.
we'll reach out when edition 01 drops in august 2026.
until then — slow down a little.

safe. soft. wild.
∧ peakplant`

function supabaseHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    'Prefer': 'return=minimal',
  }
}

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const sanitized = email.trim().toLowerCase()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
        method: 'POST',
        headers: supabaseHeaders(),
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
        console.error('[Waitlist] Supabase error:', res.status, await res.text())
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
    } else {
      console.log(`[PeakPlant Waitlist] ${new Date().toISOString()} — ${sanitized}`)
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
    console.error('[Waitlist] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
