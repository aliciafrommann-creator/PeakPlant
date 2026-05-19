'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { NavBar } from '../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const researchers = [
  {
    name: 'AMY EDMONDSON — HARVARD',
    quote: 'psychological safety requires someone to go first. to model vulnerability. to show it is safe.',
  },
  {
    name: 'SIMON SINEK',
    quote: 'a team is not a group of people who work together. a team is a group of people who trust each other.',
  },
  {
    name: 'BRENÉ BROWN',
    quote: 'vulnerability is not weakness. it is the birthplace of connection. but only when there is safety to hold it.',
  },
]

export default function PhilosophyPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/philosophy" />

      {/* Hero */}
      <section style={{ padding: '14rem 2.5rem 8rem', maxWidth: 780, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2rem' }}
        >
          philosophy
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.03em' }}
        >
          intimacy is a skill.
        </motion.h1>
      </section>

      {/* Section 1 — Research */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 680, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}
        >
          01 — the research
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3.5rem' }}
        >
          google knew it first.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>in 2012, google set out to find what makes the best team.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>they analyzed 180 teams over several years — project aristotle.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>their hypothesis: the smartest people, the best mix of personalities, the most experience.</p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: '#1A1A1A', fontWeight: 400 }}>the result surprised them.</p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: '#1A1A1A', fontWeight: 400 }}>none of that mattered much.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>the only factor that truly counted: psychological safety.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>the feeling that you can speak without being punished. that you can admit a mistake. that you can share an idea without being laughed at.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>teams with high psychological safety were measurably more productive, more innovative, and happier — regardless of IQ, skills or experience.</p>
        </motion.div>
      </section>

      {/* Section 2 — Researchers */}
      <section style={{ borderTop: '1px solid #e8e8e8', background: '#faf9f7', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}
          >
            02 — the science
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '4rem' }}
          >
            three researchers. one finding.
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem 5rem' }}>
            {researchers.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid #e8e8e8', paddingTop: '2rem' }}
              >
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45 }}>{r.name}</p>
                <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#444', fontStyle: 'italic', fontWeight: 300 }}>"{r.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Connection */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 680, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}
        >
          03 — the connection
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3.5rem' }}
        >
          what this has to do with us.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>the skills that make the best teams are the same ones that make the best relationships.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>speaking without fear. admitting uncertainty. being seen without performing. going first.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>you cannot build psychological safety at work if you don't practice it at home.</p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.85, color: '#1A1A1A', fontWeight: 400 }}>intimacy is the training ground.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>peakplant gives you a place to practice.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>not in a meeting room. not in a workshop. in the most human moment of your day.</p>
        </motion.div>
      </section>

      {/* Section 03b — It requires courage */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 680, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
        >
          {[
            { text: 'vulnerability requires courage.', indent: false, small: false },
            { text: 'courage requires safety.', indent: false, small: false },
            { text: 'and safety — real safety —', indent: false, small: false },
            { text: 'is built in connection.', indent: false, small: false },
            { text: '', indent: false, small: false },
            { text: 'we can heal alone.', indent: false, small: false },
            { text: '', indent: false, small: false },
            { text: 'but we can also heal together —', indent: false, small: false },
            { text: 'as partners.', indent: true, small: true },
            { text: 'as friends.', indent: true, small: true },
            { text: 'as families.', indent: true, small: true },
            { text: 'as society.', indent: true, small: true },
            { text: '', indent: false, small: false },
            { text: 'peakplant is one small place', indent: false, small: false },
            { text: 'where that starts.', indent: false, small: false },
          ].map((line, i) =>
            line.text === '' ? (
              <div key={i} style={{ height: '1.2rem' }} />
            ) : (
              <p key={i} style={{
                fontSize: line.small ? '0.95rem' : '1.15rem',
                lineHeight: 1.7,
                color: '#1A1A1A',
                fontWeight: 300,
                fontStyle: 'italic',
                paddingLeft: line.indent ? '2.5rem' : 0,
                opacity: line.indent ? 0.65 : 1,
              }}>
                {line.text}
              </p>
            )
          )}
        </motion.div>
      </section>

      {/* Section 4 — Mechanic */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 680, margin: '0 auto' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}
        >
          04 — the mechanic
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3.5rem' }}
        >
          how it works.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>one person picks up the card. reads the question out loud. goes first.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>that is the vulnerability loop. that is the circle of safety. that is connection — practiced.</p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#1A1A1A', fontStyle: 'italic' }}>
            'safe. soft. wild.'<br />is not a tagline.<br />it is a research finding.
          </p>
        </motion.div>
      </section>

      {/* Section 05b — poem, no label */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 680, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
        >
          {[
            { text: 'we only get it into our bones', indent: false },
            { text: 'through practice.', indent: false },
            { text: '', indent: false },
            { text: 'not every conversation is easy.', indent: false },
            { text: 'not every question will feel safe.', indent: false },
            { text: 'not every silence will be comfortable.', indent: false },
            { text: '', indent: false },
            { text: 'but that is where the skill lives.', indent: false },
            { text: 'in the discomfort.', indent: true },
            { text: 'in the choosing to stay.', indent: true },
            { text: 'in the trying again.', indent: true },
            { text: '', indent: false },
            { text: 'intimacy is not a destination.', indent: false },
            { text: 'it is a practice.', indent: false },
            { text: '', indent: false },
            { text: 'and like all practice —', indent: false },
            { text: 'it shows up', indent: false },
            { text: 'everywhere.', indent: false },
          ].map((line, i) =>
            line.text === '' ? (
              <div key={i} style={{ height: '1.2rem' }} />
            ) : (
              <p key={i} style={{
                fontSize: '1.1rem',
                lineHeight: 1.75,
                color: '#1A1A1A',
                fontWeight: 300,
                fontStyle: 'italic',
                paddingLeft: line.indent ? '2.5rem' : 0,
                opacity: line.indent ? 0.6 : 1,
              }}>
                {line.text}
              </p>
            )
          )}
        </motion.div>
      </section>

      {/* Section 5 — CTA */}
      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
        >
          <p style={{ fontFamily: PP, fontSize: '1rem', lineHeight: 1.7, color: '#555', fontWeight: 300 }}>want to practice?</p>
          <Link href="/shop" style={{
            fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            padding: '1rem 2.5rem', background: 'transparent', color: '#1A1A1A',
            border: '1px solid #1A1A1A', textDecoration: 'none', display: 'inline-block',
          }}>
            explore edition 01
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
