import Link from 'next/link'
import Image from 'next/image'
import { NavBar } from '../../components/NavBar'
import { SiteFooter } from '../../components/SiteFooter'
import { LETTERS } from '../../lib/letters'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

/* Dark value: #1A1A1A, not BRAND.md's #1E1C1A. This page renders no dark
   surface of its own, but it sits directly against NavBar (rgba(26,26,26,…)),
   SiteFooter and .pp-cta, which all hardcode #1A1A1A. Matching them keeps the
   type on this page the same black as the chrome around it; mixing the two
   warm darks only produces a visible edge with nothing gained. */
const INK = '#1A1A1A'
const RULE = '#e8e8e8'

/* No framer-motion here on purpose. An archive index is a list of links: it has
   to be readable by a crawler and on a failed JS load, and the site's motion
   signature starts at opacity 0. That also keeps this a server component, so
   the metadata in ./layout.tsx stays possible.

   Likewise no useIsMobile(): the hook returns desktop on the server and only
   corrects after hydration. The layout below is a single 680px column that
   scales with clamp(), so there is nothing to branch on. */

export default function LettersPage() {
  // Newest edition first. Sorted rather than assumed, so the order survives a
  // careless append at the bottom of LETTERS.
  const letters = [...LETTERS].sort((a, b) => b.number - a.number)

  return (
    <div
      style={{
        fontFamily: PP,
        background: '#FBFAF7',
        color: INK,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NavBar activePath="/letters" />

      {/* flex: 1 keeps the footer at the bottom of the viewport while the
          archive holds a single entry — otherwise it floats mid-screen. */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 680,
          margin: '0 auto',
          padding: 'clamp(7rem, 14vw, 9rem) clamp(1.25rem, 5vw, 2.5rem) 5rem',
        }}
      >
        <p className="pp-eyebrow" style={{ opacity: 0.4, marginBottom: '1.5rem' }}>
          the letters
        </p>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 200,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}
        >
          every letter, kept.
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            fontWeight: 300,
            lineHeight: 1.8,
            color: '#555',
            maxWidth: 520,
            marginBottom: 'clamp(3rem, 8vw, 4.5rem)',
          }}
        >
          the monthly letter goes out on the first — and then stays here. no
          email address needed to read one back.
        </p>

        <ol style={{ listStyle: 'none', borderTop: `1px solid ${RULE}` }}>
          {letters.map(letter => {
            const n = String(letter.number).padStart(2, '0')
            return (
              <li key={letter.slug} style={{ borderBottom: `1px solid ${RULE}` }}>
                {/* The whole row is the tap target — far past the 44px minimum. */}
                <Link
                  href={`/letters/${letter.slug}`}
                  style={{
                    display: 'block',
                    padding: 'clamp(2rem, 6vw, 2.75rem) 0',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'baseline',
                      gap: '0.6rem 1.5rem',
                      marginBottom: '1.1rem',
                    }}
                  >
                    {/* Chili is the one accent on this surface — nothing else
                        on the page is coloured. */}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#CF4B2C',
                      }}
                    >
                      letter {n}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        opacity: 0.35,
                      }}
                    >
                      {letter.month}
                    </span>
                  </div>

                  {/* Only rendered once a real image exists — an empty frame
                      would read as content that is missing. */}
                  {letter.heroImage && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        background: '#F3F1EC',
                        overflow: 'hidden',
                        marginBottom: '1.75rem',
                      }}
                    >
                      <Image
                        src={letter.heroImage}
                        alt=""
                        fill
                        sizes="(max-width: 860px) 100vw, 680px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <h2
                    style={{
                      fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                      fontWeight: 200,
                      letterSpacing: '-0.025em',
                      lineHeight: 1.2,
                      marginBottom: '0.9rem',
                    }}
                  >
                    {letter.title}
                  </h2>

                  <p
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 300,
                      lineHeight: 1.8,
                      color: '#555',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {letter.teaser}
                  </p>

                  {/* A span, not a nested link — .pp-quiet-link is purely the
                      look, and it already carries the mobile size and padding
                      bump from globals.css. */}
                  <span className="pp-quiet-link">read the letter →</span>
                </Link>
              </li>
            )
          })}
        </ol>

        {/* Closing note. Both sentences are statements about how the letter
            actually works — the cron in vercel.json sends on the first of the
            month to every active subscriber, and the waitlist is that same
            list. No dates, no cadence we have not built. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '1.25rem',
            marginTop: 'clamp(2.5rem, 7vw, 3.5rem)',
          }}
        >
          <span style={{ fontSize: '0.6rem', opacity: 0.25 }}>∧</span>
          <p
            style={{
              fontSize: '0.9rem',
              fontWeight: 300,
              lineHeight: 1.8,
              color: '#777',
              maxWidth: 460,
            }}
          >
            there is nothing before 01 — this is where it starts. everyone on the
            waitlist gets the next one.
          </p>
        </div>
      </main>

      {/* /letters lives at the root, English-only, exactly like /journal — so
          the footer is asked for its English copy. If the archive is ever
          locale-split, this becomes a param. */}
      <SiteFooter locale="en" />
    </div>
  )
}
