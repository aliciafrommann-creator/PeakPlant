'use client'
import { motion, useScroll } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { NavBar } from '../components/NavBar'
import { QuestionsTeaser } from '../components/QuestionsTeaser'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ color = '#1A1A1A', size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: '#1A1A1A', transformOrigin: 'left', scaleX: scrollYProgress, zIndex: 200 }} />
  )
}

function Hero() {
  return (
    <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
      <video autoPlay muted playsInline loop
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
        <source src="/film-shadows.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.5) 100%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
          style={{ marginBottom: '2rem' }}>
          <Logo color="#ffffff" size={36} />
        </motion.div>
        <p style={{ fontFamily: PP, fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 560, marginBottom: '1rem' }}>
          when did life start feeling this fast?
        </p>
        <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          a new intimacy brand. mid-august 2026.
        </p>
      </motion.div>
    </section>
  )
}

function Questions() {
  return <QuestionsTeaser intro="the questions" />
}

function Product() {
  return (
    <section style={{ borderTop: '1px solid #ebebeb', padding: '7rem 2.5rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 200, color: '#1A1A1A', lineHeight: 1.15, letterSpacing: '-0.025em', fontFamily: PP, marginBottom: '1.5rem' }}
        >
          six condoms. six questions. one ritual.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontFamily: PP, fontSize: '0.9rem', color: '#1A1A1A', opacity: 0.45, fontWeight: 300, marginBottom: '2.5rem', letterSpacing: '0.01em' }}
        >
          7,99€ · free shipping · preorder · mid-august 2026
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link href="/shop" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.55, textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 4 }}>
            reserve your box →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function Founder() {
  return (
    <section style={{ padding: '7rem 2.5rem', borderTop: '1px solid #ebebeb' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}
      >
        <span style={{ color: '#C9A96E', fontSize: '1.1rem', lineHeight: 1 }}>∧</span>
        <p style={{ fontFamily: PP, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.35 }}>founded by</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontFamily: PP, fontSize: '1rem', fontWeight: 300, lineHeight: 1.7, color: '#1A1A1A' }}>alicia.</p>
          <p style={{ fontFamily: PP, fontSize: '1rem', fontWeight: 300, lineHeight: 1.7, color: '#777' }}>msc candidate. former bosch. trail runner.</p>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
          <p style={{ fontFamily: PP, fontSize: '1rem', fontWeight: 300, lineHeight: 1.9, color: '#555' }}>i built peakplant because i noticed</p>
          <p style={{ fontFamily: PP, fontSize: '1rem', fontWeight: 300, lineHeight: 1.9, color: '#555' }}>the faster life got,</p>
          <p style={{ fontFamily: PP, fontSize: '1rem', fontWeight: 300, lineHeight: 1.9, color: '#555' }}>the harder it became to actually</p>
          <p style={{ fontFamily: PP, fontSize: '1rem', fontWeight: 300, lineHeight: 1.9, color: '#555' }}>feel close to someone.</p>
        </div>
      </motion.div>
    </section>
  )
}

