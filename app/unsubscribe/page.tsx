'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function UnsubscribeContent() {
  const params = useSearchParams()
  const done = params.get('done') === '1'
  const error = params.get('error') === '1'

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2.5rem', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem', color: '#1A1A1A', opacity: 0.5 }}>∧</span>
        </Link>

        {error ? (
          <>
            <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 200, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              that link didn't work.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: 1.7, fontWeight: 300 }}>
              write to us at{' '}
              <a href="mailto:hello@peak-plant.com" style={{ color: '#1A1A1A', opacity: 0.7 }}>
                hello@peak-plant.com
              </a>{' '}
              and we'll take care of it.
            </p>
          </>
        ) : done ? (
          <>
            <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 200, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              you've been unsubscribed.
            </p>
            <p style={{ fontSize: '1rem', color: '#666', lineHeight: 1.7, fontWeight: 300 }}>
              we'll miss you.
            </p>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.35 }}>
              ∧ peakplant
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 200, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
              unsubscribing…
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  )
}
