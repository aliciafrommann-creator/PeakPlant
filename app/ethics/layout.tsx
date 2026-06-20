import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ethics — peakplant · sustainability & values',
  description: 'peakplant is built on fair rubber latex, blauer engel paper, vegan production and seed paper that grows into sunflowers. what we believe, how we make it.',
  openGraph: {
    title: 'ethics & sustainability — peakplant',
    description: 'fair rubber. blauer engel. seed paper. our ethics are not a marketing claim — they are the product.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['vegane kondome', 'fair rubber latex', 'nachhaltige kondome', 'blauer engel', 'seed paper sunflower', 'sustainable condoms ethics', 'eco condoms'],
}

export default function EthicsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
