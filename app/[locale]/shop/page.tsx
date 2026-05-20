'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { NavBar } from '../../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const CARD_IMAGES = [
  '/edition-01/8.png',
  '/edition-01/9.png',
  '/edition-01/10.png',
  '/edition-01/11.png',
  '/edition-01/12.png',
  '/edition-01/13.png',
]

function ParallaxImage({ src, alt, objectPosition = 'center' }: { src: string; alt: string; objectPosition?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <motion.img src={src} alt={alt} style={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition, y }} />
    </div>
  )
}

function WaitlistModal({ onClose, locale }: { onClose: () => void; locale: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const isDE = locale === 'de'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'shop', locale }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: '#ffffff', border: '1px solid #1A1A1A', padding: '3rem', maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7 }}>
              {isDE ? 'wir melden uns, wenn die zeit kommt.' : "we'll find you when it's time."}
            </p>
          </div>
        ) : status === 'duplicate' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7, opacity: 0.6 }}>
              {isDE ? 'du bist bereits auf der liste.' : "you're already on the list."}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>
              {isDE ? 'zur warteliste' : 'join waitlist'}
            </p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              {isDE
                ? 'edition 01 kommt im august 2026. trag dich ein — du hörst als erste von uns.'
                : 'edition 01 drops august 2026. leave your email and you\'ll hear from us first — personally.'}
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={isDE ? 'deine@email.com' : 'your@email.com'}
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <button type="submit" disabled={status === 'loading'}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {status === 'loading' ? '...' : (isDE ? 'eintragen' : 'join waitlist')}
              </button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#1A1A1A', opacity: 0.4, lineHeight: 1.6, fontFamily: PP }}>
              mit der anmeldung stimmst du unserer{' '}
              <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>datenschutzerklärung</Link>{' '}zu.
            </p>
            {status === 'error' && <p style={{ marginTop: 8, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>{isDE ? 'Fehler. Versuch es nochmal.' : 'Something went wrong. Try again.'}</p>}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function QuestionCell({ q, i, cardSrc }: { q: string; i: number; cardSrc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', padding: '2rem', borderBottom: '1px solid #e8e8e8', borderRight: i % 3 !== 2 ? '1px solid #e8e8e8' : 'none', overflow: 'hidden', cursor: 'default' }}
    >
      <motion.div
        animate={{ opacity: hovered ? 0.08 : 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${cardSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
          transform: 'scale(1.04)',
          pointerEvents: 'none',
        }}
      />
      <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.3, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>0{i + 1}</p>
      <p style={{ fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic', color: '#1A1A1A', position: 'relative', zIndex: 1 }}>"{q}"</p>
    </motion.div>
  )
}

export default function ShopPage({ params }: { params: { locale: string } }) {
  const [modalOpen, setModalOpen] = useState(false)
  const { locale } = params
  const isDE = locale === 'de'

  const pricingRows = [
    { label: isDE ? 'preis' : 'price',                  founders: '14,90€ inkl. Versand', sub: '27€ + 12,90€/mo' },
    { label: isDE ? 'kondome' : 'condoms',              founders: '6',                  sub: '6 / month' },
    { label: isDE ? 'karten' : 'cards',                 founders: isDE ? '6 Reflexionskarten' : '6 reflection cards', sub: '6 / month' },
    { label: isDE ? 'digitale welt' : 'digital world',  founders: '✓',                  sub: '✓' },
    { label: isDE ? 'archiv-heft' : 'archive booklet',  founders: '—',                  sub: isDE ? 'monat 3' : 'month 3' },
    { label: isDE ? 'jederzeit kündbar' : 'cancel anytime', founders: '—',            sub: '✓' },
  ]

  const questionsLocale = isDE ? [
    'was ist deine liebste erinnerung an uns?',
    'wann hast du es gewusst?',
    'was soll von heute abend bleiben?',
    'geht spazieren. kein ziel. einfach reden.',
    'wer wärst du ohne mich?',
    'wie würdest du mich beschreiben – ohne alter, beruf, familie oder hobbys?',
  ] : [
    "what's your favorite memory of us?",
    'when did you know?',
    'what do you want to remember about tonight?',
    'go for a walk. no destination. just talk.',
    'who would you be without me?',
    'how would you describe me — without age, job, family or hobbies?',
  ]

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/shop" />

      <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
        <video autoPlay muted playsInline loop
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
          <source src="/film-wildness.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
        >
          <p style={{ fontFamily: PP, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 600, marginBottom: '1rem' }}>
            {isDE ? 'Nicht nur ein Produkt.\nEine Entscheidung, zu fühlen.' : 'Not just a product.\nA decision to feel.'}
          </p>
          <p style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>
            {isDE ? '14,90€ · inkl. Versand · ab august 2026' : '14,90€ · includes shipping · launches august 2026'}
          </p>
          <button
            style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => setModalOpen(true)}>
            {isDE ? 'zur warteliste →' : 'join waitlist →'}
          </button>
        </motion.div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', maxWidth: 1100, margin: '0 auto', padding: '7rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ aspectRatio: '1/1', background: '#f5f5f5', overflow: 'hidden' }}>
            <ParallaxImage src="/product-box.jpg" alt="PeakPlant founders edition" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>edition 01 — sommer 2026</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15 }}>founders edition</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(isDE ? [
                '6 Kondome — vegan, fair rubber latex',
                '6 Reflexionskarten — Blauer Engel zertifiziert, beschreibbar',
                '1 Saatpapierkarte mit QR zur digitalen Welt',
              ] : [
                '6 condoms — vegan, fair rubber latex',
                '6 reflection cards — blauer engel certified, writable',
                '1 seed paper card with QR to digital world',
              ]).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3, minWidth: 8 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.6rem', fontFamily: PP }}>
                {isDE ? 'die digitale welt' : 'the digital world'}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#777', fontWeight: 300, lineHeight: 1.7, fontFamily: PP }}>
                {isDE
                  ? 'kuratierte spotify playlists · vorlagen zum download · podcast und gründer-einblicke · community-events · ein kostenloser workshop pro edition'
                  : 'curated spotify playlists · templates to download · podcast and founder insights · community events · one free workshop per edition'}
              </p>
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: 300, letterSpacing: '-0.01em' }}>14,90€</p>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.4 }}>{isDE ? 'inkl. Versand' : 'incl. shipping'}</p>
            </div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
              {isDE ? 'ab august 2026' : 'launching august 2026'}
            </p>
            <button onClick={() => setModalOpen(true)}
              style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
              {isDE ? 'zur warteliste' : 'join waitlist'}
            </button>
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>
                {isDE ? 'abo · jederzeit kündbar' : 'subscription · cancel anytime'}
              </p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                {isDE ? 'das ritual. jeden monat.' : 'the ritual, monthly'}
              </h2>
              <p style={{ fontSize: '1rem', color: '#666', fontWeight: 300, marginTop: '0.5rem' }}>
                {isDE ? 'jeden monat eine neue edition.' : 'a new edition every month'}
              </p>
            </div>
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1rem' }}>
                {isDE ? 'willkommensbox — einmalig' : 'welcome box — once'}
              </p>
              {(isDE ? [
                'premium unboxing erlebnis',
                'persönlicher brief von alicia',
                'edition 01 box',
              ] : [
                'premium unboxing experience',
                'personal letter from alicia',
                'edition 01 box',
              ]).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1rem' }}>
                {isDE ? 'dann monatlich' : 'then monthly'}
              </p>
              {(isDE ? [
                'neue edition jeden monat',
                'neue karten, neue fragen, neue digitale welt',
                'monat 3: das archiv-heft',
              ] : [
                'new edition every month',
                'new cards, new questions, new digital world',
                'month 3: the archive booklet',
              ]).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                {isDE ? '27€ einmalig · dann 12,90€/monat · jederzeit kündbar' : '27€ to start · then 12,90€/month · cancel anytime'}
              </p>
            </div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.85 }}>
              {isDE ? 'ab august 2026' : 'launching august 2026'}
            </p>
            <button onClick={() => setModalOpen(true)}
              style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', cursor: 'pointer', alignSelf: 'flex-start' }}>
              {isDE ? 'zur warteliste' : 'join waitlist'}
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ aspectRatio: '1/1', background: '#f0f0f0', overflow: 'hidden' }}>
            <ParallaxImage src="/couples-rain.jpg" alt={isDE ? 'das ritual' : 'the ritual'} />
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '3rem' }}>
          {isDE ? 'vergleich' : 'compare'}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #1A1A1A', paddingBottom: '1rem' }}>
            <div />
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>founders edition</p>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>{isDE ? 'abo' : 'subscription'}</p>
          </div>
          {pricingRows.map(({ label, founders, sub }) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '1.1rem 0', borderBottom: '1px solid #ebebeb' }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.06em', opacity: 0.5, textTransform: 'lowercase' }}>{label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{founders}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{sub}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>
          {isDE ? 'edition 01 — die fragen' : 'edition 01 — the questions'}
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
          {questionsLocale.map((q, i) => (
            <QuestionCell key={i} q={q} i={i} cardSrc={CARD_IMAGES[i]} />
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 300, lineHeight: 1.4, marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
            {isDE ? 'edition 01 ist limitiert. sei dabei.' : 'edition 01 is limited. be there when it opens.'}
          </p>
          <button onClick={() => setModalOpen(true)}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', cursor: 'pointer' }}>
            {isDE ? 'zur warteliste' : 'join waitlist'}
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} locale={locale} />}
      </AnimatePresence>
    </div>
  )
}
