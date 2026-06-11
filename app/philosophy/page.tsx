'use client'
import { motion } from 'framer-motion'
import { NavBar } from '../../components/NavBar'
import { useIsMobile } from '../../hooks/useIsMobile'
import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function PhilosophyPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/philosophy" />

      {/* Hero */}
      <section style={{ padding: isMobile ? '7rem 1.5rem 4rem' : '10rem 2.5rem 6rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem', fontFamily: PP }}>
          philosophy
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', fontFamily: PP }}>
          feel more.
        </motion.h1>
      </section>

      {/* 01 — The Research */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: isMobile ? '4rem 1.5rem' : '6rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '2rem', fontFamily: PP }}>
          01 — the research
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '2.5rem', fontFamily: PP }}>
          google knew it first.
        </motion.h2>
        {[
          'in 2012, google launched project aristotle. their goal: understand what makes a team perform. they studied 180 teams across the company. they measured skills, experience levels, personality types, work styles. everything.',
          'the data kept pointing to one thing. not the smartest people. not the most efficient processes. not the best managers.',
          'psychological safety. the shared belief that the team is safe for interpersonal risk-taking. that you can speak, fail, and be seen — without punishment.',
          'teams where people felt safe to be honest outperformed everything else. not sometimes. consistently.',
          'google called it the most important factor in team performance. but it is not just a workplace finding. it is a human one.',
        ].map((text, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300, marginBottom: '1.4rem', fontFamily: PP }}>
            {text}
          </motion.p>
        ))}
      </section>

      {/* 02 — The Science */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: isMobile ? '4rem 1.5rem' : '6rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '2rem', fontFamily: PP }}>
          02 — the science
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '4rem', fontFamily: PP }}>
          three researchers. one finding.
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '2.5rem' : '4rem' }}>
          {[
            {
              name: 'Amy Edmondson',
              role: 'Harvard Business School',
              body: 'coined the term psychological safety in 1999. her research showed that high-performing teams make more errors — not fewer. because they feel safe enough to admit them. safety does not prevent mistakes. it creates the conditions to learn from them.',
            },
            {
              name: 'Simon Sinek',
              role: 'The Infinite Game',
              body: 'described the circle of safety. when people feel protected — not threatened — by those closest to them, they spend less energy on self-defense. and more on each other. trust is not a feeling. it is a structure.',
            },
            {
              name: 'Brené Brown',
              role: 'The Gifts of Imperfection',
              body: 'spent 20 years studying shame, vulnerability, and belonging. her finding: vulnerability is not weakness. it is the birthplace of love, belonging, joy, courage, and creativity. the willingness to be seen is the beginning of connection.',
            },
          ].map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.35, fontFamily: PP }}>{r.role}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 400, letterSpacing: '-0.01em', color: '#1A1A1A', fontFamily: PP }}>{r.name}</p>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#555', fontWeight: 300, fontFamily: PP }}>{r.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 02b — Trust */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: isMobile ? '4rem 1.5rem' : '6rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '2rem', fontFamily: PP }}>
          02b — trust
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '3rem', fontFamily: PP }}>
          redefining high performance.
        </motion.h2>
        {[
          'trust is not a given.',
          'it is not a personality trait.',
          'it is a practice.',
          '',
          'it is built in small moments.',
          'a question asked and answered honestly.',
          'a silence held without panic.',
          "a confession that didn't get punished.",
          '',
          'it grows in the spaces between people',
          'who keep choosing to show up.',
        ].map((line, i) => (
          line === '' ? (
            <div key={i} style={{ height: '1rem' }} />
          ) : (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '1.1rem', lineHeight: 1.75, color: '#444', fontWeight: 300, fontFamily: PP, marginBottom: '0.2rem' }}>
              {line}
            </motion.p>
          )
        ))}
      </section>

      {/* 03 — The Connection */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: isMobile ? '4rem 1.5rem' : '6rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '2rem', fontFamily: PP }}>
          03 — the connection
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '2.5rem', fontFamily: PP }}>
          what this has to do with us.
        </motion.h2>
        {[
          'peakplant exists at the intersection of all of this.',
          "we looked at the research. we looked at our own lives. and we saw the same pattern: people are not disconnected because they don't care. they are disconnected because they were never given a structure to practice connection.",
          'a ritual. a prompt. a moment of permission to be real.',
          'the box is not the product. the conversation is the product.',
          'and the conversation starts with a question.',
        ].map((text, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300, marginBottom: '1.4rem', fontFamily: PP }}>
            {text}
          </motion.p>
        ))}
      </section>

      {/* 03b — Courage */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: isMobile ? '4rem 1.5rem' : '6rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '3rem', fontFamily: PP }}>
          it requires courage.
        </motion.h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {[
            { text: 'vulnerability requires courage.', indent: false },
            { text: 'courage requires safety.', indent: false },
            { text: 'and safety — real safety —', indent: false },
            { text: 'is built in connection.', indent: false },
            { text: '', indent: false },
            { text: 'we can heal alone.', indent: false },
            { text: '', indent: false },
            { text: 'but we can also heal together —', indent: false },
            { text: 'as partners.', indent: true },
            { text: 'as friends.', indent: true },
            { text: 'as families.', indent: true },
            { text: 'as society.', indent: true },
            { text: '', indent: false },
            { text: 'peakplant is one small place', indent: false },
            { text: 'where that starts.', indent: false },
          ].map((line, i) => (
            line.text === '' ? (
              <div key={i} style={{ height: '0.8rem' }} />
            ) : (
              <motion.p key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: line.indent ? '0.9rem' : '1.1rem',
                  lineHeight: 1.75,
                  color: '#444',
                  fontWeight: 300,
                  fontFamily: PP,
                  paddingLeft: line.indent ? '2.5rem' : '0',
                  opacity: line.indent ? 0.7 : 1,
                }}>
                {line.text}
              </motion.p>
            )
          ))}
        </div>
      </section>

      {/* 04 — The Mechanic */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: isMobile ? '4rem 1.5rem' : '6rem 2.5rem', maxWidth: 800, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '2rem', fontFamily: PP }}>
          04 — the mechanic
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '3rem', fontFamily: PP }}>
          how it works.
        </motion.h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            'one person picks up the card. reads the question out loud. goes first.',
            'that is the vulnerability loop. that is the circle of safety. that is connection — practiced.',
            "'safe. soft. wild.' is not a tagline. it is a research finding.",
            'we only get it into our bones through practice.',
            'not every conversation is easy.',
            'that is an illusion worth letting go of.',
            'but every honest moment — however clumsy, however uncomfortable — makes us a little braver.',
            'a little more ourselves.',
            'a little more connected to the people we chose and to the person we are becoming.',
            'the comfort zone does not shrink when you practice.',
            'it widens.',
            'not just in your closest relationships.',
            'everywhere.',
          ].map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300, fontFamily: PP }}>
              {line}
            </motion.p>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 300, lineHeight: 1.45, maxWidth: 640, margin: '0 auto 3rem', letterSpacing: '-0.015em', fontFamily: PP }}
        >
          want to practice?
        </motion.p>
        <Link href="/shop" style={{ fontFamily: PP, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 3 }}>
          explore edition 01 →
        </Link>
      </section>
    </div>
  )
}
