'use client'
import { useEffect, useState } from 'react'

/**
 * A full-bleed hero that is a film on a laptop and a photograph on a phone.
 *
 * The films are 1.3–3.8 MB each and start downloading immediately. On a mobile
 * connection that is the first ten seconds of the visit spent on a blank
 * screen — for traffic arriving from Instagram, that is where people leave.
 *
 * So the still is the default and the film is an upgrade, never the other way
 * round: rendering the video first and hiding it with CSS would still download
 * every byte. The upgrade only happens on a wide viewport, and never when the
 * visitor has asked for less — data saver on, a slow connection, or reduced
 * motion. Nobody on a phone pays for a film they did not ask for.
 */
export function HeroFilm({
  film,
  poster,
  alt,
}: {
  film: string
  poster: string
  alt: string
}) {
  const [showFilm, setShowFilm] = useState(false)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 861px)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // navigator.connection is Chromium-only; absent elsewhere, which is fine —
    // the viewport check already covers the common case.
    const conn = (navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string }
    }).connection
    const thrifty = conn?.saveData === true
    const slow = /(^|-)(2g|slow-2g)$/.test(conn?.effectiveType ?? '')

    setShowFilm(wide && !calm && !thrifty && !slow)
  }, [])

  const fill: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    position: 'absolute',
    inset: 0,
  }

  if (!showFilm) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={alt} style={fill} />
  }

  return (
    <video autoPlay muted playsInline loop poster={poster} style={fill}>
      <source src={film} type="video/mp4" />
    </video>
  )
}

export default HeroFilm
