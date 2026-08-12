// The archive of the monthly letter.
//
// The letter itself is assembled and sent by app/api/newsletter/send/route.ts
// (cron in vercel.json: "0 9 1 * *" — the first of the month, to every row in
// `subscribers` with status 'active', i.e. everyone who signed up on the
// waitlist). This file is the *index* of those letters: one entry per edition,
// so a reader can find an old letter without an email address.
//
// Add a new entry to the top when an edition ships. Nothing here may describe
// content that is not actually in the letter (MANIFESTO §1 — no invented
// claims, no promises we cannot keep).

export type Letter = {
  /** URL segment: /letters/<slug> */
  slug: string
  /** Edition number, rendered zero-padded ("01"). */
  number: number
  /** The calendar month this edition was written for, lowercase. */
  month: string
  /** What this letter is. Describes real content only — never a teaser promise. */
  title: string
  /** One or two sentences on what is inside. Same honesty rule as the title. */
  teaser: string
  /**
   * Optional path to an image under /public. Left unset until a real image
   * exists — the archive simply omits the block rather than showing a
   * placeholder that looks like content.
   */
  heroImage?: string
}

export const LETTERS: Letter[] = [
  {
    slug: '01',
    number: 1,
    month: 'august 2026',
    title: 'one essay, one song, one invitation.',
    // The journal essay is resolved from lib/journal.ts via articleForMonth(),
    // which rotates by calendar month — so the essay is deliberately NOT named
    // here. Hardcoding its title would go stale the moment the rotation moves
    // on. The song is fixed for this edition, so it can be named.
    teaser:
      'the first letter: the journal essay of the month, “dudenkstsoschön” by AARON as the song of the edition, and the call to join the beta.',
    // heroImage: no image exists for this edition yet — see the type comment.
  },
]

export function letterBySlug(slug: string): Letter | undefined {
  return LETTERS.find(letter => letter.slug === slug)
}
