import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendMail } from '../../../../lib/email'
import { PRODUCT_COPY, type ProductKey } from '../../../../lib/products'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com'
const ADMIN_EMAIL = process.env.OWNER_EMAIL ?? 'hello@peak-plant.com'

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

// One source for product names (lib/products.ts) so mail, admin and shop
// cannot drift apart. Unknown keys fall back to the raw value rather than
// claiming something wrong.
function editionLabel(product: string) {
  return PRODUCT_COPY[product as ProductKey]?.en ?? product
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
      payment_status:          'paid',
      access_token:            accessToken,
      status:                  'pending',
    }

    // The order has to exist before anything claims it does. If the insert
    // fails (RLS, wrong service key, Supabase briefly away) we answer 500 so
    // Stripe retries the webhook — answering 200 here would mean a paid order
    // that lives in no database, with a confirmation mail already sent.
    const insert = await supabase('/orders', 'POST', orderPayload)
    if (!insert.ok) {
      const detail = await insert.text().catch(() => '')
      console.error('[Webhook] order insert failed:', insert.status, detail.slice(0, 500), '— session', session.id)
      return NextResponse.json({ error: 'order could not be stored' }, { status: 500 })
    }

    // /edition-01 is a public page, not a gate — the old "/01?token=…" link
    // implied an unlock mechanic that never existed. The token stays on the
    // order row in case a real gate is ever built.
    const accessLink = `${SITE}/edition-01`
    const edition    = editionLabel(product)

    if (!email) {
      // No address on the session — the customer confirmation cannot go out at
      // all. Logged as its own case so it is not mistaken for a send failure.
      console.error('[Webhook] no customer email on session', session.id, '— confirmation not sent')
    }

    const [customerMail, adminMail] = await Promise.all([
      // ── Kundenbestätigung ────────────────────────────────────────────
      email ? sendMail({
        to: email,
        subject: 'your preorder is confirmed.',
        html: `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;color:#1A1A1A">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.4;margin-bottom:40px">∧ peakplant</p>

  <h1 style="font-size:28px;font-weight:200;letter-spacing:-0.03em;line-height:1.2;margin-bottom:24px">
    your preorder is confirmed.
  </h1>

  <p style="font-size:15px;line-height:1.8;color:#555;font-weight:300;margin-bottom:32px">
    thank you — we're glad you're here.<br>
    <strong style="color:#1A1A1A;font-weight:400">${edition}</strong> ships october 2026.
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

  <div style="border:1px solid #e8e8e8;padding:24px;margin-bottom:32px">
    <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4;margin-bottom:12px">your deck · twenty cards</p>
    <p style="font-size:14px;line-height:1.7;font-weight:300;color:#555">
      inside: one deck — twenty moment cards, split into grow dates, small acts and growing questions.
      and across the edition, twenty decks carry a special card — a free workshop, a little goodie,
      or your next deck on us. you'll know the moment you draw it.
    </p>
  </div>

  <div style="background:#faf9f7;border:1px solid #e8e8e8;padding:24px;margin-bottom:40px">
    <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4;margin-bottom:12px">the digital world</p>
    <p style="font-size:14px;line-height:1.7;font-weight:300;color:#555;margin-bottom:20px">
      while you wait, the digital world of edition 01 is already open — a letter from alicia,
      a question for the two of you, and a playlist. it grows until the box ships.
    </p>
    <a href="${accessLink}" style="display:inline-block;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;background:#1A1A1A;color:#fff;text-decoration:none">
      enter the digital world →
    </a>
  </div>

  <p style="font-size:12px;line-height:1.8;opacity:0.35;font-weight:300">
    mind the moment. max the love.<br>
    ∧ peakplant
  </p>
</div>`,
      }) : null,

      // ── Admin-Benachrichtigung ───────────────────────────────────────
      sendMail({
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

    // sendMail never throws — it returns { sent, provider, error }. Without
    // reading that, a mail the provider refused counts as delivered.
    if (customerMail && !customerMail.sent) {
      console.error('[Webhook] confirmation mail not sent to', email, '—', customerMail.error)
    }
    if (!adminMail.sent) {
      console.error('[Webhook] admin notification not sent —', adminMail.error)
    }

    // The order is stored, so the webhook is done from Stripe's side. A failed
    // mail must not trigger a retry (that would insert the order twice), but it
    // is reported in the response body instead of being swallowed.
    return NextResponse.json({
      received: true,
      customerMailed: email ? customerMail?.sent === true : false,
      adminMailed: adminMail.sent,
    })
  }

  return NextResponse.json({ received: true })
}
