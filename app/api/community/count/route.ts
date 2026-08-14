import { NextResponse } from 'next/server'

// Without this, Next prerenders the route at build time and the "count" would
// be frozen at whatever the build saw — a stated number nobody measured.
export const dynamic = 'force-dynamic'

/**
 * How many people are on the list. `count: null` means "not known right now" —
 * a measured zero and a broken connection must not look the same, or the page
 * would state a number it never got (MANIFESTO §1).
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Service role only: `subscribers` has no anon SELECT policy, so with the
  // anon fallback this returned a confident-looking null forever. A missing
  // key is the same honest null, but with a log line that names the cause.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('[Community/count] Supabase URL or SUPABASE_SERVICE_ROLE_KEY missing')
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
