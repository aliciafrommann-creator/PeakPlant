/**
 * One edition of the monthly letter — /letters/<slug>.
 *
 * Server component on purpose: `generateMetadata` and `generateStaticParams`
 * cannot be exported from a 'use client' file, so there is no framer-motion
 * here. The page ships fully server-rendered, which is what a letter needs —
 * it has to be readable by a crawler and on a failed JS load, and the site's
 * motion signature starts at opacity 0.
 *
 * No useIsMobile() either: the hook returns desktop on the server and only
 * corrects after hydration. This is a single 680px column that scales with
 * clamp() plus the .pp-* classes from globals.css, so there is nothing to
 * branch on and the first paint on a phone is already right.
 *
 * Language: /letters is a root route with no locale segment — English-only,
 * exactly like /journal, and exactly like the archive index next door.
 *
 * Dark value: #1A1A1A, not BRAND.md's #1E1C1A. NavBar, SiteFooter and .pp-cta
 * all hardcode #1A1A1A; matching them keeps the type the same black as the
 * chrome around it. Mixing the two warm darks only produces a visible edge.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NavBar } from '../../../components/NavBar'
import { SiteFooter } from '../../../components/SiteFooter'
import { articleForMonth, journalArticles } from '../../../lib/journal'
import { LETTERS, letterBySlug } from '../../../lib/letters'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const SITE_URL = 'https://peak-plant.com'

/* Palette — warm paper tones, chili as the one accent on this surface. */
const INK = '#1A1A1A'
const CHILI = '#CF4B2C'
const PAPER = '#FBFAF7'
const CREAM = '#F7F2E8'
const CREAM_EDGE = '#EFE6D4'
const STONE = '#F3F1EC'
const STONE_EDGE = '#E4DFD5'
const RULE = '#e8e8e8'
const BODY = '#555'
const SUBTLE = '#777'

/**
 * Alicia's letter text for this edition, one paragraph per entry, keyed by the
 * slug in lib/letters.ts. Nothing renders while an edition has no entry — an
 * empty letter is better than an invented one (MANIFESTO §1).
 * von Alicia zu fuellen
 */
const LETTER_BODY: Record<string, string[]> = {
  '01': [],
}

/**
 * App insights for this edition, one note per entry. The whole section is
 * dropped while the list is empty — no "coming soon" box that looks like
 * content, no placeholder copy.
 * von Alicia zu fuellen
 */
const APP_NOTES: Record<string, string[]> = {
  '01': [],
}

/**
 * The song of the edition. Lives here because lib/letters.ts carries the
 * archive index only. Title, artist and the official embed — never the lyrics,
 * which are copyrighted. An edition without an entry simply has no song block.
 */
type Song = { title: string; artist: string; spotifyTrackId: string; url: string }
const SONGS: Record<string, Song> = {
  '01': {
    title: 'dudenkstsoschön',
    artist: 'AARON',
    spotifyTrackId: '7sJp9yZIHtBSHNX7Jv5npi',
    url: 'https://open.spotify.com/track/7sJp9yZIHtBSHNX7Jv5npi',
  },
}

/**
 * The journal essay an edition actually went out with, pinned per slug.
 * articleForMonth() rotates by calendar month, so evaluating it here would let
 * a later deploy silently swap the essay of an archived letter. For august 2026
 * articleForMonth() resolves to exactly this slug. An edition with no pin falls
 * back to the rotation — right for the current month, so pin it when it ships.
 */
const EDITION_ESSAY: Record<string, string> = {
  '01': 'the-case-for-slowness',
}

