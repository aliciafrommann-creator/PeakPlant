'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ color = '#1A1A1A', size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Nav() {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo color="#1A1A1A" size={22} />
        <span style={{ color: '#1A1A1A', fontSize: 11, letterSpacing: '0.45em', fontFamily: PP, fontWeight: 400 }}>PEAKPLANT</span>
      </Link>
      <div style={{ display: 'flex', gap: 32 }}>
        {['Intimacy', 'Philosophy', 'Shop', 'Journal'].map(item => (
          <Link key={item} href={`/${item.toLowerCase()}`} style={{ color: '#1A1A1A', fontSize: 10, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.45 }}>
            {item.toUpperCase()}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const replay = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play()
  }

  return (
    <section style={{ backgroundColor: '#ffffff', display: 'grid', gridTemplateRows: 'auto 72vh', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 40px 32px', gap: 22 }}>
        <div onMouseEnter={replay} title="Replay" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <Logo color="#1A1A1A" size={84} />
          <span style={{ fontSize: 12, letterSpacing: '0.62em', color: '#1A1A1A', fontFamily: PP, fontWeight: 300 }}>PEAKPLANT</span>
        </div>
        <p style={{ fontSize: 17, fontStyle: 'italic', fontWeight: 300, color: '#1A1A1A', opacity: 0.62, letterSpacing: '0.12em', fontFamily: PP }}>
          Grow where you feel most alive.
        </p>
        <p style={{ fontSize: 9, letterSpacing: '0.62em', color: '#1A1A1A', opacity: 0.28, fontFamily: PP }}>
          SAFE.&nbsp;&nbsp;&nbsp;SOFT.&nbsp;&nbsp;&nbsp;WILD.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 0.7 }}
        style={{ overflow: 'hidden', width: '100%' }}>
        <video ref={videoRef} autoPlay muted playsInline loop style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}>
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </section>
  )
}

function Manifesto() {
  return (
    <section style={{ padding: '160px 40px', maxWidth: 680, margin: '0 auto' }}>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 300, color: '#1A1A1A', lineHeight: 1.15, marginBottom: 56, letterSpacing: '-0.02em', fontFamily: PP, fontStyle: 'italic' }}>
        Being close to someone is one of the best things about being alive.
      </motion.p>
      {[
        'Not performing closeness. Actually being there — soft, open, safe enough to fully let go. That is what we are building toward.',
        'We live in systems that made intimacy feel like something to get right. Something to earn. PeakPlant exists to intervene in that. To make space for presence over performance — in the most human moments of all.',
        'We made something honest. Something that belongs in those moments and doesn\'t take you out of them. Safe. Soft. Wild — in that order, and at the same time.',
      ].map((text, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: i * 0.08 }}
          viewport={{ once: true }}
          style={{ fontSize: 16, lineHeight: 1.9, color: '#1A1A1A', opacity: 0.6, fontWeight: 300, marginBottom: 28, fontFamily: PP }}>
          {text}
        </motion.p>
      ))}
    </section>
  )
}

function ParallaxImage({ src, height = 600 }: { src: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-9%', '9%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', height, width: '100%' }}>
      <motion.img src={src} alt="" style={{ width: '100%', height: '118%', objectFit: 'cover', display: 'block', y }} />
    </div>
  )
}


function PhotoEssay() {
  const photos = [
    { src: '/scenery-1.jpg', caption: 'WARMTH', height: 520 },
    { src: '/scenery-3.jpg', caption: 'CLOSENESS', height: 400 },
    { src: '/scenery-4.jpg', caption: 'TENDERNESS', height: 520 },
    { src: '/scenery-2.jpg', caption: 'PRESENCE', height: 400 },
  ]
  return (
    <section style={{ padding: '0 40px 160px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, alignItems: 'end' }}>
        {photos.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: i * 0.1 }} viewport={{ once: true }} style={{ overflow: 'hidden' }}>
            <div style={{ height: p.height, overflow: 'hidden' }}>
              <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 1.2s ease' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
            </div>
            <p style={{ marginTop: 10, fontSize: 9, letterSpacing: '0.5em', color: '#1A1A1A', opacity: 0.35, fontFamily: PP }}>{p.caption}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Product() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh', backgroundColor: '#F4F1EB' }}>
      <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1.4 }} viewport={{ once: true }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 80px' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.55em', color: '#1A1A1A', opacity: 0.38, marginBottom: 36, fontFamily: PP }}>WHAT WE MADE</p>
        <h2 style={{ fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 300, color: '#1A1A1A', lineHeight: 1.15, marginBottom: 32, letterSpacing: '-0.02em', fontFamily: PP }}>
          Made for the evenings<br />that stay with you.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#1A1A1A', opacity: 0.58, fontWeight: 300, maxWidth: 360, marginBottom: 20, fontFamily: PP }}>
          Thin, safe, and honest. On each of the six wrappers, a question — because the best evenings always start with one.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: '#1A1A1A', opacity: 0.58, fontWeight: 300, maxWidth: 360, marginBottom: 48, fontFamily: PP }}>
          Everything else we made as good as we possibly could — so you can forget about it and enjoy the rest.
        </p>
        <Link href="/shop" style={{ alignSelf: 'flex-start', fontSize: 10, letterSpacing: '0.45em', color: '#1A1A1A', opacity: 0.6, textDecoration: 'none', fontFamily: PP, borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 4 }}>
          SEE IT →
        </Link>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.6 }} viewport={{ once: true }} style={{ overflow: 'hidden', clipPath: 'inset(0 0 18% 0)' }}>
        <img src="/product-hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', imageRendering: 'auto' }} />
      </motion.div>
    </section>
  )
}

