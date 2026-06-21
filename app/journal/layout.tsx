import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'journal — peakplant · on love, presence, and intimacy',
  description: 'the peakplant journal. essays on intimacy, presence, emotional safety, and what it means to love deeply. written for couples who want to feel closer.',
  openGraph: {
    title: 'journal — peakplant',
    description: 'on love, presence, and intimacy. essays for people who want to feel closer.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['intimacy essays', 'couples journal', 'emotional safety', 'presence relationships', 'connection rituals', 'love mindfulness', 'fragen für paare'],
}

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
