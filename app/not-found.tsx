import Link from 'next/link'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export default function NotFound() {
  return (
    <div style={{ fontFamily: PP, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#1A1A1A', textAlign: 'center', padding: '2rem' }}>
      <span style={{ fontSize: '2rem', color: '#CF4B2C', marginBottom: '1.5rem', lineHeight: 1, display: 'block' }}>∧</span>
      <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', opacity: 0.35, marginBottom: '1.5rem', textTransform: 'uppercase', fontFamily: PP }}>404 — not found</p>
      <Link href="/" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A1A1A', opacity: 0.5, textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.25)', paddingBottom: 3, fontFamily: PP }}>
        back home
      </Link>
    </div>
  )
}
