'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ color = '#1A1A1A', size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7 }}>
              You're on the founding list. We'll reach out personally before anything goes public.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>Reserve your spot</p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              The founding collection launches soon. Leave your email and you'll hear from us first — personally.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <button type="submit" disabled={loading}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Sending…' : 'Reserve'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

const collections = [
  {
    number: '01',
    name: 'The Founding Collection',
    tag: 'AVAILABLE SOON',
    description: 'Six condoms. Five love languages. One box. Each wrapper carries a question from a different love language — so every moment opens something different. The starting point for anyone who wants to discover what moves them.',
    note: 'Mixed Edition — All five love languages. Limited.',
    available: true,
  },
  {
    number: '02',
    name: 'Words of Affirmation',
    tag: 'COMING',
    description: 'For couples who know that language is everything. All six questions live in the world of words — what you say, what you hear, what you\'ve been afraid to ask for. The kind of conversation that starts in bed and doesn\'t stop.',
    note: 'Love Language Edition — Single',
    available: false,
  },
  {
    number: '03',
    name: 'Physical Touch',
    tag: 'COMING',
    description: 'Six questions built around the body — presence, sensation, closeness, and the kind of touch that communicates what words can\'t. For the people who feel most alive through contact.',
    note: 'Love Language Edition — Single',
    available: false,
  },
  {
    number: '04',
    name: 'Quality Time',
    tag: 'COMING',
    description: 'For the couples who feel most connected when nothing else is competing for attention. Questions about presence, slowness, and what it means to truly be somewhere together.',
    note: 'Love Language Edition — Single',
    available: false,
  },
  {
    number: '05',
    name: 'Acts of Service',
    tag: 'COMING',
    description: 'Love shown through action — care, attention, the small decisions that say "I see you." Questions that bring that language into the most intimate moments.',
    note: 'Love Language Edition — Single',
    available: false,
  },
  {
    number: '06',
    name: 'Receiving Gifts',
    tag: 'COMING',
    description: 'Designed to be given. The most thoughtful thing you can bring to a moment is intention — this box makes it visible. For someone who feels love through the care behind a gesture.',
    note: 'Love Language Edition — Single',
    available: false,
  },
]

export default function ShopPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <Logo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal'], ['/community', 'Community']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/shop' ? 1 : 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero — full-viewport wildness film */}
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
          <p style={{ fontFamily: PP, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 600, marginBottom: '2.5rem' }}>
            Not just a product.<br />A decision to feel.
          </p>
          <button
            style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setModalOpen(true)}>
            Reserve yours →
          </button>
        </motion.div>
      </section>

      {/* Collections */}
      <section style={{ borderTop: '1px solid #e8e8e8', maxWidth: 1100, margin: '0 auto', padding: '6rem 2.5rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}>
          All collections
        </motion.p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {collections.map((c, i) => (
            <motion.div key={c.number}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', alignItems: 'start', gap: '3rem', padding: '2.5rem 0', borderBottom: '1px solid #e8e8e8', opacity: c.available ? 1 : 0.5 }}>
              <div>
                <p style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4 }}>{c.number}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 300, letterSpacing: '-0.01em' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', border: '1px solid #1A1A1A', opacity: c.available ? 1 : 0.4 }}>{c.tag}</span>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#666', maxWidth: 560 }}>{c.description}</p>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4 }}>{c.note}</p>
              </div>
              <div style={{ paddingTop: '0.25rem' }}>
                {c.available ? (
                  <button onClick={() => setModalOpen(true)}
                    style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.75rem 1.5rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Reserve
                  </button>
                ) : (
                  <button onClick={() => setModalOpen(true)}
                    style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.75rem 1.5rem', background: 'transparent', color: '#1A1A1A', border: '1px solid rgba(26,26,26,0.3)', cursor: 'pointer', whiteSpace: 'nowrap', opacity: 0.55 }}>
                    Notify me
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Wrapper Questions */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>
          The questions on every wrapper
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555', maxWidth: 560, marginBottom: '4rem' }}>
          Each condom wrapper carries one question. Small enough to miss. Quiet enough to stay with you. The kind that slows a moment down.
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
          {[
            'Tell me something you\'ve never said out loud.',
            'When do you feel most yourself?',
            'What kind of love are you afraid of?',
            'What do you want more of in life?',
            'Where do you feel safest?',
            'What memory still lives in your body?',
            'What would freedom look like for you?',
            'What are you slowly growing into?',
            'What do you wish people understood about you?',
          ].map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              style={{ padding: '2rem 2rem', borderBottom: '1px solid #e8e8e8', borderRight: i % 3 !== 2 ? '1px solid #e8e8e8' : 'none' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.3, marginBottom: '0.75rem' }}>0{i + 1}</p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic', color: '#1A1A1A' }}>"{q}"</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subscription */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#f9f9f9', padding: '6rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>Monthly subscription</p>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)', fontWeight: 300, lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                A different love language. Every month.
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555', marginBottom: '1rem' }}>
                Start with the Founding Collection to discover all five. Then, each month, go deeper into one — a full box of six questions living entirely in that language.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555', marginBottom: '2.5rem' }}>
                Five months. Five love languages. Or take your time — every two months, at your own pace. Either way, it becomes a ritual. A regular reason to go deeper.
              </p>
              <button onClick={() => {}} style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 2rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', cursor: 'default', opacity: 0.4 }}>
                Subscription coming soon
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {['Words of Affirmation', 'Physical Touch', 'Quality Time', 'Acts of Service', 'Receiving Gifts'].map((lang, i) => (
                <motion.div key={lang}
                  initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.2rem 0', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.3, minWidth: 24 }}>0{i + 1}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 300, color: '#1A1A1A' }}>{lang}</span>
                  {i === 0 && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.25rem 0.7rem', border: '1px solid #1A1A1A', opacity: 0.35 }}>Month 1</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's inside */}
      <section style={{ padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center', borderTop: '1px solid #e8e8e8' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>What's inside</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 300, lineHeight: 1.3, marginBottom: '1.5rem', letterSpacing: '-0.015em' }}>
            Everything you need. Nothing that gets in the way.
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555', marginBottom: '1.5rem' }}>
            Ultra-thin latex. Silicone lubricant. Clean, minimal packaging. A question on every wrapper.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555' }}>
            Each box is a complete set — six moments, six conversations. Designed to feel as good to hold as it does to open.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ aspectRatio: '1/1', background: '#f5f5f5', overflow: 'hidden' }}>
          <ParallaxImage src="/product-box.jpg" alt="PeakPlant founding collection" objectPosition="center center" />
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 300, lineHeight: 1.4, marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
            The founding collection is limited. Be there when it opens.
          </p>
          <button onClick={() => setModalOpen(true)}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', cursor: 'pointer' }}>
            Reserve founding access
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
