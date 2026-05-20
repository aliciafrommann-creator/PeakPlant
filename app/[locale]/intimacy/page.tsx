'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { NavBar } from '../../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
      <motion.img src={src} alt={alt} style={{ width: '100%', height: '115%', objectFit: 'cover', y }} />
    </div>
  )
}

function QuadPanel({ bgPosition, title, body }: { bgPosition: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'default', backgroundImage: 'url(/couples-bw.jpg)', backgroundSize: '200% 200%', backgroundPosition: bgPosition, filter: 'grayscale(1)' }}>
      <motion.div animate={{ opacity: hovered ? 0.62 : 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, background: '#000', pointerEvents: 'none' }} />
      <motion.div animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', textAlign: 'center', pointerEvents: 'none' }}>
        <motion.p animate={{ y: hovered ? 0 : 20 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1rem, 1.6vw, 1.5rem)', fontWeight: 300, color: '#ffffff', fontFamily: PP, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1rem' }}>
          {title}
        </motion.p>
        <motion.p animate={{ y: hovered ? 0 : 24 }} transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(0.75rem, 1vw, 0.9rem)', fontWeight: 300, color: 'rgba(255,255,255,0.75)', fontFamily: PP, lineHeight: 1.65, maxWidth: 280 }}>
          {body}
        </motion.p>
      </motion.div>
    </div>
  )
}

