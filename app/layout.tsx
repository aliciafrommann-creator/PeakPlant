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
  title: 'peakplant — mind the moment. max the love.',
  description: 'peakplant — a new intimacy brand for couples. mind the moment. max the love. edition 01: the sunflower. 6 condoms, 1 question card, 1 seed paper card. vegan, fair rubber. launching august 2026.',
  openGraph: {
    title: 'peakplant — mind the moment. max the love.',
    description: '6 condoms. one question. one ritual. edition 01 — the sunflower.',
    type: 'website',
    url: 'https://peak-plant.com',
    siteName: 'PeakPlant',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PeakPlant — mind the moment. max the love.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'peakplant — mind the moment. max the love.',
    description: '6 condoms. one question. one ritual. edition 01 — the sunflower.',
    images: ['/opengraph-image'],
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
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  )
}
