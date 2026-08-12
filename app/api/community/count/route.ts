import { NextResponse } from 'next/server'

/**
 * How many people are on the list. `count: null` means "not known right now" —
 * a measured zero and a broken connection must not look the same, or the page
 * would state a number it never got (MANIFESTO §1).
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('[Community/count] Supabase URL or key missing')
    return NextResponse.json({ count: null })
  }
  try {
    const res = await fetch(`${url}/rest/v1/subscribers?select=id`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'count=exact',
        'Range': '0-0',
      },
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[Community/count] request failed:', res.status, detail.slice(0, 300))
      return NextResponse.json({ count: null })
    }
    // On an error response the content-range header is absent — parseInt would
    // turn that into a confident 0.
    const header = res.headers.get('content-range') ?? ''
    const total = Number.parseInt(header.split('/')[1] ?? '', 10)
    if (!Number.isFinite(total)) {
      console.error('[Community/count] no usable content-range header:', header)
      return NextResponse.json({ count: null })
    }
    return NextResponse.json({ count: total })
  } catch (err) {
    console.error('[Community/count] threw:', err)
    return NextResponse.json({ count: null })
  }
}
