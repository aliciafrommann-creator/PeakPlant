import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'philosophy — peakplant · why connection matters',
  description: 'the science behind peakplant. psychological safety, vulnerability, and why the deepest human need is to be truly seen. research by Amy Edmondson, Brené Brown, Simon Sinek.',
  openGraph: {
    title: 'the philosophy behind peakplant',
    description: 'psychological safety. vulnerability. the science of connection — and why we built peakplant around it.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['intimacy science', 'psychological safety couples', 'connection research', 'vulnerability relationships', 'Brené Brown', 'Amy Edmondson', 'emotional safety'],
}

export default function PhilosophyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
