'use client'
import { motion, useScroll } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { NavBar } from '../components/NavBar'

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
        <h1 style={{ fontFamily: PP, fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 540, margin: '0 auto 2rem' }}>
          when did life start feeling this fast?
        </h1>
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
          style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontWeight: 300, maxWidth: 360, marginBottom: 0, fontFamily: PP }}>
          6 condoms. 1 question card. 1 seed paper card.<br />
          vegan · fair rubber latex · launching august 2026.
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
        <img src="/couples-joy.jpg" alt="couple sharing a tender moment together" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
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
          <Logo color="#ffffff" size={44} />
        </motion.div>
        <h2 style={{ marginTop: 36, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, maxWidth: 560, margin: '36px auto 20px', fontFamily: PP, letterSpacing: '-0.02em' }}>
          stay a little longer.
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.4, maxWidth: 400, margin: '0 auto 56px', lineHeight: 1.85, fontWeight: 300, fontFamily: PP }}>
          we'll find you when it's time. no noise before then.
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
          <form onSubmit={submit} style={{ display: 'inline-flex', maxWidth: 460, width: '100%', border: '1px solid rgba(255,255,255,0.22)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              style={{ flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#ffffff' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 28px', backgroundColor: '#ffffff', color: '#1A1A1A', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, fontWeight: 500 }}>
              {status === 'loading' ? '...' : 'stay close'}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ marginTop: 12, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
        {status !== 'success' && status !== 'duplicate' && (
          <p style={{ marginTop: 16, fontSize: 11, color: '#ffffff', opacity: 0.35, fontFamily: PP, lineHeight: 1.65 }}>
            mit der anmeldung stimmst du unserer{' '}
            <Link href="/datenschutz" style={{ color: '#ffffff', opacity: 0.6, textDecoration: 'underline' }}>datenschutzerklärung</Link>
            {' '}zu.
          </p>
        )}
      </motion.div>
    </section>
  )
}

const questions = [
  { n: '01', q: "what's your favorite memory of us?" },
  { n: '02', q: 'when did you know?' },
  { n: '03', q: 'what do you want to remember about tonight?' },
  { n: '04', q: 'go for a walk. no destination. just talk.' },
  { n: '05', q: 'who would you be without me?' },
  { n: '06', q: 'how would you describe me — without age, job, family or hobbies?' },
]

function SixQuestions() {
  return (
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #ebebeb', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem', fontFamily: PP }}>
          edition 01
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '5rem', fontFamily: PP }}>
          six questions. one box.
        </motion.h2>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #ebebeb' }}>
          {questions.map(({ n, q }, i) => (
            <motion.div key={n}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'baseline', gap: '2.5rem', padding: '2rem 0', borderBottom: '1px solid #ebebeb' }}>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.25, fontFamily: PP, minWidth: 24 }}>{n}</span>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 300, letterSpacing: '-0.01em', fontStyle: 'italic', color: '#1A1A1A', fontFamily: PP }}>
                "{q}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const quotes = [
    { text: "we hadn't talked like that in years. not because we didn't want to — we just didn't know how to start.", author: '— beta tester, stuttgart' },
    { text: "i'm definitely part of the hook-up culture. but moments of real intimacy are just beautiful. we always talk after. now we can collect these moments and remember them. i didn't know this could bring us even closer together.", author: '— beta tester, münchen' },
  ]
  return (
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #ebebeb', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem' }}>
        {quotes.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontFamily: PP, fontSize: '1.4rem', color: '#C9A96E', lineHeight: 1 }}>∧</span>
            <p style={{ fontFamily: PP, fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.7, color: '#1A1A1A' }}>"{q.text}"</p>
            <p style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.4, fontWeight: 300 }}>{q.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function EditionCard01() {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', overflow: 'hidden', minHeight: 280, border: '1px solid rgba(255,255,255,0.12)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/edition-01/card-01.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#C9A96E', fontSize: '1rem', lineHeight: 1 }}>∧</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: PP, fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)', fontWeight: 300, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem', opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          "when did you know?"
        </p>
        <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.01em' }}>edition 01 — sommer 2026</span>
      </div>
    </motion.div>
  )
}

function EditionSystem() {
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '4rem', maxWidth: 560, fontFamily: PP }}>
          every edition. a different world.
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
          <EditionCard01 />
          {[{ label: 'edition 02 — herbst 2026' }, { label: 'edition 03 — winter 2026' }].map(({ label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: (i + 1) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', overflow: 'hidden', minHeight: 280, border: '1px solid rgba(255,255,255,0.07)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.35 }}
            >
              <div>
                <span style={{ color: '#C9A96E', fontSize: '1rem', lineHeight: 1 }}>∧</span>
              </div>
              <div>
                <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.2em', color: '#ffffff', opacity: 0.5, marginBottom: '0.75rem', textTransform: 'uppercase' }}>coming soon</p>
                <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.01em' }}>{label}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: '0.95rem', color: '#ffffff', opacity: 0.45, lineHeight: 1.75, fontWeight: 300, maxWidth: 480, fontFamily: PP, whiteSpace: 'pre-line' }}>
          {'same box outside. different world inside.\neach edition: new cards, new questions, new digital world.'}
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
        {['Intimacy', 'Philosophy', 'Shop', 'Community'].map(item => (
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
      <CouplesHero />
      <Product />
      <SixQuestions />
      <Testimonials />
      <Waitlist />
      <EditionSystem />
      <Footer />
    </main>
  )
}
