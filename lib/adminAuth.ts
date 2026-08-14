import { safeEqual } from './serverSecrets'

/**
 * Admin gate for the /api/admin/* routes.
 *
 * Fail-closed and timing-safe: an unset ADMIN_SECRET locks the panel instead
 * of comparing against `undefined`, and the comparison does not leak how many
 * characters of a guess were right (the same rule /api/health follows).
 */
export function isAdmin(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET
  const provided = req.headers.get('x-admin-secret')
  if (!secret || !provided) return false
  return safeEqual(provided, secret)
}
