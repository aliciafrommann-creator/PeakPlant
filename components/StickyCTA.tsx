'use client'
import { useEffect, useState } from 'react'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

/**
 * Mobile-only bar pinned to the bottom edge.
 *
 * The home page is about ten phone screens tall and the only permanent call to
 * action sits in the top bar — out of thumb reach for the entire scroll. This
 * puts it where the hand already is.
 *
 * It stays out of the way in three situations:
 *  - while the cookie notice occupies the bottom edge (two stacked bars is
 *    worse than none),
 *  - once the waitlist section is on screen, because covering the form with a
 *    button that scrolls to the form is absurd,
 *  - before the reader has left the hero, where the same CTA is already visible.
 */
export function StickyCTA({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false)
  const [cookieDismissed, setCookieDismissed] = useState(false)

  useEffect(() => {
    setCookieDismissed(Boolean(localStorage.getItem('cookie-notice')))
  }, [])

  useEffect(() => {
    const target = document.getElementById('waitlist')

    // Past the first screen, the hero CTA has scrolled away.
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    if (!target) return () => window.removeEventListener('scroll', onScroll)

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(false) },
      { rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(target)
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  if (!visible || !cookieDismissed) return null

  return (
    <div className="pp-sticky-cta" aria-hidden={false}>
      <a href="#waitlist" style={{
        fontFamily: PP,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        borderRadius: 999,
        background: '#1A1A1A',
        color: '#ffffff',
        fontSize: 13,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'none',
      }}>
        {locale === 'de' ? 'auf die warteliste' : 'join the waitlist'}
      </a>
    </div>
  )
}

export default StickyCTA
