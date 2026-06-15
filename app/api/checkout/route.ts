import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakplant.com'

const PRICES: Record<string, string> = {
  pack_3:   process.env.STRIPE_PRICE_PACK_3!,
  founders: process.env.STRIPE_PRICE_FOUNDERS!,
  pack_12:  process.env.STRIPE_PRICE_PACK_12!,
}

export async function POST(req: NextRequest) {
  try {
    const { product } = await req.json()

    const priceId = PRICES[product]
    if (!priceId) {
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      shipping_address_collection: {
        allowed_countries: ['AT', 'DE', 'CH', 'LU', 'BE', 'NL'],
      },
      phone_number_collection: { enabled: false },
      billing_address_collection: 'auto',
      success_url: `${SITE}/bestellen/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/shop`,
      metadata: { product },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
