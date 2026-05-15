'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const voices = [
  {
    quote: 'I gave one to my partner before our anniversary dinner. We ended up talking for three hours before we even got to the restaurant.',
    initials: 'L.M.',
    location: 'Berlin',
  },
  {
    quote: 'The question on the wrapper was better than anything I could have thought to ask. It opened something we hadn\'t talked about in years.',
    initials: 'J.K.',
    location: 'Amsterdam',
  },
  {
    quote: 'Finally something that doesn\'t feel clinical. Like someone thought about the whole evening, not just the product.',
    initials: 'S.R.',
    location: 'Vienna',
  },
  {
    quote: 'We keep the wrappers. There\'s something about them — the question stays in the room.',
    initials: 'A.W.',
    location: 'Zurich',
  },
  {
    quote: 'It made us both laugh, then it made us both honest. That combination is rare.',
    initials: 'T.B.',
    location: 'London',
  },
  {
    quote: 'The packaging alone was worth it. Left it on the nightstand and felt good about it.',
    initials: 'R.F.',
    location: 'Paris',
  },
]

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setSent(true)
    } finally {
      setLoading(false)
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
        {sent ? (
          <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7, textAlign: 'center' }}>
            You're on the list. We'll be in touch soon.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>Join the community</p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              Be part of what PeakPlant is building — stories, conversations, early access.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <button
                type="submit" disabled={loading}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                {loading ? 'Sending…' : 'Join'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function CommunityPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <Logo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '10rem', paddingBottom: '5rem', maxWidth: 800, margin: '0 auto', padding: '10rem 2.5rem 5rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}
        >
          Community
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}
        >
          People who believe that closeness is worth celebrating.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', maxWidth: 560 }}
        >
          PeakPlant is more than a product. It's a gathering place for people who take intimacy seriously — as something worth paying attention to, talking about, and doing well.
        </motion.p>
      </section>

      {/* Voices */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}
        >
          What people are saying
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
          {voices.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '2rem', border: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <p style={{ fontSize: '1rem', lineHeight: 1.75, fontWeight: 300, fontStyle: 'italic', color: '#333', flexGrow: 1 }}>
                "{v.quote}"
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{v.initials}</span>
                </div>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.08em', opacity: 0.55 }}>{v.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What to expect */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}>What you'll get</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                ['Early access', 'Be the first to experience new products, editions, and collaborations before anyone else.'],
                ['The Letter', 'A monthly piece about intimacy, desire, connection, and everything that lives in between.'],
                ['Community conversations', 'A private space for people who want to talk about closeness without performance or pretence.'],
              ].map(([title, body]) => (
                <div key={title} style={{ paddingTop: '1.5rem', borderTop: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.6rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#666' }}>{body}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ padding: '3rem', border: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 300, lineHeight: 1.3, letterSpacing: '-0.015em' }}>
              Grow where you feel most alive.
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>
              Join a community built around the belief that intimacy is one of the most important parts of a life well lived.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              Join the community
            </button>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>

    </div>
  )
}
