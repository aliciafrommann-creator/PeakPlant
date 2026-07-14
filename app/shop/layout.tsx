import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'shop — peakplant · edition 01 the sunflower',
  description: 'edition 01 — the sunflower. a deck of moment cards for couples — dates, acts, questions — plus a seed paper card that grows into sunflowers. every card scans into your private couple diary. launching august 2026. join the waitlist.',
  openGraph: {
    title: 'shop — peakplant · edition 01 the sunflower',
    description: 'edition 01. one deck of moments — dates, acts, questions. one seed paper card — grows into sunflowers. launching august 2026.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['kartenset paare', 'date ideen karten', 'paar tagebuch app', 'edition 01', 'couple card deck', 'question cards couples', 'moment cards', 'seed paper sunflower'],
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
