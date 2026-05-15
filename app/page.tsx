'use client'
import { motion, useScroll } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

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

function NavLink({ href, label, light }: { href: string; label: string; light?: boolean }) {
  const [hov, setHov] = useState(false)
  const c = light ? '#ffffff' : '#1A1A1A'
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', color: c, fontSize: 10, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.55, paddingBottom: 3 }}>
      {label.toUpperCase()}
      <motion.span animate={{ scaleX: hov ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '0.5px', background: c, transformOrigin: 'left', display: 'block' }} />
    </Link>
  )
}

function Nav() {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo color="#1A1A1A" size={28} />
      </Link>
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {['Home', 'Intimacy', 'Philosophy', 'About', 'Shop', 'Journal', 'Community'].map(item => (
          <NavLink key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} label={item} />
        ))}
      </div>
    </nav>
  )
}

function CouplesHero() {
  return (
    <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
      <video autoPlay muted playsInline loop
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
        <source src="/film-shadows.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.45) 100%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
          style={{ marginBottom: '1.5rem' }}>
          <Logo color="#ffffff" size={36} />
        </motion.div>
        <p style={{ fontFamily: PP, fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 540, marginBottom: '0.75rem' }}>
          Grow where you feel most alive.
        </p>
        <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          Scroll to explore
        </p>
      </motion.div>
    </section>
  )
}

function Product() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh', backgroundColor: '#ffffff', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 80px' }}>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
          style={{ fontSize: 10, letterSpacing: '0.55em', color: '#1A1A1A', opacity: 0.35, marginBottom: 36, fontFamily: PP }}>
          WHAT WE MADE
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', fontWeight: 200, color: '#1A1A1A', lineHeight: 1.12, marginBottom: 36, letterSpacing: '-0.03em', fontFamily: PP, whiteSpace: 'pre-line' }}>
          {'Made for the moments\nthat stay with you.'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }}
          style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontWeight: 300, maxWidth: 360, marginBottom: 16, fontFamily: PP }}>
          Thin, safe, and honest. On each of the six wrappers, a question — because the best moments always start with one.
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.28 }} viewport={{ once: true }}
          style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontWeight: 300, maxWidth: 360, marginBottom: 0, fontFamily: PP }}>
          Everything else we made as good as we possibly could — so you can forget about it and enjoy the rest.
        </motion.p>
        <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4 }} viewport={{ once: true }}>
          <Link href="/shop" style={{ display: 'inline-block', marginTop: 36, fontSize: 10, letterSpacing: '0.45em', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none', fontFamily: PP, borderBottom: '1px solid rgba(26,26,26,0.25)', paddingBottom: 4 }}>
            SEE IT →
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <img src="/couples-joy.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
      </motion.div>
    </section>
  )
}


function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }
  return (
    <section style={{ padding: '160px 40px', backgroundColor: '#1A1A1A', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
          <Logo color="#ffffff" size={44} />
        </motion.div>
        <h2 style={{ marginTop: 36, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, maxWidth: 560, margin: '36px auto 20px', fontFamily: PP, letterSpacing: '-0.02em' }}>
          First access to the founding collection.
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.4, maxWidth: 400, margin: '0 auto 56px', lineHeight: 1.85, fontWeight: 300, fontFamily: PP }}>
          The first PeakPlant collection is limited. Leave your email and we'll reach out personally before anything goes public.
        </p>
        {status === 'success' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 11, letterSpacing: '0.45em', color: '#ffffff', opacity: 0.6, fontFamily: PP }}>
            LOVELY. WE'LL BE IN TOUCH.
          </motion.p>
        ) : (
          <form onSubmit={submit} style={{ display: 'inline-flex', maxWidth: 460, width: '100%', border: '1px solid rgba(255,255,255,0.22)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              style={{ flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#ffffff' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 28px', backgroundColor: '#ffffff', color: '#1A1A1A', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, fontWeight: 500 }}>
              {status === 'loading' ? '...' : 'JOIN'}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ marginTop: 12, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
      </motion.div>
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
      <div style={{ display: 'flex', gap: 32 }}>
        {['Intimacy', 'Philosophy', 'Shop', 'Journal', 'Community'].map(item => (
          <Link key={item} href={`/${item.toLowerCase()}`} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.35 }}>
            {item.toUpperCase()}
          </Link>
        ))}
      </div>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#ffffff', opacity: 0.22, fontFamily: PP }}>© 2025 PEAKPLANT</p>
    </footer>
  )
}

export default function Home() {
  return (
    <main style={{ backgroundColor: '#ffffff', fontFamily: PP }}>
      <ScrollBar />
      <Nav />
      <CouplesHero />
      <Product />
      <Waitlist />
      <Footer />
    </main>
  )
}
