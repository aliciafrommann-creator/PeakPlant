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

function JoinModal({ onClose }: { onClose: () => void }) {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: '#ffffff', border: '1px solid #1A1A1A', padding: '3rem', maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}>
        {sent ? (
          <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7, textAlign: 'center' }}>
            You're in. First event invite is on its way.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>Join the inner circle</p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              Events, early drops, and the people building this with us. Leave your email — we'll take it from there.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }} />
              <button type="submit" disabled={loading}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {loading ? 'Sending…' : 'Join'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

const communityValues = [
  { label: 'Emotional honesty over performance', body: 'This is a space for people who are done pretending. The conversations here are real — about relationships, vulnerability, and what it actually takes to feel connected.' },
  { label: 'Depth, not content', body: 'We are not building a feed. We are building slow, intentional touchpoints — events, letters, questions — that leave something behind.' },
  { label: 'Warmth over exclusivity', body: 'The community is small on purpose. Not because it is elite. Because intimacy does not scale. You cannot have depth at volume.' },
  { label: 'Becoming, not performing', body: 'Nobody here has it figured out. We are all exploring this together — what safety feels like, what wildness means, what kind of love we want to build.' },
]

const whatYouGet = [
  {
    label: 'Events',
    body: 'Real gatherings — not webinars. We host intimate moments, pop-ups, and seasonal gatherings for people in the community. Think run club energy, but for the people who care about how they show up in relationships.',
  },
  {
    label: 'First access to new drops',
    body: 'Every new collection — love language editions, event boxes, collabs — goes to community members first. Limited runs. Personal reach-outs. No mass marketing.',
  },
  {
    label: 'The Letter',
    body: 'A monthly piece on intimacy, emotional safety, and the systems shaping how we love. Personal and slow — written like a letter from someone who thinks deeply about this stuff.',
  },
  {
    label: 'The inner circle',
    body: 'The people in this community are building something together. Early feedback on new products, input on future collections, and access to conversations that don\'t happen in public.',
  },
]

export default function CommunityPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}><Logo size={32} /></Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '10rem 2.5rem 7rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}>
          Community
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
          A run club for people who take intimacy seriously.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', maxWidth: 580, marginBottom: '3rem' }}>
          Running every week is good. A run club is something else entirely. PeakPlant community is not a newsletter or a feed — it is a group of people who show up, meet in real life, and build something together around how we love and connect.
        </motion.p>
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }}
          onClick={() => setModalOpen(true)}
          style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Join the inner circle
        </motion.button>
      </section>

      {/* What you get */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}>
          What you become part of
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem 5rem' }}>
          {whatYouGet.map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }} style={{ cursor: 'default' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '1rem' }}>0{i + 1}</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem' }}>{item.label}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Voices */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}>
          What this community believes
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem 5rem' }}>
          {communityValues.map((v, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }} style={{ cursor: 'default' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '1rem' }}>0{i + 1}</p>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem', lineHeight: 1.3 }}>{v.label}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '8rem 2.5rem', textAlign: 'center', background: '#1A1A1A' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
          <Logo size={40} />
          <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, lineHeight: 1.45, letterSpacing: '-0.015em', color: '#ffffff' }}>
            The community is small on purpose. There are no ads, no algorithm, no noise. Just people who want to do this differently.
          </p>
          <button onClick={() => setModalOpen(true)}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', background: 'transparent', cursor: 'pointer' }}>
            Join the inner circle
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {modalOpen && <JoinModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
