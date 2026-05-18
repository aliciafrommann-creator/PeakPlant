'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { NavBar } from '../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function ImpressumPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar />

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '10rem 2.5rem 8rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '2rem' }}>
          legal
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', marginBottom: '4rem' }}>
          impressum
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {[
            {
              label: 'angaben gemäß § 5 tmg',
              lines: ['Alicia Frommann', 'PeakPlant', 'Otto-Löffler-Weg 10', '73207 Plochingen'],
            },
            {
              label: 'kontakt',
              lines: ['Telefon: +49 163 9076331', 'E-Mail: hello@peak-plant.com'],
            },
            {
              label: 'vertreten durch',
              lines: ['Alicia Frommann'],
            },
            {
              label: 'handelsregister',
              lines: ['wird nach Gewerbeanmeldung ergänzt'],
            },
            {
              label: 'umsatzsteuer',
              lines: ['Umsatzsteuer-ID: wird nach Gewerbeanmeldung ergänzt'],
            },
          ].map(({ label, lines }) => (
            <div key={label} style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '0.75rem' }}>{label}</p>
              {lines.map((line, i) => (
                <p key={i} style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#444', fontWeight: 300 }}>{line}</p>
              ))}
            </div>
          ))}

          <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#999', lineHeight: 1.7, fontStyle: 'italic' }}>
              vollständiges Impressum wird vor Launch durch eine rechtssichere Fassung ergänzt.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
