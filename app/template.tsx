'use client'
import { motion } from 'framer-motion'

/**
 * Der Seitenwechsel-Übergang — und die Notbremse dafür.
 *
 * WARUM DAS `noscript` DA IST: framer-motion setzt den Ausgangszustand als
 * Inline-Stil ins SSR-HTML (`opacity:0`). Ohne JavaScript wird daraus nie
 * wieder 1 — die Seite ist dann im Quelltext vorhanden und trotzdem
 * unsichtbar. Für eine Marketingseite ist das ärgerlich; für die
 * Widerrufsbelehrung und das Impressum ist es eine Pflichtinformation, die
 * niemand lesen kann (gefunden beim Gegenlesen, 18.08.2026).
 *
 * Die Regel greift nur ohne JavaScript und nur auf exakt `opacity:0;` —
 * `opacity:0.5;` bleibt unangetastet.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <noscript>
        <style>{'[style*="opacity:0;"]{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </motion.div>
    </>
  )
}
