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
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>Embodiment</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>April 2025</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>4 min read</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}>
          The case for slowness.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#f5f5f5', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <Image src="/couples-joy.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 680px" style={{ objectFit: 'cover' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.35 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#333', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#1A1A1A', fontWeight: 300 }}>
            The best moments I have had with another person almost always happened in the gaps. Not during the planned thing. In the pause before. The drive home. The moment when neither of you is performing because you forgot to.
          </p>

          <p>
            We are trained to fill those gaps. We optimize transitions. We scroll through them. We treat the in-between as dead time — useful only for productivity, not for presence.
          </p>

          <p>
            But intimacy lives in the in-between. It lives in the moment of slowing down long enough to actually arrive in the room with another person. And we have, collectively, become very bad at this.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>What speed costs us.</h2>

          <p>
            The nervous system is not indifferent to pace. Bessel van der Kolk, who spent decades studying trauma and the body, writes about how unresolved stress keeps the nervous system in a state of chronic activation — scanning for threat, braced for impact. In this state, true intimacy is physiologically unavailable. You cannot fully open to another person when your body is busy anticipating danger.
          </p>

          <p>
            Slowness is not laziness. It is a nervous system intervention. When we slow down, the parasympathetic system — the one responsible for rest, digestion, and connection — gets a chance to come online. The body stops bracing. Breathing deepens. The quality of attention shifts from scanning to receiving.
          </p>

          <p>
            This is why a slow meal can feel more intimate than a fast conversation. Why a long walk changes something that a quick text cannot. Why the moments most people remember from their closest relationships are almost never the peak experiences — the vacations, the milestones — but the ordinary, unhurried ones. The ones where time felt briefly like it belonged to you both.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>Nature knows this.</h2>

          <p>
            There is a reason people go to mountains and forests to feel something again. It is not only the scenery. It is the pace. Nature does not rush. Seasons do not optimize. A river does not apologize for moving at its own speed.
          </p>

          <p>
            When we return to natural rhythms — even briefly — something in us remembers a different relationship with time. We slow down enough to feel what we have been moving too fast to notice. Our own bodies. Our own emotions. The person we are standing next to.
          </p>

          <p>
            This is what wildness actually is. Not chaos, not recklessness — but the freedom that comes from dropping the performance long enough to be moved by what is actually in front of you. A meadow. A person you love. The quiet sound of your own breathing.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>A small practice.</h2>

          <p>
            You do not need to rearrange your life. You need to find five minutes inside it. Before a conversation you care about, sit quietly. Before intimacy, breathe. Let arrival be a real thing rather than a transition you skip.
          </p>

          <p>
            Notice what changes when you do this. Not as an experiment. As a practice. As the quiet accumulation of moments in which you chose presence over efficiency.
          </p>

          <p style={{ color: '#1A1A1A', fontStyle: 'italic' }}>
            The best things take time. The most alive things refuse to be hurried. This is not a flaw in how they work. It is the whole point.
          </p>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/journal/the-systems-behind-disconnection" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            ← Previous essay
          </Link>
          <Link href="/journal/what-emotional-safety-feels-like" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            Next essay →
          </Link>
        </motion.div>
      </article>
    </div>
  )
}
