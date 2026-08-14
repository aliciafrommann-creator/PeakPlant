import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '../../../../lib/email'
import { isAdmin } from '../../../../lib/adminAuth'
import { PRODUCT_COPY, type ProductKey } from '../../../../lib/products'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function formatAddress(o: any) {
  return [o.shipping_name, o.shipping_address_line1, o.shipping_address_line2, `${o.shipping_postal_code ?? ''} ${o.shipping_city ?? ''}`.trim(), o.shipping_country].filter(Boolean).join('\n')
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const res = await fetch(`${SUP_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, {
    headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` },
  })
  // Without this check a database or auth error would arrive as an object,
  // `rows?.[0]` would be undefined, and the answer would be a confident
  // "order not found" for an order that exists — sending the search the wrong way.
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[Forward] order lookup failed:', res.status, detail.slice(0, 300))
    return NextResponse.json({ error: `Bestellung konnte nicht geladen werden (${res.status})` }, { status: 500 })
  }

  const rows = await res.json()
  const order = Array.isArray(rows) ? rows[0] : undefined

  if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 })

  const supplierEmail = process.env.SUPPLIER_EMAIL
  if (!supplierEmail) return NextResponse.json({ error: 'SUPPLIER_EMAIL not configured' }, { status: 500 })

  const address = formatAddress(order)
  const orderDate = new Date(order.created_at).toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna' })

  // Deck count per product — pack_12 ("duo") ships two decks, the others one.
  // The sub_* keys are gone: there is no subscription product (the old
  // "Abo-Lieferung" label would have told the supplier to ship the wrong thing).
  const QTY: Record<string, number> = { founders: 1, pack_3: 1, pack_12: 2 }
  const qty = QTY[order.product] ?? 1
  const productLabel = `${PRODUCT_COPY[order.product as ProductKey]?.de ?? order.product} (${qty}×)`

  const mail = await sendMail({
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
      <td style="padding:10px 0;line-height:1.6">${qty} Kartenset(s) Edition 01 (Momentkarten: Dates, Acts, Questions)<br>${qty} Saatpapierkarte(n) (Sonnenblume)<br>QR-Codes zur PeakPlant App</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#888;vertical-align:top">Lieferadresse</td>
      <td style="padding:10px 0;line-height:1.8;white-space:pre-line">${address}</td>
    </tr>
  </table>

  <div style="background:#f9f9f9;padding:16px;font-size:12px;color:#888;line-height:1.6">
    Bitte den Versand zeitnah veranlassen und die Tracking-Nummer an hello@peak-plant.com zurückmelden.<br>
    Bestelldatum: ${orderDate}
  </div>
</div>`,
  })

  // Only a mail the provider accepted may turn into status "forwarded".
  // Otherwise the panel would show a shipping order the supplier never saw.
  if (!mail.sent) {
    console.error('[Forward] supplier mail not sent for order', order.id, '—', mail.error)
    return NextResponse.json(
      { error: `Mail an den Supplier ging nicht raus: ${mail.error ?? 'unbekannter Fehler'}. Status bleibt offen.` },
      { status: 500 },
    )
  }

  const patch = await fetch(`${SUP_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUP_KEY,
      'Authorization': `Bearer ${SUP_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ status: 'forwarded', supplier_forwarded_at: new Date().toISOString() }),
  })

  // Mail is out but the status could not be stored: say exactly that, so the
  // same order is not forwarded a second time on the next pass.
  if (!patch.ok) {
    const detail = await patch.text().catch(() => '')
    console.error('[Forward] status patch failed for order', order.id, patch.status, detail.slice(0, 300))
    return NextResponse.json(
      { error: 'Mail an den Supplier ist raus, aber der Status konnte nicht gespeichert werden. Bitte NICHT erneut weiterleiten.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
