'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { NavBar } from '../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function QuadPanel({ bgPosition, title, body }: { bgPosition: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'default',
        backgroundImage: 'url(/couples-bw.jpg)',
        backgroundSize: '200% 200%',
        backgroundPosition: bgPosition,
        filter: 'grayscale(1)',
      }}
    >
      <motion.div
        animate={{ opacity: hovered ? 0.62 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, background: '#000', pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', textAlign: 'center', pointerEvents: 'none' }}
      >
        <motion.p
          animate={{ y: hovered ? 0 : 20 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1rem, 1.6vw, 1.5rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1rem' }}
        >
          {title}
        </motion.p>
        <motion.p
          animate={{ y: hovered ? 0 : 24 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(0.75rem, 1vw, 0.9rem)', fontWeight: 300, color: 'rgba(255,255,255,0.75)', fontFamily: PP, lineHeight: 1.65, maxWidth: 280 }}
        >
          {body}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default function IntimacyPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <NavBar activePath="/intimacy" />

      {/* Cinematic hero */}
      <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
        <video autoPlay muted playsInline loop
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
          <source src="/film-shadows.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
        >
          <p style={{ fontFamily: PP, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 600, marginBottom: '0.75rem' }}>
            Intimacy is not a single moment.
          </p>
          <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
            Scroll to explore
          </p>
        </motion.div>
      </section>

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '10rem 2.5rem 5rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}
        >
          The four phases
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}
        >
          Intimacy is not a single moment.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', maxWidth: 580 }}
        >
          It is a landscape. You move through it at your own pace — from the quiet electricity of becoming aware of each other, through the courage of presence, into connection, and out into freedom. Every phase is worth being in.
        </motion.p>
      </section>

      {/* 2×2 photo grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '50vh 50vh' }}>
        {[
          { bgPosition: '0% 0%',     title: 'Softness is strength.',                      body: 'Vulnerability does not make you weak. It makes you real. And realness is what creates actual connection — the kind that stays with you.' },
          { bgPosition: '100% 0%',   title: 'Presence over performance.',                 body: 'Intimacy is not something to get right. It is a place you arrive at when both people feel safe enough to stop performing and start actually being there.' },
          { bgPosition: '0% 100%',   title: 'Wildness without safety is not freedom.',    body: 'True wildness — the kind that feels alive, not reckless — only becomes possible when psychological safety is already in the room.' },
          { bgPosition: '100% 100%', title: 'Your worth is not earned.',                  body: 'You do not have to perform to be worthy of love. You are already enough — and intimacy should feel that way.' },
        ].map((q, i) => <QuadPanel key={i} bgPosition={q.bgPosition} title={q.title} body={q.body} />)}
      </div>

    </div>
  )
}
