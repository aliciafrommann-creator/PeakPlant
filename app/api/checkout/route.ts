import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakplant.com'

const PRICES: Record<string, { mode: 'payment' | 'subscription'; priceId: string }> = {
  founders: {
    mode: 'payment',
    priceId: process.env.STRIPE_PRICE_FOUNDERS!,
  },
  subscription: {
    mode: 'subscription',
    priceId: process.env.STRIPE_PRICE_SUB_MONTHLY!,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { product } = await req.json()

    const plan = PRICES[product]
    if (!plan) {
      return NextResponse.json({ error: 'Unknown product' }, { status: 400 })
    }

    const baseParams: Stripe.Checkout.SessionCreateParams = {
      mode: plan.mode,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      shipping_address_collection: {
        allowed_countries: ['AT', 'DE', 'CH', 'LU', 'BE', 'NL'],
      },
      phone_number_collection: { enabled: false },
      billing_address_collection: 'auto',
      success_url: `${SITE}/bestellen/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/shop`,
      metadata: { product },
    }

    if (plan.mode === 'subscription' && process.env.STRIPE_PRICE_SUB_SETUP) {
      baseParams.line_items = [
        { price: process.env.STRIPE_PRICE_SUB_SETUP, quantity: 1 },
        { price: plan.priceId, quantity: 1 },
      ]
    }

    const session = await stripe.checkout.sessions.create(baseParams)
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
