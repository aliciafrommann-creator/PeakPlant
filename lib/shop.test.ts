import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * The price path. Two things must hold, both about money:
 *
 * 1. A product is only purchasable when Stripe confirms an active price —
 *    otherwise the shop must fall back to the waitlist rather than show a
 *    button that leads nowhere.
 * 2. The amount written onto an order comes from Stripe, never from our code.
 *    `/api/reserve` used to hard-code 799 cents and the invoice route billed
 *    exactly that.
 */

const retrieve = vi.fn()
vi.mock('stripe', () => ({
  default: class {
    prices = { retrieve }
  },
}))

const ENV_KEYS = ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_PACK_3', 'STRIPE_PRICE_FOUNDERS', 'STRIPE_PRICE_PACK_12']
const saved: Record<string, string | undefined> = {}

async function shop() {
  return await import('./shop')
}

describe('shop offers', () => {
  beforeEach(() => {
    for (const k of ENV_KEYS) saved[k] = process.env[k]
    retrieve.mockReset()
    vi.resetModules()
  })
  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k] as string
    }
  })

  it('sells nothing without a secret key — the deliberate pre-launch state', async () => {
    delete process.env.STRIPE_SECRET_KEY
    process.env.STRIPE_PRICE_FOUNDERS = 'price_x'
    const { loadOffers } = await shop()
    const offers = await loadOffers()
    expect(offers.founders.purchasable).toBe(false)
    expect(offers.founders.price).toBeNull()
    expect(retrieve).not.toHaveBeenCalled()
  })

  it('sells a product whose price Stripe confirms, and formats the amount', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_PRICE_FOUNDERS = 'price_founders'
    delete process.env.STRIPE_PRICE_PACK_3
    delete process.env.STRIPE_PRICE_PACK_12
    retrieve.mockResolvedValue({ active: true, unit_amount: 2400, currency: 'eur' })

    const { loadOffers } = await shop()
    const offers = await loadOffers()

    expect(offers.founders.purchasable).toBe(true)
    expect(offers.founders.price).toContain('24')
    // Products without a price ID stay on the waitlist — per card, not per page.
    expect(offers.pack_3.purchasable).toBe(false)
    expect(offers.pack_12.purchasable).toBe(false)
  })

  it('does not sell an inactive price', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_PRICE_FOUNDERS = 'price_founders'
    retrieve.mockResolvedValue({ active: false, unit_amount: 2400, currency: 'eur' })

    const { loadOffers } = await shop()
    expect((await loadOffers()).founders.purchasable).toBe(false)
  })

  it('does not sell a price without an amount', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_PRICE_FOUNDERS = 'price_founders'
    retrieve.mockResolvedValue({ active: true, unit_amount: null, currency: 'eur' })

    const { loadOffers } = await shop()
    expect((await loadOffers()).founders.purchasable).toBe(false)
  })

  it('falls back to the waitlist when Stripe throws, instead of taking the page down', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_PRICE_FOUNDERS = 'price_founders'
    retrieve.mockRejectedValue(new Error('No such price'))

    const { loadOffers } = await shop()
    const offers = await loadOffers()
    expect(offers.founders.purchasable).toBe(false)
    expect(offers.founders.price).toBeNull()
  })
})

describe('priceCentsFor (the amount stored on an order)', () => {
  beforeEach(() => {
    for (const k of ENV_KEYS) saved[k] = process.env[k]
    retrieve.mockReset()
    vi.resetModules()
  })
  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k] as string
    }
  })

  it('returns the raw Stripe amount', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_PRICE_FOUNDERS = 'price_founders'
    retrieve.mockResolvedValue({ active: true, unit_amount: 2400, currency: 'eur' })

    const { priceCentsFor } = await shop()
    expect(await priceCentsFor('founders')).toEqual({ amountCents: 2400, currency: 'eur' })
  })

  it('returns null rather than a guess when no price is configured', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const { priceCentsFor } = await shop()
    // Null means the order is stored without an amount; the invoice route then
    // refuses instead of billing a stale 7,99 €.
    expect(await priceCentsFor('founders')).toBeNull()
  })
})
