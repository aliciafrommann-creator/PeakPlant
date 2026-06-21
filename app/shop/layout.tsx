import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'shop — peakplant · edition 01 the sunflower',
  description: 'edition 01 — the sunflower. 6 vegan condoms, 1 question card (one of ten to collect), 1 seed paper card that grows into sunflowers. launching august 2026. join the waitlist.',
  openGraph: {
    title: 'shop — peakplant · edition 01 the sunflower',
    description: 'edition 01. 6 vegan condoms. one question card. one seed paper — grows into sunflowers. launching august 2026.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['nachhaltige kondome', 'vegane kondome', 'intimacy box', 'edition 01', 'vegan condoms', 'fair rubber', 'question cards couples', 'seed paper sunflower'],
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
