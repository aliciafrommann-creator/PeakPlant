import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ count: 0 })
  try {
    const res = await fetch(`${url}/rest/v1/subscribers?select=id&status=eq.active`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'count=exact',
        'Range': '0-0',
      },
    })
    const header = res.headers.get('content-range') ?? ''
    const total = parseInt(header.split('/')[1] ?? '0') || 0
    return NextResponse.json({ count: total })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
