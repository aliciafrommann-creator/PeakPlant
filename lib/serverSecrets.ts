import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Server-side secrets, fail-closed.
 *
 * The old pattern `process.env.NEWSLETTER_SECRET ?? 'dev-secret'` meant that a
 * missing env var silently produced predictable HMAC tokens — anyone who read
 * the source could forge an unsubscribe link for any address (audit finding
 * H3). A missing secret is now an honest error at the call site, never a
 * guessable default. This module is the only place that reads these secrets,
 * so the fallback pattern cannot quietly return.
 */

/** The secret, or null when it is not configured. Never a default. */
export function newsletterSecret(): string | null {
  const v = process.env.NEWSLETTER_SECRET
  return v && v.length > 0 ? v : null
}

/**
 * Unsubscribe token for an address, or null when the secret is missing —
 * callers must treat null as "cannot operate", not as "skip the check".
 */
export function makeUnsubToken(email: string): string | null {
  const secret = newsletterSecret()
  if (!secret) return null
  return createHmac('sha256', secret).update(email).digest('base64url')
}

/** Constant-time verification. False when the secret is missing. */
export function verifyUnsubToken(email: string, token: string): boolean {
  const expected = makeUnsubToken(email)
  if (!expected) return false
  return safeEqual(token, expected)
}

/**
 * Timing-safe string comparison for secrets (`timingSafeEqual` throws on
 * length mismatch, which itself leaks the length — hash both sides first).
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac('sha256', 'cmp').update(a).digest()
  const hb = createHmac('sha256', 'cmp').update(b).digest()
  return timingSafeEqual(ha, hb)
}