function Questions() {
  const qs = [
    'When did you last feel fully yourself with someone?',
    'What does it feel like to be really seen?',
    'What does tenderness feel like to you?',
    'When do you feel safe enough to let go?',
    'What would you do if you weren\'t afraid?',
    'What does wild mean to you?',
  ]
  return (
    <section style={{ padding: '160px 40px' }}>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}
        style={{ textAlign: 'center', fontSize: 10, letterSpacing: '0.55em', color: '#1A1A1A', opacity: 0.35, marginBottom: 24, fontFamily: PP }}>
        THE WRAPPERS
      </motion.p>
      <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} viewport={{ once: true }}
        style={{ textAlign: 'center', fontSize: 15, color: '#1A1A1A', opacity: 0.45, fontWeight: 300, fontStyle: 'italic', marginBottom: 80, fontFamily: PP }}>
        Six questions. One for each.
      </motion.p>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {qs.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: i * 0.07 }} viewport={{ once: true }}
            style={{ padding: '28px 0', borderBottom: '1px solid rgba(26,26,26,0.07)', display: 'flex', gap: 40, alignItems: 'baseline' }}>
            <span style={{ fontSize: 9, letterSpacing: '0.3em', color: '#1A1A1A', opacity: 0.25, minWidth: 24, fontFamily: PP }}>0{i + 1}</span>
            <p style={{ fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 300, color: '#1A1A1A', fontStyle: 'italic', fontFamily: PP }}>{q}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FullBleed() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.8 }} viewport={{ once: true }}
      style={{ margin: '0 0 160px', height: '70vh', overflow: 'hidden', position: 'relative' }}
    >
      <motion.img src="/hero-bg.png" alt="" style={{ width: '100%', height: '115%', objectFit: 'cover', display: 'block', y, position: 'absolute', top: 0, left: 0 }} />
    </motion.section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }

  return (
    <section style={{ padding: '160px 40px', backgroundColor: '#1A1A1A', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }} viewport={{ once: true }}>
        <Logo color="#ffffff" size={44} />
        <h2 style={{ marginTop: 36, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, maxWidth: 500, margin: '36px auto 20px', fontFamily: PP, letterSpacing: '-0.01em' }}>
          Something good is coming.
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.45, maxWidth: 380, margin: '0 auto 56px', lineHeight: 1.85, fontWeight: 300, fontFamily: PP }}>
          Leave your email and we'll reach out personally — before anything goes public.
        </p>
        {status === 'success' ? (
          <p style={{ fontSize: 11, letterSpacing: '0.45em', color: '#ffffff', opacity: 0.6, fontFamily: PP }}>LOVELY. WE'LL BE IN TOUCH.</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'inline-flex', maxWidth: 460, width: '100%', border: '1px solid rgba(255,255,255,0.22)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
              style={{ flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#ffffff' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 28px', backgroundColor: '#ffffff', color: '#1A1A1A', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, fontWeight: 500 }}>
              {status === 'loading' ? '...' : 'JOIN'}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ marginTop: 12, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>Something went wrong. Try again.</p>}
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ padding: '48px 40px', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo color="#ffffff" size={18} />
        <span style={{ color: '#ffffff', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, opacity: 0.55 }}>PEAKPLANT</span>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {['Intimacy', 'Philosophy', 'Shop', 'Journal', 'Community'].map(item => (
          <Link key={item} href={`/${item.toLowerCase()}`} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.35 }}>
            {item.toUpperCase()}
          </Link>
        ))}
      </div>
      <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#ffffff', opacity: 0.22, fontFamily: PP }}>© 2025 PEAKPLANT</p>
    </footer>
  )
}

export default function Home() {
  return (
    <main style={{ backgroundColor: '#ffffff', fontFamily: PP }}>
      <Nav />
      <Hero />
      <Manifesto />
      <PhotoEssay />
      <Product />
      <Questions />
      <FullBleed />
      <Waitlist />
      <Footer />
    </main>
  )
}
