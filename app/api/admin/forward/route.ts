import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function formatAddress(o: any) {
  return [o.shipping_name, o.shipping_address_line1, o.shipping_address_line2, `${o.shipping_postal_code ?? ''} ${o.shipping_city ?? ''}`.trim(), o.shipping_country].filter(Boolean).join('\n')
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const res = await fetch(`${SUP_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, {
    headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` },
  })
  const rows = await res.json()
  const order = rows?.[0]

  if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 })

  const supplierEmail = process.env.SUPPLIER_EMAIL
  if (!supplierEmail) return NextResponse.json({ error: 'SUPPLIER_EMAIL not configured' }, { status: 500 })

  const address = formatAddress(order)
  const orderDate = new Date(order.created_at).toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna' })

  // condom quantity by product (founders = 6, subscription tiers = 6/9/12)
  const QTY: Record<string, number> = { founders: 6, sub_6: 6, sub_9: 9, sub_12: 12 }
  const qty = QTY[order.product] ?? 6
  const productLabel = order.product === 'founders'
    ? 'Founders Edition (1×)'
    : `Abo-Lieferung — ${qty} Stück`

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'peakplant <hello@peakplant.com>',
    to: supplierEmail,
    subject: `Versandauftrag #${order.id.slice(0, 8).toUpperCase()} — peakplant`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;color:#1A1A1A;border:1px solid #e0e0e0">
  <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Versandauftrag</h2>
  <p style="font-size:13px;color:#666;margin-bottom:28px">peakplant · ${orderDate}</p>

  <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:28px">
    <tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 0;color:#888;width:160px">Bestellnummer</td>
      <td style="padding:10px 0;font-weight:600;font-family:monospace">#${order.id.slice(0, 8).toUpperCase()}</td>
    </tr>
    <tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 0;color:#888">Produkt</td>
      <td style="padding:10px 0">${productLabel}</td>
    </tr>
    <tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 0;color:#888">Inhalt</td>
      <td style="padding:10px 0;line-height:1.6">${qty} Kondome (vegan, fair rubber latex)<br>1 Fragenkarte (1 Frage, Blauer Engel)<br>QR-Code zur digitalen Welt</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#888;vertical-align:top">Lieferadresse</td>
      <td style="padding:10px 0;line-height:1.8;white-space:pre-line">${address}</td>
    </tr>
  </table>

  <div style="background:#f9f9f9;padding:16px;font-size:12px;color:#888;line-height:1.6">
    Bitte den Versand zeitnah veranlassen und die Tracking-Nummer an hello@peakplant.com zurückmelden.<br>
    Bestelldatum: ${orderDate}
  </div>
</div>`,
  })

  await fetch(`${SUP_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUP_KEY,
      'Authorization': `Bearer ${SUP_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ status: 'forwarded', supplier_forwarded_at: new Date().toISOString() }),
  })

  return NextResponse.json({ ok: true })
}
