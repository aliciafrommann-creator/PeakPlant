import type { Metadata } from 'next'
import './globals.css'
import { CursorEffect } from '../components/CursorEffect'

export const metadata: Metadata = {
  title: 'PeakPlant — Grow where you feel most alive.',
  description: 'An intimacy brand. Safe. Soft. Wild.',
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
