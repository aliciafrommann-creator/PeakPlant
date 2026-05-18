'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

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
      aria-label="Cookie-Hinweis"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '14px 24px',
        background: 'rgba(255,255,255,0.96)',
        borderTop: '1px solid #e8e8e8',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ fontSize: '12px', color: '#888', letterSpacing: '0.02em', margin: 0, lineHeight: 1.55 }}>
        Diese Website verwendet ausschlie&szlig;lich technisch notwendige Cookies (Vercel), die f&uuml;r den Betrieb der Seite erforderlich sind.{' '}
        <a href="/datenschutz" style={{ color: '#888', textDecoration: 'underline' }}>Datenschutz</a>
      </p>
      <button
        onClick={dismiss}
        style={{
          padding: '8px 20px',
          borderRadius: '999px',
          border: '1px solid #ddd',
          background: 'transparent',
          color: '#111',
          fontSize: '12px',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        Verstanden
      </button>
    </div>
  )
}
