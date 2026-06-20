'use client'
import { motion, useScroll } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { NavBar } from '../../components/NavBar'
import { useIsMobile } from '../../hooks/useIsMobile'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// Global pages — no locale prefix (shop + journal only; rest are locale-routed)
const GLOBAL_PAGES = ['/shop', '/journal']

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
  return <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 1, background: '#1A1A1A', transformOrigin: 'left', scaleX: scrollYProgress, zIndex: 200 }} />
}

function CouplesHero({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  return (
    <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
      <video autoPlay muted playsInline loop
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
        <source src="/film-intimacy.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(0,0,0,0.45) 100%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
          style={{ marginBottom: '1.5rem' }}>
          <Logo color="#ffffff" size={36} />
        </motion.div>
        <h1 style={{ fontFamily: PP, fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 540, margin: '0 auto 2rem' }}>
          {isDE ? 'wann hat das leben begonnen, sich so schnell anzufühlen?' : 'when did life start feeling this fast?'}
        </h1>
        <Link href="/shop"
          style={{ display: 'inline-block', marginBottom: '2rem', padding: '0.85rem 2.2rem', border: '1px solid rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '0.28em', color: '#ffffff', textDecoration: 'none', fontFamily: PP, textTransform: 'uppercase' }}>
          {isDE ? 'edition 01 — die sonnenblume' : 'edition 01 — the sunflower'}
        </Link>
        <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          {isDE ? 'weiterscrollen' : 'scroll to explore'}
        </p>
      </motion.div>
    </section>
  )
}

function Product({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  const localHref = (path: string) => GLOBAL_PAGES.includes(path) ? path : `/${locale}${path}`
  return (
    <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: '80vh', backgroundColor: '#ffffff', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '80px 32px' : '120px 80px' }}>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
          style={{ fontSize: 10, letterSpacing: '0.55em', color: '#1A1A1A', opacity: 0.35, marginBottom: 36, fontFamily: PP }}>
          {isDE ? 'WAS WIR GEMACHT HABEN' : 'WHAT WE MADE'}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', fontWeight: 200, color: '#1A1A1A', lineHeight: 1.12, marginBottom: 36, letterSpacing: '-0.03em', fontFamily: PP, whiteSpace: 'pre-line' }}>
          {isDE ? 'Für die Momente,\ndie bleiben.' : 'Made for the moments\nthat stay with you.'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }}
          style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontWeight: 300, maxWidth: 360, marginBottom: 0, fontFamily: PP }}>
          {isDE ? '6 Kondome. 1 Fragenkarte. 1 Saatpapierkarte mit Sonnenblumensamen.\nvegan · fair rubber latex · ab august 2026.' : '6 condoms. 1 question card. 1 seed paper card with sunflower seeds.\nvegan · fair rubber latex · launching august 2026.'}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} viewport={{ once: true }}
          style={{ marginTop: 36, display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A96E', fontFamily: PP }}>{isDE ? 'vorbestellung folgt bald' : 'preorder opens soon'}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4 }} viewport={{ once: true }}>
          <Link href={localHref('/shop')} style={{ display: 'inline-block', marginTop: 16, fontSize: 10, letterSpacing: '0.45em', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none', fontFamily: PP, borderBottom: '1px solid rgba(26,26,26,0.25)', paddingBottom: 4 }}>
            {isDE ? 'ENTDECKEN →' : 'SEE IT →'}
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
        style={{ minHeight: isMobile ? '60vw' : 'auto' }}>
        <img src="/product-hero.png" alt="PeakPlant edition 01 — condoms and the sunflower question card" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
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
    let finalStatus: typeof status = 'error'
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) })
      const data = await res.json()
      if (data.duplicate) finalStatus = 'duplicate'
      else if (res.ok) finalStatus = 'success'
    } catch { finalStatus = 'error' }
    finally { setStatus(finalStatus) }
  }

  return (
    <section style={{ padding: '160px 40px', backgroundColor: '#1A1A1A', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
          <Logo color="#ffffff" size={44} />
        </motion.div>
        <h2 style={{ marginTop: 36, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, maxWidth: 560, margin: '36px auto 20px', fontFamily: PP, letterSpacing: '-0.02em' }}>
          {isDE ? 'bleib noch etwas.' : 'stay a little longer.'}
        </h2>
        <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.4, maxWidth: 400, margin: '0 auto 56px', lineHeight: 1.85, fontWeight: 300, fontFamily: PP }}>
          {isDE ? 'wir melden uns, wenn die zeit kommt. kein lärm davor.' : "we'll find you when it's time. no noise before then."}
        </p>
        {status === 'success' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p style={{ fontSize: 15, color: '#ffffff', opacity: 0.75, fontFamily: PP, fontWeight: 300, lineHeight: 1.7 }}>
              {isDE ? 'gut. schau in dein postfach —\nwir haben dir einen vorgeschmack auf edition 01 gelassen.' : 'good. check your inbox —\nwe left you a first taste of edition 01.'}
            </p>
          </motion.div>
        ) : status === 'duplicate' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 13, letterSpacing: '0.08em', color: '#ffffff', opacity: 0.5, fontFamily: PP, fontWeight: 300 }}>
            {isDE ? 'du bist bereits auf der liste.' : "you're already on the list."}
          </motion.p>
        ) : (
          <form onSubmit={submit} style={{ display: 'inline-flex', maxWidth: 460, width: '100%', border: '1px solid rgba(255,255,255,0.22)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={isDE ? 'deine@email.com' : 'your@email.com'} required
              style={{ flex: 1, padding: '16px 24px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontFamily: PP, color: '#ffffff' }} />
            <button type="submit" disabled={status === 'loading'}
              style={{ padding: '16px 28px', backgroundColor: '#ffffff', color: '#1A1A1A', border: 'none', cursor: 'pointer', fontSize: 10, letterSpacing: '0.4em', fontFamily: PP, fontWeight: 500 }}>
              {status === 'loading' ? '...' : (isDE ? 'dabei bleiben' : 'stay close')}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ marginTop: 12, fontSize: 11, color: '#e74c3c', fontFamily: PP }}>{isDE ? 'Etwas ist schiefgelaufen. Versuch es nochmal.' : 'Something went wrong. Try again.'}</p>}
        {status !== 'success' && status !== 'duplicate' && (
          <p style={{ marginTop: 16, fontSize: 11, color: '#ffffff', opacity: 0.35, fontFamily: PP, lineHeight: 1.65 }}>
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
  { n: '01', q: 'what makes you feel seen by me?' },
  { n: '02', q: 'when do you feel most alive with me?' },
  { n: '03', q: 'what helps you open up to me?' },
  { n: '04', q: 'what makes our relationship feel warm?' },
  { n: '05', q: 'where do you need more light from me?' },
  { n: '06', q: 'when do you feel safe enough to fully bloom?' },
  { n: '07', q: 'where do you need space to grow on your own?' },
  { n: '08', q: 'what are we still growing into together?' },
  { n: '09', q: 'how do we find our way back to each other?' },
  { n: '10', q: 'what have we helped each other become?' },
]
const questionsDE = [
  { n: '01', q: 'was lässt dich von mir gesehen fühlen?' },
  { n: '02', q: 'wann fühlst du dich mit mir am lebendigsten?' },
  { n: '03', q: 'was hilft dir, dich mir zu öffnen?' },
  { n: '04', q: 'was macht unsere beziehung warm?' },
  { n: '05', q: 'wo brauchst du mehr licht von mir?' },
  { n: '06', q: 'wann fühlst du dich sicher genug, ganz aufzublühen?' },
  { n: '07', q: 'wo brauchst du raum, um für dich zu wachsen?' },
  { n: '08', q: 'worin wachsen wir noch gemeinsam hinein?' },
  { n: '09', q: 'wie finden wir wieder zueinander?' },
  { n: '10', q: 'wozu haben wir einander werden lassen?' },
]

function QuestionRow({ n, q, cardSrc, i }: { n: string; q: string; cardSrc: string; i: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '2.5rem', padding: '2rem 0', borderBottom: '1px solid #ebebeb', overflow: 'hidden', cursor: 'default' }}
    >
      <motion.div
        animate={{ opacity: hovered ? 0.07 : 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cardSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px)', transform: 'scale(1.04)', pointerEvents: 'none' }}
      />
      <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.25, fontFamily: PP, minWidth: 24, position: 'relative', zIndex: 1 }}>{n}</span>
      <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 300, letterSpacing: '-0.01em', fontStyle: 'italic', color: '#1A1A1A', fontFamily: PP, position: 'relative', zIndex: 1 }}>
        "{q}"
      </p>
    </motion.div>
  )
}

