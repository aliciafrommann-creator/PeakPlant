import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'about — peakplant · alicia frommann',
  description: 'peakplant was founded by Alicia Frommann. a brand built on the belief that love, presence, and connection are worth investing in. the story behind the sunflower.',
  openGraph: {
    title: 'about peakplant — alicia frommann',
    description: 'a brand built on the belief that love and presence are worth showing up for. the story behind peakplant.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['peakplant founder', 'Alicia Frommann', 'intimacy brand story', 'sustainable condom brand', 'about peakplant'],
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
