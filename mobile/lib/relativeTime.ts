import type { Lang } from './types';

/**
 * Human, "living" date labels for the feed — "today", "yesterday", "3 days ago"
 * — so a couple's space reads as alive rather than a list of timestamps. Older
 * than a week falls back to a calm absolute date. Pure + injectable clock so it
 * is deterministic in tests.
 */

/** Whole calendar days between two dates (local midnight to local midnight). */
function dayDelta(then: Date, now: Date): number {
  const a = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Lower-case absolute date, e.g. "12 march 2026" / "12. märz 2026". */
export function formatAbsoluteDate(iso: string, lang: Lang, now: Date = new Date()): string {
  const d = new Date(iso);
  const loc = lang === 'de' ? 'de-DE' : 'en-US';
  // Drop the year when it's the current year — less noise in the common case.
  const sameYear = d.getFullYear() === now.getFullYear();
  return d
    .toLocaleDateString(loc, {
      day: 'numeric',
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    })
    .toLowerCase();
}

/**
 * Relative day label. 0 → today, 1 → yesterday, 2–6 → "N days ago", otherwise
 * an absolute date. Future dates (clock skew) read as "today".
 */
export function relativeDay(iso: string, lang: Lang, now: Date = new Date()): string {
  const delta = dayDelta(new Date(iso), now);
  if (delta <= 0) return lang === 'de' ? 'heute' : 'today';
  if (delta === 1) return lang === 'de' ? 'gestern' : 'yesterday';
  if (delta < 7) return lang === 'de' ? `vor ${delta} Tagen` : `${delta} days ago`;
  return formatAbsoluteDate(iso, lang, now);
}
