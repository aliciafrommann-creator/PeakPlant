import type { Metadata } from 'next'
import './globals.css'
import { CursorEffect } from '../components/CursorEffect'

export const metadata: Metadata = {
  title: 'peakplant — safe. soft. wild.',
  description: 'a new intimacy brand. launching august 2026.',
  openGraph: {
    title: 'peakplant — safe. soft. wild.',
    description: '6 condoms. 6 questions. one ritual.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden', cursor: 'none' }}>
        <CursorEffect />
        {children}
      </body>
    </html>
  )
}
