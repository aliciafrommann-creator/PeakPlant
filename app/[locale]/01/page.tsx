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

type CommunityQuestion = { text: string; created_at: string }

export default function DigitalWorld01({ params }: { params: { locale: string } }) {
  const isDE = params.locale === 'de'
  const questions = isDE ? QUESTIONS_DE : QUESTIONS_EN

  const [count, setCount] = useState<number | null>(null)
  const [communityQs, setCommunityQs] = useState<CommunityQuestion[]>([])
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/community/count').then(r => r.json()).then(d => setCount(d.count ?? null)).catch(() => {})
    fetch('/api/questions').then(r => r.json()).then(d => setCommunityQs(d.questions ?? [])).catch(() => {})
  }, [])

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

  return (
    <div style={{ background: '#0e0e0e', minHeight: '100vh', color: '#ffffff', fontFamily: PP }}>
      <NavBar activePath="/01" />

      {/* Intro */}
      <section style={{ padding: '160px 40px 80px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.3, fontFamily: PP }}>edition 01 — the digital world</span>
          <h1 style={{ marginTop: 32, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {isDE ? 'du bist nicht allein hier.' : 'you are not alone in here.'}
          </h1>
          {count !== null && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }}
              style={{ marginTop: 28, fontSize: '0.7rem', letterSpacing: '0.2em', opacity: 0.3, textTransform: 'uppercase', fontFamily: PP }}>
              {count.toLocaleString()} {isDE ? 'menschen sind hier.' : 'people are here.'}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* Spotify */}
      <section style={{ padding: '0 40px 100px', maxWidth: 640, margin: '0 auto' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, marginBottom: 20, fontFamily: PP }}>the playlist</p>
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

      {/* Six Questions */}
      <section style={{ padding: '60px 40px 100px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, marginBottom: 48, fontFamily: PP }}>
          {isDE ? 'die sechs fragen' : 'the six questions'}
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
      </section>

      {/* Anonymous Question Wall */}
      <section style={{ padding: '60px 40px 160px', maxWidth: 640, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', opacity: 0.25, marginBottom: 48, fontFamily: PP }}>
          {isDE ? 'fragen der community' : 'from the community'}
        </p>

        {submitted ? (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: 64, fontStyle: 'italic', fontFamily: PP }}>
            {isDE ? 'danke.' : 'thank you.'}
          </motion.p>
        ) : (
          <form onSubmit={submitQuestion} style={{ marginBottom: 64 }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 24, fontWeight: 300, fontFamily: PP }}>
              {isDE ? 'stell eine frage. anonym. für alle hier.' : 'ask something. anonymously. for everyone here.'}
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
              transition={{ duration: 0.5, delay: i * 0.04 }}
              style={{ padding: '22px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: PP }}>“{q.text}”</p>
            </motion.div>
          ))}
        </div>
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
