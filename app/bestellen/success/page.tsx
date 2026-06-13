'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function SuccessContent() {
  return (
    <div style={{ fontFamily: PP, background: '#fff', color: '#1A1A1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 480, textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '2.5rem' }}>∧ peakplant</p>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          thank you.<br />you're part of it now.
        </h1>

        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#555', fontWeight: 300, marginBottom: '2.5rem' }}>
          your preorder is confirmed. we've sent a confirmation to your inbox —
          including your sneak peek into the digital world, as a thank you.
          <br /><br />
          edition 01 ships mid-august 2026. your card is charged now to reserve
          your box, and you're fully refundable anytime until it ships.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/01"
            style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: '#1A1A1A', color: '#fff', textDecoration: 'none' }}>
            enter the digital world →
          </Link>
          <Link href="/"
            style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', textDecoration: 'none' }}>
            back home
          </Link>
        </div>

        <p style={{ marginTop: '3rem', fontSize: 12, opacity: 0.3, fontWeight: 300, lineHeight: 1.6 }}>
          safe. soft. wild.
        </p>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fff' }} />}>
      <SuccessContent />
    </Suspense>
  )
}
