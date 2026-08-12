import type { Metadata } from 'next'

// Own layout so the archive keeps its own metadata. /letters is a root route
// (no locale segment), like /journal and /shop — so there is one canonical and
// no hreflang pair to declare.
export const metadata: Metadata = {
  title: 'the letters — peakplant · every monthly letter, kept',
  // Names only what a letter definitely carries. The app-insights block in an
  // edition is gated on copy that may not be written yet, so it is not
  // advertised here (MANIFESTO §1).
  description:
    'the peakplant letter archive. every monthly letter stays readable here after it is sent — the journal essay of the month, one song, and an open door into the beta.',
  alternates: {
    canonical: 'https://peak-plant.com/letters',
  },
  openGraph: {
    title: 'the letters — peakplant',
    description: 'every monthly letter, kept. no email address needed to read one back.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['peakplant letter', 'newsletter archive', 'monthly letter', 'intimacy newsletter', 'couples letter'],
}

export default function LettersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
