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
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal'], ['/community', 'Community']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/journal' ? 1 : 0.5 }}>{label}</Link>
          ))}
        </div>
      </nav>

      <article style={{ maxWidth: 680, margin: '0 auto', padding: '9rem 2.5rem 8rem' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>Aliveness</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>March 2025</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.35 }}>4 min read</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}>
          You are allowed to be fully alive.
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ width: '100%', aspectRatio: '16/9', background: '#f5f5f5', overflow: 'hidden', marginBottom: '3.5rem' }}>
          <img src="/bw-grid-2.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.35 }}
          style={{ fontSize: '1.05rem', lineHeight: 1.9, color: '#333', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#1A1A1A', fontWeight: 300 }}>
            At some point, most of us learned to regulate how much we feel. To turn things down. To manage the intensity. To be easier, less, more palatable — to ourselves and to others.
          </p>

          <p>
            This is not a personal failing. It is a logical adaptation to environments that could not hold the full version of us. Children learn early: this much emotion is acceptable. This much need is okay. Beyond that, you are too much. So we learn to be less.
          </p>

          <p>
            The trouble is that we keep doing it long after the environment has changed. We carry the regulation into places that no longer require it — into relationships that could hold us, into bodies that are finally safe, into moments that are genuinely good and present and worth inhabiting.
          </p>

          <p>
            And we miss them. We are there, but we are managing our experience of being there. We are alive, but at some reduced percentage of what alive actually means.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>What full aliveness costs.</h2>

          <p>
            The poet Rilke wrote about the necessity of living the questions — of staying open to experience even when it does not resolve into clarity. There is a version of that in how we live: not trying to get life right, but letting it actually touch you.
          </p>

          <p>
            Full aliveness is not about highs. It is not about peak experiences or optimal states or performing joy. It is the much simpler, much harder thing of being genuinely present to what is happening. The ordinary warmth of a morning. The way a conversation shifts when someone says something true. The specific quality of light on a particular afternoon that you will never see again exactly like that.
          </p>

          <p>
            Most of us walk past these things, not because we do not value them, but because we have learned to stay slightly behind the glass. Close enough to observe. Far enough to stay safe.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>What worth has to do with it.</h2>

          <p>
            Here is the thing I keep coming back to: full aliveness requires believing you are allowed to have it. That your presence in your own life is not contingent on performance or usefulness or becoming enough. That you do not need to earn the right to feel good, to feel held, to feel your own aliveness without justifying it.
          </p>

          <p>
            This is what I mean when I say human worth is inherent. Not as a philosophical position — as a lived experience. The moment you stop believing your value is earned is the moment you can stop managing your aliveness and start actually having it.
          </p>

          <p>
            Brené Brown's research on wholehearted living keeps arriving at the same finding: people who live with the most vitality are not the ones who have the most. They are the ones who believe, in their bones, that they are enough. That they are worthy of belonging. That the full version of themselves is welcome.
          </p>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginTop: '1.5rem', marginBottom: '-0.5rem' }}>This is what PeakPlant is about.</h2>

          <p>
            Not the product. Not the packaging. The underlying conviction that you are allowed to feel things — deeply, without apology. That intimacy can be a place where you become more yourself, not less. That wildness is not something you have to earn but something you can return to.
          </p>

          <p>
            You were not given this one life to spend it performing your way through it. You were given it to inhabit. To feel. To be moved by what moves you. To let the people you love actually reach you.
          </p>

          <p style={{ color: '#1A1A1A', fontStyle: 'italic' }}>
            You are already allowed. You were always allowed. The only question is whether you will let yourself believe it.
          </p>

        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/journal/what-emotional-safety-feels-like" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            ← Previous essay
          </Link>
          <Link href="/journal/why-the-wrapper-has-a-question" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none' }}>
            Next essay →
          </Link>
        </motion.div>
      </article>
    </div>
  )
}
