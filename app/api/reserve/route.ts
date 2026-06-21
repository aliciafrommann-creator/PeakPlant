import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com'
const ADMIN_EMAIL = process.env.OWNER_EMAIL ?? 'hello@peak-plant.com'

function editionLabel(product: string) {
  if (product === 'pack_3')   return '3er pack'
  if (product === 'founders') return '6er pack — founders edition'
  if (product === 'pack_12')  return '12er pack'
  return product
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, product = 'founders' } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'valid email required' }, { status: 400 })
    }

    const sanitized = email.trim().toLowerCase()
    const { nanoid } = await import('nanoid')
    const accessToken = nanoid(40)

    const insert = await fetch(`${SUP_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUP_KEY,
        'Authorization': `Bearer ${SUP_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email:          sanitized,
        product,
        edition_slug:   'edition-01',
        shipping_name:  name ?? null,
        amount_total_cents: 799,
        currency:       'eur',
        payment_status: 'invoice',
        status:         'pending',
        access_token:   accessToken,
      }),
    })

    if (!insert.ok && insert.status !== 409) {
      const body = await insert.text()
      console.error('[Reserve] Supabase error:', insert.status, body)
      return NextResponse.json({ error: 'server error' }, { status: 500 })
    }

    const accessLink = `${SITE}/01?token=${accessToken}`
    const edition    = editionLabel(product)

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await Promise.all([
        resend.emails.send({
          from: 'peakplant <hello@peak-plant.com>',
          to: sanitized,
          subject: 'your spot is reserved — pay whenever you\'re ready.',
          html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;color:#1A1A1A">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;margin-bottom:40px">∧ peakplant</p>
  <h1 style="font-size:28px;font-weight:200;letter-spacing:-0.03em;line-height:1.2;margin-bottom:24px">your spot is reserved.</h1>
  <p style="font-size:15px;line-height:1.8;color:#555;font-weight:300;margin-bottom:28px">
    no payment needed yet. <strong style="color:#1A1A1A;font-weight:400">${edition}</strong> ships mid-august 2026.
    we'll send you an invoice you can settle anytime before then — or pay now if you'd like to lock it in.
  </p>
  <div style="border:1px solid #e8e8e8;padding:24px;margin-bottom:28px">
    <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4;margin-bottom:12px">your card · one of ten</p>
    <p style="font-size:14px;line-height:1.7;font-weight:300;color:#555">
      inside your box: one question card — the first of ten in edition 01. collect the set over the three months it runs.
      and somewhere across the edition, twenty boxes hide a special card — a free workshop, a little goodie,
      or your next box on us.
    </p>
  </div>
  <div style="background:#faf9f7;border:1px solid #e8e8e8;padding:24px;margin-bottom:28px">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4;margin-bottom:12px">a sneak peek, just for you</p>
    <p style="font-size:14px;line-height:1.7;font-weight:300;color:#555;margin-bottom:20px">
      you're part of this from the start. step into the digital world of edition 01, early.
    </p>
    <a href="${accessLink}" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;background:#1A1A1A;color:#fff;text-decoration:none">enter the digital world →</a>
  </div>
  <p style="font-size:13px;line-height:1.7;color:#777;font-weight:300;margin-bottom:28px">
    want to pay now and support the first production run?
    <a href="${SITE}/shop" style="color:#1A1A1A">do it here →</a>
  </p>
  <p style="font-size:12px;line-height:1.8;opacity:0.35;font-weight:300">safe. soft. wild.<br>∧ peakplant</p>
</div>`,
        }),
        resend.emails.send({
          from: 'peakplant <hello@peak-plant.com>',
          to: ADMIN_EMAIL,
          subject: `reservierung (auf rechnung) — ${edition} · ${sanitized}`,
          html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;color:#1A1A1A">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;margin-bottom:24px">∧ peakplant — neue reservierung</p>
  <table style="width:100%;font-size:14px;font-weight:300;border-collapse:collapse">
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5;width:140px">produkt</td><td style="padding:10px 0">${edition}</td></tr>
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5">zahlung</td><td style="padding:10px 0;color:#C9A96E">auf rechnung (offen)</td></tr>
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5">name</td><td style="padding:10px 0">${name ?? '—'}</td></tr>
    <tr><td style="padding:10px 0;opacity:0.5">email</td><td style="padding:10px 0">${sanitized}</td></tr>
  </table>
  <div style="margin-top:24px"><a href="${SITE}/admin" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:12px 24px;background:#1A1A1A;color:#fff;text-decoration:none">admin-panel öffnen →</a></div>
</div>`,
        }),
      ])
    }

    return NextResponse.json({ reserved: true })
  } catch (err: any) {
    console.error('[Reserve] Error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
