import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const COOKIE  = 'pp_access'
const EDITION = 'edition-01'

async function findByToken(token: string) {
  const res = await fetch(
    `${SUP_URL}/rest/v1/orders?access_token=eq.${encodeURIComponent(token)}&select=access_token,status&limit=1`,
    { headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` } }
  )
  const rows = await res.json()
  return Array.isArray(rows) && rows[0] ? rows[0] : null
}

async function findByEmail(email: string) {
  const res = await fetch(
    `${SUP_URL}/rest/v1/orders?email=eq.${encodeURIComponent(email)}&edition_slug=eq.${EDITION}&select=access_token,status&limit=1`,
    { headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` } }
  )
  const rows = await res.json()
  return Array.isArray(rows) && rows[0] ? rows[0] : null
}

function setCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

// GET — checks existing cookie
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value
  if (!token) return NextResponse.json({ valid: false })
  const order = await findByToken(token)
  return NextResponse.json({ valid: !!order && order.status !== 'cancelled' })
}

// POST — verify by token or email, set cookie on success
export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json()

    let order = null
    if (token) order = await findByToken(token)
    else if (email && email.includes('@')) order = await findByEmail(email.trim().toLowerCase())

    if (!order || order.status === 'cancelled') {
      return NextResponse.json({ valid: false, reason: token ? 'invalid_token' : 'not_found' })
    }

    const res = NextResponse.json({ valid: true })
    setCookie(res, order.access_token)
    return res
  } catch {
    return NextResponse.json({ valid: false, reason: 'error' }, { status: 500 })
  }
}
