'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { NavBar } from '../../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function Article() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/journal" />

      <article style={{ maxWidth: 680, margin: '0 auto', padding: '9rem 2.5rem 8rem' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>Systems Thinking</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>May 2025</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>7 min read</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}>
          The systems behind disconnected intimacy.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#f5f5f5', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <Image src="/couples-rain.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 680px" style={{ objectFit: 'cover' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.35 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#333', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#1A1A1A', fontWeight: 300 }}>
            When people feel emotionally disconnected — from their partners, from themselves, from intimacy itself — the first instinct is to look for a personal explanation. What am I doing wrong? What am I missing? How do I fix this?
          </p>

          <p>
            This is understandable. But it is the wrong level of analysis. Because what we call personal disconnection is, in most cases, a systemic outcome. The product of structures that were never designed to make us feel safe, present, or emotionally honest — and that, by now, have been running long enough to feel like nature.
          </p>

          <p>
            I spent years studying systems thinking — how mental models, feedback loops, and structural conditions shape behavior at scale. What I kept coming back to was a pattern: the behaviors we pathologize as individual failures are almost always the logical outputs of the systems people are embedded in.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>Four systems doing the most damage.</h2>

          <p>
            <strong>Social media</strong> is the most visible. Platforms built on external validation teach us, through thousands of micro-reinforcements, that our worth is proportional to how we are perceived. We learn to present. To curate. To manage the gap between who we are and who we appear to be. When that becomes habitual online, it bleeds offline — into conversations, into bedrooms, into the most vulnerable spaces of our lives.
          </p>

          <p>
            <strong>Productivity culture</strong> is subtler but equally corrosive. The logic of optimization — do more, become more, be more efficient — was never designed to stop at the office. It colonizes everything. Relationships become something to manage rather than inhabit. Intimacy becomes something to get right rather than something to be inside. You lose the quality of presence that closeness actually requires.
          </p>

          <p>
            <strong>Hookup culture and dating apps</strong> created abundance — and with abundance came the illusion of infinite alternatives. Research from Sheena Iyengar on the paradox of choice applies here: more options create less satisfaction, not more. When connection feels replaceable, the impulse to invest deeply — to be vulnerable, to choose someone repeatedly — weakens. We become efficient instead of devoted.
          </p>

          <p>
            <strong>Emotional illiteracy</strong> is the oldest system of all. Most of us were never taught how to name what we feel, how to communicate needs, or how to stay in the room when things get hard. Donella Meadows, the systems thinker, wrote about how systems perpetuate themselves through the mental models of the people inside them. The mental model most of us inherited was: emotions are private, vulnerability is weakness, needing people is a liability. That model is still running.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>Why understanding the system changes everything.</h2>

          <p>
            Donella Meadows also wrote that the highest leverage point in any system is not a policy or a rule — it is the paradigm. The shared belief from which the system emerges. Changing behavior is hard. Changing the story behind the behavior is transformational.
          </p>

          <p>
            The paradigm driving disconnection is this: your worth is conditional on your performance. That belief is the water we swim in. It shows up in how we love, how we have sex, how we talk about ourselves, how we respond when we feel hurt. It makes vulnerability feel like a strategic risk rather than a human necessity.
          </p>

          <p>
            If we can interrupt that paradigm — if we can collectively begin to operate from the assumption that worth is inherent, not earned — the downstream effects on intimacy are profound. Not because intimacy becomes easy. But because the fear that makes it feel impossible softens.
          </p>

          <p>
            This is what ThinkTogether is built around — the idea that systems change when mental models change, and that mental models change through conversation, community, and the slow accumulation of alternative experiences. PeakPlant exists at the same intersection. Products are entry points. The real work is at the level of the story.
          </p>

          <p style={{ color: '#1A1A1A', fontStyle: 'italic' }}>
            Disconnected intimacy is not a personal failure. It is a systemic output. And systemic outputs can be changed — not by trying harder, but by seeing more clearly.
          </p>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/journal/performance-entered-intimacy" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            ← Previous essay
          </Link>
          <Link href="/journal/the-case-for-slowness" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            Next essay →
          </Link>
        </motion.div>
      </article>
    </div>
  )
}
