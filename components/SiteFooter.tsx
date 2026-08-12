import Link from 'next/link'
import { navItems } from '../lib/translations'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const GLOBAL_PATHS = ['/shop', '/journal', '/unsubscribe']

function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none" aria-hidden="true">
      <path d="M4 34 L24 4 L44 34" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The one footer for every locale page. Pages used to carry their own footers
 * as well, which stacked two footers (and two sets of legal links) on top of
 * each other — this is now the single source, so the legal pages stay reachable
 * from everywhere exactly once.
 */
export function SiteFooter({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  const localHref = (href: string) =>
    GLOBAL_PATHS.some(g => href === g || href.startsWith(`${g}/`)) ? href : `/${locale}${href}`

  const legal = [
    { href: '/impressum', label: 'Impressum' },
    { href: '/datenschutz', label: isDE ? 'Datenschutz' : 'Privacy' },
    { href: '/agb', label: 'AGB' },
  ]

  return (
    <footer className="pp-footer" style={{ borderTop: '1px solid #ebebeb', background: '#ffffff', padding: '3rem 2.5rem', fontFamily: PP }}>
      <div className="pp-footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem 3rem', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <Logo />
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1A1A1A' }}>peakplant</span>
          </div>
          <p className="pp-footer-tagline" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: '#1A1A1A', opacity: 0.45, lineHeight: 1.7, maxWidth: 260 }}>
            {isDE ? 'für die momente, die bleiben' : 'made for the moments that stay with you'}
          </p>
        </div>

        <nav aria-label={isDE ? 'Seiten' : 'Pages'} style={{ display: 'flex', flexDirection: 'column' }}>
          {navItems.map(({ en, de, href }) => (
            <Link key={href} href={localHref(href)} className="pp-footer-link">
              {isDE ? de : en}
            </Link>
          ))}
          <Link href="/journal" className="pp-footer-link">Journal</Link>
        </nav>

        <nav aria-label={isDE ? 'Rechtliches' : 'Legal'} style={{ display: 'flex', flexDirection: 'column' }}>
          {legal.map(({ href, label }) => (
            <Link key={href} href={href} className="pp-footer-link">
              {label}
            </Link>
          ))}
          <span className="pp-footer-link" style={{ opacity: 0.3, pointerEvents: 'none' }}>© 2026 peakplant</span>
        </nav>
      </div>
    </footer>
  )
}
