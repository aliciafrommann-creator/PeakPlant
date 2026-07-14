import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PeakPlant — mind the moment. max the love.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1A1A',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 72, color: '#CF4B2C', marginBottom: 28, display: 'flex', lineHeight: 1 }}>
          ∧
        </div>
        <div style={{ fontSize: 13, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 44, display: 'flex' }}>
          PEAKPLANT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <div style={{ fontSize: 58, fontWeight: 200, color: '#ffffff', display: 'flex' }}>
            mind the moment.
          </div>
          <div style={{ fontSize: 58, fontWeight: 200, color: '#CF4B2C', display: 'flex' }}>
            max the love.
          </div>
        </div>
        <div style={{ marginTop: 52, fontSize: 15, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', display: 'flex' }}>
          EDITION 01 — THE SUNFLOWER · LAUNCHING AUGUST 2026
        </div>
      </div>
    ),
    { ...size }
  )
}
