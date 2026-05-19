'use client'
import { motion, AnimatePresence, useScroll, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'

const C = 'var(--font-cormorant), Georgia, serif'
const R = 'var(--font-raleway), "Helvetica Neue", sans-serif'

function Grain() {
  return (
    <svg
      aria-hidden
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 9998,
        pointerEvents: 'none',
        opacity: 0.04,
      }}
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        height: '2px',
        background: 'var(--edition-pink)',
        zIndex: 9997,
        scaleX: scrollYProgress,
        transformOrigin: '0 0',
        width: '100%',
      }}
    />
  )
}

function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.65
  }, [])

  return (
    <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#1A1A1A' }}>
      <video
        ref={videoRef}
        autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.72 }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* warm pink tint */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(232,56,122,0.18) 0%, rgba(232,99,58,0.10) 50%, transparent 100%)', pointerEvents: 'none' }} />
      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(26,26,26,0.75) 100%)', pointerEvents: 'none' }} />

      {/* drifting card-01 in corner */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '12vh', right: '6vw', width: 'clamp(100px, 14vw, 200px)', opacity: 0.18, pointerEvents: 'none' }}
      >
        <Image src="/edition-01/card-01.png" alt="" width={200} height={280} style={{ width: '100%', height: 'auto' }} />
      </motion.div>

      <div style={{ position: 'absolute', bottom: '8vh', left: '6vw', right: '6vw' }}>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(56px, 12vw, 164px)', lineHeight: 0.9, color: 'var(--edition-white)', maxWidth: '80vw' }}
        >
          when did life<br />start feeling<br />this fast?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          style={{ fontFamily: R, fontWeight: 100, fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--edition-white)', marginTop: '2rem' }}
        >
          edition 01 · launching august 2026
        </motion.p>
      </div>
    </section>
  )
}

const QUESTIONS = [
  { text: 'when did you last feel truly present with someone?', card: '/edition-01/card-01.png' },
  { text: 'what are you afraid to ask for?', card: '/edition-01/card-02.png' },
  { text: "where does your body hold tension you haven't named?", card: '/edition-01/card-03.png' },
  { text: 'when did intimacy start feeling like an obligation?', card: '/edition-01/card-04.png' },
  { text: "what would you do differently if you weren't afraid?", card: '/edition-01/card-05.png' },
  { text: "what does your body need that your mind keeps ignoring?", card: '/edition-01/card-06.png' },
]

