'use client'
import { useEffect, useState } from 'react'

/**
 * Viewport check for the few places that decide layout in JavaScript.
 *
 * The default is **860px on purpose**: every media query in `app/globals.css`
 * switches at 860 (nav → burger, `.pp-stack` → one column, hero films → poster).
 * While this hook defaulted to 768, every window between 769 and 860 got both
 * at once — the stylesheet stacked the page, the inline grids stayed
 * two-column. Measured on a 800px viewport before the fix: ten two-column
 * grids on /shop alone, squeezed into a layout meant to be single-column.
 *
 * Caveat that has bitten this codebase before: on the server this returns
 * `false`, so the first paint is always the desktop branch. For anything that
 * must be right in the very first frame — and for anything a search engine
 * reads — use the CSS classes (`.pp-stack` and friends), not this hook.
 */
export function useIsMobile(breakpoint = 860): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])

  return isMobile
}
