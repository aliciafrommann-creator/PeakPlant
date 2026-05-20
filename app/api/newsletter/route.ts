import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function supabaseHeaders(key: string) {
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=representation',
  }
}

export async function POST(req: Request) {
  try {
    const { email, locale } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const sanitized = email.trim().toLowerCase()
    const isDE = locale === 'de'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    // Upsert: if pending/unsubscribed, reset token and resend confirmation
    const existing = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(sanitized)}&select=status`,
      { headers: supabaseHeaders(supabaseKey) }
    )
    const rows = await existing.json()

    if (rows?.length > 0 && rows[0].status === 'confirmed') {
      return NextResponse.json({ duplicate: true })
    }

    // Insert or update
    const upsertRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders(supabaseKey),
        'Prefer': 'return=representation,resolution=merge-duplicates',
      },
      body: JSON.stringify({
        email: sanitized,
        status: 'pending',
        confirmation_token: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
        source: 'website',
      }),
    })

    if (!upsertRes.ok) {
      const body = await upsertRes.text()
      console.error('[Newsletter] Supabase error:', upsertRes.status, body)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    const [row] = await upsertRes.json()
    const token = row?.confirmation_token
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com').replace(/\/$/, '')
    const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`
    const unsubUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${token}`

    if (process.env.RESEND_API_KEY && token) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'hello@peak-plant.com',
          to: sanitized,
          subject: isDE ? 'bitte bestätige deine anmeldung.' : 'please confirm your subscription.',
          text: isDE
            ? `∧ peakplant\n\nbitte bestätige deine anmeldung:\n${confirmUrl}\n\nwenn du dich nicht angemeldet hast, kannst du diese e-mail ignorieren.\n\nsafe. soft. wild.\n∧ peakplant\n\nabmelden: ${unsubUrl}`
            : `∧ peakplant\n\nplease confirm your subscription:\n${confirmUrl}\n\nif you didn't sign up, you can ignore this email.\n\nsafe. soft. wild.\n∧ peakplant\n\nunsubscribe: ${unsubUrl}`,
        })
      } catch (err) {
        console.error('[Newsletter] Resend error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Newsletter] Uncaught error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