export function generateStaticParams() {
  return LETTERS.map(letter => ({ slug: letter.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const letter = letterBySlug(params.slug)
  // Nothing to describe for an unknown slug — the page itself 404s.
  if (!letter) return {}

  const n = String(letter.number).padStart(2, '0')
  const title = `letter ${n} — ${letter.month} · peakplant`

  return {
    title,
    // The teaser in lib/letters.ts is the one honest summary of this edition;
    // duplicating it as a second description would only let the two drift.
    description: letter.teaser,
    // The segment layout canonicalises to /letters — an edition has to point
    // at itself instead, or every letter collapses into the archive index.
    alternates: { canonical: `${SITE_URL}/letters/${letter.slug}` },
    openGraph: {
      type: 'article',
      title,
      description: letter.teaser,
      url: `${SITE_URL}/letters/${letter.slug}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
  }
}

/* --- shared bits ---------------------------------------------------------- */

/* Labels stay at 0.7rem / 11.2px with wide tracking — the same size the
   archive index uses, and above the 11px floor a phone still reads. */
const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontFamily: PP,
}

/* Body copy never drops below 16px, line-height 1.8. */
const bodyStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 300,
  lineHeight: 1.8,
  color: BODY,
  fontFamily: PP,
}

const sectionStyle: React.CSSProperties = {
  borderTop: `1px solid ${RULE}`,
  marginTop: 'clamp(3rem, 8vw, 4.5rem)',
  paddingTop: 'clamp(3rem, 8vw, 4.5rem)',
}

const cardStyle: React.CSSProperties = {
  padding: 'clamp(1.5rem, 5vw, 2.25rem)',
  borderRadius: 16,
}

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
  fontWeight: 200,
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  fontFamily: PP,
}

/* --- page ----------------------------------------------------------------- */

export default function LetterPage({ params }: { params: { slug: string } }) {
  const letter = letterBySlug(params.slug)
  if (!letter) notFound()

  const n = String(letter.number).padStart(2, '0')
  const body = LETTER_BODY[letter.slug] ?? []
  const notes = APP_NOTES[letter.slug] ?? []
  const song = SONGS[letter.slug]

  const pinned = EDITION_ESSAY[letter.slug]
  const essay = (pinned && journalArticles.find(a => a.slug === pinned)) || articleForMonth()

  return (
    <div
      style={{
        fontFamily: PP,
        background: PAPER,
        color: INK,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NavBar activePath="/letters" />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 680,
          margin: '0 auto',
          padding: 'clamp(7rem, 14vw, 9rem) clamp(1.25rem, 5vw, 2.5rem) 5rem',
        }}
      >
        {/* 1 — a quiet head: label, month, one large light line */}
        <header>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: '0.6rem 1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* The brief called this label "brief 01". /letters is English-only
                — lib/letters.ts, the archive index ("letter {n}", "every letter,
                kept") and the SiteFooter here all speak English, so a German
                label would be the one German word on the surface. Change this
                one string if the area is ever German or locale-split. */}
            <span style={{ ...labelStyle, color: CHILI }}>letter {n}</span>
            <span style={{ ...labelStyle, letterSpacing: '0.15em', color: SUBTLE }}>{letter.month}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              fontWeight: 200,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            {letter.title}
          </h1>
        </header>

        {/* 2 — Alicia's letter. Empty means nothing is rendered at all. */}
        {body.length > 0 && (
          <section style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {body.map((paragraph, i) => (
                <p key={i} style={{ ...bodyStyle, whiteSpace: 'pre-line' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 3 — the essay of the edition, straight out of lib/journal.ts */}
        <section style={sectionStyle}>
          <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.5rem' }}>from the journal</p>

          <div style={{ ...cardStyle, background: CREAM, border: `1px solid ${CREAM_EDGE}` }}>
            <p style={{ ...labelStyle, color: CHILI, marginBottom: '1rem' }}>{essay.category}</p>

            <h2 style={{ ...headingStyle, marginBottom: '1rem' }}>{essay.title}</h2>

            <p style={{ ...bodyStyle, marginBottom: '2rem' }}>{essay.excerpt}</p>

            <Link href={`/journal/${essay.slug}`} className="pp-cta" style={{ fontFamily: PP }}>
              read the essay
            </Link>
          </div>
        </section>

        {/* 4 — the song of the edition. Title, artist, the official embed and a
               link out. No lyrics: they are copyrighted and stay with AARON. */}
        {song && (
          <section style={sectionStyle}>
            <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.5rem' }}>the song of this edition</p>

            <h2 style={{ ...headingStyle, marginBottom: '0.6rem' }}>{song.title}</h2>
            <p style={{ ...labelStyle, letterSpacing: '0.15em', color: SUBTLE, marginBottom: '1.75rem' }}>
              {song.artist}
            </p>

            {/* The wrapper is what keeps a phone from scrolling sideways —
                globals.css caps iframes at 100%, this clips the rounded edge. */}
            <div style={{ maxWidth: '100%', overflow: 'hidden', borderRadius: 12 }}>
              <iframe
                src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}?utm_source=generator&theme=0`}
                title={`${song.title} — ${song.artist}`}
                width="100%"
                height="152"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                style={{ border: 'none', borderRadius: 12, display: 'block', maxWidth: '100%' }}
              />
            </div>

            <p style={{ marginTop: '1.75rem' }}>
              <a
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pp-quiet-link"
                style={{ fontFamily: PP }}
              >
                open on spotify
              </a>
            </p>

            {/* Spotify as an embedded third party is already named in the
                privacy notice — the player says so where it plays. */}
            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1.7, color: SUBTLE, fontFamily: PP }}>
              the player is loaded by spotify — see the{' '}
              <Link href="/datenschutz" style={{ color: SUBTLE }}>
                privacy notice
              </Link>
              .
            </p>
          </section>
        )}

        {/* 5 — app insights. The whole block is gone while the list is empty. */}
        {notes.length > 0 && (
          <section style={sectionStyle}>
            <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.5rem' }}>from the app</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {notes.map((note, i) => (
                <p key={i} style={{ ...bodyStyle, whiteSpace: 'pre-line' }}>
                  {note}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 6 — the beta. No date, no device list, no promise: what the beta is
               is decided on /beta, and this only opens the door to it. */}
        <section style={sectionStyle}>
          <div style={{ ...cardStyle, background: STONE, border: `1px solid ${STONE_EDGE}` }}>
            <p style={{ ...labelStyle, color: CHILI, marginBottom: '1rem' }}>beta</p>

            <h2 style={{ ...headingStyle, marginBottom: '1rem' }}>the app is being built.</h2>

            <p style={{ ...bodyStyle, marginBottom: '2rem' }}>
              if you want to see it early, this is where the beta is explained.
            </p>

            <Link href="/beta" className="pp-cta" style={{ fontFamily: PP }}>
              about the beta
            </Link>
          </div>
        </section>

        <p style={{ marginTop: 'clamp(3rem, 8vw, 4.5rem)' }}>
          <Link href="/letters" className="pp-quiet-link" style={{ fontFamily: PP }}>
            ← every letter
          </Link>
        </p>
      </main>

      {/* /letters lives at the root, English-only, exactly like /journal — so
          the footer is asked for its English copy, same as the archive index. */}
      <SiteFooter locale="en" />
    </div>
  )
}
