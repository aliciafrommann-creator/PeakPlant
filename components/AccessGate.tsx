'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const GOLD = '#C9A96E'

type GateState = 'checking' | 'unlocked' | 'locked'

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState]   = useState<GateState>('checking')
  const [email, setEmail]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState('')
  const [linkSent, setLinkSent] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const params = new URLSearchParams(window.location.search)
      const token  = params.get('token')

      // 1. token in URL → verify and set cookie
      if (token) {
        try {
          const res = await fetch('/api/access/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })
          const data = await res.json()
          if (!cancelled && data.valid) {
            // strip token from URL for cleanliness
            window.history.replaceState({}, '', window.location.pathname)
            setState('unlocked')
            return
          }
        } catch { /* fall through */ }
      }

      // 2. existing cookie?
      try {
        const res = await fetch('/api/access/verify')
        const data = await res.json()
        if (!cancelled) setState(data.valid ? 'unlocked' : 'locked')
      } catch {
        if (!cancelled) setState('locked')
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  async function unlockByEmail(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.valid) { setState('unlocked'); return }
      setError("we couldn't find an order for that email.")
    } catch {
      setError('something went wrong. try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function emailMeLink() {
    if (!email.includes('@')) { setError('enter your email first.'); return }
    setSubmitting(true); setError('')
    try {
      await fetch('/api/access/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setLinkSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'unlocked') return <>{children}</>

  if (state === 'checking') {
    return (
      <div style={{ fontFamily: PP, background: '#faf9f7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}
          style={{ fontSize: '2rem', color: GOLD, fontWeight: 200 }}>∧</motion.div>
      </div>
    )
  }

  // locked
  return (
    <div style={{ fontFamily: PP, background: '#faf9f7', color: '#1A1A1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>

        <div style={{ fontSize: '3rem', color: GOLD, fontWeight: 200, marginBottom: '1.5rem' }}>∧</div>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>edition 01</p>

        {linkSent ? (
          <>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '1rem' }}>
              check your inbox.
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#555', fontWeight: 300 }}>
              if there's an order for <strong style={{ color: '#1A1A1A' }}>{email}</strong>, your access link is on its way.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: '1rem' }}>
              the world inside the box.
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#555', fontWeight: 300, marginBottom: '2rem' }}>
              this space is for those who have edition 01.
              enter the email you ordered with to step inside.
            </p>

            <form onSubmit={unlockByEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email" required value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: 14, padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A', textAlign: 'center' }}
              />
              <button type="submit" disabled={submitting}
                style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {submitting ? '...' : 'enter →'}
              </button>
            </form>

            {error && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}

            <button onClick={emailMeLink} disabled={submitting}
              style={{ fontFamily: PP, fontSize: 11, opacity: 0.5, background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '1.5rem', textDecoration: 'underline', color: '#1A1A1A' }}>
              email me my access link instead
            </button>

            <p style={{ fontSize: 12, opacity: 0.4, marginTop: '2.5rem', lineHeight: 1.7, fontWeight: 300 }}>
              don't have edition 01 yet?{' '}
              <Link href="/shop" style={{ color: '#1A1A1A', textDecoration: 'underline' }}>visit the shop</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
