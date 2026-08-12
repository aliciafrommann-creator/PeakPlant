'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from '../lib/translations'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// Pages that live at root level, not under /[locale]/
// /shop + /journal stay global (single source, not locale-split)
const GLOBAL_PATHS = ['/shop', '/journal', '/unsubscribe']

function Logo({ color = '#1A1A1A', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function NavBar({ activePath }: { activePath?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

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
    return `/${locale}${href}`
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The drawer covers the page; the page behind it must not scroll away.
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // A route change while the drawer is open must close it.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const bg = scrolled ? 'rgba(26,26,26,0.93)' : 'rgba(255,255,255,0.90)'
  const color = scrolled ? '#ffffff' : '#1A1A1A'
  const dividerColor = scrolled ? 'rgba(255,255,255,0.18)' : 'rgba(26,26,26,0.18)'

  const ctaLabel = locale === 'de' ? 'warteliste' : 'waitlist'

  return (
    <>
      <nav className="pp-nav" style={{ background: bg, color }}>
        <Link href={localHref('/')} aria-label="peakplant"
          style={{ display: 'flex', alignItems: 'center', minHeight: 44, minWidth: 44, textDecoration: 'none' }}>
          <Logo color={color} size={30} />
        </Link>

        {/* Desktop: the full bar. Hidden under 860px by CSS. */}
        <div className="pp-nav-links">
          {navItems.map(({ en, de, href }) => (
            <Link key={href} href={localHref(href)} style={{
              fontFamily: PP,
              fontSize: '0.75rem',
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
          {/* Persistent conversion CTA — the waitlist is one tap away on every page. */}
          <Link href={`/${locale}#waitlist`} style={{
            fontFamily: PP,
            fontSize: '0.65rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: scrolled ? '#1A1A1A' : '#ffffff',
            background: scrolled ? '#ffffff' : '#1A1A1A',
            padding: '0.6rem 1.2rem',
            borderRadius: 999,
            transition: 'background 0.4s ease, color 0.4s ease',
            whiteSpace: 'nowrap',
          }}>
            {ctaLabel}
          </Link>
          <Link href={altPath} style={{
            fontFamily: PP,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            color,
            opacity: 0.38,
            borderLeft: `1px solid ${dividerColor}`,
            paddingLeft: '1.25rem',
            transition: 'opacity 0.3s ease',
          }}>
            {altLocale.toUpperCase()}
          </Link>
        </div>

        {/* Mobile: CTA + menu. Five uppercase links never fit a 390px bar. */}
        <div className="pp-nav-mobile">
          <Link href={`/${locale}#waitlist`} style={{
            fontFamily: PP,
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: scrolled ? '#1A1A1A' : '#ffffff',
            background: scrolled ? '#ffffff' : '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '0 1.1rem',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            transition: 'background 0.4s ease, color 0.4s ease',
          }}>
            {ctaLabel}
          </Link>
          <button
            type="button"
            className="pp-burger"
            aria-label={locale === 'de' ? 'Menü öffnen' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            style={{ color }}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="pp-drawer" role="dialog" aria-modal="true" style={{ fontFamily: PP }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <Logo color="#FBFAF7" size={30} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={locale === 'de' ? 'Menü schließen' : 'Close menu'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, border: 0, background: 'transparent',
                color: '#FBFAF7', cursor: 'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M2 2 L16 16 M16 2 L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Link href={localHref('/')} className="pp-drawer-link" style={{ opacity: activePath === '/' ? 1 : 0.75 }}>
              {locale === 'de' ? 'Start' : 'Home'}
            </Link>
            {navItems.map(({ en, de, href }) => (
              <Link key={href} href={localHref(href)} className="pp-drawer-link"
                style={{ opacity: activePath === href ? 1 : 0.75 }}>
                {locale === 'de' ? de : en}
              </Link>
            ))}
          </div>

          <Link href={`/${locale}#waitlist`} style={{
            marginTop: '2rem',
            display: 'block',
            textAlign: 'center',
            background: '#FBFAF7',
            color: '#1A1A1A',
            padding: '1.1rem 1.5rem',
            borderRadius: 999,
            fontSize: '0.8rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}>
            {ctaLabel}
          </Link>

          <Link href={altPath} style={{
            marginTop: '1.5rem',
            display: 'block',
            padding: '0.9rem 0',
            fontSize: '0.8rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}>
            {altLocale === 'de' ? 'Deutsch' : 'English'}
          </Link>
        </div>
      )}
    </>
  )
}

export default NavBar
