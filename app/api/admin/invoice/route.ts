import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isAdmin } from '../../../../lib/adminAuth'
import { PRODUCT_COPY, type ProductKey } from '../../../../lib/products'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const SUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  // ── fetch the order ────────────────────────────────────────────────
  const res = await fetch(`${SUP_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, {
    headers: { 'apikey': SUP_KEY, 'Authorization': `Bearer ${SUP_KEY}` },
  })
  // A failed lookup is not an absent order: without this check a database or
  // auth error would be reported as "order not found".
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[Invoice] order lookup failed:', res.status, detail.slice(0, 300))
    return NextResponse.json({ error: `Bestellung konnte nicht geladen werden (${res.status})` }, { status: 500 })
  }

  const rows = await res.json()
  const order = Array.isArray(rows) ? rows[0] : undefined

  if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 })
  if (!order.email) return NextResponse.json({ error: 'order has no email' }, { status: 400 })
  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'order is already paid' }, { status: 400 })
  }

  // No invented amount: the old fallback (799 cents) came from the condom era
  // and would have invoiced a real customer the wrong price. If the order has
  // no amount, that is a data problem to fix — not a number to guess.
  const amount = order.amount_total_cents
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json(
      { error: 'order has no amount — set amount_total_cents before invoicing' },
      { status: 400 }
    )
  }
  const currency = (order.currency ?? 'eur').toLowerCase()
  const editionLabel = PRODUCT_COPY[order.product as ProductKey]?.de ?? 'peakplant edition 01'

  try {
    // ── already invoiced? hand back the existing one ─────────────────
    // The only guard used to be payment_status === 'paid', which does not help
    // while an invoice is still open: a second click sent the customer a second
    // real invoice. If one exists, return its link instead of creating another.
    if (order.stripe_invoice_id) {
      const existingInvoice = await stripe.invoices.retrieve(order.stripe_invoice_id)
      return NextResponse.json({
        ok: true,
        alreadySent: true,
        invoiceUrl: existingInvoice.hosted_invoice_url,
      })
    }

    // ── create or reuse a Stripe customer for this email ─────────────
    const existing = await stripe.customers.list({ email: order.email, limit: 1 })
    const customer = existing.data[0] ?? await stripe.customers.create({
      email: order.email,
      name: order.shipping_name ?? undefined,
      address: order.shipping_address_line1 ? {
        line1: order.shipping_address_line1,
        line2: order.shipping_address_line2 ?? undefined,
        city: order.shipping_city ?? undefined,
        postal_code: order.shipping_postal_code ?? undefined,
        country: order.shipping_country ?? undefined,
      } : undefined,
      metadata: { order_id: order.id },
    })

    // ── create the invoice (send_invoice → Stripe emails a hosted link) ─
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: 14,
      currency,
      description: 'peakplant edition 01 — preorder. ships october 2026. fully refundable until it ships.',
      metadata: { order_id: order.id, product: order.product ?? 'founders' },
    })

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount,
      currency,
      description: editionLabel,
    })

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
    await stripe.invoices.sendInvoice(finalized.id)

    // ── mark the order ───────────────────────────────────────────────
    const patch = await fetch(`${SUP_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUP_KEY,
        'Authorization': `Bearer ${SUP_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        stripe_invoice_id: finalized.id,
        invoice_sent_at: new Date().toISOString(),
      }),
    })

    // The invoice is out at Stripe either way — but if the note of it did not
    // reach the database, the duplicate guard above is blind on the next click.
    // Say so instead of reporting a clean success.
    if (!patch.ok) {
      const detail = await patch.text().catch(() => '')
      console.error('[Invoice] status patch failed for order', order.id, patch.status, detail.slice(0, 300))
      return NextResponse.json(
        {
          error: `Rechnung ${finalized.id} ist bei Stripe verschickt, konnte aber nicht an der Bestellung vermerkt werden. Bitte NICHT erneut senden.`,
          invoiceUrl: finalized.hosted_invoice_url,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, invoiceUrl: finalized.hosted_invoice_url })
  } catch (err: any) {
    console.error('[Invoice] Error:', err)
    return NextResponse.json({ error: err.message ?? 'invoice failed' }, { status: 500 })
  }
}
