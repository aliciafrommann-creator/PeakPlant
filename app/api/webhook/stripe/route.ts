import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakplant.com'
const ADMIN_EMAIL = process.env.OWNER_EMAIL ?? 'hello@peakplant.com'

async function supabase(path: string, method: string, body?: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res
}

function editionLabel(product: string) {
  if (product === 'founders') return 'founders edition'
  if (product === 'subscription') return 'the ritual — monthly subscription'
  return product
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[Webhook] Signature error:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email   = session.customer_email ?? session.customer_details?.email ?? ''
    const product = session.metadata?.product ?? 'founders'
    const shipping = session.shipping_details
    const amount  = session.amount_total ? (session.amount_total / 100).toFixed(2) : '—'
    const currency = (session.currency ?? 'eur').toUpperCase()

    const { nanoid } = await import('nanoid')
    const accessToken = nanoid(40)

    const orderPayload = {
      stripe_session_id:       session.id,
      stripe_payment_intent:   typeof session.payment_intent === 'string' ? session.payment_intent : null,
      stripe_subscription_id:  typeof session.subscription === 'string' ? session.subscription : null,
      email,
      product,
      edition_slug:            'edition-01',
      shipping_name:           shipping?.name ?? null,
      shipping_address_line1:  shipping?.address?.line1 ?? null,
      shipping_address_line2:  shipping?.address?.line2 ?? null,
      shipping_city:           shipping?.address?.city ?? null,
      shipping_postal_code:    shipping?.address?.postal_code ?? null,
      shipping_country:        shipping?.address?.country ?? null,
      amount_total_cents:      session.amount_total ?? null,
      currency:                session.currency ?? 'eur',
      access_token:            accessToken,
      status:                  'pending',
    }

    await supabase('/orders', 'POST', orderPayload)

    const accessLink = `${SITE}/01?token=${accessToken}`
    const edition    = editionLabel(product)

    const resend = new Resend(process.env.RESEND_API_KEY)
    await Promise.all([
      // ── Kundenbestätigung ────────────────────────────────────────────
      email && resend.emails.send({
        from: 'peakplant <hello@peakplant.com>',
        to: email,
        subject: 'your preorder is confirmed — and your sneak peek is inside.',
        html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;color:#1A1A1A">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;margin-bottom:40px">∧ peakplant</p>

  <h1 style="font-size:28px;font-weight:200;letter-spacing:-0.03em;line-height:1.2;margin-bottom:24px">
    your preorder is confirmed.
  </h1>

  <p style="font-size:15px;line-height:1.8;color:#555;font-weight:300;margin-bottom:32px">
    thank you — we're glad you're here.<br>
    <strong style="color:#1A1A1A;font-weight:400">${edition}</strong> ships mid-august 2026.
    we collect preorders through the year so we can produce to the highest
    sustainability standard — and you're <strong style="color:#1A1A1A;font-weight:400">fully refundable anytime</strong> until it ships.
  </p>

  <div style="border:1px solid #e8e8e8;padding:24px;margin-bottom:32px">
    <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4;margin-bottom:16px">order summary</p>
    <table style="width:100%;font-size:14px;font-weight:300">
      <tr><td style="padding:6px 0;opacity:0.5">product</td><td style="text-align:right">${edition}</td></tr>
      <tr><td style="padding:6px 0;opacity:0.5">amount</td><td style="text-align:right">${amount} ${currency}</td></tr>
      ${shipping?.name ? `<tr><td style="padding:6px 0;opacity:0.5;vertical-align:top">ships to</td><td style="text-align:right">${shipping.name}<br>${shipping.address?.line1 ?? ''}<br>${shipping.address?.postal_code ?? ''} ${shipping.address?.city ?? ''}</td></tr>` : ''}
    </table>
  </div>

  <div style="background:#faf9f7;border:1px solid #e8e8e8;padding:24px;margin-bottom:40px">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4;margin-bottom:12px">a sneak peek, just for you</p>
    <p style="font-size:14px;line-height:1.7;font-weight:300;color:#555;margin-bottom:20px">
      while you wait, step into the digital world of edition 01 — early.
      it's our thank you for believing in this before it ships. save this link, it's yours.
    </p>
    <a href="${accessLink}" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;background:#1A1A1A;color:#fff;text-decoration:none">
      enter the digital world →
    </a>
  </div>

  <p style="font-size:12px;line-height:1.8;opacity:0.35;font-weight:300">
    safe. soft. wild.<br>
    ∧ peakplant
  </p>
</div>`,
      }),

      // ── Admin-Benachrichtigung ───────────────────────────────────────
      resend.emails.send({
        from: 'peakplant <hello@peakplant.com>',
        to: ADMIN_EMAIL,
        subject: `neue bestellung — ${edition} · ${email}`,
        html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;color:#1A1A1A">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;margin-bottom:24px">∧ peakplant — neue bestellung</p>

  <table style="width:100%;font-size:14px;font-weight:300;border-collapse:collapse">
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5;width:140px">produkt</td><td style="padding:10px 0">${edition}</td></tr>
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5">betrag</td><td style="padding:10px 0;color:#16a34a;font-weight:500">${amount} ${currency}</td></tr>
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5">kunde</td><td style="padding:10px 0">${email}</td></tr>
    ${shipping?.name ? `
    <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;opacity:0.5;vertical-align:top">lieferadresse</td><td style="padding:10px 0;line-height:1.7">${shipping.name}<br>${shipping.address?.line1 ?? ''}${shipping.address?.line2 ? '<br>' + shipping.address.line2 : ''}<br>${shipping.address?.postal_code ?? ''} ${shipping.address?.city ?? ''}<br>${shipping.address?.country ?? ''}</td></tr>
    ` : ''}
    <tr><td style="padding:10px 0;opacity:0.5">zeitpunkt</td><td style="padding:10px 0">${new Date().toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}</td></tr>
  </table>

  <div style="margin-top:24px">
    <a href="${SITE}/admin" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:12px 24px;background:#1A1A1A;color:#fff;text-decoration:none">
      admin-panel öffnen →
    </a>
  </div>
</div>`,
      }),
    ])
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase(`/orders?stripe_subscription_id=eq.${sub.id}`, 'PATCH', { status: 'cancelled' })
  }

  return NextResponse.json({ received: true })
}
