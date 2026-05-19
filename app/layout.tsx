import type { Metadata } from 'next'
import { Cormorant_Garamond, Raleway } from 'next/font/google'
import './globals.css'
import { CursorEffect } from '../components/CursorEffect'
import CookieBanner from '../components/CookieBanner'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-raleway',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PeakPlant — Edition 01',
  description: 'an intimate edition for curious couples.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${raleway.variable}`}>
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden', cursor: 'none' }}>
        <CursorEffect />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
