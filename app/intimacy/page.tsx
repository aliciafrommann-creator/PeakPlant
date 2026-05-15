'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <motion.img src={src} alt={alt} style={{ width: '100%', height: '115%', objectFit: 'cover', y }} />
    </div>
  )
}

const phases = [
  {
    number: '01',
    name: 'Distance',
    headline: 'The space between two people is not empty.',
    body: 'It holds everything that hasn\'t been said yet. Anticipation. Curiosity. The quiet awareness that someone else is in the room — and that they matter to you.',
    image: '/intimacy-distance.jpg',
  },
  {
    number: '02',
    name: 'Presence',
    headline: 'To be seen is already an act of courage.',
    body: 'Presence is the moment you stop performing and start actually being there. No script. No right answer. Just two people, paying attention to each other.',
    image: '/intimacy-presence.jpg',
  },
  {
    number: '03',
    name: 'Intimacy',
    headline: 'Closeness is something you build together.',
    body: 'Not a destination but a feeling — warm, unhurried, honest. Intimacy happens when safety and desire arrive in the same room at the same time.',
    image: '/intimacy-intimacy.jpg',
  },
  {
    number: '04',
    name: 'Wildness',
    headline: 'Joy is allowed to be big.',
    body: 'Wildness is not recklessness. It\'s full permission — to want, to play, to feel alive. The best moments of connection are the ones where nothing had to be held back.',
    image: '/intimacy-wildness.jpg',
  },
]

export default function IntimacyPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <Logo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/intimacy' ? 1 : 0.5 }}>
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
          The four phases
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}
        >
          Intimacy isn't a single moment.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', maxWidth: 580 }}
        >
          It's a landscape. You move through it at your own pace — with curiosity, care, and the freedom to go where you actually want to go.
        </motion.p>
      </section>

      {/* Phases */}
      {phases.map((phase, i) => (
        <section
          key={phase.number}
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '4rem 2.5rem',
            display: 'grid',
            gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
            gap: '5rem',
            alignItems: 'center',
            borderTop: '1px solid #e8e8e8',
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ order: i % 2 === 0 ? 0 : 1, aspectRatio: '4/3', background: '#f5f5f5', overflow: 'hidden' }}
          >
            <ParallaxImage src={phase.image} alt={phase.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ order: i % 2 === 0 ? 1 : 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35 }}>{phase.number}</p>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>{phase.name}</p>
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 300, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
              {phase.headline}
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555' }}>
              {phase.body}
            </p>
          </motion.div>
        </section>
      ))}

      {/* Closing */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}
        >
          <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, lineHeight: 1.45, letterSpacing: '-0.015em' }}>
            Every phase is worth being in.
          </p>
          <Link
            href="/shop"
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', border: '1px solid #1A1A1A', color: '#1A1A1A', textDecoration: 'none' }}
          >
            Explore the collection
          </Link>
        </motion.div>
      </section>

    </div>
  )
}
