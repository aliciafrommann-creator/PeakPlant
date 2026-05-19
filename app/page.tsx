'use client'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'

const C = 'var(--font-cormorant), Georgia, serif'
const R = 'var(--font-raleway), "Helvetica Neue", sans-serif'

// ─── Grain overlay ─────────────────────────────────────────────────────────────────────────────
function Grain() {
  return (
    <svg aria-hidden style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none', opacity: 0.04 }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}

// ─── Scroll progress bar ───────────────────────────────────────────────────────────────────────────────
function ScrollBar() {
  const { scrollYProgress } = useScroll()
  return <motion.div style={{ position: 'fixed', top: 0, left: 0, height: '2px', background: 'var(--edition-pink)', zIndex: 9997, scaleX: scrollYProgress, transformOrigin: '0 0', width: '100%' }} />
}

// ─── 1. Hero ──────────────────────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => { if (ref.current) ref.current.playbackRate = 0.75 }, [])

  return (
    <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
      <video ref={ref} autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}>
        <source src="/film-shadows.mp4" type="video/mp4" />
      </video>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 30%, rgba(26,26,26,0.55) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(232,56,122,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        style={{ position: 'absolute', bottom: '8vh', left: '6vw' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(56px, 12vw, 164px)', lineHeight: 0.9, color: 'var(--edition-white)', maxWidth: '80vw' }}
        >
          when did life<br />start feeling<br />this fast?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          style={{ fontFamily: R, fontWeight: 100, fontSize: '0.72rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--edition-white)', marginTop: '2rem' }}
        >
          edition 01 · launching august 2026
        </motion.p>
      </motion.div>
    </section>
  )
}

// ─── 2+3. Box opening → horizontal questions ─────────────────────────────────────────────────────────────
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
    const onScroll = () => setCurrent(Math.round(el.scrollLeft / el.clientWidth))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section style={{ position: 'relative', background: 'var(--edition-cream)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8%', background: 'linear-gradient(to bottom, var(--edition-pink), var(--edition-cream))', pointerEvents: 'none', zIndex: 2 }} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(26,26,26,0.1)', zIndex: 3 }}>
        <div style={{ height: '100%', background: 'var(--edition-pink)', width: `${((current + 1) / QUESTIONS.length) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ position: 'absolute', top: '3rem', right: '3rem', fontFamily: R, fontSize: '0.65rem', fontWeight: 200, letterSpacing: '0.2em', color: 'var(--edition-dark)', opacity: 0.45, zIndex: 3 }}>
        {String(current + 1).padStart(2, '0')} / {String(QUESTIONS.length).padStart(2, '0')}
      </div>

      <motion.div animate={{ opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '50%', right: '4vw', transform: 'translateY(-50%)', width: 'clamp(60px, 10vw, 140px)', pointerEvents: 'none', zIndex: 1 }}>
        <Image src="/edition-01/logo-edition-01.png" alt="" width={140} height={140} style={{ width: '100%', height: 'auto' }} />
      </motion.div>

      <div ref={scrollRef} className="h-scroll" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', position: 'relative', zIndex: 2 }}>
        {QUESTIONS.map((q, i) => (
          <div key={i} style={{ flexShrink: 0, width: '100vw', height: '100vh', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', padding: '0 8vw', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <Image src={q.card} alt="" fill style={{ objectFit: 'cover', filter: 'blur(32px) saturate(1.3)', opacity: 0.2, transform: 'scale(1.08)' }} />
            </div>
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 14 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', right: 'clamp(3vw, 8vw, 12vw)', top: '50%', translateY: '-50%', width: 'clamp(120px, 18vw, 240px)', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}
            >
              <Image src={q.card} alt="" width={240} height={336} style={{ width: '100%', height: 'auto', borderRadius: '3px' }} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 4.5rem)', lineHeight: 1.2, color: 'var(--edition-dark)', maxWidth: '52ch', position: 'relative', zIndex: 2 }}
            >
              {q.text}
            </motion.p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Testimonials ───────────────────────────────────────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    {
      text: 'for the first time in years, we actually talked. not about logistics. about us.',
      author: '— early tester, berlin',
    },
    {
      text: "i didn't expect a question on a wrapper to make me cry. it did.",
      author: '— early tester, münchen',
    },
  ]
  return (
    <section style={{ padding: '14vh 8vw', background: 'var(--edition-white)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6vw' }}>
        {quotes.map((q, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <span style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', color: 'var(--edition-gold)', lineHeight: 1, opacity: 0.7 }}>∧</span>
            <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)', lineHeight: 1.55, color: 'var(--edition-dark)' }}>
              “{q.text}”
            </p>
            <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--edition-dark)', opacity: 0.45 }}>
              {q.author}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── 4. Safe. Soft. Wild. ──────────────────────────────────────────────────────────────────────────────
function SafeSoftWild() {
  const drifters = [
    { src: '/edition-01/card-02.png', top: '8%', left: '3%', w: 130, delay: 0 },
    { src: '/edition-01/card-05.png', top: '12%', right: '5%', w: 100, delay: 3 },
    { src: '/edition-01/card-04.png', bottom: '10%', left: '6%', w: 88, delay: 6 },
    { src: '/edition-01/card-03.png', bottom: '16%', right: '4%', w: 115, delay: 2 },
  ]
  return (
    <section style={{ height: '100vh', background: 'var(--edition-pink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: '0.5rem', position: 'relative' }}>
      {drifters.map((d, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], rotate: [0, 4 * (i % 2 === 0 ? 1 : -1), 0] }}
          transition={{ duration: 16 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
          style={{ position: 'absolute', ...(d.top ? { top: d.top } : {}), ...(d.bottom ? { bottom: d.bottom } : {}), ...(d.left ? { left: d.left } : {}), ...(d.right ? { right: d.right } : {}), width: d.w, opacity: 0.2, pointerEvents: 'none' }}
        >
          <Image src={d.src} alt="" width={d.w} height={Math.round(d.w * 1.4)} style={{ width: '100%', height: 'auto', borderRadius: '2px' }} />
        </motion.div>
      ))}
      {['safe.', 'soft.', 'wild.'].map((word, i) => (
        <motion.span key={word}
          initial={{ opacity: 0, x: i % 2 === 0 ? -80 : 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'block', fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(68px, 13.5vw, 196px)', lineHeight: 0.95, color: 'var(--edition-white)', letterSpacing: '-0.01em', position: 'relative', zIndex: 1 }}
        >
          {word}
        </motion.span>
      ))}
    </section>
  )
}

// ─── 5. Four videos ───────────────────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    number: '01',
    name: 'Distance',
    headline: 'The space between two people is not empty.',
    body: "It holds everything that hasn't been said yet. Longing. Curiosity. The quiet awareness that someone else is in the room — and that they matter to you.",
    video: '/film-distance.mp4',
  },
  {
    number: '02',
    name: 'Presence',
    headline: 'To be seen is already an act of courage.',
    body: 'Presence is the moment you stop performing and start actually being there. No script, no right answer. Just two people paying attention to each other — and choosing to stay.',
    video: '/film-presence.mp4',
  },
  {
    number: '03',
    name: 'Intimacy',
    headline: 'Closeness is something you build together.',
    body: 'Not a destination but a feeling — warm, unhurried, honest. Intimacy happens when safety and openness arrive in the same room at the same time.',
    video: '/film-intimacy.mp4',
  },
  {
    number: '04',
    name: 'Wildness',
    headline: 'Joy is allowed to be big.',
    body: 'Wildness is not chaos. It is full permission — to feel, to laugh, to cry, to move freely, to express what is alive in you.',
    video: '/film-wildness.mp4',
  },
]

function FourVideos() {
  return (
    <section style={{ background: 'var(--edition-white)', borderTop: '1px solid rgba(26,26,26,0.06)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10vh 6vw' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.4, marginBottom: '1.5rem' }}
        >
          the four phases
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.15, color: 'var(--edition-dark)', marginBottom: '8vh' }}
        >
          Intimacy is not a single moment.
        </motion.h2>
      </div>

      {PHASES.map((phase, i) => (
        <motion.div key={phase.number}
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 1100, margin: '0 auto', padding: '5vh 6vw',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem',
            alignItems: 'center',
            borderTop: '1px solid rgba(26,26,26,0.08)',
          }}
        >
          <div style={{ order: i % 2 === 0 ? 0 : 1, aspectRatio: '4/3', overflow: 'hidden', background: 'var(--edition-dark)' }}>
            <video autoPlay muted loop playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            >
              <source src={phase.video} type="video/mp4" />
            </video>
          </div>

          <div style={{ order: i % 2 === 0 ? 1 : 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span style={{ fontFamily: R, fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.3 }}>{phase.number}</span>
              <span style={{ fontFamily: R, fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.65 }}>{phase.name}</span>
            </div>
            <h3 style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', lineHeight: 1.25, color: 'var(--edition-dark)' }}>
              {phase.headline}
            </h3>
            <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.9rem', lineHeight: 1.85, color: 'var(--edition-dark)', opacity: 0.6 }}>
              {phase.body}
            </p>
          </div>
        </motion.div>
      ))}
    </section>
  )
}

// ─── 6. Product ───────────────────────────────────────────────────────────────────────────────────────
function Product() {
  return (
    <section style={{ padding: '14vh 8vw', background: 'var(--edition-cream)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', gap: '8vw', alignItems: 'flex-start', flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 320px', maxWidth: '44ch' }}>
          <h2 style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', lineHeight: 1.1, color: 'var(--edition-dark)', marginBottom: '2.5rem' }}>
            six condoms.<br />six questions.<br />one ritual.
          </h2>
          <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.85rem', letterSpacing: '0.04em', color: 'var(--edition-dark)', opacity: 0.65, lineHeight: 1.85, marginBottom: '1.5rem', maxWidth: '48ch' }}>
            each box holds six vegan, ultra-thin condoms and six printed questions to open before, during, or after. no app. no algorithm. just paper, presence, and the willingness to ask.
          </p>
          <p style={{ fontFamily: R, fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--edition-pink)', marginBottom: '0.4rem' }}>
            14,90€ · includes shipping
          </p>
          <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.38, marginBottom: '3rem' }}>
            edition 01 is limited to 1.000 boxes
          </p>
          <Link href="/shop"
            style={{ fontFamily: R, fontWeight: 200, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-white)', background: 'var(--edition-dark)', padding: '0.85rem 2rem', textDecoration: 'none', display: 'inline-block' }}>
            reserve your box
          </Link>
        </div>

        <div style={{ flex: '0 0 auto', position: 'relative', width: 'clamp(200px, 28vw, 360px)', height: 'clamp(260px, 36vw, 480px)' }}>
          {['/edition-01/card-01.png', '/edition-01/card-03.png', '/edition-01/card-06.png'].map((src, i) => (
            <motion.div key={src}
              animate={{ y: [0, -10 + i * 4, 0], rotate: [i * 8 - 8, i * 8 - 6, i * 8 - 8] }}
              transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', width: '55%', left: `${i * 22}%`, top: `${i * 8}%`, zIndex: 3 - i, boxShadow: '0 8px 28px rgba(26,26,26,0.12)', borderRadius: '3px', overflow: 'hidden' }}
            >
              <Image src={src} alt="" width={220} height={308} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

// ─── 7. Founder ──────────────────────────────────────────────────────────────────────────────────────
function Founder() {
  return (
    <section style={{ position: 'relative', padding: '14vh 8vw', background: 'var(--edition-white)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(200px, 35vw, 480px)', color: 'var(--edition-pink)', opacity: 0.05, pointerEvents: 'none', userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap' }}>
        ∧
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', maxWidth: '64ch' }}
      >
        <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.45, marginBottom: '2rem' }}>a note from the founder</p>
        <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.4rem, 2.8vw, 2.4rem)', lineHeight: 1.5, color: 'var(--edition-dark)', marginBottom: '2.5rem' }}>
          “i built this because i kept buying things that promised connection — and they all felt hollow. peakplant is the thing i actually wanted to find.”
        </p>
        <p style={{ fontFamily: R, fontWeight: 200, fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--edition-dark)', opacity: 0.5 }}>— Alicia, founder</p>
      </motion.div>
    </section>
  )
}

// ─── 8. Edition cards ──────────────────────────────────────────────────────────────────────────────────
function EditionCards() {
  const [hovered, setHovered] = useState<string | null>(null)
  const editions = [
    { number: '01', label: 'founders edition', sublabel: 'sommer 2026', active: true, card: '/edition-01/card-01.png' },
    { number: '02', label: 'edition 02', sublabel: 'herbst 2026', active: false, card: null },
    { number: '03', label: 'edition 03', sublabel: 'winter 2026', active: false, card: null },
  ]
  return (
    <section style={{ background: 'var(--edition-dark)', padding: '14vh 8vw' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--edition-white)', lineHeight: 1.15, marginBottom: '6vh' }}
        >
          every edition.<br />a different world.
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {editions.map(({ number, label, sublabel, active, card }, i) => (
            <motion.div key={number}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => active && setHovered(number)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                background: active ? 'rgba(250,250,248,0.06)' : 'rgba(250,250,248,0.03)',
                border: active ? '1px solid rgba(250,250,248,0.2)' : '1px solid rgba(250,250,248,0.08)',
              }}
            >
              {active && card && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  opacity: hovered === number ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}>
                  <Image src={card} alt="" fill style={{ objectFit: 'cover', objectPosition: 'center' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.5)' }} />
                </div>
              )}
              <div style={{ position: 'relative', zIndex: 1, padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--edition-gold)', opacity: active ? 1 : 0.35, marginBottom: '0.75rem' }}>∧ {number}</p>
                  <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', color: 'var(--edition-white)', opacity: active ? 1 : 0.3, lineHeight: 1.2 }}>{label}</p>
                </div>
                <div>
                  <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.62rem', letterSpacing: '0.14em', color: 'var(--edition-white)', opacity: active ? 0.6 : 0.2, marginBottom: '0.5rem' }}>{sublabel}</p>
                  {active ? (
                    <span style={{ fontFamily: R, fontWeight: 100, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--edition-pink)' }}>open</span>
                  ) : (
                    <span style={{ fontFamily: R, fontWeight: 100, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--edition-white)', opacity: 0.2 }}>coming soon</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontFamily: R, fontWeight: 200, fontSize: '0.85rem', color: 'var(--edition-white)', opacity: 0.4, lineHeight: 1.8, maxWidth: '44ch', marginTop: '4rem' }}
        >
          same box outside. different world inside.<br />
          each edition: new cards, new questions, new experience.
        </motion.p>
      </div>
    </section>
  )
}

// ─── 9. Waitlist ─────────────────────────────────────────────────────────────────────────────────────
function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <section style={{ padding: '18vh 8vw', background: 'var(--edition-dark)' }}>
      <AnimatePresence mode="wait">
        {status === 'success' || status === 'duplicate' ? (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <p style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 5rem)', color: 'var(--edition-white)', lineHeight: 1.1 }}>
              {status === 'duplicate' ? "you're already on the list." : "we'll be in touch."}
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.9 }}>
            <h2 style={{ fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(46px, 10vw, 116px)', lineHeight: 0.95, color: 'var(--edition-white)', marginBottom: '4rem' }}>
              stay a little<br />longer.
            </h2>
            <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.8rem', letterSpacing: '0.08em', color: 'var(--edition-white)', opacity: 0.45, marginBottom: '2.5rem', maxWidth: '40ch', lineHeight: 1.8 }}>
              we'll find you when it's time. no noise before then.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your email" required
                style={{ fontFamily: R, fontWeight: 200, fontSize: '0.8rem', letterSpacing: '0.06em', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(250,250,248,0.28)', color: 'var(--edition-white)', padding: '0.6rem 0', outline: 'none', minWidth: '260px' }}
              />
              <button type="submit" disabled={status === 'loading'}
                style={{ fontFamily: R, fontWeight: 200, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', background: 'transparent', color: 'var(--edition-white)', border: '1px solid rgba(250,250,248,0.32)', padding: '0.7rem 1.8rem', cursor: 'none', transition: 'background 0.3s ease, border-color 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--edition-pink)'; e.currentTarget.style.borderColor = 'var(--edition-pink)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(250,250,248,0.32)' }}
              >
                {status === 'loading' ? '...' : 'stay close'}
              </button>
            </form>
            {status === 'error' && <p style={{ fontFamily: R, fontSize: '0.7rem', color: '#e74c3c', marginTop: '0.5rem' }}>Something went wrong. Try again.</p>}
            <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.62rem', color: 'var(--edition-white)', opacity: 0.28, lineHeight: 1.7 }}>
              mit der anmeldung stimmst du unserer{' '}
              <Link href="/datenschutz" style={{ color: 'var(--edition-white)', opacity: 0.55, textDecoration: 'underline' }}>datenschutzerklärung</Link> zu.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ─── 10. Footer ─────────────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: '8vh 8vw 4vh', background: 'var(--edition-dark)', borderTop: '1px solid rgba(250,250,248,0.06)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', bottom: '3vh', left: '8vw', fontFamily: C, fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(3rem, 8vw, 9rem)', color: 'var(--edition-white)', opacity: 0.06, pointerEvents: 'none', userSelect: 'none', lineHeight: 1, whiteSpace: 'nowrap' }}>
        ∧ peakplant
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem', position: 'relative' }}>
        <div>
          <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--edition-white)', opacity: 0.32, marginBottom: '0.75rem' }}>∧ peakplant</p>
          <p style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--edition-white)', opacity: 0.18, lineHeight: 1.7 }}>edition 01 · launching august 2026</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {[
            { label: 'Intimacy', href: '/intimacy' },
            { label: 'Philosophy', href: '/philosophy' },
            { label: 'Ethics', href: '/ethics' },
            { label: 'Shop', href: '/shop' },
            { label: 'Journal', href: '/journal' },
            { label: 'Impressum', href: '/impressum' },
            { label: 'Datenschutz', href: '/datenschutz' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              style={{ fontFamily: R, fontWeight: 100, fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--edition-white)', opacity: 0.3, textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Grain />
      <ScrollBar />
      <NavBar activePath="/" />
      <main>
        <Hero />
        <Questions />
        <Testimonials />
        <SafeSoftWild />
        <FourVideos />
        <Product />
        <Founder />
        <EditionCards />
        <Waitlist />
        <Footer />
      </main>
    </>
  )
}
