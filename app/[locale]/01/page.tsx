'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NavBar } from '../../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const QUESTIONS_EN = [
  { n: '01', q: "what's your favorite memory of us?" },
  { n: '02', q: 'when did you know?' },
  { n: '03', q: 'what do you want to remember about tonight?' },
  { n: '04', q: 'go for a walk. no destination. just talk.' },
  { n: '05', q: 'who would you be without me?' },
  { n: '06', q: 'how would you describe me — without age, job, family or hobbies?' },
]
const QUESTIONS_DE = [
  { n: '01', q: 'was ist deine liebste erinnerung an uns?' },
  { n: '02', q: 'wann hast du es gewusst?' },
  { n: '03', q: 'was soll von heute abend bleiben?' },
  { n: '04', q: 'geht spazieren. kein ziel. einfach reden.' },
  { n: '05', q: 'wer wärst du ohne mich?' },
  { n: '06', q: 'wie würdest du mich beschreiben – ohne alter, beruf, familie oder hobbys?' },
]

// one of these surfaces each month — rotates automatically, no deploy needed
const MONTHLY_POOL_EN = [
  'what do you wish you said more often?',
  'when did you last feel fully present?',
  "what would you do differently if you weren't afraid?",
  'what does safety feel like — in your body?',
  'when was the last time someone really listened to you?',
  'what are you still hiding from the people closest to you?',
  'which goodbye are you still carrying?',
  'when do you feel most like yourself?',
  'what did watching others teach you about love?',
  'what would you tell the person you were a year ago?',
  'what do you want more of — and who could you tell?',
  'what would you ask, if you knew the answer would be honest?',
]
const MONTHLY_POOL_DE = [
  'was würdest du gern öfter sagen?',
  'wann warst du zuletzt ganz im moment?',
  'was würdest du anders machen, wenn du keine angst hättest?',
  'wie fühlt sich sicherheit an — in deinem körper?',
  'wann hat dir zuletzt jemand wirklich zugehört?',
  'was versteckst du noch vor den menschen, die dir am nächsten sind?',
  'welchen abschied trägst du noch mit dir?',
  'wann fühlst du dich am meisten wie du selbst?',
  'was hat dich das beobachten anderer über liebe gelehrt?',
  'was würdest du dem menschen sagen, der du vor einem jahr warst?',
  'wovon willst du mehr — und wem könntest du das sagen?',
  'was würdest du fragen, wenn du wüsstest, dass die antwort ehrlich ist?',
]

// add a new entry at the top each month — the archive grows downward
type Letter = { key: string; month: string; title: string; lines: string[] }
const LETTERS_EN: Letter[] = [
  {
    key: '2026-06',
    month: 'june 2026',
    title: 'the room opens.',
    lines: [
      'this is the first letter. there will be one every month — short, honest, no marketing.',
      'the room opens before the box does. edition 01 ships in august. until then, this is where it begins: a question, a playlist, and whatever you leave on the wall below.',
      'come back next month. the question changes, the playlist changes, and a new letter will be here.',
      '— alicia',
    ],
  },
]
const LETTERS_DE: Letter[] = [
  {
    key: '2026-06',
    month: 'juni 2026',
    title: 'der raum öffnet sich.',
    lines: [
      'das ist der erste brief. es wird jeden monat einen geben — kurz, ehrlich, ohne marketing.',
      'der raum öffnet, bevor die box es tut. edition 01 erscheint im august. bis dahin beginnt es hier: eine frage, eine playlist, und alles, was du unten an der wand hinterlässt.',
      'komm nächsten monat wieder. die frage ändert sich, die playlist ändert sich, und ein neuer brief wartet hier.',
      '— alicia',
    ],
  },
]

const FOUNDER_EN = [
  'i built peakplant because i noticed something.\nthe faster life got, the harder intimacy became.',
  'not physical intimacy. emotional intimacy.\nthe kind where you actually feel seen.',
  'peakplant is my attempt to slow that down.\none box. one question. one moment at a time.',
  '— alicia',
]
const FOUNDER_DE = [
  'ich habe peakplant gebaut, weil mir etwas aufgefallen ist.\nje schneller das leben wurde, desto schwerer wurde intimität.',
  'keine körperliche intimität. emotionale intimität.\ndie art, bei der man sich wirklich gesehen fühlt.',
  'peakplant ist mein versuch, das zu entschleunigen.\neine box. eine frage. ein moment nach dem anderen.',
  '— alicia',
]

type CommunityQuestion = { text: string; created_at: string }

const label = (isDE: boolean): React.CSSProperties => ({
  fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, fontFamily: PP,
})

