import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUP_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SITE      = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakplant.com'

export async function POST(req: NextRequest) {
  try {
    const { email, edition = 'edition-01' } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'valid email required' }, { status: 400 })
    }

    const sanitized = email.trim().toLowerCase()

    const res = await fetch(
      `${SUP_URL}/rest/v1/orders?email=eq.${encodeURIComponent(sanitized)}&edition_slug=eq.${edition}&select=access_token,status`,
      {
        headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` },
      }
    )

    const orders = await res.json()
    const order  = Array.isArray(orders) && orders.length > 0 ? orders[0] : null

    if (!order) {
      return NextResponse.json({ sent: false, reason: 'not_found' })
    }

    const accessLink = `${SITE}/01?token=${order.access_token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'peakplant <hello@peakplant.com>',
      to: sanitized,
      subject: 'your access link.',
      html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#fff;color:#1A1A1A">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;margin-bottom:32px">∧ peakplant</p>
  <h2 style="font-size:22px;font-weight:200;letter-spacing:-0.02em;margin-bottom:16px">here's your link.</h2>
  <p style="font-size:14px;line-height:1.8;color:#555;font-weight:300;margin-bottom:28px">
    click below to access the digital world for edition 01.
    the link sets a session — you won't need to do this again on this device.
  </p>
  <a href="${accessLink}" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;background:#1A1A1A;color:#fff;text-decoration:none">
    enter the digital world →
  </a>
  <p style="margin-top:32px;font-size:11px;opacity:0.35;font-weight:300;line-height:1.6">
    safe. soft. wild.<br>∧ peakplant
  </p>
</div>`,
    })

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error('[AccessLink] Error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
