'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { NavBar } from '../../components/NavBar'
import { QuestionsTeaser } from '../../components/QuestionsTeaser'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function ParallaxImage({ src, alt, objectPosition = 'center' }: { src: string; alt: string; objectPosition?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <motion.img src={src} alt={alt} style={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition, y }} />
    </div>
  )
}

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'shop' }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } finally {
      if (status === 'loading') setStatus('error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: '#ffffff', border: '1px solid #1A1A1A', padding: '3rem', maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7 }}>
              we'll find you when it's time.
            </p>
          </div>
        ) : status === 'duplicate' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7, opacity: 0.6 }}>
              you're already on the list.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>join waitlist</p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              edition 01 ships mid-august 2026. leave your email and you'll hear from us first — personally.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <button type="submit" disabled={status === 'loading'}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {status === 'loading' ? '...' : 'join waitlist'}
              </button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#1A1A1A', opacity: 0.4, lineHeight: 1.6, fontFamily: PP }}>
              mit der anmeldung stimmst du unserer{' '}
              <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>datenschutzerklärung</Link>{' '}zu.
            </p>
            {status === 'error' && <p style={{ marginTop: 8, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

const pricingRows = [
  { label: 'price',          founders: '7,99€ incl. shipping', sub: '27€ + 12,90€/mo' },
  { label: 'condoms',        founders: '6',                     sub: '6 / month' },
  { label: 'question card',  founders: '1 card · 6 questions',  sub: '1 / month' },
  { label: 'digital world',  founders: '✓ (sneak peek)',        sub: '✓' },
  { label: 'archive booklet',founders: '—',                     sub: 'month 3' },
  { label: 'cancel anytime', founders: 'full refund',           sub: '✓' },
]

export default function ShopPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

  async function startCheckout(product: 'founders' | 'subscription') {
    setCheckingOut(product)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      // checkout not configured yet → fall back to waitlist
      setModalOpen(true)
    } catch {
      setModalOpen(true)
    } finally {
      setCheckingOut(null)
    }
  }

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <NavBar activePath="/shop" />

      {/* Hero */}
      <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
        <video autoPlay muted playsInline loop
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
          <source src="/film-wildness.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
        >
          <p style={{ fontFamily: PP, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 600, marginBottom: '1rem' }}>
            Not just a product.<br />A decision to feel.
          </p>
          <p style={{ fontFamily: PP, fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2rem', letterSpacing: '0.04em' }}>
            7,99€ · includes shipping · preorder · launches mid-august 2026
          </p>
          <button
            disabled={checkingOut === 'founders'}
            style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => startCheckout('founders')}>
            {checkingOut === 'founders' ? '...' : 'preorder — 7,99€ →'}
          </button>
        </motion.div>
      </section>

      {/* Product 1 — Founders Edition */}
      <section style={{ borderTop: '1px solid #e8e8e8', maxWidth: 1100, margin: '0 auto', padding: '7rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ aspectRatio: '1/1', background: '#f5f5f5', overflow: 'hidden' }}>
            <ParallaxImage src="/product-box.jpg" alt="PeakPlant founders edition" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>
                edition 01 — sommer 2026 · einmalig
              </p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                founders edition
              </h2>
              <p style={{ fontFamily: PP, fontSize: '0.9rem', color: '#1A1A1A', opacity: 0.5, marginTop: '0.5rem', fontWeight: 300 }}>
                7,99€ · includes shipping · preorder · launches mid-august 2026
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                '6 condoms — vegan, fair rubber latex, sustainably produced',
                '1 question card — 6 questions to open up, blauer engel certified',
                'digital world — a sneak peek sent to your inbox after ordering',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3, minWidth: 8 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: 300, letterSpacing: '-0.01em' }}>7,99€</p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.4 }}>incl. shipping</p>
            </div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
              preorder now · ships mid-august 2026
            </p>
            <button onClick={() => startCheckout('founders')} disabled={checkingOut === 'founders'}
              style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
              {checkingOut === 'founders' ? '...' : 'vorbestellen — 7,99€'}
            </button>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontFamily: PP, fontSize: '0.78rem', color: '#1A1A1A', opacity: 0.35, marginTop: '3rem', fontStyle: 'italic' }}>
          edition 01 is a preorder. your card is charged now to reserve your box —
          and you're fully refunded, anytime, if anything's not right.
        </motion.p>
      </section>

      {/* Product 2 — Subscription */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>
                subscription · monatlich kündbar
              </p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                the ritual, monthly
              </h2>
              <p style={{ fontSize: '1rem', color: '#666', fontWeight: 300, marginTop: '0.5rem' }}>a new edition every month</p>
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1rem' }}>welcome box — once</p>
              {[
                'premium unboxing experience',
                'personal letter from alicia',
                'edition 01 box',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300 }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1rem' }}>then monthly</p>
              {[
                'new edition every month',
                'new cards, new questions, new digital world',
                'month 3: the archive booklet',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300 }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                27€ to start · then 12,90€/month · cancel anytime
              </p>
            </div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
              preorder now · ships mid-august 2026
            </p>
            <button onClick={() => startCheckout('subscription')} disabled={checkingOut === 'subscription'}
              style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', cursor: 'pointer', alignSelf: 'flex-start' }}>
              {checkingOut === 'subscription' ? '...' : 'abo starten — 27€'}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ aspectRatio: '1/1', background: '#f0f0f0', overflow: 'hidden' }}>
            <ParallaxImage src="/couples-rain.jpg" alt="the ritual" />
          </motion.div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '3rem' }}>
          compare
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #1A1A1A', paddingBottom: '1rem', marginBottom: '0' }}>
            <div />
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>founders edition</p>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>subscription</p>
          </div>
          {pricingRows.map(({ label, founders, sub }) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '1.1rem 0', borderBottom: '1px solid #ebebeb' }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.06em', opacity: 0.5, textTransform: 'lowercase' }}>{label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{founders}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{sub}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Wrapper Questions */}
      <div style={{ borderTop: '1px solid #e8e8e8' }}>
        <QuestionsTeaser intro="edition 01 — the questions" />
      </div>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 300, lineHeight: 1.4, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            preorder edition 01. step into the digital world today.
          </p>
          <p style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: '#777', marginBottom: '2.5rem', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            we collect preorders through the year, then produce to the highest
            sustainability standard. fully refundable, anytime — no risk to you.
          </p>
          <button onClick={() => startCheckout('founders')} disabled={checkingOut === 'founders'}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: '#1A1A1A', color: '#fff', border: '1px solid #1A1A1A', cursor: 'pointer' }}>
            {checkingOut === 'founders' ? '...' : 'preorder — 7,99€'}
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
