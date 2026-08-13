import Link from 'next/link'
import type { Metadata } from 'next'
import { NavBar } from '../../components/NavBar'
import { SiteFooter } from '../../components/SiteFooter'
import { journalArticles } from '../../lib/journal'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

export const metadata: Metadata = {
  title: 'journal — peakplant',
  description:
    'Essays on intimacy, presence and the systems behind disconnection. Written alongside the making of PeakPlant.',
  alternates: { canonical: 'https://peak-plant.com/journal' },
}

/**
 * The journal index.
 *
 * This page used to be `redirect('/community')` — six written pieces existed
 * and nothing listed them. The footer linked here from every page, and the
 * welcome letter invites people to "read my journal", so the invitation led
 * to the community page instead of to the writing.
 */
export default function JournalIndex() {
  return (
    <main style={{ fontFamily: PP, background: '#FBFAF7', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/journal" />

      <section className="pp-journal-head">
        <p className="pp-eyebrow" style={{ color: '#857F76', marginBottom: '1.5rem' }}>
          journal
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: 720, margin: 0 }}>
          notes from the making of it.
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 300, color: '#5A554E', maxWidth: 560, marginTop: '1.75rem' }}>
          essays on intimacy, presence, and why closeness is something you practise
          rather than something you have. one of these goes out with the monthly
          letter.
        </p>
      </section>

      <section className="pp-journal-list">
        {journalArticles.map((a) => (
          <Link key={a.slug} href={`/journal/${a.slug}`} className="pp-journal-item">
            <p className="pp-eyebrow" style={{ color: '#857F76', opacity: 0.8, marginBottom: '0.85rem' }}>
              {a.category}
            </p>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 0.9rem' }}>
              {a.title}
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, fontWeight: 300, color: '#5A554E', margin: '0 0 1.1rem', maxWidth: 620 }}>
              {a.excerpt}
            </p>
            <span className="pp-quiet-link" style={{ fontFamily: PP }}>
              READ →
            </span>
          </Link>
        ))}
      </section>

      <SiteFooter locale="en" />
    </main>
  )
}
