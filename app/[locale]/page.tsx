'use client'
import { motion, useScroll } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavBar } from '../../components/NavBar'
import { useIsMobile } from '../../hooks/useIsMobile'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// Global pages — no locale prefix (shop + journal only; rest are locale-routed)
const GLOBAL_PAGES = ['/shop', '/journal']

// NOTE: /edition-01/*.png are pink design-exploration sheets, NOT the sunflower
// edition's card art — they are deliberately no longer shown anywhere.

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
    // 100svh, not 100vh: on iOS Safari 100vh is the height WITHOUT the browser
    // chrome, so a bottom-aligned hero puts its call to action underneath the
    // address bar — invisible until you scroll. svh is the visible height.
    <section className="pp-hero" style={{ overflow: 'hidden', position: 'relative', background: '#1E1C1A' }}>
      {/* No poster image. The section background is already the dark stone the
          film sits on, so nothing flashes while it loads — and any still we
          have is a different shoot than the film, which reads as a stock photo
          swapped in for a second. Better nothing than the wrong picture. */}
      <video autoPlay muted playsInline loop
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
        <source src="/film-intimacy.mp4" type="video/mp4" />
      </video>
      <div className="pp-hero-scrim" style={{ position: 'absolute', inset: 0 }} />
      <motion.div
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="pp-hero-inner"
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
          style={{ marginBottom: '1.5rem' }}>
          <Logo color="#ffffff" size={36} />
        </motion.div>
        <h1 style={{ fontFamily: PP, fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 540, margin: '0 auto 1.25rem' }}>
          {isDE ? 'wann hat das leben begonnen, sich so schnell anzufühlen?' : 'when did life start feeling this fast?'}
        </h1>
        <p style={{ fontFamily: PP, fontSize: '0.8rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.75)', fontWeight: 300, maxWidth: 420, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          {isDE ? 'ein kartenset für paare — dates, acts, questions. jede karte wird ein festgehaltener moment. friends & solo edition sind unterwegs.' : 'a card deck for couples — dates, acts, questions. every card becomes a moment you keep. friends & solo editions are on their way.'}
        </p>
        <a href="#waitlist" className="pp-hero-cta"
          style={{ marginBottom: '1.75rem', color: '#ffffff', textDecoration: 'none', fontFamily: PP }}>
          {isDE ? 'edition 01 — auf die warteliste' : 'edition 01 — join the waitlist'}
        </a>
        <p style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.28em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
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
    <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', minHeight: '80vh', backgroundColor: '#FBFAF7', borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: isMobile ? '80px 32px' : '120px 80px' }}>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}
          className="pp-eyebrow"
          style={{ color: '#1A1A1A', opacity: 0.35, marginBottom: 36, fontFamily: PP }}>
          {isDE ? 'WAS WIR GEMACHT HABEN' : 'WHAT WE MADE'}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(32px, 3.8vw, 54px)', fontWeight: 200, color: '#1A1A1A', lineHeight: 1.12, marginBottom: 36, letterSpacing: '-0.03em', fontFamily: PP, whiteSpace: 'pre-line' }}>
          {isDE ? 'Für die Momente,\ndie bleiben.' : 'Made for the moments\nthat stay with you.'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }}
          style={{ fontSize: 15, lineHeight: 1.85, color: '#555', fontWeight: 300, maxWidth: 360, marginBottom: 0, fontFamily: PP }}>
          {isDE ? 'ein Kartenset mit echten Momenten für euch zwei — Dates, Acts, Questions. Plus eine Saatpapierkarte mit Sonnenblumensamen.\nKarte erleben · QR scannen · Moment festhalten · ab oktober 2026.' : 'a deck of real moments for the two of you — dates, acts, questions. plus one seed paper card with sunflower seeds.\nlive the card · scan the QR · keep the moment · launching october 2026.'}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} viewport={{ once: true }}
          style={{ marginTop: 36, display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#CF4B2C', fontFamily: PP }}>{isDE ? 'vorbestellung folgt bald' : 'preorder opens soon'}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }} viewport={{ once: true }}
          style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <a href="#waitlist" className="pp-cta" style={{ fontFamily: PP }}>
            {isDE ? 'auf die warteliste' : 'join the waitlist'}
          </a>
          <Link href={localHref('/shop')} className="pp-quiet-link" style={{ fontFamily: PP }}>
            {isDE ? 'ENTDECKEN →' : 'SEE IT →'}
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)' }} whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}
        style={{ position: 'relative', minHeight: isMobile ? '60vw' : 'auto' }}>
        <Image src="/product-hero.png" alt="PeakPlant edition 01 — the sunflower card deck" fill priority sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: 'center' }} />
      </motion.div>
    </section>
  )
}

