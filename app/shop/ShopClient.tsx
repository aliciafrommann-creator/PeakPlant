'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { NavBar } from '../../components/NavBar'
import { HeroFilm } from '../../components/HeroFilm'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { ProductKey, ProductOffer } from '../../lib/shop'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// Two modes, decided per product by the server (lib/shop.ts): where Stripe
// confirms a price, the card sells; everywhere else it collects emails, which
// is the honest state while printing and pricing are open.
function WaitlistModal({ onClose, source }: { onClose: () => void; source: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  // Only promise an inbox when the server confirms the mail actually went out.
  const [mailed, setMailed] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) { setMailed(!!data.mailed); setStatus('success') }
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
        style={{ position: 'relative', background: '#ffffff', border: '1px solid #1A1A1A', padding: '3rem', maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="close" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', opacity: 0.35, color: '#1A1A1A', lineHeight: 1 }}>×</button>
        {status === 'success' || status === 'duplicate' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7 }}>
              {status === 'duplicate'
                ? "you're already on the list. we'll find you when edition 01 is ready."
                : mailed
                  ? "you're in. check your inbox — your first taste of edition 01 is waiting, and we'll reach out the moment it ships."
                  : "you're in. we'll reach out the moment edition 01 ships."}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>join the waitlist</p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              edition 01 — the sunflower — ships october 2026. leave your email and you&apos;ll be first to know when it&apos;s ready. no payment, no noise.
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }}
              />
              <button type="submit" disabled={status === 'loading'}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', borderRadius: 999, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {status === 'loading' ? '...' : 'get early access'}
              </button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#1A1A1A', opacity: 0.62, lineHeight: 1.6, fontFamily: PP }}>
              by joining you agree to our{' '}
              <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>privacy policy</Link>.
            </p>
            {status === 'error' && <p style={{ marginTop: 8, fontSize: 12.5, color: '#B5532E', fontFamily: PP }}>Something went wrong. Try again.</p>}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

/**
 * The one place a deck is bought or waited for. Which of the two it is comes
 * from the server (Stripe), not from a flag someone has to remember to flip.
 *
 * The checkout POST returns a Stripe session URL; on any failure the button
 * says so and offers the waitlist instead of silently doing nothing — a dead
 * buy button is the worst thing this page could do.
 */
function PurchaseBlock({
  offer,
  onWaitlist,
  soonLabel = 'preorder opens soon',
  compact = false,
}: {
  offer: ProductOffer
  onWaitlist: () => void
  soonLabel?: string
  compact?: boolean
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const buttonStyle: React.CSSProperties = {
    fontFamily: PP,
    fontSize: '0.75rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: compact ? '0.9rem 1.75rem' : '1rem 2rem',
    // 43px waren es ohne — knapp unter der sicheren Tippgröße.
    minHeight: 44,
    background: '#1A1A1A',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  }

  async function buy() {
    setStatus('loading')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: offer.key }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        window.location.href = data.url
        return // keep the spinner while the browser leaves the page
      }
      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (!offer.purchasable) {
    return (
      <>
        <div style={{ borderTop: '1px solid #ebebeb', paddingTop: compact ? '1.25rem' : '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#857F76', opacity: 0.85 }}>
            {soonLabel}
          </p>
        </div>
        <button onClick={onWaitlist} style={buttonStyle}>join the waitlist</button>
      </>
    )
  }

  return (
    <>
      <div style={{ borderTop: '1px solid #ebebeb', paddingTop: compact ? '1.25rem' : '1.5rem' }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 300, letterSpacing: '-0.01em', marginBottom: '0.3rem' }}>{offer.price}</p>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#857F76', opacity: 0.85 }}>
          preorder · ships october 2026
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignSelf: 'stretch' }}>
        <button onClick={buy} disabled={status === 'loading'} style={{ ...buttonStyle, opacity: status === 'loading' ? 0.6 : 1 }}>
          {status === 'loading' ? 'one moment …' : 'preorder now'}
        </button>
        {status === 'error' && (
          <p style={{ fontSize: '0.78rem', color: '#B5532E', fontFamily: PP, lineHeight: 1.6, maxWidth: 320 }}>
            checkout could not be opened just now. please try again — or{' '}
            <button onClick={onWaitlist} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
              join the waitlist
            </button>{' '}
            and we will reach out.
          </p>
        )}
        <p style={{ fontSize: '0.72rem', color: '#777', fontWeight: 300, lineHeight: 1.6, maxWidth: 340 }}>
          you are charged now to reserve your deck, and you can get a full refund anytime until it ships.
        </p>
      </div>
    </>
  )
}

