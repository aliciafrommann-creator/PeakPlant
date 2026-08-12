import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'de']
// Routes that live at root level and must NOT be redirected into a locale
// segment — there is no app/[locale]/shop, so a redirect there is a 404.
//
// This is not only about folders with a page.tsx. Every root-level route
// belongs here, including Next's file conventions that produce a URL without a
// file extension: opengraph-image, twitter-image, apple-icon, manifest. Those
// have no page.tsx, so they are easy to miss — and a missed one silently 404s
// (every social preview image, in the case of opengraph-image).
const SKIP = [
  '/impressum', '/datenschutz', '/app-datenschutz', '/agb', '/api', '/_next', '/favicon', '/sitemap', '/robots',
  '/shop', '/journal', '/unsubscribe', '/admin',
  // /bestellen itself has no page — only /bestellen/success exists. The bare
  // path is caught below and sent to /shop rather than into a 404.
  '/bestellen',
  '/letters', '/beta',
  '/opengraph-image',
]

function preferredLocale(req: NextRequest): string {
  const al = req.headers.get('Accept-Language') ?? ''
  return al.toLowerCase().startsWith('de') ? 'de' : 'en'
}

/**
 * Matches a SKIP entry only on a path boundary, so `/shop` does not also
 * swallow a future `/shopping-cart` and `/beta` not a `/beta-tester`.
 */
function isSkipped(pathname: string): boolean {
  return SKIP.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /bestellen has no page of its own; someone shortening the success URL or
  // guessing the address should land in the shop, not on a 404.
  if (pathname === '/bestellen') {
    const url = req.nextUrl.clone()
    url.pathname = '/shop'
    return NextResponse.redirect(url)
  }

  if (pathname.includes('.') || isSkipped(pathname)) return NextResponse.next()
  if (LOCALES.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next()
  const locale = preferredLocale(req)
  // Clone instead of building a fresh URL from the pathname alone: `new URL(to,
  // req.url)` drops the query string, which silently ate the access token in
  // /01?token=… links sent by the order and reservation mails.
  const url = req.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.svg|.*\\..*).*)'],
}