function Waitlist({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  // Whether the welcome mail actually went out. We only promise an inbox when
  // the server confirms it sent one.
  const [mailed, setMailed] = useState(false)
  const isDE = locale === 'de'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    let finalStatus: typeof status = 'error'
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, locale }) })
      const data = await res.json()
      if (data.duplicate) finalStatus = 'duplicate'
      else if (res.ok) { finalStatus = 'success'; setMailed(!!data.mailed) }
    } catch { finalStatus = 'error' }
    finally { setStatus(finalStatus) }
  }

  return (
    <section id="waitlist" style={{ padding: '160px 40px', backgroundColor: '#1A1A1A', textAlign: 'center', scrollMarginTop: 80 }}>
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
              {mailed
                ? (isDE ? 'gut. schau in dein postfach —\nwir haben dir einen vorgeschmack auf edition 01 gelassen.' : 'good. check your inbox —\nwe left you a first taste of edition 01.')
                : (isDE ? 'gut. du stehst auf der liste.\nwir melden uns, wenn edition 01 kommt.' : "good. you're on the list.\nwe'll reach out when edition 01 is ready.")}
            </p>
          </motion.div>
        ) : status === 'duplicate' ? (
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontSize: 13, letterSpacing: '0.08em', color: '#ffffff', opacity: 0.5, fontFamily: PP, fontWeight: 300 }}>
            {isDE ? 'du bist bereits auf der liste.' : "you're already on the list."}
          </motion.p>
        ) : (
          <form onSubmit={submit} className="pp-waitlist" style={{ fontFamily: PP, margin: '0 auto' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={isDE ? 'deine@email.com' : 'your@email.com'} required />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? '...' : (isDE ? 'edition 01 sichern' : 'get early access')}
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

// The REAL ten Growing Questions from the finalized deck
// (mobile/lib/content/edition01.ts) — never invented approximations.
const questionsEN = [
  { n: '01', q: 'where do you sometimes still feel unseen by me?' },
  { n: '02', q: 'what helps you become more yourself?' },
  { n: '03', q: 'what helps you feel safe enough to grow and change?' },
  { n: '04', q: 'who are you slowly becoming?' },
  { n: '05', q: 'what between us currently needs more light?' },
  { n: '06', q: 'what is already growing beautifully between us?' },
  { n: '07', q: 'what have we outgrown together?' },
  { n: '08', q: 'how can I support your growth without taking over?' },
  { n: '09', q: 'what part of your growth should remain entirely yours?' },
  { n: '10', q: 'what dream would you like me to take seriously?' },
]
const questionsDE = [
  { n: '01', q: 'wo fühlst du dich von mir manchmal noch ungesehen?' },
  { n: '02', q: 'was hilft dir, mehr du selbst zu werden?' },
  { n: '03', q: 'was hilft dir, dich sicher genug zu fühlen, um zu wachsen?' },
  { n: '04', q: 'wer wirst du gerade langsam?' },
  { n: '05', q: 'was zwischen uns braucht gerade mehr licht?' },
  { n: '06', q: 'was wächst zwischen uns schon wunderschön?' },
  { n: '07', q: 'woraus sind wir zusammen herausgewachsen?' },
  { n: '08', q: 'wie kann ich dein wachstum unterstützen, ohne es zu übernehmen?' },
  { n: '09', q: 'welcher teil deines wachstums soll ganz dir gehören?' },
  { n: '10', q: 'welchen traum von dir soll ich ernst nehmen?' },
]

function QuestionRow({ n, q, i }: { n: string; q: string; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '2.5rem', padding: '2rem 0', borderBottom: '1px solid #ebebeb', cursor: 'default' }}
    >
      <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.25, fontFamily: PP, minWidth: 24 }}>{n}</span>
      <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 300, letterSpacing: '-0.01em', fontStyle: 'italic', color: '#1A1A1A', fontFamily: PP }}>
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
    <section style={{ backgroundColor: '#FBFAF7', borderTop: '1px solid #ebebeb', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem', fontFamily: PP }}>
          edition 01
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '2rem', fontFamily: PP }}>
          {isDE ? 'zwanzig karten. eine edition.' : 'twenty cards. one edition.'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
          style={{ fontSize: '0.95rem', color: '#777', fontWeight: 300, lineHeight: 1.8, maxWidth: 440, marginBottom: '4rem', fontFamily: PP }}>
          {isDE ? 'fünf grow dates, fünf small acts, zehn growing questions. hier ein vorgeschmack auf die fragen — echte karten aus dem deck.' : 'five grow dates, five small acts, ten growing questions. a taste of the questions — real cards from the deck.'}
        </motion.p>
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #ebebeb' }}>
          {questions.map(({ n, q }, i) => (
            <QuestionRow key={n} n={n} q={q} i={i} />
          ))}
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: QUESTIONS_SHOWN * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'baseline', gap: '2.5rem', padding: '2rem 0', borderBottom: '1px solid #ebebeb' }}
          >
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.25, fontFamily: PP, minWidth: 24 }}>∧</span>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 300, letterSpacing: '-0.01em', color: '#bbb', fontFamily: PP }}>
              {isDE ? 'sieben weitere fragen — und alle dates & acts — zu entdecken in edition 01.' : 'seven more questions — and every date & act — to discover in edition 01.'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CollectAndSurprise({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  return (
    <section style={{ backgroundColor: '#faf9f7', borderTop: '1px solid #ebebeb', padding: '7rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#CF4B2C', opacity: 0.9, marginBottom: '1.25rem', fontFamily: PP }}>
            {isDE ? 'zum sammeln' : 'made to collect'}
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem', fontFamily: PP }}>
            {isDE ? 'ein deck. jede karte wird ein moment.' : 'one deck. every card becomes a moment.'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8, fontFamily: PP }}>
            {isDE
              ? 'euer deck trägt die momente dieser edition — dates, acts, questions. erlebt eine karte, scannt ihren QR-code, haltet ein foto und eine notiz fest. so wächst euer gemeinsames tagebuch, karte für karte.'
              : 'your deck holds this edition’s moments — dates, acts, questions. live a card, scan its QR code, keep a photo and a note. your shared diary grows, card by card.'}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.25rem', fontFamily: PP }}>
            {isDE ? 'die überraschung' : 'the surprise'}
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem', fontFamily: PP }}>
            {isDE ? 'zwanzig decks verbergen mehr.' : 'twenty decks hide more.'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8, fontFamily: PP }}>
            {isDE
              ? 'zwanzig decks pro edition tragen eine besondere karte. dahinter: ein kostenloser workshop, ein kleines goodie oder euer nächstes deck geschenkt. ihr wisst es in dem moment, in dem ihr sie zieht.'
              : 'twenty decks per edition carry a special card. behind it: a free workshop, a little goodie, or your next deck on us. you’ll know the moment you draw it.'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* Sneak peek of the app — a stylised phone mock built from the app's real
   design tokens (warm stone, chili, pill CTAs) so nothing is faked. The app
   ships with edition 01; until then the honest CTA is the waitlist. */
function AppPeek({ locale, isMobile }: { locale: string; isMobile: boolean }) {
  const isDE = locale === 'de'
  const features = isDE ? [
    ['scannen', 'karte erleben, QR scannen — foto und notiz werden ein moment in eurem tagebuch.'],
    ['entdecken', 'kuratierte date-ideen, die zu wetter, zeit und euch passen — mit ehrlichem „warum dieser vorschlag".'],
    ['orte', 'eine karte mit euren orten, anonymen community-tipps — und „unser ort" für die plätze, die nur euch gehören.'],
    ['wochen-moment', 'eine sanfte weekly challenge als gemeinsamer anlass — nie als druck.'],
  ] : [
    ['scan', 'live the card, scan the QR — photo and note become a moment in your shared diary.'],
    ['discover', 'curated date ideas that fit the weather, the hour and you — with an honest "why this".'],
    ['places', 'a map of your places, anonymous community tips — and "our place" for the spots only you two know.'],
    ['weekly moment', 'one gentle weekly challenge as a shared occasion — never as pressure.'],
  ]
  return (
    <section style={{ backgroundColor: '#F3F1EC', borderTop: '1px solid #ebebeb', padding: '8rem 2.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#CF4B2C', marginBottom: '1.25rem', fontFamily: PP }}>
            {isDE ? 'sneak peek — die app' : 'sneak peek — the app'}
          </p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem', fontFamily: PP }}>
            {isDE ? 'euer space. euer tagebuch.' : 'your space. your diary.'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2rem' }}>
            {features.map(([k, v]) => (
              <div key={k} className="pp-feature-row" style={{ fontFamily: PP }}>
                <span className="pp-feature-key" style={{ color: '#CF4B2C' }}>{k}</span>
                <p style={{ fontSize: '0.9rem', color: '#555', fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
          <a href="#waitlist" className="pp-cta" style={{ fontFamily: PP }}>
            {isDE ? 'app kommt mit edition 01 — dabei sein' : 'the app ships with edition 01 — get in'}
          </a>
          <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#999', fontWeight: 300, fontFamily: PP }}>
            {isDE ? 'privat für euren space. keine likes, keine follower, kein feed für fremde.' : 'private to your space. no likes, no followers, no feed for strangers.'}
          </p>
        </motion.div>
        {/* Stylised phone mock in the app's real look — not a fake screenshot */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 270, borderRadius: 36, border: '1px solid #d8d4cc', background: '#F3F1EC', boxShadow: '0 24px 60px rgba(30,28,26,0.14)', padding: '1.1rem', fontFamily: PP }}>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', color: '#857F76', textTransform: 'uppercase', marginBottom: 10 }}>{isDE ? 'paar-space' : 'couple space'}</div>
            <div style={{ fontSize: 17, fontWeight: 400, color: '#1E1C1A', marginBottom: 12 }}>anna & jo 🌶️</div>
            <div style={{ background: '#FBFAF7', borderRadius: 14, padding: '0.8rem', marginBottom: 10, border: '1px solid #ebe7df' }}>
              <div style={{ fontSize: 8.5, letterSpacing: '0.2em', color: '#CF4B2C', marginBottom: 6 }}>{isDE ? 'KARTE 06 · GROWING QUESTION' : 'CARD 06 · GROWING QUESTION'}</div>
              <div style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.55, color: '#1E1C1A', fontStyle: 'italic' }}>
                “what is already growing beautifully between us?”
              </div>
            </div>
            <div style={{ background: '#FBFAF7', borderRadius: 14, padding: '0.8rem', marginBottom: 10, border: '1px solid #ebe7df' }}>
              <div style={{ height: 84, borderRadius: 10, background: 'linear-gradient(135deg, #E3B23C 0%, #E08A4F 60%, #CF4B2C 100%)', marginBottom: 8, opacity: 0.85 }} />
              <div style={{ fontSize: 11.5, fontWeight: 300, color: '#5A554E', lineHeight: 1.5 }}>
                {isDE ? 'sonnenuntergang am fluss — wir haben bis zehn geredet. ✦' : 'sunset by the river — we talked till ten. ✦'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.2rem 0' }}>
              <span style={{ fontSize: 9, letterSpacing: '0.14em', color: '#857F76' }}>{isDE ? '4 VON 20 BEWAHRT' : '4 OF 20 KEPT'}</span>
              <span style={{ fontSize: 9, letterSpacing: '0.2em', color: '#ffffff', background: '#1E1C1A', borderRadius: 999, padding: '0.45rem 0.9rem' }}>{isDE ? 'MOMENT FESTHALTEN' : 'PRESERVE MOMENT'}</span>
            </div>
          </div>
        </motion.div>
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
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/product-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }} />
      <motion.div
        animate={{ opacity: hovered ? 0.5 : 0.15 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ color: '#CF4B2C', fontSize: '1rem', lineHeight: 1 }}>∧</span>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: PP, fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)', fontWeight: 300, color: '#ffffff', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem' }}>
          {isDE ? '"was wächst zwischen uns schon wunderschön?"' : '"what is already growing beautifully between us?"'}
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
          {/* No dates on 02/03: edition 01 has not shipped yet, so a season
              printed here is a promise we cannot keep — and it ages by itself. */}
          {['edition 02', 'edition 03'].map((label, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: (i + 1) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', overflow: 'hidden', minHeight: 280, border: '1px solid rgba(255,255,255,0.07)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: 0.35 }}
            >
              <div><span style={{ color: '#CF4B2C', fontSize: '1rem', lineHeight: 1 }}>∧</span></div>
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
            ? 'jede edition ist eine pflanze. edition 01 ist die sonnenblume — ihre samen stecken im saatpapier deines decks.\njede weitere edition bringt eine neue pflanze, neue karten, neue fragen.\ngeplant sind außerdem eine friends edition für freundeskreise und eine solo edition für die liebe zu dir selbst — weil beides genauso zählt. freundeskreise kann die app schon heute.'
            : 'every edition is a plant. edition 01 is the sunflower — its seeds are pressed into the seed paper in your deck.\neach edition after it brings a new plant, new cards, new questions.\nalso planned: a friends edition for your circle and a solo edition for the love you give yourself — because both matter just as much. the app already holds circles of friends.'}
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
        <h2 style={{ fontFamily: PP, fontSize: 'clamp(2rem, 5vw, 4.5rem)', fontWeight: 200, color: '#CF4B2C', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '2.5rem' }}>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 520 }}
      >
        <Image
          src="/couples-card.png"
          alt="a couple reading the peakplant sunflower question card in the alps"
          width={1122} height={1402} sizes="(max-width: 768px) 100vw, 520px"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 2 }}
        />
      </motion.div>
    </section>
  )
}

export default function Home({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isMobile = useIsMobile()
  return (
    <main style={{ backgroundColor: '#FBFAF7', fontFamily: PP }}>
      <ScrollBar />
      <NavBar activePath="/" />
      <CouplesHero locale={locale} />
      <Product locale={locale} isMobile={isMobile} />
      <LifestyleMoment />
      <SixQuestions locale={locale} />
      <CollectAndSurprise locale={locale} isMobile={isMobile} />
      <AppPeek locale={locale} isMobile={isMobile} />
      <Manifesto locale={locale} />
      <Waitlist locale={locale} />
      <EditionSystem locale={locale} isMobile={isMobile} />
    </main>
  )
}