function StayCloseForm({ isDE }: { isDE: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    let finalStatus: typeof status = 'error'
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'digital-world-01' }),
      })
      const data = await res.json()
      if (data.duplicate) finalStatus = 'duplicate'
      else if (res.ok) finalStatus = 'success'
    } catch {
      finalStatus = 'error'
    } finally {
      setStatus(finalStatus)
    }
  }

  if (status === 'success') {
    return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', fontFamily: PP, fontWeight: 300 }}>
        {isDE ? 'gut. bis nächsten monat.' : 'good. see you next month.'}
      </motion.p>
    )
  }
  if (status === 'duplicate') {
    return (
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontFamily: PP, fontWeight: 300 }}>
        {isDE ? 'du bist schon dabei. wir sagen bescheid.' : "you're already in. we'll let you know."}
      </motion.p>
    )
  }
  return (
    <form onSubmit={submit}>
      <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.12)', maxWidth: 420 }}>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder={isDE ? 'deine@email.com' : 'your@email.com'}
          style={{ flex: 1, padding: '14px 20px', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: PP, color: '#ffffff' }}
        />
        <button type="submit" disabled={status === 'loading'}
          style={{ padding: '14px 20px', background: 'transparent', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.2em', fontFamily: PP, whiteSpace: 'nowrap' }}>
          {status === 'loading' ? '…' : (isDE ? 'sag mir bescheid' : 'tell me')}
        </button>
      </div>
      {status === 'error' && (
        <p style={{ marginTop: 10, fontSize: '0.7rem', color: '#e74c3c', fontFamily: PP }}>
          {isDE ? 'etwas ist schiefgelaufen. versuch es nochmal.' : 'something went wrong. try again.'}
        </p>
      )}
    </form>
  )
}

