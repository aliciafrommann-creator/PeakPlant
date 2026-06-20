'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from '../lib/translations'
import { useIsMobile } from '../hooks/useIsMobile'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// Pages that live at root level, not under /[locale]/
// /shop stays global (single checkout, no locale split needed)
const GLOBAL_PATHS = ['/shop', '/unsubscribe']

function Logo({ color = '#1A1A1A', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NavBar({ activePath }: { activePath?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const locale = pathname?.startsWith('/de') ? 'de' : 'en'
  const altLocale = locale === 'de' ? 'en' : 'de'
  const isLocaleRoute = !!(pathname?.match(/^\/(en|de)(\/|$)/))
  const pathWithoutLocale = pathname?.replace(/^\/(en|de)/, '') || '/'
  const altPath = isLocaleRoute
    ? `/${altLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    : `/${altLocale}`

  const localHref = (href: string) => {
    if (href === '/') return `/${locale}`
    if (GLOBAL_PATHS.some(g => href === g || href.startsWith(`${g}/`))) return href
    return isLocaleRoute ? `/${locale}${href}` : href
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const bg = scrolled ? 'rgba(26,26,26,0.93)' : 'rgba(255,255,255,0.90)'
  const color = scrolled ? '#ffffff' : '#1A1A1A'
  const dividerColor = scrolled ? 'rgba(255,255,255,0.18)' : 'rgba(26,26,26,0.18)'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: isMobile ? '1.1rem 1.25rem' : '1.5rem 2.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: bg,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      transition: 'background 0.4s ease',
    }}>
      <Link href={localHref('/')} style={{ textDecoration: 'none' }}>
        <Logo color={color} size={isMobile ? 26 : 32} />
      </Link>
      <div style={{ display: 'flex', gap: isMobile ? '1.1rem' : '2.5rem', alignItems: 'center' }}>
        {navItems.map(({ en, de, href }) => (
          <Link key={href} href={localHref(href)} style={{
            fontFamily: PP,
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color,
            opacity: activePath === href ? 1 : 0.5,
            transition: 'color 0.4s ease',
          }}>
            {locale === 'de' ? de : en}
          </Link>
        ))}
        <Link href={altPath} style={{
          fontFamily: PP,
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          textDecoration: 'none',
          color,
          opacity: 0.38,
          borderLeft: `1px solid ${dividerColor}`,
          paddingLeft: isMobile ? '0.75rem' : '1.25rem',
          transition: 'opacity 0.3s ease',
        }}>
          {altLocale.toUpperCase()}
        </Link>
      </div>
    </nav>
  )
}

export default NavBar
