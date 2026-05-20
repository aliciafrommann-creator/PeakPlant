import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com').replace(/\/$/, '')

    if (!token || token.length < 32) {
      return NextResponse.redirect(`${siteUrl}/?newsletter=invalid`)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${siteUrl}/?newsletter=error`)
    }

    const res = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/newsletter_subscribers?confirmation_token=eq.${encodeURIComponent(token)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }),
      }
    )

    if (!res.ok) {
      console.error('[Newsletter/unsubscribe] Supabase error:', res.status, await res.text())
      return NextResponse.redirect(`${siteUrl}/?newsletter=error`)
    }

    return NextResponse.redirect(`${siteUrl}/?newsletter=unsubscribed`)
  } catch (err) {
    console.error('[Newsletter/unsubscribe] Uncaught error:', err)
    return NextResponse.redirect(`${(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com')}/?newsletter=error`)
  }
}
