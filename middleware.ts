import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'de']
// Global pages that live at root level (not locale-prefixed)
const SKIP = [
  '/impressum', '/datenschutz', '/agb', '/api', '/_next', '/favicon', '/sitemap', '/robots',
  '/shop', '/journal', '/unsubscribe', '/admin', '/bestellen',
]

function preferredLocale(req: NextRequest): string {
  const al = req.headers.get('Accept-Language') ?? ''
  return al.toLowerCase().startsWith('de') ? 'de' : 'en'
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.includes('.') || SKIP.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (LOCALES.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next()
  const locale = preferredLocale(req)
  const to = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
  return NextResponse.redirect(new URL(to, req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\.svg|.*\..*).*)'],
}