function ParallaxImage({ src, alt, objectPosition = 'center' }: { src: string; alt: string; objectPosition?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
      <motion.div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120%', y }}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 550px" style={{ objectFit: 'cover', objectPosition }} />
      </motion.div>
    </div>
  )
}

const pricingRows = [
  { label: 'moment cards',  pack3: 'full deck',  founders: 'full deck', pack12: '2 × full deck' },
  { label: 'card groups',   pack3: 'dates · acts · questions', founders: 'dates · acts · questions', pack12: 'dates · acts · questions' },
  { label: 'seed paper',    pack3: 'sunflower',  founders: 'sunflower', pack12: '2 × sunflower' },
  { label: 'surprise card', pack3: 'a chance',   founders: 'a chance', pack12: 'a chance' },
  { label: 'shipping',      pack3: 'included',   founders: 'included', pack12: 'included' },
  { label: 'digital world', pack3: '✓',          founders: '✓',        pack12: '✓'        },
]

export function ShopClient({ offers }: { offers: Record<ProductKey, ProductOffer> }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const isMobile = useIsMobile()
  const openWaitlist = () => setWaitlistOpen(true)
  const anyPurchasable = Object.values(offers).some(o => o.purchasable)

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <NavBar activePath="/shop" />

      {/* Hero */}
      <section className="pp-hero" style={{ overflow: 'hidden', position: 'relative', background: '#1E1C1A' }}>
        <HeroFilm
          film="/film-wildness.mp4"
          poster="/hero-wildness.webp"
          alt="two people running through a meadow"
        />
        <div className="pp-hero-scrim" style={{ position: 'absolute', inset: 0 }} />
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="pp-hero-inner"
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}
        >
          <p style={{ fontFamily: PP, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 600, marginBottom: '1rem' }}>
            Not just a product.<br />A decision to feel.
          </p>
          <p className="pp-hero-sub" style={{ fontFamily: PP, color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem' }}>
            a card deck for couples · edition 01 · the sunflower · ships october 2026
          </p>
          <button
            className="pp-hero-cta"
            style={{ fontFamily: PP, background: 'transparent', color: '#ffffff', cursor: 'pointer' }}
            onClick={() => {
              // Once a deck can actually be bought, the hero points at the
              // decks instead of collecting an email for something on sale.
              if (anyPurchasable) document.getElementById('decks')?.scrollIntoView({ behavior: 'smooth' })
              else setWaitlistOpen(true)
            }}>
            {anyPurchasable ? 'see the decks →' : 'join the waitlist →'}
          </button>
        </motion.div>
      </section>

      {/* Product 1 — 6er / Founders Edition */}
      <section id="decks" style={{ borderTop: '1px solid #e8e8e8', maxWidth: 1100, margin: '0 auto', padding: '7rem 2.5rem', scrollMarginTop: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ aspectRatio: '1/1', background: '#f5f5f5', overflow: 'hidden' }}>
            <ParallaxImage src="/product-hero.png" alt="PeakPlant edition 01 — the sunflower card deck" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>
                edition 01 — the sunflower
              </p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                founders edition
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'the full edition 01 deck — 20 moment cards: 5 grow dates · 5 small acts · 10 growing questions',
                'every card carries a QR — live the moment, scan it, keep a photo and a note in your private couple diary',
                '1 seed paper card — plant it, it grows into sunflowers',
                'a chance at a special card — twenty decks per edition hide a free workshop, a goodie, or your next deck on us',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.72rem', opacity: 0.3, minWidth: 8 }}>—</span>
                  <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1rem' }}>
              {/* Diese Liste nennt nur, was die App HEUTE kann. Draußen sind:
                  „one free workshop per edition" (es gibt in der App keinerlei
                  Workshop-Mechanik, und /community sagt bewusst „das bauen wir
                  auf" statt es zu versprechen) und „how to grow your seed
                  paper" (die Anleitung steht auf der Website, nicht in der App).
                  Beides waren Kaufbestandteile, die es nicht gibt (§1). */}
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.6rem', fontFamily: PP }}>the app — your space</p>
              <p style={{ fontSize: '0.82rem', color: '#777', fontWeight: 300, lineHeight: 1.7, fontFamily: PP }}>
                a private space for the two of you · your growing moment diary · a gentle weekly challenge · curated date ideas & a places map · every card you scan opens its guided evening in the app
              </p>
            </div>
            <PurchaseBlock
              offer={offers.founders}
              onWaitlist={openWaitlist}
              soonLabel="preorder opens soon · ships october 2026"
            />
          </motion.div>
        </div>
      </section>

      {/* Products — 3er and 12er */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '3rem' }}>
            {/* "also coming" war falsch: das HIER ist edition 01, das Jetzt.
                Kommen tun edition 02 und 03 — die stehen auf der Startseite. */}
            edition 01 — the decks
          </motion.p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>

            {/* 3er pack */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ border: '1px solid #e8e8e8', padding: '2.5rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>the deck</p>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.2 }}>one deck.<br />every moment.</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  'the edition 01 deck — dates, acts, questions',
                  'every card scans into your private couple diary',
                  '1 seed paper card — grows into sunflowers',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.72rem', opacity: 0.3, minWidth: 8 }}>—</span>
                    <p style={{ fontSize: '0.88rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
              <PurchaseBlock offer={offers.pack_3} onWaitlist={openWaitlist} compact />
            </motion.div>

            {/* 12er pack */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{ border: '1px solid #e8e8e8', padding: '2.5rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.5rem' }}>duo</p>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.2 }}>two decks.<br />one to gift.</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  'two edition 01 decks — keep one, gift one',
                  'every card scans into a private couple diary',
                  '2 seed paper cards — they grow into sunflowers',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.72rem', opacity: 0.3, minWidth: 8 }}>—</span>
                    <p style={{ fontSize: '0.88rem', color: '#555', fontWeight: 300, lineHeight: 1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
              <PurchaseBlock offer={offers.pack_12} onWaitlist={openWaitlist} compact />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '3rem' }}>
          compare
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 520 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '1px solid #1A1A1A', paddingBottom: '1rem' }}>
              <div />
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>the deck</p>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>founders</p>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500 }}>duo</p>
            </div>
            {pricingRows.map(({ label, pack3, founders, pack12 }) => (
              <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '1.1rem 0', borderBottom: '1px solid #ebebeb' }}>
                <p style={{ fontSize: '0.8rem', letterSpacing: '0.06em', opacity: 0.5, textTransform: 'lowercase' }}>{label}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{pack3}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{founders}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 300 }}>{pack12}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Questions */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}>
          edition 01 — the questions
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }}
          style={{ fontSize: '0.95rem', fontWeight: 300, color: '#777', lineHeight: 1.7, marginBottom: '3rem', maxWidth: 460 }}>
          ten growing questions in the deck, alongside the dates and the acts. here&apos;s a taste of edition 01 — the rest unfold as you live them, and stay in your shared diary.
        </motion.p>
        {/* Breakpoint in CSS, not in JS: the server renders the desktop grid
            either way, so a JS-only breakpoint ships the phone a three-column
            layout and only corrects it after hydration. */}
        <div className="pp-question-grid" style={{ gap: '0' }}>
          {/* DIE ECHTEN Fragen aus dem fertigen Deck (mobile/lib/content/
              edition01.ts). Hier standen bis zum 18.08.2026 drei erfundene
              Näherungen — auf genau der Seite, auf der Geld fließt, und
              nachprüfbar in dem Moment, in dem jemand das gedruckte Deck in
              der Hand hält. Die Startseite und /edition-01 zitieren korrekt
              und tragen dort den Hinweis „never invented approximations"; der
              Shop war die eine Stelle, an der es niemand angewandt hat.
              Wer sie ändert, gleicht sie mit der Kartendatei ab (§1). */}
          {[
            'Where do you sometimes still feel unseen by me?',
            'What is already growing beautifully between us?',
            'What dream would you like me to take seriously?',
          ].map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="pp-question-cell"
              style={{ padding: '2rem', borderBottom: '1px solid #e8e8e8', borderRight: i % 3 !== 2 ? '1px solid #e8e8e8' : 'none' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.3, marginBottom: '0.75rem' }}>0{i + 1}</p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic', color: '#1A1A1A' }}>"{q}"</p>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="pp-question-cell"
            style={{ padding: '2rem', borderBottom: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', opacity: 0.3, marginBottom: '0.75rem' }}>∧</p>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 300, color: '#bbb' }}>seven more — to discover in your box.</p>
          </motion.div>
        </div>
      </section>

      {/* The edition is a plant */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#857F76', opacity: 0.9, marginBottom: '1.25rem' }}>every edition, a plant</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              edition 01 is the sunflower.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8 }}>
              every edition is built around one plant — its colour, its card, and the seeds pressed into the paper you find in your box.
              plant the card, water it, and it becomes the real thing. edition 01 grows sunflowers.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8, marginTop: '1.25rem' }}>
              in love, the sunflower means warmth, loyalty and growing together. but love isn&apos;t always about shining —
              it&apos;s about giving each other light, without taking the other&apos;s. that&apos;s what edition 01&apos;s questions are about.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.25rem' }}>the surprise</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 200, letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              twenty decks hide more.
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#555', fontWeight: 300, lineHeight: 1.8 }}>
              twenty decks per edition carry a special card. behind it: a free workshop, a little goodie,
              or your next deck on us. you&apos;ll know the moment you draw it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 300, lineHeight: 1.4, marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
            {anyPurchasable
              ? 'edition 01 ships october 2026. reserve yours now.'
              : 'edition 01 ships october 2026. be the first to know.'}
          </p>
          <button
            onClick={() => {
              if (anyPurchasable) document.getElementById('decks')?.scrollIntoView({ behavior: 'smooth' })
              else setWaitlistOpen(true)
            }}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer' }}>
            {anyPurchasable ? 'see the decks' : 'join the waitlist'}
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {waitlistOpen && <WaitlistModal onClose={() => setWaitlistOpen(false)} source="shop" />}
      </AnimatePresence>

      <footer className="pp-dark-footer" style={{ padding: '48px 40px', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid rgba(255,255,255,0.07)', fontFamily: PP }}>
        <span style={{ color: '#ffffff', fontSize: 11, letterSpacing: '0.35em', fontFamily: PP, opacity: 0.55 }}>PEAKPLANT</span>
        <div style={{ display: 'flex', gap: '4px 24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[['impressum', '/impressum'], ['datenschutz', '/datenschutz'], ['agb', '/agb']].map(([label, href]) => (
            <Link key={href} href={href} className="pp-dark-link is-legal">{label}</Link>
          ))}
          <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#ffffff', opacity: 0.25, fontFamily: PP }}>© 2026 PEAKPLANT</p>
        </div>
      </footer>
    </div>
  )
}
