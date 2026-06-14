'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// The six questions of edition 01 — all on a single card inside the box.
// Every one is fully readable here.
const QUESTIONS = [
  "what's your favorite memory of us?",
  'when did you know?',
  'what do you want to remember about tonight?',
  'go for a walk. no destination. just talk.',
  'who would you be without me?',
  'how would you describe me — without age, job, family or hobbies?',
]

// A different warm gradient per card — the "colorful side" of intimacy.
const GRADIENTS = [
  'linear-gradient(135deg, #F4C9B8 0%, #E8A598 50%, #D98777 100%)',
  'linear-gradient(135deg, #E9C8D8 0%, #D6A0BE 50%, #C27FA3 100%)',
  'linear-gradient(135deg, #F3D9A8 0%, #E8C079 50%, #C9A96E 100%)',
  'linear-gradient(135deg, #C9D6C2 0%, #A6BE9E 50%, #87A37C 100%)',
  'linear-gradient(135deg, #C3CCE0 0%, #9FAACB 50%, #7E8BB3 100%)',
  'linear-gradient(135deg, #E5C2C2 0%, #CC9E9E 50%, #B37E7E 100%)',
]

function Card({ q, i }: { q: string; i: number }) {
  const [flipped, setFlipped] = useState(false)
  const revealed = true

  return (
    <motion.button
      onClick={() => setFlipped(f => !f)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.05 }}
      style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        perspective: 1000,
        fontFamily: PP,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={revealed ? q : 'a hidden question'}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        {/* ── Front ─────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          border: '1px solid #e2e0db', background: '#fff',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '1.5rem', textAlign: 'left',
        }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', opacity: 0.3 }}>0{i + 1}</span>
          <div>
            <div style={{ width: 18, height: 1, background: '#C9A96E', opacity: 0.7, marginBottom: '0.75rem' }} />
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35 }}>
              {revealed ? 'tap to read' : 'tap to peek'}
            </span>
          </div>
        </div>

        {/* ── Back ──────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', background: GRADIENTS[i % GRADIENTS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', fontWeight: 300, lineHeight: 1.4,
            letterSpacing: '-0.01em', fontStyle: 'italic', color: '#fff',
            textShadow: '0 1px 12px rgba(0,0,0,0.18)',
            filter: revealed ? 'none' : 'blur(7px)',
            userSelect: revealed ? 'auto' : 'none',
          }}>
            "{q}"
          </p>
          {!revealed && (
            <span style={{
              position: 'absolute', bottom: '1rem', left: 0, right: 0,
              fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.8)',
            }}>
              inside the box
            </span>
          )}
        </div>
      </motion.div>
    </motion.button>
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
        six questions. all on one card in the box.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
        style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: '#777', marginBottom: '3rem', maxWidth: 460 }}>
        tap each one to turn it over and read.
      </motion.p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {QUESTIONS.map((q, i) => <Card key={i} q={q} i={i} />)}
      </div>
    </section>
  )
}
