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
  if (!url || !key) return NextResponse.json({ questions: [] })
  try {
    const res = await fetch(`${url}/rest/v1/community_questions?select=text,created_at&order=created_at.desc&limit=60`, { headers: headers(key) })
    if (!res.ok) return NextResponse.json({ questions: [] })
    return NextResponse.json({ questions: await res.json() })
  } catch {
    return NextResponse.json({ questions: [] })
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) return NextResponse.json({ ok: true })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ ok: true })

  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') return NextResponse.json({ ok: true })
    const t = text.trim()
    if (t.length < 3 || t.length > 200) return NextResponse.json({ ok: true })
    await fetch(`${url}/rest/v1/community_questions`, {
      method: 'POST',
      headers: { ...headers(key), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ text: t }),
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
