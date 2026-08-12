/**
 * Eine einzelne Ausgabe des Briefs (/letters/<slug>).
 *
 * Server-Komponente mit Absicht: `generateMetadata` und `generateStaticParams`
 * koennen in einer 'use client'-Datei nicht exportiert werden. Deshalb hier
 * kein framer-motion — die Seite wird komplett serverseitig ausgeliefert
 * (gut fuer Google, und der erste Frame auf dem Handy stimmt sofort).
 *
 * Mobil: kein JS-Breakpoint (kein useIsMobile) — die Seite ist einspaltig und
 * skaliert ueber clamp() plus die bestehenden .pp-*-Klassen aus globals.css.
 *
 * Sprachen: /letters liegt auf Root-Ebene, es gibt also kein [locale]-Segment,
 * aus dem sich die Sprache ableiten liesse. Jede Ausgabe hat daher je eine
 * deutsche und eine englische URL (siehe `slug` unten); die Seite rendert die
 * Sprache, zu der der aufgerufene Slug gehoert, und verlinkt die andere.
 *
 * Farbe: BRAND.md nennt #1E1C1A als Dunkel. Die Website benutzt real durchgaengig
 * #1A1A1A (NavBar, SiteFooter, .pp-cta sind fest darauf verdrahtet). Ein stiller
 * Mix erzeugt sichtbare Kanten gegen den Button, deshalb hier bewusst #1A1A1A.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NavBar } from '../../../components/NavBar'
import { SiteFooter } from '../../../components/SiteFooter'
import { journalArticles } from '../../../lib/journal'
import type { Locale } from '../../../lib/translations'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const SITE_URL = 'https://peak-plant.com'

/* Palette — warm, eine dominante Akzentfarbe (chili), sonst nur Papiertoene. */
const INK = '#1A1A1A'
const CHILI = '#CF4B2C'
const PAPER = '#FBFAF7'
const CREAM = '#F7F2E8'
const CREAM_EDGE = '#EFE6D4'
const STONE = '#F3F1EC'
const STONE_EDGE = '#E4DFD5'
const LINE = '#ebebeb'
const BODY = '#555'
const SUBTLE = '#857F76'

type Bilingual = { de: string; en: string }

type Letter = {
  key: string
  /** Je Sprache eine eigene URL — /letters liegt ausserhalb von [locale]. */
  slug: Bilingual
  month: Bilingual
  title: Bilingual
  /** Der Journal-Text dieser Ausgabe, fest verdrahtet: eine archivierte
   *  Ausgabe muss ihren Text behalten. articleForMonth() waere zeitabhaengig
   *  und wuerde denselben Brief spaeter auf einen anderen Text zeigen lassen.
   *  Fuer august 2026 loest articleForMonth() genau diesen Slug auf. */
  articleSlug: string
  song: { title: string; artist: string; spotifyTrackId: string; url: string }
}

const LETTERS: Letter[] = [
  {
    key: '01',
    slug: { de: 'brief-01', en: 'letter-01' },
    month: { de: 'august 2026', en: 'august 2026' },
    title: { de: 'der erste brief.', en: 'the first letter.' },
    articleSlug: 'the-case-for-slowness',
    song: {
      title: 'dudenkstsoschön',
      artist: 'AARON',
      spotifyTrackId: '7sJp9yZIHtBSHNX7Jv5npi',
      url: 'https://open.spotify.com/track/7sJp9yZIHtBSHNX7Jv5npi',
    },
  },
]

/**
 * Alicias Brieftext fuer brief 01, ein Absatz pro Eintrag.
 * Solange die Arrays leer sind, rendert der Block gar nichts —
 * lieber kein Absatz als ein erfundener.
 * von Alicia zu fuellen
 */
const LETTER_BODY: Record<Locale, string[]> = {
  de: [],
  en: [],
}

/**
 * App-Einblicke dieser Ausgabe, eine Notiz pro Eintrag.
 * Der ganze Abschnitt faellt weg, solange die Arrays leer sind.
 * von Alicia zu fuellen
 */
const APP_NOTES: Record<Locale, string[]> = {
  de: [],
  en: [],
}

function findLetter(slug: string): { letter: Letter; locale: Locale } | null {
  for (const letter of LETTERS) {
    if (letter.slug.de === slug) return { letter, locale: 'de' }
    if (letter.slug.en === slug) return { letter, locale: 'en' }
  }
  return null
}

