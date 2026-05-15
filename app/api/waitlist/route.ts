import { NextResponse } from 'next/server'

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
      const res = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ email: sanitized, source: source ?? 'homepage' }),
      })
      if (!res.ok && res.status !== 409) {
        console.error('[Waitlist] Supabase error:', res.status, await res.text())
      }
    } else {
      console.log(`[PeakPlant Waitlist] ${new Date().toISOString()} — ${sanitized}`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Waitlist] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
