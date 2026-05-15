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

export default function Article() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}><Logo size={32} /></Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/about', 'About'], ['/shop', 'Shop'], ['/journal', 'Journal'], ['/community', 'Community']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/journal' ? 1 : 0.5 }}>{label}</Link>
          ))}
        </div>
      </nav>

      <article style={{ maxWidth: 680, margin: '0 auto', padding: '9rem 2.5rem 8rem' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>Design</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>March 2025</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>3 min read</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}>
          Why the wrapper has a question on it.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ width: '100%', aspectRatio: '16/9', background: '#f5f5f5', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <img src="/product-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.35 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#333', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#1A1A1A', fontWeight: 300 }}>
            Most condom packaging is designed to disappear. Or to signal confidence. Or to feel clinical and responsible. What almost none of it does is create a moment of pause before one of the most intimate things two people can do together.
          </p>

          <p>
            When we started designing the first PeakPlant collection, the question was not: how do we make this look better than other brands? The question was: what should this object actually do in the moment someone picks it up?
          </p>

          <p>
            Because there is a moment. Between reaching for the packaging and opening it, there is a beat — brief, often unexamined — where something could be different. Where instead of rushing through a logistical step, two people could actually arrive in the room with each other.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>The wrapper as design philosophy.</h2>

          <p>
            We put a question on each wrapper. Not as decoration. Not as a brand flourish. As an invitation to pause. To look at the person you are with. To be, for a moment, present rather than procedural.
          </p>

          <p>
            Questions like: <em>What do you need right now?</em> Or: <em>When do you feel most yourself?</em> Or: <em>Tell me something you've never said out loud.</em>
          </p>

          <p>
            These questions do not require answering. They require noticing. The act of reading them together — even briefly, even silently — interrupts the automation. It creates a micro-moment of actual contact, the kind that intimacy is made of but that speed tends to eliminate.
          </p>

          <p>
            Simon Sinek's work on intentionality in leadership keeps coming back to the same insight: behavior changes when you change the environment that prompts it. We are trying to redesign a small environmental prompt — the wrapper — in a way that points toward presence rather than away from it.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>Why packaging is never only packaging.</h2>

          <p>
            The object you hold shapes how you feel about what you are about to do. Clinical packaging says: this is a medical precaution. Aggressive packaging says: this is about performance. Packaging with a question says: this is about the two of you.
          </p>

          <p>
            We chose matte, tactile materials — not for aesthetic reasons alone, but because textures register subconsciously. A surface you can feel properly reminds you that you have a body. That you are here, in this moment, in this room.
          </p>

          <p>
            The seed in the corner of the box is not an accident either. It is a symbol: something small that holds the possibility of growth. Every PeakPlant box contains one, because what we are really designing for is not a single encounter but a longer arc — the accumulation of moments in which two people choose presence over performance, and slowly build something between them that can grow.
          </p>

          <p style={{ color: '#1A1A1A', fontStyle: 'italic' }}>
            Design is never neutral. Every object says something about what the people who made it believe matters. This is what we believe matters: that the moment before intimacy deserves to be treated as a moment, not a procedure.
          </p>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/journal/you-are-allowed-to-be-fully-alive" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            ← Previous essay
          </Link>
          <Link href="/journal" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            All essays →
          </Link>
        </motion.div>
      </article>
    </div>
  )
}
