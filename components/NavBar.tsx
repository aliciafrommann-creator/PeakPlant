'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ color = '#1A1A1A', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const items = [
  { label: 'Home', href: '/' },
  { label: 'Intimacy', href: '/intimacy' },
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'Ethics', href: '/ethics' },
  { label: 'Shop', href: '/shop' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
]

export function NavBar({ activePath }: { activePath?: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const bg = scrolled ? 'rgba(26,26,26,0.93)' : 'rgba(255,255,255,0.90)'
  const color = scrolled ? '#ffffff' : '#1A1A1A'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1.5rem 2.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: bg,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      transition: 'background 0.4s ease',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo color={color} size={32} />
      </Link>
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {items.map(({ label, href }) => (
          <Link key={href} href={href} style={{
            fontFamily: PP,
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color,
            opacity: activePath === href ? 1 : 0.5,
            transition: 'color 0.4s ease',
          }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default NavBar
