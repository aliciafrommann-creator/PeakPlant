'use client'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <motion.img src={src} alt={alt} style={{ width: '100%', height: '115%', objectFit: 'cover', y }} />
    </div>
  )
}

const pillars = [
  {
    number: '01',
    title: 'Honesty',
    body: 'We say what we are. An intimacy brand. We make condoms — and we think that deserves to be said with warmth, not embarrassment.',
  },
  {
    number: '02',
    title: 'Softness',
    body: 'Closeness is not a performance. It's a feeling. We design everything around that — the product, the packaging, the words on the wrapper.',
  },
  {
    number: '03',
    title: 'Wildness',
    body: 'Being alive is extraordinary. Being close to someone you want to be close to is one of the best things about it. We celebrate that, fully.',
  },
  {
    number: '04',
    title: 'Safety',
    body: 'Real safety is not just physical. It's the feeling that you can be yourself. We hold both — the literal and the emotional — with equal care.',
  },
]

export default function PhilosophyPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <Logo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/philosophy' ? 1 : 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '10rem', paddingBottom: '6rem', maxWidth: 800, margin: '0 auto', padding: '10rem 2.5rem 6rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}
        >
          Our philosophy
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3rem' }}
        >
          Grow where you feel most alive.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.15rem', lineHeight: 1.85, color: '#444', maxWidth: 620 }}
        >
          Being close to someone is one of the best things about being alive. Not performing closeness — actually being there, with another person, in a way that feels real. PeakPlant exists to make that easier, more beautiful, and more honest.
        </motion.p>
      </section>

      {/* Image break */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem 6rem', height: '55vh', overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ParallaxImage src="/philosophy-hero.jpg" alt="Natural light, soft textures" />
        </motion.div>
      </section>

      {/* Body text */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 2.5rem 7rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            You do not have to perform to be worthy of love. You do not have to earn intimacy by being a certain way, wanting a certain thing, or knowing all the right moves. Intimacy is not a skill to master. It's a place you can arrive at — together — when both people feel safe enough to show up.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            PeakPlant started from a simple frustration: why does a product designed for one of the most tender moments of human life come wrapped in language that feels clinical, aggressive, or embarrassing? We wanted something different. Packaging you'd be comfortable leaving on a nightstand. Words that invite, not instruct.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444' }}>
            So we made it. And on each wrapper, a question — not because we think intimacy needs a script, but because the best evenings usually start with someone asking something real.
          </p>
        </motion.div>
      </section>

      {/* Pillars */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}
        >
          What we stand for
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3rem 5rem' }}>
          {pillars.map((p, i) => (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '1rem' }}>{p.number}</p>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing line */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 640, margin: '0 auto', letterSpacing: '-0.015em' }}
        >
          Safe. Soft. Wild. — in that order, and at the same time.
        </motion.p>
      </section>

    </div>
  )
}