const QUESTIONS_SHOWN = 3

function SixQuestions({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  const questions = (isDE ? questionsDE : questionsEN).slice(0, QUESTIONS_SHOWN)
  return (
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #ebebeb', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem', fontFamily: PP }}>
          edition 01
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '2rem', fontFamily: PP }}>
          {isDE ? 'zehn fragen. eine edition.' : 'ten questions. one edition.'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
          style={{ fontSize: '0.95rem', color: '#777', fontWeight: 300, lineHeight: 1.8, maxWidth: 440, marginBottom: '4rem', fontFamily: PP }}>
          {isDE ? 'ein vorgeschmack. die übrigen entfalten sich, eine nach der anderen, in deiner box.' : 'a first taste. the rest unfold, one at a time, inside your box.'}
        </motion.p>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #ebebeb' }}>
          {questions.map(({ n, q }, i) => (
            <QuestionRow key={n} n={n} q={q} cardSrc={CARD_IMAGES[i]} i={i} />
          ))}
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: QUESTIONS_SHOWN * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'baseline', gap: '2.5rem', padding: '2rem 0', borderBottom: '1px solid #ebebeb' }}
          >
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.25, fontFamily: PP, minWidth: 24 }}>∧</span>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 300, letterSpacing: '-0.01em', color: '#bbb', fontFamily: PP }}>
              {isDE ? 'sieben weitere — zu entdecken in edition 01.' : 'seven more — to discover in edition 01.'}
            </p>
          </motion.div>
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
    <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #ebebeb', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '5rem' }}>
        {quotes.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontFamily: PP, fontSize: '1.4rem', color: '#C9A96E', lineHeight: 1 }}>∧</span>
            <p style={{ fontFamily: PP, fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.7, color: '#1A1A1A' }}>"{q.text}"</p>
            <p style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#1A1A1A', opacity: 0.4, fontWeight: 300 }}>{q.author}</p>
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
        <span style={{ color: '#C9A96E', fontSize: '1rem', lineHeight: 1 }}>∧</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: PP, fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)', fontWeight: 300, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem' }}>
          {isDE ? '"wann hast du es gewusst?"' : '"when did you know?"'}
        </p>
        <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.01em' }}>{isDE ? 'edition 01 — die sonnenblume' : 'edition 01 — the sunflower'}</span>
      </div>
    </motion.div>
  )
}

