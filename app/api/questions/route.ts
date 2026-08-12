import { NextResponse } from 'next/server'

const rateMap = new Map<string, number>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const last = rateMap.get(ip) ?? 0
  if (now - last < 60 * 60 * 1000) return true
  rateMap.set(ip, now)
  return false
}

function headers(key: string) {
  return { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // An empty list is a real answer ("nobody has asked anything yet"), so it
  // stays the response shape — but every reason it can be empty by accident is
  // logged, otherwise a broken fetch is invisible in the Vercel logs.
  if (!url || !key) {
    console.error('[Questions] GET: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing')
    return NextResponse.json({ questions: [] })
  }
  try {
    const res = await fetch(`${url}/rest/v1/community_questions?select=text,created_at&order=created_at.desc&limit=60`, { headers: headers(key) })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[Questions] GET failed:', res.status, detail.slice(0, 300))
      return NextResponse.json({ questions: [] })
    }
    return NextResponse.json({ questions: await res.json() })
  } catch (err) {
    console.error('[Questions] GET threw:', err)
    return NextResponse.json({ questions: [] })
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  // Deliberate: the rate limit answers honestly (ok: false) instead of pretending
  // the question was stored. One question per IP per hour is the spam guard.
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('[Questions] POST: Supabase URL or key missing — question not stored')
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 })
  }

  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ ok: false, reason: 'text_required' }, { status: 400 })
    }
    const t = text.trim()
    if (t.length < 3 || t.length > 200) {
      return NextResponse.json({ ok: false, reason: 'length' }, { status: 400 })
    }

    const res = await fetch(`${url}/rest/v1/community_questions`, {
      method: 'POST',
      headers: { ...headers(key), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ text: t }),
    })

    // Without this the insert could fail and the answer would still be ok: true —
    // the question vanished while the page showed it standing there.
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[Questions] insert failed:', res.status, detail.slice(0, 300))
      return NextResponse.json({ ok: false, reason: 'store_failed' }, { status: 502 })
    }
  } catch (err) {
    console.error('[Questions] POST threw:', err)
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
