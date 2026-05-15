'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

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

const pairs = [
  ['Performance', 'Presence'],
  ['External validation', 'Self-worth'],
  ['Emotional armor', 'Vulnerability'],
  ['Fear', 'Trust'],
  ['Disconnection', 'Deep connection'],
  ['Shame', 'Openness'],
]

function TransformRow({ before, after, index }: { before: string; after: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'center', padding: '2rem 1rem', borderBottom: '1px solid #ebebeb', cursor: 'default', position: 'relative' }}
    >
      {/* subtle row highlight */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, background: '#f8f8f8', zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Before */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.p
          animate={{ opacity: hovered ? 0.15 : 0.6, x: hovered ? -10 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)', fontWeight: 300, fontFamily: PP, letterSpacing: '-0.01em', position: 'relative', display: 'inline-block' }}
        >
          {before}
          <motion.span
            animate={{ scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', top: '52%', left: 0, right: 0, height: '1.5px', background: '#1A1A1A', opacity: 0.55, transformOrigin: 'left', display: 'block' }}
          />
        </motion.p>
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
        <motion.svg
          width="32" height="14" viewBox="0 0 32 14" fill="none"
          animate={{ opacity: hovered ? 1 : 0.12, x: hovered ? 5 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <path d="M0 7h28M22 2.5l6 4.5-6 4.5" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </div>

      {/* After */}
      <motion.p
        animate={{ opacity: hovered ? 1 : 0.6, x: hovered ? 0 : 8, color: hovered ? '#1A1A1A' : '#666' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)', fontWeight: hovered ? 500 : 300, fontFamily: PP, letterSpacing: '-0.01em', zIndex: 1 }}
      >
        {after}
      </motion.p>
    </motion.div>
  )
}

function TransformTable() {
  return (
    <section style={{ borderTop: '1px solid #e8e8e8', padding: '5rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', padding: '0 0 1rem', marginBottom: '0.25rem' }}>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.3, fontFamily: PP }}>Before</p>
        <div />
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.3, fontFamily: PP }}>After</p>
      </div>
      {pairs.map(([before, after], i) => (
        <TransformRow key={before} before={before} after={after} index={i} />
      ))}
    </section>
  )
}

const beliefs = [
  {
    number: '01',
    title: 'Softness is strength.',
    body: 'Vulnerability does not make you weak. It makes you real. And realness is what creates actual connection — the kind that stays with you.',
  },
  {
    number: '02',
    title: 'Presence over performance.',
    body: 'Intimacy is not something to get right. It is a place you arrive at when both people feel safe enough to stop performing and start actually being there.',
  },
  {
    number: '03',
    title: 'Wildness without safety is not freedom.',
    body: 'True wildness — the kind that feels alive, not reckless — only becomes possible when psychological safety is already in the room.',
  },
  {
    number: '04',
    title: 'Your worth is not earned.',
    body: 'You do not have to perform to be worthy of love. You do not have to become more, look different, or get it right. You are already enough — and intimacy should feel that way.',
  },
]

export default function PhilosophyPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <Logo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/philosophy' ? 1 : 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <section style={{ paddingTop: '10rem', paddingBottom: '6rem', maxWidth: 800, margin: '0 auto', padding: '10rem 2.5rem 6rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}
        >
          Our philosophy
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}
        >
          Grow where you feel most alive.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.15rem', lineHeight: 1.85, color: '#444', maxWidth: 620 }}
        >
          We only have one life to live. And modern society keeps teaching us to spend it performing — for status, for desirability, for validation. PeakPlant exists to intervene in that system. We believe intimacy has the power to reconnect people: to themselves, to others, and to the emotional depth of being human.
        </motion.p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem 6rem', height: '55vh', overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ParallaxImage src="/bw-grid-2.png" alt="Natural light, soft textures" />
        </motion.div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 2.5rem 7rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        {[
          'For a long time, I tied my self-worth to external performance — achievement, ambition, being enough. I was successful on the outside and not fully free on the inside. Through reflection, vulnerability work, and emotional honesty, I slowly began to understand how deeply the systems surrounding us shape our relationships, our intimacy, and our sense of worth.',
          'The more I worked on my own mental models, the more intimacy changed too. It became safe, deep, growing — something built between two people rather than performed for each other. That transformation did not only affect romantic relationships. It changed friendships, communication, and the way I moved through the world itself.',
          'PeakPlant exists because more people deserve to experience that kind of connection. Not the performance of it. The actual thing.',
          'You do not have to perform to be worthy of love. That is not a slogan. It is the center of everything we build.',
        ].map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '1.05rem', lineHeight: 1.85, color: i === 3 ? '#1A1A1A' : '#444', fontWeight: i === 3 ? 400 : 300 }}
          >
            {text}
          </motion.p>
        ))}
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}
        >
          What we believe
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem 5rem' }}>
          {beliefs.map((b, i) => (
            <motion.div
              key={b.number}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              style={{ cursor: 'default' }}
            >
              <motion.p
                initial={{ opacity: 0.35 }} whileHover={{ opacity: 0.7 }} transition={{ duration: 0.3 }}
                style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}
              >{b.number}</motion.p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem' }}>{b.title}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{b.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <TransformTable />

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 640, margin: '0 auto', letterSpacing: '-0.015em' }}
        >
          Grow where you feel most alive.
        </motion.p>
      </section>

    </div>
  )
}