function Questions() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setCurrent(idx)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section style={{ position: 'relative', background: 'var(--edition-cream)', overflow: 'hidden' }}>
      {/* box-opening gradient */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '7%', background: 'linear-gradient(to bottom, var(--edition-pink), var(--edition-cream))', pointerEvents: 'none', zIndex: 2 }} />

      {/* progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(26,26,26,0.1)', zIndex: 3 }}>
        <motion.div style={{ height: '100%', background: 'var(--edition-pink)', width: `${((current + 1) / QUESTIONS.length) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* counter */}
      <div style={{ position: 'absolute', top: '3rem', right: '3rem', fontFamily: R, fontSize: '0.65rem', fontWeight: 200, letterSpacing: '0.2em', color: 'var(--edition-dark)', opacity: 0.5, zIndex: 3 }}>
        {String(current + 1).padStart(2, '0')} / {String(QUESTIONS.length).padStart(2, '0')}
      </div>

      {/* logo watermark — shifts with current question */}
      <motion.div
        animate={{ opacity: [0.06, 0.09, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '50%', right: '4vw', transform: 'translateY(-50%)', width: 'clamp(60px, 10vw, 140px)', pointerEvents: 'none', zIndex: 1 }}
      >
        <Image src="/edition-01/logo-edition-01.png" alt="" width={140} height={140} style={{ width: '100%', height: 'auto' }} />
      </motion.div>

      {/* horizontal scroll container */}
      <div
        ref={scrollRef}
        className="h-scroll"
        style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', position: 'relative', zIndex: 2 }}
      >
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: '100vw',
              height: '100vh',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8vw',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* card artwork as full-bleed background, blurred + faded */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Image
                src={q.card}
                alt=""
                fill
                style={{ objectFit: 'cover', filter: 'blur(32px) saturate(1.4)', opacity: 0.22, transform: 'scale(1.08)' }}
              />
            </div>

            {/* floating card — drifts slowly, right side */}
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 14 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                right: 'clamp(3vw, 8vw, 12vw)',
                top: '50%',
                translateY: '-50%',
                width: 'clamp(120px, 18vw, 260px)',
                opacity: 0.55,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <Image src={q.card} alt="" width={260} height={364} style={{ width: '100%', height: 'auto', borderRadius: '3px' }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: C,
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                lineHeight: 1.2,
                color: 'var(--edition-dark)',
                maxWidth: '54ch',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {q.text}
            </motion.p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SafeSoftWild() {
  const words = ['safe.', 'soft.', 'wild.']
  // drifting card fragments as atmosphere
  const drifters = [
    { src: '/edition-01/card-02.png', top: '8%', left: '3%', w: 140, delay: 0 },
    { src: '/edition-01/card-05.png', top: '15%', right: '5%', w: 110, delay: 3 },
    { src: '/edition-01/card-04.png', bottom: '10%', left: '8%', w: 90, delay: 6 },
    { src: '/edition-01/card-03.png', bottom: '18%', right: '3%', w: 120, delay: 2 },
  ]

  return (
    <section style={{
      height: '100vh',
      background: 'var(--edition-pink)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      gap: '0.5rem',
      position: 'relative',
    }}>
      {drifters.map((d, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0], rotate: [0, 4 * (i % 2 === 0 ? 1 : -1), 0] }}
          transition={{ duration: 16 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
          style={{
            position: 'absolute',
            ...(d.top ? { top: d.top } : {}),
            ...(d.bottom ? { bottom: d.bottom } : {}),
            ...(d.left ? { left: d.left } : {}),
            ...(d.right ? { right: d.right } : {}),
            width: d.w,
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        >
          <Image src={d.src} alt="" width={d.w} height={Math.round(d.w * 1.4)} style={{ width: '100%', height: 'auto', borderRadius: '2px' }} />
        </motion.div>
      ))}

      {words.map((word, i) => (
        <motion.span
          key={word}
          initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'block',
            fontFamily: C,
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(68px, 13.5vw, 196px)',
            lineHeight: 0.95,
            color: 'var(--edition-white)',
            letterSpacing: '-0.01em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {word}
        </motion.span>
      ))}
    </section>
  )
}

function Product() {
  return (
    <section style={{ padding: '14vh 8vw', background: 'var(--edition-white)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', gap: '8vw', alignItems: 'flex-start', flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 320px', maxWidth: '44ch' }}>
          <h2 style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', lineHeight: 1.1, color: 'var(--edition-dark)', marginBottom: '3rem' }}>
            six condoms.<br />six questions.<br />one ritual.
          </h2>
          <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.85rem', letterSpacing: '0.06em', color: 'var(--edition-dark)', opacity: 0.65, lineHeight: 1.8, marginBottom: '1.5rem' }}>
            each box holds six vegan, ultra-thin condoms — and six printed questions to open before, during, or after. no app. no algorithm. just paper, presence, and the willingness to ask.
          </p>
          <p style={{ fontFamily: R, fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--edition-pink)', marginBottom: '0.5rem' }}>
            14,90€ · includes shipping · launches august 2026
          </p>
          <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.45, marginBottom: '3rem' }}>
            edition 01 is limited to 1.000 boxes.
          </p>
          <Link href="/shop" style={{ fontFamily: R, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-dark)', textDecoration: 'none', borderBottom: '1px solid var(--edition-dark)', paddingBottom: '3px', opacity: 0.8 }}>
            explore the edition
          </Link>
        </div>

        {/* floating spread of 3 cards */}
        <div style={{ flex: '0 0 auto', position: 'relative', width: 'clamp(200px, 28vw, 380px)', height: 'clamp(260px, 36vw, 500px)' }}>
          {['/edition-01/card-01.png', '/edition-01/card-03.png', '/edition-01/card-06.png'].map((src, i) => (
            <motion.div
              key={src}
              animate={{ y: [0, -10 + i * 4, 0], rotate: [i * 8 - 8, i * 8 - 6, i * 8 - 8] }}
              transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: '55%',
                left: `${i * 22}%`,
                top: `${i * 8}%`,
                zIndex: 3 - i,
                boxShadow: '0 8px 32px rgba(26,26,26,0.14)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <Image src={src} alt="" width={220} height={308} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function Founder() {
  return (
    <section style={{ position: 'relative', padding: '14vh 8vw', background: 'var(--edition-cream)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(200px, 35vw, 480px)', color: 'var(--edition-pink)', opacity: 0.05, pointerEvents: 'none', userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap' }}>
        ∧
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', maxWidth: '64ch' }}
      >
        <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.5, marginBottom: '2rem' }}>
          a note from the founder
        </p>
        <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.4rem, 2.8vw, 2.4rem)', lineHeight: 1.5, color: 'var(--edition-dark)', marginBottom: '2.5rem' }}>
          "i built this because i kept buying things that promised connection — and they all felt hollow. peakplant is the thing i actually wanted to find."
        </p>
        <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.55 }}>
          — Alicia, founder
        </p>
      </motion.div>
    </section>
  )
}

function SocialProof() {
  return (
    <section style={{ padding: '12vh 8vw', background: 'var(--edition-white)' }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.8rem, 4vw, 3.8rem)', lineHeight: 1.3, color: 'var(--edition-dark)', maxWidth: '52ch', marginBottom: '2rem' }}>
          "we hadn't talked like that in years. not because we didn't want to — we just didn't know how to start."
        </p>
        <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.45 }}>
          beta tester, berlin
        </p>
      </motion.div>
    </section>
  )
}

function EditionCards() {
  return (
    <section style={{ padding: '14vh 8vw', background: 'var(--edition-dark)' }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-white)', opacity: 0.4, marginBottom: '4rem' }}
      >
        the edition system
      </motion.p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
        {[
          { number: '01', title: 'founders edition', desc: 'six condoms. six questions. one ritual.', price: '14,90€', active: true },
          { number: '02', title: 'coming soon', desc: 'a new theme. a new set of questions.', active: false },
          { number: '03', title: 'coming soon', desc: 'the archive expands.', active: false },
        ].map((ed, i) => (
          <motion.div
            key={ed.number}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              aspectRatio: '2/3',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
              background: ed.active ? 'var(--edition-cream)' : 'rgba(250,250,248,0.06)',
              backdropFilter: !ed.active ? 'blur(12px)' : 'none',
              border: !ed.active ? '1px solid rgba(250,250,248,0.12)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2rem',
            }}
          >
            {/* edition 01: card-01 floats as atmosphere */}
            {ed.active && (
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '8%', right: '8%', width: '48%', opacity: 0.65, pointerEvents: 'none' }}
              >
                <Image src="/edition-01/card-01.png" alt="" width={180} height={252} style={{ width: '100%', height: 'auto', borderRadius: '2px' }} />
              </motion.div>
            )}
            {!ed.active && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: R, fontWeight: 100, fontSize: '0.6rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--edition-white)', opacity: 0.3 }}>
                coming soon
              </div>
            )}
            <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: ed.active ? 'var(--edition-dark)' : 'var(--edition-white)', opacity: 0.5, marginBottom: '0.75rem' }}>{ed.number}</p>
            <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', color: ed.active ? 'var(--edition-dark)' : 'var(--edition-white)', marginBottom: '0.5rem' }}>{ed.title}</p>
            <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.04em', color: ed.active ? 'var(--edition-dark)' : 'var(--edition-white)', opacity: 0.6, lineHeight: 1.6 }}>{ed.desc}</p>
            {ed.price && <p style={{ fontFamily: R, fontWeight: 300, fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--edition-pink)', marginTop: '1rem' }}>{ed.price}</p>}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section style={{ padding: '18vh 8vw', background: 'var(--edition-dark)' }}>
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.9 }}>
            <h2 style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(46px, 10vw, 116px)', lineHeight: 0.95, color: 'var(--edition-white)', marginBottom: '4rem' }}>
              stay a little<br />longer.
            </h2>
            <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--edition-white)', opacity: 0.5, marginBottom: '2.5rem', maxWidth: '40ch', lineHeight: 1.7 }}>
              we'll find you when it's time. no noise before then.
            </p>
            <form onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true) }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your email" required
                style={{ fontFamily: R, fontWeight: 200, fontSize: '0.8rem', letterSpacing: '0.08em', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(250,250,248,0.3)', color: 'var(--edition-white)', padding: '0.6rem 0', outline: 'none', minWidth: '260px' }}
              />
              <button type="submit"
                style={{ fontFamily: R, fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'transparent', color: 'var(--edition-white)', border: '1px solid rgba(250,250,248,0.35)', padding: '0.7rem 1.8rem', cursor: 'none', transition: 'background 0.3s ease, border-color 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--edition-pink)'; e.currentTarget.style.borderColor = 'var(--edition-pink)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(250,250,248,0.35)' }}
              >
                stay close
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="thanks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 5rem)', color: 'var(--edition-white)', lineHeight: 1.1 }}>we'll be in touch.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ padding: '8vh 8vw 4vh', background: 'var(--edition-dark)', borderTop: '1px solid rgba(250,250,248,0.08)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', bottom: '4vh', left: '8vw', fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(3rem, 8vw, 9rem)', color: 'var(--edition-white)', opacity: 0.06, pointerEvents: 'none', userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap' }}>
        ∧ peakplant
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem', position: 'relative' }}>
        <div>
          <div style={{ width: 'clamp(28px, 3.5vw, 44px)', marginBottom: '1rem', opacity: 0.4 }}>
            <Image src="/edition-01/logo-black.png" alt="∧ peakplant" width={44} height={44} style={{ width: '100%', height: 'auto', filter: 'invert(1)' }} />
          </div>
          <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--edition-white)', opacity: 0.2, lineHeight: 1.7 }}>edition 01 · launching august 2026</p>
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Philosophy', href: '/philosophy' },
            { label: 'Ethics', href: '/ethics' },
            { label: 'Shop', href: '/shop' },
            { label: 'Journal', href: '/journal' },
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--edition-white)', opacity: 0.35, textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <Grain />
      <ScrollBar />
      <NavBar activePath="/" />
      <main>
        <Hero />
        <Questions />
        <SafeSoftWild />
        <Product />
        <Founder />
        <SocialProof />
        <EditionCards />
        <Waitlist />
        <Footer />
      </main>
    </>
  )
}
