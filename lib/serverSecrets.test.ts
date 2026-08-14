import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { newsletterSecret, makeUnsubToken, verifyUnsubToken, safeEqual } from './serverSecrets'

/**
 * These guard the unsubscribe link. The bug this replaces was a
 * `?? 'dev-secret'` fallback: with the env var unset, every token became
 * predictable and anyone could unsubscribe anyone (audit finding H3). So the
 * important assertions here are the negative ones.
 */
describe('serverSecrets', () => {
  const original = process.env.NEWSLETTER_SECRET

  beforeEach(() => {
    process.env.NEWSLETTER_SECRET = 'test-secret-value'
  })
  afterEach(() => {
    if (original === undefined) delete process.env.NEWSLETTER_SECRET
    else process.env.NEWSLETTER_SECRET = original
  })

  it('issues and verifies a token for the same address', () => {
    const token = makeUnsubToken('someone@example.com')
    expect(token).toBeTruthy()
    expect(verifyUnsubToken('someone@example.com', token as string)).toBe(true)
  })

  it('rejects a token issued for a different address', () => {
    const token = makeUnsubToken('someone@example.com') as string
    expect(verifyUnsubToken('other@example.com', token)).toBe(false)
  })

  it('produces no token at all when the secret is missing', () => {
    delete process.env.NEWSLETTER_SECRET
    expect(newsletterSecret()).toBeNull()
    expect(makeUnsubToken('someone@example.com')).toBeNull()
  })

  it('verifies nothing when the secret is missing — not even a token minted with the old default', () => {
    // The exact value the removed fallback used. If this ever passes again,
    // the fallback is back and every subscriber is deletable by a stranger.
    const forged = 'dev-secret'
    delete process.env.NEWSLETTER_SECRET
    expect(verifyUnsubToken('someone@example.com', forged)).toBe(false)
    expect(verifyUnsubToken('someone@example.com', '')).toBe(false)
  })

  it('treats an empty secret as missing', () => {
    process.env.NEWSLETTER_SECRET = ''
    expect(newsletterSecret()).toBeNull()
    expect(makeUnsubToken('a@b.de')).toBeNull()
  })

  it('compares secrets safely, including different lengths', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abcd')).toBe(false)
    expect(safeEqual('', '')).toBe(true)
    expect(safeEqual('Bearer x', 'Bearer y')).toBe(false)
  })
})
