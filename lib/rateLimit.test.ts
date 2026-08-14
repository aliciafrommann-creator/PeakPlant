import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * The throttle in front of /api/reserve and /api/checkout (audit finding H2:
 * unauthenticated, each call wrote an order row and sent two mails).
 *
 * Here only the in-memory layer is exercised: no service-role key is set, so
 * the persistent layer is skipped exactly as it is in local development. The
 * important property is that it degrades *closed enough* — the memory layer
 * still blocks a flood — and never throws, which would take the shop down.
 */

const ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const saved: Record<string, string | undefined> = {}

describe('rate limit (in-memory layer)', () => {
  beforeEach(async () => {
    for (const k of ENV) {
      saved[k] = process.env[k]
      delete process.env[k]
    }
    vi.resetModules()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    for (const k of ENV) {
      if (saved[k] === undefined) delete process.env[k]
      else process.env[k] = saved[k] as string
    }
  })

  it('allows up to the limit, then blocks', async () => {
    const { withinRateLimit } = await import('./rateLimit')
    expect(await withinRateLimit('t1', '1.2.3.4', 2, 60)).toBe(true)
    expect(await withinRateLimit('t1', '1.2.3.4', 2, 60)).toBe(true)
    expect(await withinRateLimit('t1', '1.2.3.4', 2, 60)).toBe(false)
  })

  it('counts per caller, so one flooder cannot lock out everyone else', async () => {
    const { withinRateLimit } = await import('./rateLimit')
    expect(await withinRateLimit('t2', 'flooder', 1, 60)).toBe(true)
    expect(await withinRateLimit('t2', 'flooder', 1, 60)).toBe(false)
    expect(await withinRateLimit('t2', 'someone-else', 1, 60)).toBe(true)
  })

  it('counts per route, so the shop and the waitlist have separate windows', async () => {
    const { withinRateLimit } = await import('./rateLimit')
    expect(await withinRateLimit('reserve', 'ip', 1, 60)).toBe(true)
    expect(await withinRateLimit('reserve', 'ip', 1, 60)).toBe(false)
    expect(await withinRateLimit('checkout', 'ip', 1, 60)).toBe(true)
  })

  it('lets the window roll: after it passes, the caller is allowed again', async () => {
    const { withinRateLimit } = await import('./rateLimit')
    expect(await withinRateLimit('t3', 'ip', 1, 60)).toBe(true)
    expect(await withinRateLimit('t3', 'ip', 1, 60)).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(await withinRateLimit('t3', 'ip', 1, 60)).toBe(true)
  })

  it('reads the caller IP from the proxy header and survives its absence', async () => {
    const { callerIp } = await import('./rateLimit')
    expect(callerIp(new Request('https://x.dev', { headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' } }))).toBe('9.9.9.9')
    expect(callerIp(new Request('https://x.dev'))).toBe('unknown')
  })
})
