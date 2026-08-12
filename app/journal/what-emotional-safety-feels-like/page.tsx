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
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>Relationships</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>April 2025</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>5 min read</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}>
          What emotional safety actually feels like.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#f5f5f5', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <Image src="/couples-joy.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 680px" style={{ objectFit: 'cover' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.35 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#333', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#1A1A1A', fontWeight: 300 }}>
            Most people have never had a word for it. They have just noticed its absence — the subtle bracing, the things left unsaid, the way certain conversations feel like minefields you navigate rather than rooms you inhabit.
          </p>

          <p>
            Emotional safety is not the absence of conflict. That is a common misunderstanding that leads people to mistake quiet suppression for healthy closeness. Real emotional safety is something different: the presence of trust deep enough that the relationship can survive your honesty.
          </p>

          <p>
            It is the knowledge that you can say what you feel without losing the person. That your needs are not inconvenient. That being seen — fully, in your uncertainty and your mess — will not result in rejection. That you are allowed to not have it together.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>Why so few people have it.</h2>

          <p>
            Amy Edmondson at Harvard has spent decades studying psychological safety in teams — what she calls "the shared belief that the team is safe for interpersonal risk-taking." Her research consistently shows that high-performing groups are not the ones where people agree the most. They are the ones where people feel safe enough to disagree, to fail, to admit they do not know.
          </p>

          <p>
            The same is true in relationships. The couples and friendships built on emotional safety are not the ones without friction. They are the ones where friction does not feel existential. Where "I am upset" does not mean "I am leaving." Where repair is possible, and expected, and practiced.
          </p>

          <p>
            Most of us were not modeled this. We learned, instead, that conflict is dangerous, that need is burdensome, that the way to stay in relationships is to stay manageable. Those early lessons run deep — they shape our attachment styles, our communication patterns, the way we brace even in relationships that are genuinely safe.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>What it feels like when you find it.</h2>

          <p>
            There is a particular quality to it. A kind of loosening. The sense that you can let your guard down not because nothing bad will ever happen, but because you trust that whatever happens can be worked through. That the relationship is not so fragile that it requires management.
          </p>

          <p>
            In the body, it often shows up as ease. The breath goes a little deeper. The shoulders drop. You notice you are not monitoring yourself quite so carefully. You can be mid-sentence and not know how it is going to end, and that feels okay.
          </p>

          <p>
            In intimacy specifically, emotional safety is what makes wildness possible. This sounds counterintuitive — safety as the prerequisite for wildness. But it is precisely right. When you trust the container, you can stop managing what you put in it. You can be loud when you are loud. Soft when you are soft. Uncertain when you are uncertain. You can be more fully yourself because the risk of being yourself has been removed.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>How it is built.</h2>

          <p>
            Not in a single conversation. Through small consistent actions: saying what you mean, following through, responding to someone's vulnerability with care rather than deflection. Through repair when things go wrong — which they will — and through the accumulation of evidence that this person, in this relationship, can be trusted with what is true.
          </p>

          <p>
            It is not a feeling you achieve. It is a quality you cultivate, together, in the repeated choice to stay honest rather than comfortable.
          </p>

          <p style={{ color: '#1A1A1A', fontStyle: 'italic' }}>
            Once you have felt emotional safety — genuinely, not as a performance of safety — you understand why everything else is harder without it. And you become unwilling to settle for less.
          </p>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/journal/the-case-for-slowness" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            ← Previous essay
          </Link>
          <Link href="/journal/you-are-allowed-to-be-fully-alive" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            Next essay →
          </Link>
        </motion.div>
      </article>
    </div>
  )
}
