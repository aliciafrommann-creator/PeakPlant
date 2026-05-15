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

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: '#1A1A1A', transformOrigin: 'left', scaleX: scrollYProgress, zIndex: 200 }} />
  )
}

function NavLink({ href, label, light }: { href: string; label: string; light?: boolean }) {
  const [hov, setHov] = useState(false)
  const c = light ? '#ffffff' : '#1A1A1A'
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', color: c, fontSize: 10, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.55, paddingBottom: 3 }}>
      {label.toUpperCase()}
      <motion.span animate={{ scaleX: hov ? 1 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '0.5px', background: c, transformOrigin: 'left', display: 'block' }} />
    </Link>
  )
}

function Nav() {
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <Logo color="#1A1A1A" size={28} />
      </Link>
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        {['Home', 'Intimacy', 'Philosophy', 'Shop', 'Journal', 'Community'].map(item => (
          <NavLink key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} label={item} />
        ))}
      </div>
    </nav>
  )
}

function LogoHero() {
  return (
    <section style={{ height: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <video autoPlay muted playsInline loop
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}>
        <source src="/film-logo-transform.mp4" type="video/mp4" />
      </video>
    </section>
  )
}

function Product() {
  const lines = [
    { label: true, text: 'WHAT WE MADE' },
    { heading: true, text: 'Made for the moments\nthat stay with you.' },
    { text: 'Thin, safe, and honest. On each of the six wrappers, a question — because the best moments always start with one.' },
    { text: 'Everything else we made as good as we possibly could — so you can forget about it and enjoy the rest.' },
  ]
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh', backgroundColor: '#F4F1EB' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 80px' }}>
        {lines.map((l, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
            {l.label && <p style={{ fontSize: 10, letterSpacing: '0.55em', color: '#1A1A1A', opacity: 0.38, marginBottom: 36, fontFamily: PP }}>{l.text}</p>}
            {l.heading && <h2 style={{ fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 300, color: '#1A1A1A', lineHeight: 1.15, marginBottom: 32, letterSpacing: '-0.02em', fontFamily: PP, whiteSpace: 'pre-line' }}>{l.text}</h2>}
            {!l.label && !l.heading && <p style={{ fontSize: 15, lineHeight: 1.85, color: '#1A1A1A', opacity: 0.55, fontWeight: 300, maxWidth: 360, marginBottom: 20, fontFamily: PP }}>{l.text}</p>}
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.45 }} viewport={{ once: true }}>
          <Link href="/shop" style={{ alignSelf: 'flex-start', display: 'inline-block', marginTop: 28, fontSize: 10, letterSpacing: '0.45em', color: '#1A1A1A', opacity: 0.6, textDecoration: 'none', fontFamily: PP, borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 4 }}>
            SEE IT →
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <img src="/couples-joy.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
      </motion.div>
    </section>
  )
}

function SlidePanel({ src, caption }: { src: string; caption: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ width: '100vw', height: '100%', flex: '0 0 100vw', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={src} alt={caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
      >
        <motion.p
          animate={{ y: hovered ? 0 : 32 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(5rem, 11vw, 10rem)', fontWeight: 200, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.04em', lineHeight: 1, mixBlendMode: 'difference' }}
        >
          {caption}
        </motion.p>
      </motion.div>
    </div>
  )
}

function HorizontalSlideshow() {
  const photos = [
    { src: '/scenery-1.jpg', caption: 'WARMTH' },
    { src: '/scenery-3.jpg', caption: 'CLOSENESS' },
    { src: '/scenery-4.jpg', caption: 'TENDERNESS' },
    { src: '/scenery-2.jpg', caption: 'PRESENCE' },
  ]
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', '-300vw'])

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <motion.div style={{ display: 'flex', height: '100%', x, willChange: 'transform' }}>
          {photos.map((p, i) => (
            <SlidePanel key={i} src={p.src} caption={p.caption} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

function FullBleed() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  return (
    <motion.section ref={ref}
      initial={{ clipPath: 'inset(0 8% 0 8%)' }} whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
      style={{ margin: '0 0 180px', height: '70vh', overflow: 'hidden', position: 'relative' }}>
      <motion.img src="/hero-bg.png" alt=""
        style={{ width: '100%', height: '124%', objectFit: 'cover', display: 'block', y, position: 'absolute', top: 0, left: 0 }} />
    </motion.section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }
  return (
    <section style={{ padding: '160px 40px', backgroundColor: '#1A1A1A', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
          <Logo color="#ffffff" size={44} />
        </motion.div>
        <h2 style={{ marginTop: 36, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, maxWidth: 560, margin: '36px auto 20px', fontFamily: PP, letterSpacing: '-0.02em' }}>
          First access to the founding collection.
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.4, maxWidth: 400, margin: '0 auto 56px', lineHeight: 1.85, fontWeight: 300, fontFamily: PP }}>
          The first PeakPlant collection is limited. Leave your email and we'll reach out personally before anything goes public.
        </p>
        {status === 'success' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 11, letterSpacing: '0.45em', color: '#ffffff', opacity: 0.6, fontFamily: PP }}>
            LOVELY. WE'LL BE IN TOUCH.
          </motion.p>
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
      <ScrollBar />
      <Nav />
      <LogoHero />
      <Product />
      <HorizontalSlideshow />
      <FullBleed />
      <Waitlist />
      <Footer />
    </main>
  )
}