export default function DigitalWorld01({ params }: { params: { locale: string } }) {
  const isDE = params.locale === 'de'
  const questions = isDE ? QUESTIONS_DE : QUESTIONS_EN
  const letters = isDE ? LETTERS_DE : LETTERS_EN
  const founder = isDE ? FOUNDER_DE : FOUNDER_EN

  const [count, setCount] = useState<number | null>(null)
  const [communityQs, setCommunityQs] = useState<CommunityQuestion[]>([])
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // computed client-side to avoid hydration mismatch at month boundaries
  const [thisMonth, setThisMonth] = useState<{ name: string; question: string } | null>(null)

  useEffect(() => {
    fetch('/api/community/count').then(r => r.json()).then(d => setCount(d.count ?? null)).catch(() => {})
    fetch('/api/questions').then(r => r.json()).then(d => setCommunityQs(d.questions ?? [])).catch(() => {})
    const now = new Date()
    const pool = isDE ? MONTHLY_POOL_DE : MONTHLY_POOL_EN
    const idx = (now.getFullYear() * 12 + now.getMonth()) % pool.length
    setThisMonth({
      name: now.toLocaleDateString(isDE ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' }).toLowerCase(),
      question: pool[idx],
    })
  }, [isDE])

  async function submitQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      })
      setCommunityQs(prev => [{ text: input.trim(), created_at: new Date().toISOString() }, ...prev])
      setSubmitted(true)
      setInput('')
    } catch {}
    setSubmitting(false)
  }

  const monthTag = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(isDE ? 'de-DE' : 'en-US', { month: 'long' }).toLowerCase()
    } catch { return '' }
  }

  return (
    <div style={{ background: '#0e0e0e', minHeight: '100vh', color: '#ffffff', fontFamily: PP }}>
      <NavBar activePath="/01" />

      {/* Intro */}
      <section style={{ padding: '160px 40px 80px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
          <span style={label(isDE)}>edition 01 — the digital world</span>
          <h1 style={{ marginTop: 32, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {isDE ? 'du bist nicht allein hier.' : 'you are not alone in here.'}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}
            style={{ marginTop: 20, fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            {isDE ? 'dieser raum verändert sich jeden monat. komm wieder.' : 'this room changes every month. come back.'}
          </motion.p>
          {count !== null && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}
              style={{ marginTop: 28, fontSize: '0.7rem', letterSpacing: '0.2em', opacity: 0.3, textTransform: 'uppercase', fontFamily: PP }}>
              {count.toLocaleString()} {isDE ? 'menschen sind hier.' : 'people are here.'}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* This month */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ ...label(isDE), marginBottom: 20 }}>
          {thisMonth ? (isDE ? `dieser monat — ${thisMonth.name}` : `this month — ${thisMonth.name}`) : (isDE ? 'dieser monat' : 'this month')}
        </p>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
          style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 200, fontStyle: 'italic', lineHeight: 1.5, letterSpacing: '-0.01em', marginBottom: 16, minHeight: '1.5em' }}>
          {thisMonth ? `“${thisMonth.question}”` : ''}
        </motion.p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 300, lineHeight: 1.7, marginBottom: 56 }}>
          {isDE ? 'eine frage pro monat, nur für diesen raum. nimm sie mit in dein nächstes gespräch.' : 'one question a month, only for this room. take it into your next conversation.'}
        </p>

        <p style={{ ...label(isDE), marginBottom: 20 }}>{isDE ? 'der sound dazu' : 'the sound for it'}</p>
        {process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID ? (
          <iframe
            src={`https://open.spotify.com/embed/playlist/${process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`}
            width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy" style={{ border: 'none', display: 'block' }}
          />
        ) : (
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.25, fontFamily: PP }}>
            {isDE ? 'playlist folgt bald.' : 'playlist coming soon.'}
          </p>
        )}
      </section>

      {/* The letters */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ ...label(isDE), marginBottom: 48 }}>{isDE ? 'die briefe' : 'the letters'}</p>
        {letters.map((letter, li) => (
          <motion.div key={letter.key}
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: li * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: li < letters.length - 1 ? 72 : 0 }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.25, marginBottom: 16, fontFamily: PP }}>{letter.month}</p>
            <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 200, letterSpacing: '-0.02em', marginBottom: 28, lineHeight: 1.3 }}>
              {letter.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {letter.lines.map((line, i) => (
                <p key={i} style={{ fontSize: '0.95rem', lineHeight: 1.85, color: i === letter.lines.length - 1 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)', fontWeight: 300, fontStyle: i === letter.lines.length - 1 ? 'italic' : 'normal', whiteSpace: 'pre-line' }}>
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Six Questions */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ ...label(isDE), marginBottom: 48 }}>
          {isDE ? 'die sechs fragen — edition 01' : 'the six questions — edition 01'}
        </p>
        <div>
          {questions.map(({ n, q }, i) => (
            <motion.div key={n}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.07 }}
              style={{ padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 24, alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', opacity: 0.2, minWidth: 20, fontFamily: PP }}>{n}</span>
              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.65, opacity: 0.85 }}>“{q}”</p>
            </motion.div>
          ))}
        </div>
        <p style={{ marginTop: 32, fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontWeight: 300, lineHeight: 1.7 }}>
          {isDE ? 'jede edition bringt sechs neue. die alten bleiben hier — das archiv wächst.' : 'every edition brings six new ones. the old ones stay here — the archive grows.'}
        </p>
      </section>

      {/* Anonymous Question Wall */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ ...label(isDE), marginBottom: 16 }}>
          {isDE ? 'die wand' : 'the wall'}
        </p>
        {communityQs.length > 0 && (
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.2, marginBottom: 40, fontFamily: PP }}>
            {communityQs.length} {isDE ? 'fragen, anonym gestellt. sie bleiben.' : 'questions, asked anonymously. they stay.'}
          </p>
        )}

        {submitted ? (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: 64, fontStyle: 'italic', fontFamily: PP }}>
            {isDE ? 'danke. sie hängt jetzt hier.' : 'thank you. it hangs here now.'}
          </motion.p>
        ) : (
          <form onSubmit={submitQuestion} style={{ marginBottom: 64 }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 24, fontWeight: 300, fontFamily: PP }}>
              {isDE ? 'stell eine frage. anonym. für alle, die nach dir kommen.' : 'ask something. anonymously. for everyone who comes after you.'}
            </p>
            <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.12)' }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                placeholder={isDE ? 'deine frage…' : 'your question…'}
                maxLength={200}
                style={{ flex: 1, padding: '14px 20px', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: PP, color: '#ffffff' }}
              />
              <button type="submit" disabled={submitting || !input.trim()}
                style={{ padding: '14px 20px', background: 'transparent', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.65rem', letterSpacing: '0.2em', fontFamily: PP, whiteSpace: 'nowrap' }}>
                {submitting ? '…' : (isDE ? 'senden' : 'send')}
              </button>
            </div>
          </form>
        )}

        <div>
          {communityQs.length === 0 ? (
            <p style={{ fontSize: '0.75rem', opacity: 0.2, fontStyle: 'italic', fontFamily: PP }}>
              {isDE ? 'noch keine fragen. du könntest die erste sein.' : 'no questions yet. you could be the first.'}
            </p>
          ) : communityQs.map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.04 }}
              style={{ padding: '22px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: PP }}>“{q.text}”</p>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.15, fontFamily: PP, whiteSpace: 'nowrap' }}>{monthTag(q.created_at)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder note */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ ...label(isDE), marginBottom: 40 }}>{isDE ? 'warum es diesen raum gibt' : 'why this room exists'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {founder.map((para, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '0.95rem', lineHeight: 1.85, color: i === founder.length - 1 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)', fontWeight: 300, whiteSpace: 'pre-line', fontStyle: i === founder.length - 1 ? 'italic' : 'normal' }}>
              {para}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Stay close */}
      <section style={{ padding: '60px 40px 160px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ ...label(isDE), marginBottom: 20 }}>{isDE ? 'wenn sich der raum verändert' : 'when the room changes'}</p>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', fontWeight: 300, lineHeight: 1.8, marginBottom: 32 }}>
          {isDE
            ? 'neuer brief, neue frage, neue playlist — einmal im monat. wir schreiben dir, wenn es soweit ist. sonst nichts.'
            : 'new letter, new question, new playlist — once a month. we write you when it happens. nothing else.'}
        </p>
        <StayCloseForm isDE={isDE} />
      </section>

      <footer style={{ padding: '48px 40px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Link href={`/${params.locale}`} style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: PP }}>∧ peakplant</Link>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['impressum', '/impressum'], ['datenschutz', '/datenschutz']].map(([l, h]) => (
            <Link key={h} href={h} style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', fontFamily: PP }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
