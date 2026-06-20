import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'intimacy — peakplant · being fully present',
  description: 'what intimacy actually looks like. not performance, not pressure — presence. the peakplant guide to being fully here with another person.',
  openGraph: {
    title: 'intimacy — peakplant',
    description: 'not performance. presence. what it means to be fully here with someone.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['intimacy guide', 'presence in relationships', 'emotional intimacy', 'deeper connection', 'mindful sex', 'couples connection', 'relationship presence'],
}

export default function IntimacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
