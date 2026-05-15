'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const paragraphs = [
  'For a long time, I tied my self-worth to external performance — achievement, ambition, being enough. I was successful on the outside and not fully free on the inside. Through reflection, vulnerability work, and emotional honesty, I slowly began to understand how deeply the systems surrounding us shape our relationships, our intimacy, and our sense of worth.',
  'I studied systems thinking — how feedback loops, mental models, and cultural architecture shape behavior at scale. What I realized is that loneliness and emotional disconnection are not personal failures. They are systemic outcomes. The systems we live inside — social media, productivity culture, dating apps, performance norms — were not designed to help us feel emotionally safe. They were designed to make us feel not enough.',
  'The more I worked on my own mental models, the more intimacy changed too. It became safe, deep, growing — something built between two people rather than performed for each other. That transformation did not only affect romantic relationships. It changed friendships, communication, and the way I moved through the world itself.',
  'PeakPlant exists because more people deserve to experience that kind of connection. Not the performance of it. The actual thing.',
  'You do not have to perform to be worthy of love. That is not a slogan. It is the center of everything we build.',
]

export default function AboutPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}><Logo size={32} /></Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/about', 'About'], ['/shop', 'Shop'], ['/journal', 'Journal'], ['/community', 'Community']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <section style={{ paddingTop: '10rem', paddingBottom: '5rem', maxWidth: 800, margin: '0 auto', padding: '10rem 2.5rem 5rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}>
          Our story
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em' }}>
          Built from the inside out.
        </motion.h1>
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
            <p style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '-0.01em', color: '#1A1A1A' }}>Alicia Frommann</p>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, marginTop: '0.25rem' }}>Co-founder, PeakPlant</p>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', paddingTop: '5rem' }}>
          {paragraphs.map((text, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '1.05rem', lineHeight: 1.85, color: i === 4 ? '#1A1A1A' : '#444', fontWeight: i === 4 ? 400 : 300 }}>
              {text}
            </motion.p>
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 640, margin: '0 auto 3rem', letterSpacing: '-0.015em' }}>
          You do not have to perform to be worthy of love.
        </motion.p>
        <Link href="/philosophy" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 3 }}>
          Read our philosophy →
        </Link>
      </section>

    </div>
  )
}
