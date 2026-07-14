import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

/**
 * Global footer for all locale pages. Exists primarily so the legal pages
 * (Impressum/Datenschutz/AGB) are reachable from everywhere — previously they
 * were only linked on /01, an Impressumspflicht gap.
 */
export function SiteFooter({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/journal', label: 'Journal' },
    { href: '/impressum', label: 'Impressum' },
    { href: '/datenschutz', label: isDE ? 'Datenschutz' : 'Privacy' },
    { href: '/agb', label: 'AGB' },
  ]
  return (
    <footer style={{ borderTop: '1px solid #ebebeb', background: '#ffffff', padding: '2.5rem', fontFamily: PP }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.5rem 2.5rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.45 }}>
          peakplant — {isDE ? 'für die momente, die bleiben' : 'made for the moments that stay with you'}
        </p>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href}
              style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
