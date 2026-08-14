import Stripe from 'stripe'

/**
 * Shop configuration — the single source of truth for what is purchasable.
 *
 * Two rules behind this file:
 *
 * 1. **The price comes from Stripe, never from our code.** A price typed into
 *    a React component drifts away from the price actually charged at some
 *    point, and then the site lies about money (MANIFESTO §1). We read the
 *    amount from the Stripe price the checkout will use, so both can never
 *    disagree.
 * 2. **No buy button without a working checkout.** A product counts as
 *    purchasable only when the secret key AND its price ID exist AND Stripe
 *    confirms the price. Otherwise the shop stays in waitlist mode — which is
 *    the honest state while printing and pricing are still open, and is
 *    exactly what the page did before.
 *
 * Product identities (keys, names, deck counts) live in `lib/products.ts` —
 * that file stays import-free so client components can use it; this one adds
 * the server-only Stripe half.
 */

import { PRODUCT_KEYS, type ProductKey } from './products'

export { PRODUCT_KEYS, PRODUCT_COPY, PRODUCT_DECK_COUNT } from './products'
export type { ProductKey } from './products'

const PRICE_ENV: Record<ProductKey, string> = {
  pack_3:   'STRIPE_PRICE_PACK_3',
  founders: 'STRIPE_PRICE_FOUNDERS',
  pack_12:  'STRIPE_PRICE_PACK_12',
}

export type ProductOffer = {
  key: ProductKey
  /** Formatted price as Stripe holds it, e.g. "24,00 €". Null = not for sale yet. */
  price: string | null
  purchasable: boolean
}

function formatPrice(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100)
}

/**
 * Ask Stripe what a product costs. Returns null for every failure — no key,
 * no price ID, inactive price, Stripe unreachable — because every one of them
 * means "we cannot take money for this right now", and the shop then shows the
 * waitlist instead of a button that would break.
 */
async function offerFor(key: ProductKey, stripe: Stripe | null): Promise<ProductOffer> {
  const priceId = process.env[PRICE_ENV[key]]
  if (!stripe || !priceId) return { key, price: null, purchasable: false }
  try {
    const price = await stripe.prices.retrieve(priceId)
    if (!price.active || price.unit_amount == null) {
      console.error(`[Shop] price ${PRICE_ENV[key]} is inactive or has no amount — product stays in waitlist mode`)
      return { key, price: null, purchasable: false }
    }
    return {
      key,
      price: formatPrice(price.unit_amount, price.currency),
      purchasable: true,
    }
  } catch (err) {
    console.error(`[Shop] could not read ${PRICE_ENV[key]} from Stripe:`, err instanceof Error ? err.message : err)
    return { key, price: null, purchasable: false }
  }
}

/**
 * The raw amount for a product, straight from Stripe — for order rows, where
 * a wrong number becomes a wrong invoice. Null when Stripe cannot confirm it;
 * callers then store nothing rather than a guess (the reservation route used
 * to hard-code 799 cents, a price from the condom era).
 */
export async function priceCentsFor(
  key: ProductKey
): Promise<{ amountCents: number; currency: string } | null> {
  const secret = process.env.STRIPE_SECRET_KEY
  const priceId = process.env[PRICE_ENV[key]]
  if (!secret || !priceId) return null
  try {
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })
    const price = await stripe.prices.retrieve(priceId)
    if (!price.active || price.unit_amount == null) return null
    return { amountCents: price.unit_amount, currency: price.currency }
  } catch (err) {
    console.error(`[Shop] could not read ${PRICE_ENV[key]} from Stripe:`, err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * All three offers. Called from the shop server component; the result decides
 * per product whether the page shows "preorder" or "join the waitlist".
 */
export async function loadOffers(): Promise<Record<ProductKey, ProductOffer>> {
  const secret = process.env.STRIPE_SECRET_KEY
  const stripe = secret ? new Stripe(secret, { apiVersion: '2024-06-20' }) : null
  if (!stripe) {
    // Not an error: this is the deliberate pre-launch state.
    console.info('[Shop] STRIPE_SECRET_KEY not set — shop runs in waitlist mode')
  }
  const offers = await Promise.all(PRODUCT_KEYS.map(k => offerFor(k, stripe)))
  return Object.fromEntries(offers.map(o => [o.key, o])) as Record<ProductKey, ProductOffer>
}
