'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { NavBar } from '../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const paragraphs = [
  'for a long time, i measured myself by external performance. by what i achieved. by how much i optimized. i was successful on the outside, and not fully free on the inside.',
  'i studied systems thinking — how feedback loops, mental models, and cultural architecture shape behavior at scale. what i found was that loneliness and emotional disconnection are not personal failures. they are systemic outcomes.',
  'the systems we live inside were not designed to help us feel emotionally safe. they were designed to make us feel not enough. and most of us have internalized that so completely, we can no longer tell the difference between who we actually are and what the system trained us to perform.',
  'when i started working on my own mental models, intimacy changed too. it became safe. deep. growing. something built between two people instead of performed for each other.',
  'peakplant exists because more people deserve to experience that kind of connection. not the performance of it. the actual thing.',
  'that is not a slogan. it is the center of everything we build.',
]

const books = [
  { author: 'Brené Brown', title: 'The Gifts of Imperfection' },
  { author: 'Amy Edmondson', title: 'The Fearless Organization' },
  { author: 'John Sterman', title: 'Business Dynamics' },
]

export default function AboutPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/about" />

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '10rem 2.5rem 5rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}>
          our story
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em' }}>
          built from the inside out.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
          style={{ fontSize: '0.85rem', letterSpacing: '0.04em', opacity: 0.45, marginTop: '1.25rem' }}>
          alicia frommann. founder, peakplant.
        </motion.p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem 7rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7rem', alignItems: 'start', borderTop: '1px solid #e8e8e8' }}>
        <motion.div
          initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} whileInView={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'sticky', top: '8rem', paddingTop: '5rem' }}
        >
          <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f0f0f0' }}>
            <img src="/alicia.jpg" alt="Alicia Frommann" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'grayscale(100%)' }} />
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '-0.01em', color: '#1A1A1A' }}>alicia frommann</p>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, marginTop: '0.25rem' }}>founder, peakplant</p>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', paddingTop: '5rem' }}>
          {paragraphs.map((text, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '1.05rem', lineHeight: 1.85, color: i >= 4 ? '#1A1A1A' : '#444', fontWeight: i >= 4 ? 400 : 300 }}>
              {text}
            </motion.p>
          ))}

          {/* Book recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e8e8e8' }}
          >
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.25rem' }}>
              what changed my thinking
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {books.map(b => (
                <p key={b.title} style={{ fontSize: '0.9rem', color: '#555', fontWeight: 300, lineHeight: 1.5 }}>
                  <span style={{ color: '#1A1A1A', fontWeight: 400 }}>{b.author}</span>
                  {' — '}{b.title}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 640, margin: '0 auto 3rem', letterSpacing: '-0.015em' }}>
          you do not have to perform to be worthy of love.
        </motion.p>
        <Link href="/philosophy" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 3 }}>
          read our philosophy →
        </Link>
      </section>
    </div>
  )
}
