'use client'
import { motion, useScroll } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { NavBar } from '../../components/NavBar'
import { useIsMobile } from '../../hooks/useIsMobile'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const PD = 'var(--font-display), Georgia, serif'

const CARD_IMAGES = [
  '/edition-01/8.png',
  '/edition-01/9.png',
  '/edition-01/10.png',
  '/edition-01/11.png',
  '/edition-01/12.png',
  '/edition-01/13.png',
]

function Logo({ color = '#1A1A1A', size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  return <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: '#1A1612', transformOrigin: 'left', scaleX: scrollYProgress, zIndex: 200 }} />
}

function CouplesHero({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  return (
    <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
      <video autoPlay muted playsInline loop
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
        <source src="/film-intimacy.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 35%, rgba(0,0,0,0.5) 100%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
          style={{ marginBottom: '1.5rem' }}>
          <Logo color="#ffffff" size={36} />
        </motion.div>
        <h1 style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, color: '#ffffff', letterSpacing: '-0.01em', lineHeight: 1.2, maxWidth: 560, margin: '0 auto 2rem' }}>
          {isDE ? 'wann hat das leben begonnen, sich so schnell anzufühlen?' : 'when did life start feeling this fast?'}
        </h1>
        <Link href={`/${locale}/shop`}
          style={{ display: 'inline-block', marginBottom: '2rem', padding: '0.85rem 2.2rem', border: '1px solid rgba(255,255,255,0.45)', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#ffffff', textDecoration: 'none', fontFamily: PP, textTransform: 'uppercase' }}>
          edition 01 &mdash; 14,90€
        </Link>
        <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          {isDE ? 'weiterscrollen' : 'scroll to explore'}
        </p>
      </motion.div>
    </section>
  )
}

function Product({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  const localHref = (path: string) => `/${locale}${path}`
  return (
    <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: '80vh', backgroundColor: '#ffffff', borderTop: '1px solid #E0D8CF', borderBottom: '1px solid #E0D8CF' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '80px 32px' : '120px 80px' }}>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
          style={{ fontSize: 10, letterSpacing: '0.55em', color: '#1A1612', opacity: 0.35, marginBottom: 36, fontFamily: PP }}>
          {isDE ? 'WAS WIR GEMACHT HABEN' : 'WHAT WE MADE'}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
          style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(2.2rem, 4.5vw, 5rem)', fontWeight: 300, color: '#1A1612', lineHeight: 1.08, marginBottom: 36, letterSpacing: '-0.01em' }}>
          {isDE ? 'Für die Momente,
die bleiben.' : 'Made for the moments
that stay with you.'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }}
          style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontWeight: 300, maxWidth: 360, marginBottom: 0, fontFamily: PP }}>
          {isDE ? '6 Kondome. 6 Reflexionskarten. 1 Saatpapierkarte.\nvegan · fair rubber latex · ab august 2026.' : '6 condoms. 6 reflection cards. 1 seed paper card.\nvegan · fair rubber latex · launching august 2026.'}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} viewport={{ once: true }}
          style={{ marginTop: 36, display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: 300, letterSpacing: '-0.01em', color: '#1A1612', fontFamily: PP }}>14,90€</span>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.4, fontFamily: PP }}>{isDE ? 'inkl. versand' : 'incl. shipping'}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4 }} viewport={{ once: true }}>
          <Link href={localHref('/shop')} style={{ display: 'inline-block', marginTop: 16, fontSize: 10, letterSpacing: '0.45em', color: '#1A1612', opacity: 0.5, textDecoration: 'none', fontFamily: PP, borderBottom: '1px solid rgba(26,22,18,0.25)', paddingBottom: 4 }}>
            {isDE ? 'ENTDECKEN →' : 'SEE IT →'}
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
        style={{ minHeight: isMobile ? '60vw' : 'auto' }}>
        <img src="/couples-joy.jpg" alt="couple sharing a tender moment together" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
      </motion.div>
    </section>
  )
}

