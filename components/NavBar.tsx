'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const RALEWAY = 'var(--font-raleway), "Helvetica Neue", sans-serif'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Intimacy', href: '/intimacy' },
  { label: 'Philosophy', href: '/philosophy' },
  { label: 'Ethics', href: '/ethics' },
  { label: 'Shop', href: '/shop' },
  { label: 'Journal', href: '/journal' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
]

export function NavBar({ activePath }: { activePath?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    function startIdle() {
      if (idleRef.current) clearTimeout(idleRef.current)
      idleRef.current = setTimeout(() => setVisible(false), 2000)
    }
    function show() {
      setVisible(true)
      startIdle()
    }
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 80)
      if (y < lastScrollY.current) show()
      lastScrollY.current = y
      startIdle()
    }
    function onMouse(e: MouseEvent) {
      if (e.clientY < window.innerHeight * 0.12) show()
    }

    startIdle()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse)
    return () => {
      if (idleRef.current) clearTimeout(idleRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2.5rem',
        background: scrolled ? 'rgba(26,26,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.4s ease, opacity 0.4s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: RALEWAY,
          fontSize: '0.75rem',
          fontWeight: 200,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: scrolled ? '#FAFAF8' : '#1A1A1A',
          textDecoration: 'none',
          transition: 'color 0.4s ease',
        }}
      >
        ∧ peakplant
      </Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {NAV_ITEMS.filter(i => i.href !== '/').map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontFamily: RALEWAY,
              fontSize: '0.7rem',
              fontWeight: 200,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: activePath === item.href
                ? 'var(--edition-pink)'
                : scrolled ? '#FAFAF8' : '#1A1A1A',
              textDecoration: 'none',
              opacity: activePath === item.href ? 1 : 0.75,
              transition: 'color 0.4s ease, opacity 0.2s ease',
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default NavBar