function EditionSystem({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '4rem', maxWidth: 560, fontFamily: PP }}>
          {isDE ? 'jede edition. eine andere welt.' : 'every edition. a different world.'}
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
          <EditionCard01 locale={locale} />
          {(isDE ? ['edition 02 — herbst 2026', 'edition 03 — winter 2026'] : ['edition 02 — autumn 2026', 'edition 03 — winter 2026']).map((label, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: (i + 1) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', overflow: 'hidden', minHeight: 280, border: '1px solid rgba(255,255,255,0.07)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.35 }}
            >
              <div><span style={{ color: '#C9A96E', fontSize: '1rem', lineHeight: 1 }}>∧</span></div>
              <div>
                <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.2em', color: '#ffffff', opacity: 0.5, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  {isDE ? 'demnächst' : 'coming soon'}
                </p>
                <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.01em' }}>{label}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontSize: '0.95rem', color: '#ffffff', opacity: 0.45, lineHeight: 1.75, fontWeight: 300, maxWidth: 480, fontFamily: PP, whiteSpace: 'pre-line' }}>
          {isDE
            ? 'jede edition eine pflanze, drei monate lang. edition 01 ist die sonnenblume — ihre samen stecken im saatpapier deiner box.\nneue edition: neue pflanze, neue karten, neue fragen, neue digitale welt.'
            : 'every edition is a plant, for three months. edition 01 is the sunflower — its seeds are pressed into the seed paper in your box.\nnew edition: new plant, new cards, new questions, new digital world.'}
        </motion.p>
      </div>
    </section>
  )
}

function Manifesto({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  return (
    <section style={{ backgroundColor: '#1A1A1A', padding: '8rem 2.5rem', textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
        <p style={{ fontFamily: PP, fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#ffffff', opacity: 0.3, marginBottom: '2.5rem' }}>
          ∧ peakplant
        </p>
        <h2 style={{ fontFamily: PP, fontSize: 'clamp(2rem, 5vw, 4.5rem)', fontWeight: 200, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 0 }}>
          {isDE ? 'im moment bleiben.' : 'mind the moment.'}
        </h2>
        <h2 style={{ fontFamily: PP, fontSize: 'clamp(2rem, 5vw, 4.5rem)', fontWeight: 200, color: '#C9A96E', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '2.5rem' }}>
          {isDE ? 'die liebe maximieren.' : 'max the love.'}
        </h2>
        <p style={{ fontFamily: PP, fontSize: '0.9rem', color: '#ffffff', opacity: 0.35, fontWeight: 300, maxWidth: 480, margin: '0 auto', lineHeight: 1.85 }}>
          {isDE
            ? 'die welt ist so wunderschön. lieben zu können, zu spüren, zu sehen — das ist alles, was wirklich zählt.'
            : 'the world is so beautiful. to love, to feel, to be seen — that is everything that truly matters.'}
        </p>
      </motion.div>
    </section>
  )
}

function LifestyleMoment() {
  return (
    <section style={{ padding: '5rem 2.5rem', background: '#f9f6ef', display: 'flex', justifyContent: 'center' }}>
      <motion.img
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        src="/couples-card.png"
        alt="a couple reading the peakplant sunflower question card in the alps"
        style={{ width: '100%', maxWidth: 520, display: 'block', borderRadius: 2 }}
      />
    </section>
  )
}

function Footer({ locale }: { locale: string }) {
  const isDE = locale === 'de'
  const localHref = (path: string) => GLOBAL_PAGES.includes(path) ? path : `/${locale}${path}`
  const footerNav = isDE
    ? [['INTIMITÄT', '/intimacy'], ['PHILOSOPHIE', '/philosophy'], ['SHOP', '/shop'], ['COMMUNITY', '/community']]
    : [['INTIMACY', '/intimacy'], ['PHILOSOPHY', '/philosophy'], ['SHOP', '/shop'], ['COMMUNITY', '/community']]
  return (
    <footer style={{ padding: '48px 40px', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
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
      <LifestyleMoment />
      <Testimonials locale={locale} isMobile={isMobile} />
      <SixQuestions locale={locale} />
      <Manifesto locale={locale} />
      <Waitlist locale={locale} />
      <EditionSystem locale={locale} isMobile={isMobile} />
      <Footer locale={locale} />
    </main>
  )
}
