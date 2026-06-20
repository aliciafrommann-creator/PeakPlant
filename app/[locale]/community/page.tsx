'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { NavBar } from '../../../components/NavBar'
import { useIsMobile } from '../../../hooks/useIsMobile'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ size = 28, color = '#1A1A1A' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TransformRow({ before, after, index }: { before: string; after: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'center', padding: '2rem 1rem', borderBottom: '1px solid #ebebeb', cursor: 'default', position: 'relative' }}
    >
      <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, background: '#f8f8f8', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <motion.p animate={{ opacity: hovered ? 0.15 : 0.6, x: hovered ? -10 : 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)', fontWeight: 300, fontFamily: PP, letterSpacing: '-0.01em', position: 'relative', display: 'inline-block' }}>
          {before}
          <motion.span animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', top: '52%', left: 0, right: 0, height: '1.5px', background: '#1A1A1A', opacity: 0.55, transformOrigin: 'left', display: 'block' }} />
        </motion.p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
        <motion.svg width="32" height="14" viewBox="0 0 32 14" fill="none"
          animate={{ opacity: hovered ? 1 : 0.12, x: hovered ? 5 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <path d="M0 7h28M22 2.5l6 4.5-6 4.5" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </div>
      <motion.p animate={{ opacity: hovered ? 1 : 0.6, x: hovered ? 0 : 8, color: hovered ? '#1A1A1A' : '#666' }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)', fontWeight: hovered ? 500 : 300, fontFamily: PP, letterSpacing: '-0.01em', zIndex: 1 }}>
        {after}
      </motion.p>
    </motion.div>
  )
}

function JoinModal({ onClose, locale }: { onClose: () => void; locale: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const isDE = locale === 'de'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'community', locale }) })
      const data = await res.json()
      if (data.duplicate) setStatus('duplicate')
      else if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: '#ffffff', border: '1px solid #1A1A1A', padding: '3rem', maxWidth: 440, width: '100%' }}
        onClick={e => e.stopPropagation()}>
        {status === 'success' ? (
          <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7, textAlign: 'center' }}>
            {isDE ? 'wir melden uns, wenn die zeit kommt.' : "we'll find you when it's time."}
          </p>
        ) : status === 'duplicate' ? (
          <p style={{ fontFamily: PP, fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.7, textAlign: 'center', opacity: 0.6 }}>
            {isDE ? 'du bist bereits auf der liste.' : "you're already on the list."}
          </p>
        ) : (
          <>
            <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: '1rem' }}>
              {isDE ? 'dem inner circle beitreten' : 'Join the inner circle'}
            </p>
            <p style={{ fontFamily: PP, fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '2rem' }}>
              {isDE
                ? 'events, frühe drops und die menschen, die das mit uns aufbauen. hinterlass deine e-mail — wir melden uns.'
                : 'Events, early drops, and the people building this with us. Leave your email — we\'ll take it from there.'}
            </p>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={isDE ? 'deine@email.com' : 'your@email.com'}
                style={{ fontFamily: PP, fontSize: '1rem', padding: '0.85rem 1rem', border: '1px solid #1A1A1A', background: 'transparent', outline: 'none', color: '#1A1A1A' }} />
              <button type="submit" disabled={status === 'loading'}
                style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {status === 'loading' ? '…' : (isDE ? 'beitreten' : 'Join')}
              </button>
            </form>
            {status === 'error' && <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#e74c3c', fontFamily: PP }}>{isDE ? 'Fehler. Versuch es nochmal.' : 'Something went wrong. Try again.'}</p>}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function CommunityPage({ params }: { params: { locale: string } }) {
  const [modalOpen, setModalOpen] = useState(false)
  const { locale } = params
  const isDE = locale === 'de'
  const isMobile = useIsMobile()

  const pairs = isDE ? [
    ['Leistung', 'Präsenz'],
    ['Externe Bestätigung', 'Selbstwert'],
    ['Emotionale Rüstung', 'Verletzlichkeit'],
    ['Angst', 'Vertrauen'],
    ['Isolation', 'Tiefe Verbindung'],
    ['Scham', 'Offenheit'],
  ] : [
    ['Performance', 'Presence'],
    ['External validation', 'Self-worth'],
    ['Emotional armor', 'Vulnerability'],
    ['Fear', 'Trust'],
    ['Disconnection', 'Deep connection'],
    ['Shame', 'Openness'],
  ]

  const whatYouGet = isDE ? [
    { label: 'Workshops & Treffen', body: 'echte events in echten räumen — intime workshops in cafés, abendgespräche und treffen mit menschen, die gemeinsam an verbindung und liebe arbeiten. kleine gruppen. keine bühne, keine performance.' },
    { label: 'Live Talks', body: 'wir gehen live zu den themen, die wirklich zählen — intimität, emotionale sicherheit, verbindung, die systeme hinter der art, wie wir lieben. manchmal ein gespräch, manchmal ein tiefer einblick. immer etwas, das bleibt.' },
    { label: 'Das Journal — zuerst', body: 'community-mitglieder erhalten jede neue journalausgabe, bevor sie veröffentlicht wird. jede ausgabe kommt mit einem QR-code, der zu einem kuratierten podcast oder TED-talk führt — ein begleiter für den spaziergang, den pendelweg oder die stille stunde.' },
    { label: 'Partner-Communities', body: 'wir kooperieren mit laufclubs, cafés und lokalen gruppen, denen dasselbe wichtig ist. der workshop folgt manchmal dem lauf. das gespräch beginnt bei kaffee. alles verbindet sich.' },
  ] : [
    { label: 'Workshops & gatherings', body: 'Real events in real spaces — intimate workshops in cafes, evening talks, and gatherings with people building something together around how we love and connect. Small groups. No stage, no performance.' },
    { label: 'Live talks', body: 'We go live on the topics that matter — intimacy, emotional safety, connection, the systems behind how we love. Sometimes a conversation, sometimes a deep dive. Always something worth staying for.' },
    { label: 'The journal — early', body: 'Community members receive each new journal issue before it goes public. Every issue comes with a QR code linking to a curated podcast or TED talk that goes deeper on the essay inside — a companion for the walk, the commute, or the quiet hour.' },
    { label: 'Partner communities', body: 'We cooperate with run clubs, cafes, and local groups who care about the same things. The workshop sometimes follows the run. The conversation starts over coffee. It all connects.' },
  ]

  const communityValues = isDE ? [
    { label: 'Emotionale Ehrlichkeit statt Leistung', body: 'das ist ein raum für menschen, die aufgehört haben zu spielen. die gespräche hier sind echt — über beziehungen, verletzlichkeit und was verbindung wirklich bedeutet.' },
    { label: 'Tiefe statt Content', body: 'wir bauen keinen feed. wir bauen langsame, bewusste berührungspunkte — events, briefe, fragen — die etwas hinterlassen.' },
    { label: 'Wärme statt Exklusivität', body: 'die community ist bewusst klein. nicht weil sie exklusiv ist. weil intimität nicht skaliert. du kannst keine tiefe in großer zahl haben.' },
    { label: 'Werden statt Performen', body: 'niemand hier hat es herausgefunden. wir erkunden das gemeinsam — was sich sicherheit anfühlt, was wildheit bedeutet, welche art von liebe wir aufbauen wollen.' },
  ] : [
    { label: 'Emotional honesty over performance', body: 'This is a space for people who are done pretending. The conversations here are real — about relationships, vulnerability, and what it actually takes to feel connected.' },
    { label: 'Depth, not content', body: 'We are not building a feed. We are building slow, intentional touchpoints — events, letters, questions — that leave something behind.' },
    { label: 'Warmth over exclusivity', body: 'The community is small on purpose. Not because it is elite. Because intimacy does not scale. You cannot have depth at volume.' },
    { label: 'Becoming, not performing', body: "Nobody here has it figured out. We are all exploring this together — what safety feels like, what wildness means, what kind of love we want to build." },
  ]

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/community" />

      <section style={{ padding: isMobile ? '7rem 1.5rem 4rem' : '8rem 5rem 6rem', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '3rem' : '6rem', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/couples-yosemite.png" alt={isDE ? 'zwei menschen, die zusammen zur ruhe kommen' : 'two people resting together in nature'}
            decoding="async"
            style={{ width: '100%', maxWidth: isMobile ? 360 : 460, display: 'block', borderRadius: 2 }} />
        </motion.div>
        <div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}>Community</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
            {isDE ? 'Für Menschen, denen Verbindung wichtig ist.' : 'For people who take connection seriously.'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555', marginBottom: '3rem' }}>
            {isDE
              ? 'PeakPlant community ist kein newsletter und kein feed — es ist eine gruppe von menschen, die im echten leben auftauchen und gemeinsam etwas aufbauen. wir veranstalten workshops, talks, kooperieren mit cafés und lokalen communities und schaffen räume, in denen die gespräche, die zählen, wirklich stattfinden.'
              : 'PeakPlant community is not a newsletter or a feed — it is a group of people who show up in real life and build something together. We run workshops, host talks, partner with cafes and local communities, and create moments where the conversations that matter actually happen.'}
          </motion.p>
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }}
            onClick={() => setModalOpen(true)}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {isDE ? 'dem inner circle beitreten' : 'Join the inner circle'}
          </motion.button>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}>
          {isDE ? 'Woran du teilnimmst' : 'What you become part of'}
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '2.5rem' : '3rem 5rem' }}>
          {whatYouGet.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }} style={{ cursor: 'default' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '1rem' }}>0{i + 1}</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem' }}>{item.label}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '5rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1rem' }}>
          {isDE ? 'Was sich verändert' : 'What this community transforms'}
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', padding: '0 1rem 1rem', marginBottom: '0.25rem' }}>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.3, fontFamily: PP }}>{isDE ? 'Vorher' : 'Before'}</p>
          <div />
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.3, fontFamily: PP }}>{isDE ? 'Nachher' : 'After'}</p>
        </div>
        {pairs.map(([before, after], i) => <TransformRow key={before} before={before} after={after} index={i} />)}
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '4rem' }}>
          {isDE ? 'Woran wir glauben' : 'What this community believes'}
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '2.5rem' : '3rem 5rem' }}>
          {communityValues.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }} style={{ cursor: 'default' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '1rem' }}>0{i + 1}</p>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.85rem', lineHeight: 1.3 }}>{v.label}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#555' }}>{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '8rem 2.5rem', textAlign: 'center', background: '#1A1A1A' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
          <Logo size={40} color="#ffffff" />
          <p style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 300, lineHeight: 1.45, letterSpacing: '-0.015em', color: '#ffffff' }}>
            {isDE
              ? 'die community ist bewusst klein. keine werbung, kein algorithmus, kein lärm. nur menschen, die das anders machen wollen.'
              : 'The community is small on purpose. There are no ads, no algorithm, no noise. Just people who want to do this differently.'}
          </p>
          <button onClick={() => setModalOpen(true)}
            style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', border: '1px solid rgba(255,255,255,0.4)', color: '#ffffff', background: 'transparent', cursor: 'pointer' }}>
            {isDE ? 'dem inner circle beitreten' : 'Join the inner circle'}
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {modalOpen && <JoinModal onClose={() => setModalOpen(false)} locale={locale} />}
      </AnimatePresence>
    </div>
  )
}
