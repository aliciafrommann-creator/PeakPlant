import type { Metadata } from 'next'
import './globals.css'
import { CursorEffect } from '../components/CursorEffect'
import CookieBanner from '../components/CookieBanner'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PeakPlant',
  url: 'https://peak-plant.com',
  description: 'A premium intimacy brand for couples seeking deeper connection.',
  email: 'hello@peak-plant.com',
  foundingDate: '2026',
  founder: { '@type': 'Person', name: 'Alicia Frommann' },
}

export const metadata: Metadata = {
  title: 'peakplant — safe. soft. wild.',
  description: 'peakplant is a new intimacy brand for couples who want to feel closer. 6 condoms, 1 question card with 6 questions, 1 seed paper card. vegan, fair rubber. launching august 2026.',
  openGraph: {
    title: 'peakplant — safe. soft. wild.',
    description: '6 condoms. 6 questions. one ritual.',
    type: 'website',
  },
  icons: [{ rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=location.pathname;document.documentElement.lang=p.startsWith('/de')?'de':'en';})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
        <CursorEffect />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
