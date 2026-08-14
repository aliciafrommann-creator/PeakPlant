import { redirect } from 'next/navigation'

/**
 * /01 → /edition-01 (P0 honesty decision, 14.08.2026).
 *
 * The page was marketed as an "exclusive" digital world, but there was never a
 * gate: `?token=` was ignored and the route sat in the public sitemap. Rather
 * than build exclusivity after the fact, the page now says what it is — the
 * public digital side of edition 01 — under a name that says so. This stub
 * keeps every already-sent mail link (/01?token=…) working; the token was
 * never read, so nothing is lost by dropping it here.
 */
export default function LegacyEditionRedirect({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/edition-01`)
}
