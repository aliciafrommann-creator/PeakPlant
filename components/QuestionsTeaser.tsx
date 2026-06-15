'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// The six questions of edition 01. Only the first is "leaked" — the rest stay
// blurred. The full set lives inside the box.
const QUESTIONS = [
  "what's your favorite memory of us?",
  'when did you know?',
  'what do you want to remember about tonight?',
  'go for a walk. no destination. just talk.',
  'who would you be without me?',
  'how would you describe me — without age, job, family or hobbies?',
]

// Each card pairs one of your photos with a warm gradient sampled from it.
// On hover (or tap), the gradient + photo fade in behind the question — the
// "colorful side" of intimacy revealing itself.
const CARDS = [
  { img: '/couples-joy.jpg',  grad: 'linear-gradient(135deg, rgba(244,201,184,0.55) 0%, rgba(217,135,119,0.65) 100%)' },
  { img: '/couples-rain.jpg', grad: 'linear-gradient(135deg, rgba(195,204,224,0.50) 0%, rgba(126,139,179,0.65) 100%)' },
  { img: '/couples-bw.jpg',   grad: 'linear-gradient(135deg, rgba(233,200,216,0.50) 0%, rgba(194,127,163,0.62) 100%)' },
  { img: '/couples-rain.jpg', grad: 'linear-gradient(135deg, rgba(201,214,194,0.50) 0%, rgba(135,163,124,0.62) 100%)' },
  { img: '/couples-joy.jpg',  grad: 'linear-gradient(135deg, rgba(243,217,168,0.52) 0%, rgba(201,169,110,0.62) 100%)' },
  { img: '/couples-bw.jpg',   grad: 'linear-gradient(135deg, rgba(229,194,194,0.50) 0%, rgba(179,126,126,0.62) 100%)' },
]

const REVEALED_INDEX = 0

function Card({ q, i }: { q: string; i: number }) {
  const [active, setActive] = useState(false)   // tap toggle (touch)
  const revealed = i === REVEALED_INDEX
  const open = active                            // hover handled via CSS group state below
  const { img, grad } = CARDS[i % CARDS.length]

  return (
    <motion.div
      onClick={() => setActive(a => !a)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.05 }}
      style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        cursor: 'pointer',
        fontFamily: PP,
        overflow: 'hidden',
        border: '1px solid #e2e0db',
        background: '#fff',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={revealed ? q : 'a hidden question'}
    >
      {/* ── Photo (revealed on hover/tap) ──────────────────────── */}
      <motion.div
        animate={{ opacity: open ? 1 : 0, scale: open ? 1.06 : 1.12 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
          filter: revealed ? 'none' : 'blur(4px)',
        }}
      />
      {/* ── Gradient sampled from the photo (the "schöner verlauf") ─ */}
      <motion.div
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, background: grad, mixBlendMode: 'multiply' }}
      />
      {/* ── Legibility wash ────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)' }}
      />

      {/* ── Front label (fades out on reveal) ──────────────────── */}
      <motion.div
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '1.5rem', textAlign: 'left', pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.3 }}>0{i + 1}</span>
        <div>
          <div style={{ width: 18, height: 1, background: '#C9A96E', opacity: 0.7, marginBottom: '0.75rem' }} />
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35 }}>
            {revealed ? 'hover to read' : 'hover to peek'}
          </span>
        </div>
      </motion.div>

      {/* ── Question (fades in on reveal) ──────────────────────── */}
      <motion.div
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.6, delay: open ? 0.15 : 0 }}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', textAlign: 'center', pointerEvents: 'none',
        }}
      >
        <p style={{
          fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', fontWeight: 300, lineHeight: 1.4,
          letterSpacing: '-0.01em', fontStyle: 'italic', color: '#fff',
          textShadow: '0 1px 16px rgba(0,0,0,0.55)',
          filter: revealed ? 'none' : 'blur(7px)',
          userSelect: revealed ? 'auto' : 'none',
        }}>
          "{q}"
        </p>
        {!revealed && (
          <span style={{
            position: 'absolute', bottom: '1rem', left: 0, right: 0,
            fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 8px rgba(0,0,0,0.5)',
          }}>
            inside the box
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}

export function QuestionsTeaser({
  intro = 'edition 01 — the questions',
  background = 'transparent',
}: { intro?: string; background?: string }) {
  return (
    <section style={{ padding: '7rem 2.5rem', maxWidth: 1000, margin: '0 auto', background, fontFamily: PP }}>
      <motion.p
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1rem', color: '#1A1A1A' }}>
        {intro}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }}
        style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.7rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.3, color: '#1A1A1A', marginBottom: '0.75rem', maxWidth: 520 }}>
        one question, revealed. five waiting inside the box.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
        style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: '#777', marginBottom: '3rem', maxWidth: 460 }}>
        move over a card to turn it over.
      </motion.p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {QUESTIONS.map((q, i) => <Card key={i} q={q} i={i} />)}
      </div>
    </section>
  )
}
