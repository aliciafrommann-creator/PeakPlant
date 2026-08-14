/**
 * Rate limiting for the public write routes (audit finding H2: /api/reserve
 * could create an order row and send two mails per unauthenticated call,
 * without any limit — mail-bombing in the domain's name).
 *
 * Two layers, both best-effort in isolation, honest together:
 *
 * 1. In-memory window per serverless instance. Free and instant, but resets on
 *    every cold start, so it cannot be the only line.
 * 2. Persistent window in Postgres via the `api_rate_hit` RPC (migration
 *    `0017_rate_limits.sql`, SECURITY DEFINER, service_role only). Survives
 *    cold starts and covers all instances.
 *
 * Until 0017 is applied in production the RPC does not exist; the helper then
 *    degrades to layer 1 and logs once, instead of blocking every request.
 *    Fail-open by design: an unreachable database must not take the shop down —
 *    the in-memory layer still catches the naive flood.
 */

type Entry = { count: number; reset: number }
const memory = new Map<string, Entry>()

let warnedNoPersistence = false

function memoryHit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || now > entry.reset) {
    memory.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  entry.count++
  return entry.count <= max
}

async function persistentHit(key: string, max: number, windowSeconds: number): Promise<boolean | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/api_rate_hit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ p_key: key, p_window_seconds: windowSeconds, p_max: max }),
    })
    if (!res.ok) {
      if (!warnedNoPersistence) {
        warnedNoPersistence = true
        console.error('[RateLimit] persistent layer unavailable (apply 0017_rate_limits.sql):', res.status)
      }
      return null
    }
    return (await res.json()) === true
  } catch (err) {
    if (!warnedNoPersistence) {
      warnedNoPersistence = true
      console.error('[RateLimit] persistent layer unreachable:', err)
    }
    return null
  }
}

/**
 * True when the caller is within the limit. `name` scopes the window per
 * route, `ip` per caller; both layers share the same key and window.
 */
export async function withinRateLimit(
  name: string,
  ip: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `${name}:${ip}`
  const memOk = memoryHit(key, max, windowSeconds * 1000)
  if (!memOk) return false
  const persisted = await persistentHit(key, max, windowSeconds)
  return persisted === null ? memOk : persisted
}

/** Uniform way to read the caller IP behind Vercel's proxy. */
export function callerIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
