'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { NavBar } from '../../components/NavBar'
import { useIsMobile } from '../../hooks/useIsMobile'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

type Product = 'pack_3' | 'founders' | 'pack_12'

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

function ReserveModal({ onClose, product }: { onClose: () => void; product: Product }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, product }) })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
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
        style={{ position: 'relative', background: '#ffffff', border: '1px solid #1A1A1A', padding: '3rem', maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="close" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', opacity: 0.35, color: '#1A1A1A', lineHeight: 1 }}>×</button>
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7 }}>
              your spot is reserved. check your inbox — your sneak peek into the digital world is waiting, and the invoice follows.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>reserve &amp; pay by invoice</p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              no payment now. we&apos;ll send you an invoice you can settle anytime before edition 01 ships — and you get into the digital world immediately.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="your name"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <button type="submit" disabled={status === 'loading'}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {status === 'loading' ? '...' : 'reserve my spot'}
              </button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#1A1A1A', opacity: 0.4, lineHeight: 1.6, fontFamily: PP }}>
              by reserving you agree to our{' '}
              <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>privacy policy</Link>.
            </p>
            {status === 'error' && <p style={{ marginTop: 8, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

const pricingRows = [
  { label: 'price',         pack3: '5€',        founders: '7,90€',    pack12: '13,90€'  },
  { label: 'condoms',       pack3: '3',          founders: '6',        pack12: '12'       },
  { label: 'question card', pack3: '1 of ten',   founders: '1 of ten', pack12: '2 of ten' },
  { label: 'surprise card', pack3: 'a chance',   founders: 'a chance', pack12: 'a chance' },
  { label: 'shipping',      pack3: 'included',   founders: 'included', pack12: 'included' },
  { label: 'digital world', pack3: '✓',          founders: '✓',        pack12: '✓'        },
]

export default function ShopPage() {
  const [reserveProduct, setReserveProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<Product | null>(null)
  const isMobile = useIsMobile()

  async function startCheckout(product: Product) {
    setLoading(product)
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product }) })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
      else { setReserveProduct(product); setLoading(null) }
    } catch { setReserveProduct(product); setLoading(null) }
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
          <p style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>
            from 5€ · includes shipping · ships mid-august 2026
          </p>
          <button
            disabled={loading === 'founders'}
            style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => startCheckout('founders')}>
            {loading === 'founders' ? '...' : 'preorder now →'}
          </button>
        </motion.div>
      </section>

      {/* Product 1 — 6er / Founders Edition */}
      <section style={{ borderTop: '1px solid #e8e8e8', maxWidth: 1100, margin: '0 auto', padding: '7rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ aspectRatio: '1/1', background: '#f5f5f5', overflow: 'hidden' }}>
            <ParallaxImage src="/product-box.jpg" alt="PeakPlant founders edition" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>
                edition 01 — sommer 2026
              </p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                founders edition
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                '6 condoms — vegan, fair rubber latex',
                '1 question card — one of ten to collect this edition, blauer engel certified',
                '1 seed paper card with QR to digital world',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3, minWidth: 8 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.6rem', fontFamily: PP }}>the digital world</p>
              <p style={{ fontSize: '0.82rem', color: '#777', fontWeight: 300, lineHeight: 1.7, fontFamily: PP }}>
                curated spotify playlists · templates to download · podcast and founder insights · community events · one free workshop per edition
              </p>
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: 300, letterSpacing: '-0.01em' }}>7,90€</p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.4 }}>incl. shipping</p>
            </div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
              preorder · ships mid-august 2026 · refundable anytime
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
              <button onClick={() => startCheckout('founders')} disabled={loading === 'founders'}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                {loading === 'founders' ? '...' : 'preorder now — 7,90€'}
              </button>
              <button onClick={() => setReserveProduct('founders')}
                style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.08em', background: 'none', border: 'none', color: '#1A1A1A', opacity: 0.5, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                or reserve &amp; pay by invoice later
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products — 3er and 12er */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '3rem' }}>
            also available
          </motion.p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>

            {/* 3er pack */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ border: '1px solid #e8e8e8', padding: '2.5rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>3er pack</p>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.2 }}>three condoms.<br />one card.</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  '3 condoms — vegan, fair rubber latex',
                  '1 question card — one of ten to collect',
                  '1 seed paper card with QR to digital world',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.6rem', opacity: 0.3, minWidth: 8 }}>—</span>
                    <p style={{ fontSize: '0.88rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.25rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '-0.01em' }}>5€</p>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.4 }}>incl. shipping</p>
              </div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
                preorder · ships mid-august 2026
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
                <button onClick={() => startCheckout('pack_3')} disabled={loading === 'pack_3'}
                  style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.9rem 1.75rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {loading === 'pack_3' ? '...' : 'preorder — 5€'}
                </button>
                <button onClick={() => setReserveProduct('pack_3')}
                  style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.08em', background: 'none', border: 'none', color: '#1A1A1A', opacity: 0.5, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  or pay by invoice
                </button>
              </div>
            </motion.div>

            {/* 12er pack */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{ border: '1px solid #e8e8e8', padding: '2.5rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>12er pack</p>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.2 }}>twelve condoms.<br />two cards.</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  '12 condoms — vegan, fair rubber latex',
                  '2 question cards — two of ten to collect',
                  '1 seed paper card with QR to digital world',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.6rem', opacity: 0.3, minWidth: 8 }}>—</span>
                    <p style={{ fontSize: '0.88rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.25rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '-0.01em' }}>13,90€</p>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.4 }}>incl. shipping</p>
              </div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
                preorder · ships mid-august 2026
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
                <button onClick={() => startCheckout('pack_12')} disabled={loading === 'pack_12'}
                  style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.9rem 1.75rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {loading === 'pack_12' ? '...' : 'preorder — 13,90€'}
                </button>
                <button onClick={() => setReserveProduct('pack_12')}
                  style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.08em', background: 'none', border: 'none', color: '#1A1A1A', opacity: 0.5, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  or pay by invoice
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '3rem' }}>
          compare
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 520 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '1px solid #1A1A1A', paddingBottom: '1rem' }}>
              <div />
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>3er pack</p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>6er · founders</p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>12er pack</p>
            </div>
            {pricingRows.map(({ label, pack3, founders, pack12 }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '1.1rem 0', borderBottom: '1px solid #ebebeb' }}>
                <p style={{ fontSize: '0.8rem', letterSpacing: '0.06em', opacity: 0.5, textTransform: 'lowercase' }}>{label}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{pack3}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{founders}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{pack12}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Questions */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>
          edition 01 — the questions
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }}
          style={{ fontSize: '0.95rem', fontWeight: 300, color: '#777', lineHeight: 1.7, marginBottom: '3rem', maxWidth: 460 }}>
          ten questions per edition, one in every box. here&apos;s a taste of edition 01 — the rest unfold as you collect, and live forever in the digital world.
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '0' }}>
          {[
            "what's your favorite memory of us?",
            'when did you know?',
            'what do you want to remember about tonight?',
            'go for a walk. no destination. just talk.',
            'who would you be without me?',
            'how would you describe me — without age, job, family or hobbies?',
          ].map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              style={{ padding: '2rem', borderBottom: '1px solid #e8e8e8', borderRight: isMobile ? (i % 2 !== 1 ? '1px solid #e8e8e8' : 'none') : (i % 3 !== 2 ? '1px solid #e8e8e8' : 'none') }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.3, marginBottom: '0.75rem' }}>0{i + 1}</p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic', color: '#1A1A1A' }}>"{q}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collect + the surprise card */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.25rem' }}>collect them</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              ten questions. one per box.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8 }}>
              every edition runs three months and holds ten questions — a new card in every box.
              collect the set, then a new edition begins with ten you&apos;ve never seen.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.9, marginBottom: '1.25rem' }}>the surprise</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              twenty boxes hide more.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8 }}>
              twenty boxes per edition carry a special card. behind it: a free workshop, a little goodie,
              or your next box on us. you&apos;ll know the moment you open it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 300, lineHeight: 1.4, marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
            edition 01 is a preorder. be part of the first run.
          </p>
          <button onClick={() => startCheckout('founders')} disabled={loading === 'founders'}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading === 'founders' ? '...' : 'preorder now — 7,90€'}
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {reserveProduct && <ReserveModal onClose={() => setReserveProduct(null)} product={reserveProduct} />}
      </AnimatePresence>

      <footer style={{ padding: '48px 40px', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ color: '#ffffff', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, opacity: 0.55 }}>PEAKPLANT</span>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['impressum', '/impressum'], ['datenschutz', '/datenschutz'], ['agb', '/agb']].map(([label, href]) => (
            <Link key={href} href={href} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.25em', fontFamily: PP, textDecoration: 'none', opacity: 0.22 }}>{label}</Link>
          ))}
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#ffffff', opacity: 0.18, fontFamily: PP }}>© 2026 PEAKPLANT</p>
        </div>
      </footer>
    </div>
  )
}