function Waitlist({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const isDE = locale === 'de'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <section style={{ padding: '160px 40px', backgroundColor: '#1A1612', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
          <Logo color="#ffffff" size={44} />
        </motion.div>
        <h2 style={{ marginTop: 36, fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 300, color: '#ffffff', lineHeight: 1.1, maxWidth: 560, margin: '36px auto 20px', letterSpacing: '-0.01em' }}>
          {isDE ? 'bleib noch etwas.' : 'stay a little longer.'}
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.4, maxWidth: 400, margin: '0 auto 56px', lineHeight: 1.85, fontWeight: 300, fontFamily: PP }}>
          {isDE ? 'wir melden uns, wenn die zeit kommt. kein lärm davor.' : "we'll find you when it's time. no noise before then."}
        </p>
        {status === 'success' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.75, fontFamily: PP, fontWeight: 300, lineHeight: 1.7 }}>
              {isDE ? 'gut. schau in dein postfach —\nwir haben dir die sechs fragen gelassen.' : 'good. check your inbox —\nwe left you the six questions.'}
            </p>
          </motion.div>
        ) : status === 'duplicate' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 13, letterSpacing: '0.08em', color: '#ffffff', opacity: 0.5, fontFamily: PP, fontWeight: 300 }}>
            {isDE ? 'du bist bereits auf der liste.' : "you're already on the list."}
          </motion.p>
        ) : (
          <form onSubmit={submit} style={{ display: 'inline-flex', maxWidth: 460, width: '100%', border: '1px solid rgba(255,255,255,0.2)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={isDE ? 'deine@email.com' : 'your@email.com'} required
              style={{ flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#ffffff' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 28px', backgroundColor: '#ffffff', color: '#1A1612', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, fontWeight: 500 }}>
              {status === 'loading' ? '...' : (isDE ? 'dabei bleiben' : 'stay close')}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ marginTop: 12, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>{isDE ? 'Etwas ist schiefgelaufen. Versuch es nochmal.' : 'Something went wrong. Try again.'}</p>}
        {status !== 'success' && status !== 'duplicate' && (
          <p style={{ marginTop: 16, fontSize: 11, color: '#ffffff', opacity: 0.3, fontFamily: PP, lineHeight: 1.65 }}>
            mit der anmeldung stimmst du unserer{' '}
            <Link href="/datenschutz" style={{ color: '#ffffff', opacity: 0.6, textDecoration: 'underline' }}>datenschutzerklärung</Link>
            {' '}zu.
          </p>
        )}
      </motion.div>
    </section>
  )
}

const questionsEN = [
  { n: '01', q: "what's your favorite memory of us?" },
  { n: '02', q: 'when did you know?' },
  { n: '03', q: 'what do you want to remember about tonight?' },
  { n: '04', q: 'go for a walk. no destination. just talk.' },
  { n: '05', q: 'who would you be without me?' },
  { n: '06', q: 'how would you describe me — without age, job, family or hobbies?' },
]
const questionsDE = [
  { n: '01', q: 'was ist deine liebste erinnerung an uns?' },
  { n: '02', q: 'wann hast du es gewusst?' },
  { n: '03', q: 'was soll von heute abend bleiben?' },
  { n: '04', q: 'geht spazieren. kein ziel. einfach reden.' },
  { n: '05', q: 'wer wärst du ohne mich?' },
  { n: '06', q: 'wie würdest du mich beschreiben – ohne alter, beruf, familie oder hobbys?' },
]

function QuestionRow({ n, q, cardSrc, i }: { n: string; q: string; cardSrc: string; i: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '2.5rem', padding: '2rem 0', borderBottom: '1px solid #E0D8CF', overflow: 'hidden', cursor: 'default' }}
    >
      <motion.div
        animate={{ opacity: hovered ? 0.07 : 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cardSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px)', transform: 'scale(1.04)', pointerEvents: 'none' }}
      />
      <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.25, fontFamily: PP, minWidth: 24, position: 'relative', zIndex: 1 }}>{n}</span>
      <p style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(1.15rem, 2.2vw, 1.6rem)', fontWeight: 300, letterSpacing: '-0.01em', color: '#1A1612', position: 'relative', zIndex: 1, lineHeight: 1.4 }}>
        “{q}”
      </p>
    </motion.div>
  )
}

