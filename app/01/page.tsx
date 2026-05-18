'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const GOLD = '#C9A96E'

const prompts = [
  'what do you wish you said more often?',
  'when did you last feel fully present?',
  'what would you do differently if you weren\'t afraid?',
]

function NewsletterForm({ source }: { source: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.6, fontFamily: PP, fontWeight: 300, letterSpacing: '0.04em' }}>
        see you in the next edition.
      </motion.p>
    )
  }

  if (status === 'duplicate') {
    return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        style={{ fontSize: 14, color: '#1A1A1A', opacity: 0.5, fontFamily: PP, fontWeight: 300, letterSpacing: '0.04em' }}>
        you're already on the list.
      </motion.p>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
      <div style={{ display: 'flex', border: '1px solid rgba(26,26,26,0.25)' }}>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{ flex: 1, padding: '14px 20px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#1A1A1A' }}
        />
        <button type="submit" disabled={status === 'loading'}
          style={{ padding: '14px 24px', background: '#1A1A1A', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.35em', fontFamily: PP }}>
          {status === 'loading' ? '...' : 'STAY CLOSE'}
        </button>
      </div>
      {status === 'error' && <p style={{ fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
    </form>
  )
}

export default function Edition01Page() {
  return (
    <div style={{ fontFamily: PP, background: '#faf9f7', color: '#1A1A1A', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 2.5rem', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: 560 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: GOLD, fontWeight: 200, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            ∧
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
            style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.45 }}
          >
            edition 01 — sommer
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 200, lineHeight: 1.25, letterSpacing: '-0.025em' }}
          >
            you found the world inside the box.
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 1.2 }}
          style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)' }}
        >
          <svg width="1" height="48" viewBox="0 0 1 48" style={{ display: 'block' }}>
            <motion.line x1="0.5" y1="0" x2="0.5" y2="48" stroke="rgba(26,26,26,0.2)" strokeWidth="1"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 1.5 }} />
          </svg>
        </motion.div>
      </section>

      {/* Spotify */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}
        >
          a playlist for edition 01
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', marginBottom: '3rem' }}
        >
          slow down. press play.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
          style={{ border: '1px solid #e0e0e0', padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#ffffff' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M2 2l12 7-12 7V2z" fill="#1A1A1A" opacity="0.25" />
            </svg>
          </div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.3 }}>
            playlist coming soon
          </p>
        </motion.div>
      </section>

      {/* Founder Story */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '5rem', alignItems: 'start' }}
        >
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1rem' }}>founder</p>
            <div style={{ width: 40, height: 1, background: GOLD, opacity: 0.7 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', marginBottom: '2.5rem', lineHeight: 1.3 }}>
              why i built this
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                'i built peakplant because i noticed something.\nthe faster life got, the harder intimacy became.',
                'not physical intimacy. emotional intimacy.\nthe kind where you actually feel seen.',
                'peakplant is my attempt to slow that down.\none box. one question. one moment at a time.',
                '— alicia',
              ].map((para, i) => (
                <motion.p key={i}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontSize: '1.05rem', lineHeight: 1.85, color: i === 3 ? '#1A1A1A' : '#555', fontWeight: i === 3 ? 400 : 300, whiteSpace: 'pre-line', fontStyle: i === 3 ? 'italic' : 'normal' }}
                >
                  {para}
                </motion.p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Extra Prompts */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}
        >
          go a little deeper
        </motion.p>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #e8e8e8' }}>
          {prompts.map((prompt, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '2.5rem 0', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'baseline', gap: '2rem' }}
            >
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.3, minWidth: 20 }}>0{i + 1}</span>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 300, lineHeight: 1.4, letterSpacing: '-0.01em', fontStyle: 'italic', color: '#1A1A1A' }}>
                "{prompt}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem 9rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}>
            stay in the world
          </p>
          <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.3 }}>
            edition 02 drops in herbst 2026.
          </h2>
          <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, fontWeight: 300, marginBottom: '2.5rem' }}>
            leave your email and we'll make sure you're there.
          </p>
          <NewsletterForm source="edition-01" />
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8e8e8', padding: '2.5rem', textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.35, fontFamily: PP }}>
            ∧ peakplant
          </span>
        </Link>
      </footer>

    </div>
  )
}
