/**
 * Parse the payload encoded in a moment card's QR code into a card id.
 *
 * Physical cards carry a route (PP-015), not personal data. We accept a few
 * shapes so printing/encoding can evolve without breaking the scanner:
 *   - peakplant://card/card-04
 *   - https://peak-plant.com/c/card-04     (production form; any host works)
 *   - card-04                              (bare id)
 *
 * Returns the normalized card id (e.g. "card-04") or null if the payload
 * isn't a recognizable card reference. Pure — no I/O — so it's unit-tested.
 */
const CARD_ID = /^card-\d{1,4}$/;

export function parseCardQr(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;

  // Bare id.
  if (CARD_ID.test(text)) return text;

  // Anything URL-ish: take the last non-empty path segment, ignore query/hash.
  const withoutQuery = text.split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (last && CARD_ID.test(last)) return last;

  return null;
}