function SixQuestions({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  const questions = isDE ? questionsDE : questionsEN
  return (
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E0D8CF', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem', fontFamily: PP }}>
          edition 01
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '5rem' }}>
          {isDE ? 'sechs fragen. eine box.' : 'six questions. one box.'}
        </motion.h2>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #E0D8CF' }}>
          {questions.map(({ n, q }, i) => (
            <QuestionRow key={n} n={n} q={q} cardSrc={CARD_IMAGES[i]} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  const quotes = isDE ? [
    { text: 'wir hatten seit jahren nicht mehr so geredet. nicht weil wir nicht wollten – wir wussten einfach nicht, wie wir anfangen sollten.', author: '— beta tester, stuttgart' },
    { text: 'ich bin definitiv teil der hook-up-culture. aber echte intime momente sind einfach wunderschön. wir reden danach immer. jetzt können wir diese momente sammeln und festhalten. ich wusste nicht, dass uns das noch näher bringen kann.', author: '— beta tester, münchen' },
  ] : [
    { text: "we hadn't talked like that in years. not because we didn't want to — we just didn't know how to start.", author: '— beta tester, stuttgart' },
    { text: "i'm definitely part of the hook-up culture. but moments of real intimacy are just beautiful. we always talk after. now we can collect these moments and remember them. i didn't know this could bring us even closer together.", author: '— beta tester, münchen' },
  ]
  return (
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E0D8CF', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '5rem' }}>
        {quotes.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontFamily: PD, fontSize: '1.8rem', color: '#B8955A', lineHeight: 1 }}>∧</span>
            <p style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', fontWeight: 300, lineHeight: 1.65, color: '#1A1612' }}>“{q.text}”</p>
            <p style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#1A1612', opacity: 0.4, fontWeight: 300 }}>{q.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function EditionCard01({ locale }: { locale: string }) {
  const [hovered, setHovered] = useState(false)
  const isDE = locale === 'de'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', overflow: 'hidden', minHeight: 280, border: '1px solid rgba(255,255,255,0.12)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'default' }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/010826.png)', backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }} />
      <motion.div
        animate={{ opacity: hovered ? 0.5 : 0.15 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#B8955A', fontSize: '1rem', lineHeight: 1 }}>∧</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)', fontWeight: 300, color: '#ffffff', lineHeight: 1.5, marginBottom: '1rem' }}>
          {isDE ? '„wann hast du es gewusst?“' : '“when did you know?”'}
        </p>
        <span style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)', fontWeight: 300, color: 'rgba(255,255,255,0.6)', fontFamily: PP, letterSpacing: '0.08em', textTransform: 'uppercase' }}>edition 01 — sommer 2026</span>
      </div>
    </motion.div>
  )
}

function EditionSystem({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  return (
    <section style={{ backgroundColor: '#1A1612', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, color: '#ffffff', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '4rem', maxWidth: 560 }}>
          {isDE ? 'jede edition. eine andere welt.' : 'every edition. a different world.'}
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
          <EditionCard01 locale={locale} />
          {['edition 02 — herbst 2026', 'edition 03 — winter 2026'].map((label, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: (i + 1) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', overflow: 'hidden', minHeight: 280, border: '1px solid rgba(255,255,255,0.07)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.35 }}
            >
              <div><span style={{ color: '#B8955A', fontSize: '1rem', lineHeight: 1 }}>∧</span></div>
              <div>
                <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.2em', color: '#ffffff', opacity: 0.5, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  {isDE ? 'demnächst' : 'coming soon'}
                </p>
                <span style={{ fontFamily: PD, fontStyle: 'italic', fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', fontWeight: 300, color: '#ffffff', letterSpacing: '-0.01em' }}>{label}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: '0.95rem', color: '#ffffff', opacity: 0.45, lineHeight: 1.75, fontWeight: 300, maxWidth: 480, fontFamily: PP, whiteSpace: 'pre-line' }}>
          {isDE
            ? 'außen dieselbe box. innen eine andere welt.\njede edition: neue karten, neue fragen, neue digitale welt.'
            : 'same box outside. different world inside.\neach edition: new cards, new questions, new digital world.'}
        </motion.p>
      </div>
    </section>
  )
}

function Footer({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  const localHref = (path: string) => `/${locale}${path}`
  const footerNav = isDE
    ? [['INTIMITÄT', '/intimacy'], ['PHILOSOPHIE', '/philosophy'], ['SHOP', '/shop'], ['COMMUNITY', '/community']]
    : [['INTIMACY', '/intimacy'], ['PHILOSOPHY', '/philosophy'], ['SHOP', '/shop'], ['COMMUNITY', '/community']]
  return (
    <footer style={{ padding: '48px 40px', backgroundColor: '#1A1612', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo color="#ffffff" size={18} />
        <span style={{ color: '#ffffff', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, opacity: 0.55 }}>PEAKPLANT</span>
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {footerNav.map(([label, href]) => (
          <Link key={href} href={localHref(href)} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.35em', fontFamily: PP, textDecoration: 'none', opacity: 0.35 }}>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['impressum', '/impressum'], ['datenschutz', '/datenschutz'], ['agb', '/agb']].map(([label, href]) => (
          <Link key={href} href={href} style={{ color: '#ffffff', fontSize: 9, letterSpacing: '0.25em', fontFamily: PP, textDecoration: 'none', opacity: 0.22 }}>
            {label}
          </Link>
        ))}
        <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#ffffff', opacity: 0.18, fontFamily: PP }}>© 2026 PEAKPLANT</p>
      </div>
    </footer>
  )
}

export default function Home({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isMobile = useIsMobile()
  return (
    <main style={{ backgroundColor: '#ffffff', fontFamily: PP }}>
      <ScrollBar />
      <NavBar activePath="/" />
      <CouplesHero locale={locale} />
      <Product locale={locale} isMobile={isMobile} />
      <SixQuestions locale={locale} />
      <Testimonials locale={locale} isMobile={isMobile} />
      <Waitlist locale={locale} />
      <EditionSystem locale={locale} isMobile={isMobile} />
      <Footer locale={locale} />
    </main>
  )
}
