'use client'
import Link from 'next/link'
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
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>Vulnerability</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>May 2025</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>5 min read</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}>
          Performance entered intimacy.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ width: '100%', aspectRatio: '16/9', background: '#f5f5f5', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <img src="/scenery-1.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.35 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#333', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#1A1A1A', fontWeight: 300 }}>
            There is a moment in most relationships — subtle, almost invisible — when something shifts. When two people stop showing up for each other and start showing up <em>as</em> something for each other.
          </p>

          <p>
            Brené Brown spent years researching what keeps people from real intimacy. Her answer was not complicated: shame. The quiet, persistent belief that if someone truly saw us — not the curated version, not the performing version — they would leave. So we manage how we appear. We optimize the impression. We turn the most tender parts of ourselves into a presentation.
          </p>

          <p>
            This is not weakness. It is an entirely rational response to a culture that rewards performance. We were trained from early on: the version of you that succeeds is the version worth keeping. And so we brought that logic into the bedroom, into the relationship, into the most intimate corners of our lives.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>We learned to optimize everything.</h2>

          <p>
            Simon Sinek talks about organizations losing their purpose — the drift from <em>why</em> to <em>what</em> that happens slowly, almost without anyone noticing. The same thing happens in relationships. You begin with a feeling. A pull toward another person that has nothing to do with performance. And somewhere, over time, you start optimizing. You track the impression. You manage the image. You stop letting yourself be seen in the spaces between.
          </p>

          <p>
            The cost is not obvious at first. The relationship continues. Conversations happen. Physical closeness happens. But something is missing — a quality of aliveness, of risk, of actual contact. Two people can be entirely present in the same room and still fundamentally not reach each other.
          </p>

          <p>
            That is what performance costs intimacy. Not the relationship itself, necessarily. But the rawness. The realness. The thing that makes closeness feel like closeness rather than like two people managing each other's experience of them.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>What presence actually requires.</h2>

          <p>
            There is a concept from systems thinking: feedback loops that reinforce behavior over time. The longer you perform in a relationship, the more the other person responds to the performance. Which makes it harder to stop. You become, in a sense, trapped by your own consistency — because authenticity now feels like a disruption rather than a return.
          </p>

          <p>
            This is what makes intimacy courageous. Not in the way that word is usually used — not bungee-jumping or quitting your job courageous — but the quieter, more difficult kind. The willingness to say: this is what I actually feel. This is what I actually need. I am afraid of showing you this but I am going to anyway.
          </p>

          <p>
            That is presence. Not the absence of fear — but choosing contact over comfort.
          </p>

          <p>
            Brené Brown calls this wholehearted living. The willingness to engage with life from a place of worthiness rather than worthiness-to-be-earned. And the research is consistent: people who do this — who allow themselves to be seen, imperfections and all — report deeper connections, more meaningful relationships, and a kind of aliveness that the performance never delivers.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>This is what PeakPlant is really about.</h2>

          <p>
            The question on every PeakPlant wrapper is not decoration. It is an invitation to pause. To arrive. To notice whether you are about to be present with another human being, or whether you are about to manage an experience.
          </p>

          <p>
            Those are different things. And most of us, if we are honest, have spent too much time in the second category.
          </p>

          <p style={{ color: '#1A1A1A', fontStyle: 'italic' }}>
            The good news is: presence is available in every moment. It does not require becoming someone different. It requires, in fact, exactly the opposite — becoming more honestly who you already are.
          </p>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/journal" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            ← All essays
          </Link>
          <Link href="/journal/the-systems-behind-disconnection" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            Next essay →
          </Link>
        </motion.div>
      </article>
    </div>
  )
}
