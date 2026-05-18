'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { NavBar } from '../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function AGBPage() {
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
          agb
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85, color: '#444', fontWeight: 300, marginBottom: '1.5rem' }}>
              Die Allgemeinen Geschäftsbedingungen werden vor Launch vollständig ergänzt.
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.85, color: '#444', fontWeight: 300 }}>
              Bei Fragen: hello@peak-plant.com
            </p>
          </div>
          <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#999', lineHeight: 1.7, fontStyle: 'italic' }}>
              Placeholder — wird vor Launch durch rechtssichere Fassung ersetzt.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
