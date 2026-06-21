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

  const orders = await res.json()
  return NextResponse.json({ orders })
}
