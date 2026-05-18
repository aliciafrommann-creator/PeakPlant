'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function ImpressumPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A', fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6, fontFamily: PP }}>
          ∧ peakplant
        </Link>
      </nav>

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
            { label: 'angaben gemäß § 5 tmg', lines: ['peakplant', '[rechtsform + name]', '[adresse]'] },
            { label: 'kontakt', lines: ['e-mail: hello@peakplant.com', 'telefon: wird ergänzt'] },
            { label: 'vertreten durch', lines: ['alicia frommann'] },
            { label: 'handelsregister', lines: ['[handelsregisternummer nach UG-gründung]'] },
            { label: 'umsatzsteuer', lines: ['umsatzsteuer-id: wird ergänzt nach gewerbeanmeldung'] },
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
              placeholder — wird vor launch durch rechtssichere fassung von händlerbund.de ersetzt (inkl. medizinprodukt-paragraph für kondome).
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
