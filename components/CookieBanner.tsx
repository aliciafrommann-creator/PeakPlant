'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  // The notice used to be German everywhere, including on the English pages.
  const isDE = pathname?.startsWith('/de') ?? false

  useEffect(() => {
    if (!localStorage.getItem('cookie-notice')) setVisible(true)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem('cookie-notice', '1')
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label={isDE ? 'Cookie-Hinweis' : 'Cookie notice'}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        // The notice inherited the browser's serif default — off-brand, and it
        // reads as a broken page on a phone where it fills a third of the view.
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        background: 'rgba(255,255,255,0.96)',
        borderTop: '1px solid #e8e8e8',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px 20px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ fontSize: '12px', color: '#888', letterSpacing: '0.01em', margin: 0, lineHeight: 1.5, flex: '1 1 220px' }}>
        {isDE
          ? 'Diese Website verwendet ausschließlich technisch notwendige Cookies (Vercel), die für den Betrieb der Seite erforderlich sind. '
          : 'This site uses only the technically necessary cookies (Vercel) required to run it. '}
        <a href="/datenschutz" style={{ color: '#888', textDecoration: 'underline' }}>
          {isDE ? 'Datenschutz' : 'Privacy'}
        </a>
      </p>
      <button
        onClick={dismiss}
        style={{
          padding: '12px 24px',
          minHeight: 44,
          borderRadius: '999px',
          border: '1px solid #ddd',
          background: 'transparent',
          color: '#111',
          fontSize: '13px',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          // On a phone the notice wraps to several lines; the button then grows
          // to full width instead of hiding as a 32px sliver in the corner.
          flex: '1 0 auto',
          whiteSpace: 'nowrap',
        }}
      >
        {isDE ? 'Verstanden' : 'Got it'}
      </button>
    </div>
  )
}
