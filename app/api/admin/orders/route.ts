import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const res = await fetch(
    `${SUP_URL}/rest/v1/orders?select=*&order=created_at.desc`,
    { headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` } }
  )

  // A PostgREST error is a JSON object, not an array. Passing it through made
  // the panel show a calm, empty order list — indistinguishable from "no orders
  // yet" at exactly the moment the difference matters.
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[Admin/orders] load failed:', res.status, detail.slice(0, 300))
    return NextResponse.json(
      { error: `Bestellungen konnten nicht geladen werden (${res.status})` },
      { status: 500 },
    )
  }

  const orders = await res.json()
  if (!Array.isArray(orders)) {
    console.error('[Admin/orders] unexpected response shape:', JSON.stringify(orders).slice(0, 300))
    return NextResponse.json({ error: 'Unerwartete Antwort der Datenbank' }, { status: 500 })
  }

  return NextResponse.json({ orders })
}
