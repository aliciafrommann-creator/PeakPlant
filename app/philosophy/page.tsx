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
          <ParallaxImage src="/philosophy-hero.jpg" alt="Natural light, soft textures" />
        </motion.div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 2.5rem 7rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            For a long time, I tied my self-worth to external performance — achievement, ambition, being enough. I was successful on the outside and not fully free on the inside. Through reflection, vulnerability work, and emotional honesty, I slowly began to understand how deeply the systems surrounding us shape our relationships, our intimacy, and our sense of worth.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            The more I worked on my own mental models, the more intimacy changed too. It became safe, deep, growing — something built between two people rather than performed for each other. That transformation did not only affect romantic relationships. It changed friendships, communication, and the way I moved through the world itself.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            PeakPlant exists because more people deserve to experience that kind of connection. Not the performance of it. The actual thing.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            You do not have to perform to be worthy of love. That is not a slogan. It is the center of everything we build.
          </p>
        </motion.div>
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
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '1rem' }}>{b.number}</p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem' }}>{b.title}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{b.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '5rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '0.75rem 0', marginBottom: '0.5rem', borderBottom: '1px solid #e8e8e8' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, fontFamily: PP }}>Before</p>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, fontFamily: PP, width: 40 }}></p>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, fontFamily: PP }}>After</p>
          </div>
          {[
            ['Performance', 'Presence'],
            ['External validation', 'Self-worth'],
            ['Emotional armor', 'Vulnerability'],
            ['Fear', 'Trust'],
            ['Disconnection', 'Deep connection'],
            ['Shame', 'Openness'],
          ].map(([before, after], i) => {
            const [hovered, setHovered] = useState(false)
            return (
              <motion.div
                key={before}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '1.4rem 0', borderBottom: '1px solid #e8e8e8', cursor: 'default' }}
              >
                <motion.p
                  animate={{ opacity: hovered ? 0.25 : 0.55, x: hovered ? -6 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', fontWeight: 300, fontFamily: PP, position: 'relative' }}
                >
                  {before}
                  <motion.span
                    animate={{ scaleX: hovered ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: '#1A1A1A', opacity: 0.3, transformOrigin: 'left' }}
                  />
                </motion.p>

                <motion.div
                  animate={{ opacity: hovered ? 1 : 0.15, scaleX: hovered ? 1 : 0.5 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: 40, display: 'flex', justifyContent: 'center' }}
                >
                  <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                    <path d="M0 4h18M14 1l4 3-4 3" stroke="#1A1A1A" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>

                <motion.p
                  animate={{ opacity: hovered ? 1 : 0.4, x: hovered ? 6 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', fontWeight: hovered ? 400 : 300, fontFamily: PP, letterSpacing: '-0.01em' }}
                >
                  {after}
                </motion.p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 640, margin: '0 auto', letterSpacing: '-0.015em' }}
        >
          Safe. Soft. Wild — in that order, and at the same time.
        </motion.p>
      </section>

    </div>
  )
}
