import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'community — peakplant · people who love deeply',
  description: 'the peakplant community. people who believe in presence, love, and the beauty of connection. join the waitlist and be part of edition 01 — the sunflower.',
  openGraph: {
    title: 'community — peakplant',
    description: 'people who love deeply. join the community before edition 01 launches.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['couples community', 'intimacy community', 'lovemaxing', 'connection rituals', 'peakplant community', 'relationship mindfulness'],
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