export default function IntimacyPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isDE = locale === 'de'

  const quadPanels = isDE ? [
    { bgPosition: '0% 0%',     title: 'Sanftheit ist Stärke.',                        body: 'Verletzlichkeit macht dich nicht schwach. Sie macht dich echt. Und Echtheit ist das, was echte Verbindung schafft — die Art, die bleibt.' },
    { bgPosition: '100% 0%',   title: 'Präsenz statt Leistung.',                      body: 'Intimität ist nichts, das man richtig machen muss. Es ist ein ort, an dem du ankommst — wenn sich beide sicher genug fühlen aufzuhören zu spielen und wirklich da zu sein.' },
    { bgPosition: '0% 100%',   title: 'Wildheit ohne Sicherheit ist keine Freiheit.', body: 'Echte Wildheit — die Art, die sich lebendig anfühlt, nicht leichtsinnig — wird nur möglich, wenn psychologische Sicherheit bereits im Raum ist.' },
    { bgPosition: '100% 100%', title: 'Dein Wert wird nicht verdient.',                body: 'Du musst nicht performen, um liebenswert zu sein. Du bist bereits genug — und Intimität sollte sich so anfühlen.' },
  ] : [
    { bgPosition: '0% 0%',     title: 'Softness is strength.',                      body: "Vulnerability does not make you weak. It makes you real. And realness is what creates actual connection — the kind that stays with you." },
    { bgPosition: '100% 0%',   title: 'Presence over performance.',                 body: "Intimacy is not something to get right. It is a place you arrive at when both people feel safe enough to stop performing and start actually being there." },
    { bgPosition: '0% 100%',   title: 'Wildness without safety is not freedom.',    body: "True wildness — the kind that feels alive, not reckless — only becomes possible when psychological safety is already in the room." },
    { bgPosition: '100% 100%', title: 'Your worth is not earned.',                  body: "You do not have to perform to be worthy of love. You are already enough — and intimacy should feel that way." },
  ]

  const phases = isDE ? [
    {
      number: '01', name: 'Wahrnehmung',
      headline: 'Der Raum zwischen zwei Menschen ist nicht leer.',
      body: 'Er hält alles, was noch nicht gesagt wurde. Sehnsucht. Neugier. Das stille Bewusstsein, dass jemand anderes im Raum ist — und dass sie dir wichtig sind. Hier beginnt Intimität: in der Stille, bevor irgendetwas passiert.',
      video: '/film-distance.mp4',
    },
    {
      number: '02', name: 'Präsenz',
      headline: 'Gesehen zu werden ist bereits ein Akt des Mutes.',
      body: 'Präsenz ist der Moment, in dem du aufhörst zu spielen und wirklich da bist. Atem verlangsamt sich. Schultern werden weich. Kein Skript, keine richtige Antwort. Nur zwei Menschen, die aufeinander achten — und sich entscheiden zu bleiben.',
      video: '/film-presence.mp4',
    },
    {
      number: '03', name: 'Intimität',
      headline: 'Nähe ist etwas, das ihr gemeinsam aufbaut.',
      body: 'Nicht ein Ziel, sondern ein Gefühl — warm, ungehetzt, ehrlich. Intimität geschieht, wenn Sicherheit und Offenheit gleichzeitig im selben Raum ankommen. Wenn Verletzlichkeit keine Schwäche mehr ist, sondern das, was der Freiheit am nächsten kommt.',
      video: '/film-intimacy.mp4',
    },
    {
      number: '04', name: 'Wildheit',
      headline: 'Freude darf groß sein.',
      body: 'Wildheit ist kein Chaos. Es ist volle Erlaubnis — zu fühlen, zu lachen, zu weinen, sich frei zu bewegen, das auszudrücken, was in dir lebt. Die besten Momente der Verbindung sind die, in denen nichts zurückgehalten werden musste.',
      video: '/film-wildness.mp4',
    },
  ] : [
    { number: '01', name: 'Awareness', headline: "The space between two people is not empty.", body: "It holds everything that hasn't been said yet. Longing. Curiosity. The quiet awareness that someone else is in the room — and that they matter to you. This is where intimacy begins: in the silence before anything happens.", video: '/film-distance.mp4' },
    { number: '02', name: 'Presence', headline: 'To be seen is already an act of courage.', body: "Presence is the moment you stop performing and start actually being there. Breath slowing. Shoulders softening. No script, no right answer. Just two people paying attention to each other — and choosing to stay.", video: '/film-presence.mp4' },
    { number: '03', name: 'Intimacy', headline: 'Closeness is something you build together.', body: 'Not a destination but a feeling — warm, unhurried, honest. Intimacy happens when safety and openness arrive in the same room at the same time. When vulnerability is not weakness, but the closest thing to freedom.', video: '/film-intimacy.mp4' },
    { number: '04', name: 'Wildness', headline: 'Joy is allowed to be big.', body: 'Wildness is not chaos. It is full permission — to feel, to laugh, to cry, to move freely, to express what is alive in you. The best moments of connection are the ones where nothing had to be held back.', video: '/film-wildness.mp4' },
  ]

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/intimacy" />

      <section style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
        <video autoPlay muted playsInline loop
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}>
          <source src="/film-shadows.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '5rem 2.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: PP, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: 600, marginBottom: '0.75rem' }}>
            {isDE ? 'Intimität ist kein einzelner Moment.' : 'Intimacy is not a single moment.'}
          </p>
          <p style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
            {isDE ? 'weiterscrollen' : 'Scroll to explore'}
          </p>
        </motion.div>
      </section>

      <section style={{ padding: '10rem 2.5rem 5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}>
          {isDE ? 'Die vier Phasen' : 'The four phases'}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '2.5rem' }}>
          {isDE ? 'Intimität ist kein einzelner Moment.' : 'Intimacy is not a single moment.'}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555', maxWidth: 580 }}>
          {isDE
            ? 'Es ist eine Landschaft. Du bewegst dich in deinem eigenen Tempo durch sie — von der stillen Elektrizität des Wahrnehmens, über den Mut der Präsenz, in Verbindung und hinaus in Freiheit. Jede Phase ist es wert, darin zu sein.'
            : 'It is a landscape. You move through it at your own pace — from the quiet electricity of becoming aware of each other, through the courage of presence, into connection, and out into freedom. Every phase is worth being in.'}
        </motion.p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '50vh 50vh' }}>
        {quadPanels.map((q, i) => <QuadPanel key={i} bgPosition={q.bgPosition} title={q.title} body={q.body} />)}
      </div>
    </div>
  )
}