function SocialProof() {
  return (
    <section style={{ padding: '8rem 2.5rem', textAlign: 'center', borderTop: '1px solid #ebebeb' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}
      >
        <p style={{ fontFamily: PP, fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.35 }}>early readers say</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ color: '#C9A96E', fontSize: '1.1rem', lineHeight: 1 }}>∧</span>
          {/* TODO: Replace with real testimonial when available */}
          <p style={{ fontFamily: PP, fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.75, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
            ‘this made us talk for two hours.<br />we hadn’t done that in months.’
          </p>
          <p style={{ fontFamily: PP, fontSize: '0.75rem', color: '#1A1A1A', opacity: 0.35, letterSpacing: '0.06em' }}>— beta tester, munich</p>
        </div>
      </motion.div>
    </section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }
  return (
    <section style={{ padding: '160px 40px', backgroundColor: '#1A1A1A', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
          <Logo color="#ffffff" size={40} />
        </motion.div>
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', fontWeight: 200, color: '#ffffff', lineHeight: 1.2, maxWidth: 480, margin: '2.5rem auto 1rem', fontFamily: PP, letterSpacing: '-0.025em' }}>
          stay a little longer.
        </h2>
        <p style={{ fontSize: 14, color: '#ffffff', opacity: 0.4, maxWidth: 320, margin: '0 auto 56px', lineHeight: 1.8, fontWeight: 300, fontFamily: PP }}>
          we'll find you when it's time.
        </p>
        {status === 'success' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 13, letterSpacing: '0.08em', color: '#ffffff', opacity: 0.7, fontFamily: PP, fontWeight: 300 }}>
            we'll find you when it's time.
          </motion.p>
        ) : status === 'duplicate' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 13, letterSpacing: '0.08em', color: '#ffffff', opacity: 0.5, fontFamily: PP, fontWeight: 300 }}>
            you're already on the list.
          </motion.p>
        ) : (
          <form onSubmit={submit} style={{ display: 'inline-flex', maxWidth: 440, width: '100%', border: '1px solid rgba(255,255,255,0.2)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              style={{ flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#ffffff' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 28px', backgroundColor: '#ffffff', color: '#1A1A1A', border: 'none', cursor: 'pointer', fontSize: 9, letterSpacing: '0.35em', fontFamily: PP, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {status === 'loading' ? '...' : 'stay close'}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ marginTop: 12, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
        {status !== 'success' && status !== 'duplicate' && (
          <p style={{ marginTop: 16, fontSize: 11, color: '#ffffff', opacity: 0.3, fontFamily: PP, lineHeight: 1.65 }}>
            mit der anmeldung stimmst du unserer{' '}
            <Link href="/datenschutz" style={{ color: '#ffffff', opacity: 0.5, textDecoration: 'underline' }}>datenschutzerklärung</Link>
            {' '}zu.
          </p>
        )}
      </motion.div>
    </section>
  )
}

const editions = [
  { sym: '∧', label: 'edition 01 — sommer 2026' },
  { sym: '∧', label: 'edition 02 — herbst 2026' },
  { sym: '∧', label: 'edition 03 — winter 2026' },
]

function EditionSystem() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '4rem', maxWidth: 560, fontFamily: PP }}>
          every edition. a different world.
        </motion.h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {editions.map(({ sym, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#C9A96E', fontSize: '1rem', lineHeight: 1 }}>{sym}</span>
              <span style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.01em' }}>{label}</span>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: '0.9rem', color: '#ffffff', opacity: 0.35, lineHeight: 1.75, fontWeight: 300, fontFamily: PP }}>
          same outside. different world inside.
        </motion.p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ padding: '48px 40px', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo color="#ffffff" size={18} />
        <span style={{ color: '#ffffff', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, opacity: 0.55 }}>PEAKPLANT</span>
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {['Intimacy', 'Philosophy', 'Shop', 'Journal', 'Community'].map(item => (
          <Link key={item} href={`/${item.toLowerCase()}`} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.35 }}>
            {item.toUpperCase()}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['impressum', '/impressum'], ['datenschutz', '/datenschutz'], ['agb', '/agb']].map(([label, href]) => (
          <Link key={href} href={href} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.25em', fontFamily: PP, textDecoration: 'none', opacity: 0.22 }}>
            {label}
          </Link>
        ))}
        <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#ffffff', opacity: 0.18, fontFamily: PP }}>© 2026 PEAKPLANT</p>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <main style={{ backgroundColor: '#ffffff', fontFamily: PP }}>
      <ScrollBar />
      <NavBar activePath="/" />
      <Hero />
      <Questions />
      <Product />
      <Founder />
      <SocialProof />
      <Waitlist />
      <EditionSystem />
      <Footer />
    </main>
  )
}