export function generateStaticParams() {
  return LETTERS.flatMap(letter => [{ slug: letter.slug.de }, { slug: letter.slug.en }])
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const found = findLetter(params.slug)
  if (!found) return { title: 'peakplant' }

  const { letter, locale } = found
  const isDE = locale === 'de'
  const eyebrow = isDE ? `brief ${letter.key}` : `letter ${letter.key}`
  const title = `${eyebrow} — ${letter.month[locale]} · peakplant`
  const description = isDE
    ? `${eyebrow}, ${letter.month.de}: ein text aus dem journal, der song der ausgabe (${letter.song.title} von ${letter.song.artist}) und die einladung zur beta.`
    : `${eyebrow}, ${letter.month.en}: one essay from the journal, the song of this issue (${letter.song.title} by ${letter.song.artist}) and the invitation to the beta.`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/letters/${letter.slug[locale]}`,
      languages: {
        de: `${SITE_URL}/letters/${letter.slug.de}`,
        en: `${SITE_URL}/letters/${letter.slug.en}`,
        'x-default': `${SITE_URL}/letters/${letter.slug.en}`,
      },
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${SITE_URL}/letters/${letter.slug[locale]}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
  }
}

/* --- geteilte Stile ------------------------------------------------------- */

/** Label: UPPERCASE, weit gesperrt, 12px — auf dem Handy noch lesbar. */
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontWeight: 400,
  fontFamily: PP,
}

/** Fliesstext: nie unter 16px, Zeilenhoehe 1.8. */
const bodyStyle: React.CSSProperties = {
  fontSize: 'clamp(1rem, 1.1vw, 1.05rem)',
  lineHeight: 1.8,
  fontWeight: 300,
  color: BODY,
  fontFamily: PP,
}

const sectionStyle: React.CSSProperties = {
  borderTop: `1px solid ${LINE}`,
  paddingTop: 'clamp(3rem, 8vw, 4.5rem)',
  marginTop: 'clamp(3rem, 8vw, 4.5rem)',
}

const cardStyle: React.CSSProperties = {
  padding: 'clamp(1.5rem, 5vw, 2.25rem)',
  borderRadius: 16,
}

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
  fontWeight: 200,
  letterSpacing: '-0.025em',
  lineHeight: 1.2,
  fontFamily: PP,
}

/* --- Seite ---------------------------------------------------------------- */

export default function LetterPage({ params }: { params: { slug: string } }) {
  const found = findLetter(params.slug)
  if (!found) notFound()

  const { letter, locale } = found
  const isDE = locale === 'de'
  const otherLocale: Locale = isDE ? 'en' : 'de'

  const body = LETTER_BODY[locale]
  const notes = APP_NOTES[locale]
  // Kein Fallback auf einen anderen Text: waere der Slug falsch, zeigte die
  // Ausgabe stillschweigend etwas Fremdes. Dann lieber kein Journal-Block.
  const article = journalArticles.find(a => a.slug === letter.articleSlug)

  return (
    <div style={{ fontFamily: PP, background: PAPER, color: INK, minHeight: '100vh' }}>
      <NavBar />

      <main
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: 'clamp(7rem, 15vw, 9rem) clamp(1.25rem, 5vw, 2.5rem) clamp(4rem, 10vw, 6rem)',
        }}
      >
        {/* 1 — ruhiger Kopf */}
        <header>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginBottom: '1.75rem' }}>
            <span style={{ ...labelStyle, color: CHILI }}>
              {isDE ? `brief ${letter.key}` : `letter ${letter.key}`}
            </span>
            <span style={{ ...labelStyle, color: SUBTLE }}>{letter.month[locale]}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 7vw, 3.2rem)',
              fontWeight: 200,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              marginBottom: '1.5rem',
            }}
          >
            {letter.title[locale]}
          </h1>

          <p style={{ ...bodyStyle, color: SUBTLE }}>
            {isDE ? 'ein text, ein song, eine einladung.' : 'one essay, one song, one invitation.'}
          </p>

          <p style={{ marginTop: '2rem' }}>
            <Link href={`/letters/${letter.slug[otherLocale]}`} className="pp-quiet-link" style={{ fontFamily: PP }}>
              {isDE ? 'read in english' : 'auf deutsch lesen'}
            </Link>
          </p>
        </header>

        {/* 2 — Alicias Brief. Leer = nichts, kein Platzhaltertext. */}
        {body.length > 0 && (
          <section style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {body.map((paragraph, i) => (
                <p key={i} style={{ ...bodyStyle, whiteSpace: 'pre-line' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 3 — der Text dieser Ausgabe, aus lib/journal.ts */}
        {article && (
          <section style={sectionStyle}>
            <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.5rem' }}>
              {isDE ? 'aus dem journal' : 'from the journal'}
            </p>

            <div style={{ ...cardStyle, background: CREAM, border: `1px solid ${CREAM_EDGE}` }}>
              <p style={{ ...labelStyle, color: CHILI, fontSize: 11, marginBottom: '1rem' }}>{article.category}</p>
              <h2 style={{ ...headingStyle, marginBottom: '1rem' }}>{article.title}</h2>
              <p style={{ ...bodyStyle, marginBottom: '2rem' }}>{article.excerpt}</p>

              <Link href={`/journal/${article.slug}`} className="pp-cta" style={{ fontFamily: PP }}>
                {isDE ? 'text lesen' : 'read the essay'}
              </Link>

              {isDE && (
                <p style={{ marginTop: '1rem', fontSize: 13, color: SUBTLE, fontWeight: 300, fontFamily: PP }}>
                  der text erscheint auf englisch.
                </p>
              )}
            </div>
          </section>
        )}

        {/* 4 — der Song der Ausgabe. Nur Titel, Interpret, Player und Link:
               der Songtext ist urheberrechtlich geschuetzt. */}
        <section style={sectionStyle}>
          <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.5rem' }}>
            {isDE ? 'der song dieser ausgabe' : 'the song of this issue'}
          </p>

          <h2 style={{ ...headingStyle, marginBottom: '0.5rem' }}>{letter.song.title}</h2>
          <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.75rem' }}>{letter.song.artist}</p>

          <div style={{ maxWidth: '100%', overflow: 'hidden', borderRadius: 12 }}>
            <iframe
              src={`https://open.spotify.com/embed/track/${letter.song.spotifyTrackId}?utm_source=generator&theme=0`}
              title={`${letter.song.title} — ${letter.song.artist}`}
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ border: 'none', borderRadius: 12, display: 'block', maxWidth: '100%' }}
            />
          </div>

          <p style={{ marginTop: '1.5rem' }}>
            <a
              href={letter.song.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pp-quiet-link"
              style={{ fontFamily: PP }}
            >
              {isDE ? 'auf spotify öffnen' : 'open on spotify'}
            </a>
          </p>

          <p style={{ marginTop: '1.25rem', fontSize: 13, color: SUBTLE, fontWeight: 300, fontFamily: PP, lineHeight: 1.7 }}>
            {isDE ? 'der player wird von spotify geladen — mehr dazu im ' : 'the player is loaded by spotify — more in the '}
            <Link href="/datenschutz" style={{ color: SUBTLE, textDecoration: 'underline' }}>
              {isDE ? 'datenschutz' : 'privacy notice'}
            </Link>
            .
          </p>
        </section>

        {/* 5 — App-Einblicke. Faellt komplett weg, solange APP_NOTES leer ist. */}
        {notes.length > 0 && (
          <section style={sectionStyle}>
            <p style={{ ...labelStyle, color: SUBTLE, marginBottom: '1.5rem' }}>
              {isDE ? 'aus der app' : 'from the app'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {notes.map((note, i) => (
                <p key={i} style={{ ...bodyStyle, whiteSpace: 'pre-line' }}>
                  {note}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* 6 — Beta. Kein Datum, keine Geraeteliste, kein Versprechen:
               was die beta ist, steht auf /beta. */}
        <section style={sectionStyle}>
          <div style={{ ...cardStyle, background: STONE, border: `1px solid ${STONE_EDGE}` }}>
            <p style={{ ...labelStyle, color: CHILI, fontSize: 11, marginBottom: '1rem' }}>beta</p>
            <h2 style={{ ...headingStyle, marginBottom: '1rem' }}>
              {isDE ? 'die app entsteht gerade.' : 'the app is being built.'}
            </h2>
            <p style={{ ...bodyStyle, marginBottom: '2rem' }}>
              {isDE
                ? 'wenn du sie früh sehen willst: hier steht, was es mit der beta auf sich hat.'
                : 'if you want to see it early: here is what the beta is about.'}
            </p>
            <Link href="/beta" className="pp-cta" style={{ fontFamily: PP }}>
              {isDE ? 'zur beta' : 'about the beta'}
            </Link>
          </div>
        </section>
      </main>

      {/* 7 — der eine Footer. /letters liegt ausserhalb von [locale], das
             Locale-Layout rendert ihn hier also nicht mit. */}
      <SiteFooter locale={locale} />
    </div>
  )
}
