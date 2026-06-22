/**
 * QR parsing and resolution for physical PeakPlant cards.
 *
 * Everything here is pure (no I/O) so it can be exhaustively unit-tested. The
 * scanner screen owns the side effects (camera, storage, navigation) and calls
 * into these helpers. The exact wire format the printing company must encode is
 * documented in docs/QR_FORMAT.md — keep the two in sync.
 *
 * Two payload families are recognized:
 *
 *  1. Card references — everyday prompt cards. Reusable, scan as often as you
 *     like. Encoded as a route, never personal data:
 *       - peakplant://card/card-04
 *       - https://peak-plant.com/c/card-04   (any host works)
 *       - card-04                            (bare id)
 *
 *  2. Activation tokens — rare / collectible "unlock" cards. Single-use and
 *     time-boxed. Self-describing so they verify offline during the beta
 *     (a server-signed format is a documented post-beta hardening step):
 *       PP1.<cardId>.<expiryYYYYMMDD>.<nonce>
 *     wrapped, optionally, in a route:
 *       - peakplant://t/PP1.card-12.20271231.a3f9c2
 *       - https://peak-plant.com/t/PP1.card-12.20271231.a3f9c2
 */

const CARD_ID = /^card-\d{1,4}$/;
const TOKEN_VERSION = 'PP1';
const EXPIRY = /^\d{8}$/; // YYYYMMDD
const NONCE = /^[a-z0-9]{4,32}$/i;

/**
 * Parse a card reference payload into a normalized card id (e.g. "card-04"),
 * or null if it isn't a recognizable card reference. This is the everyday,
 * reusable path. Kept stable for existing callers.
 */
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

/** A decoded single-use activation token (structure only — not yet verified). */
export interface ActivationToken {
  /** The exact token string, used as the redemption key. */
  raw: string;
  version: string;
  cardId: string;
  /** Expiry as YYYYMMDD (date-only; expires at end of that day, UTC). */
  expiry: string;
  nonce: string;
}

/**
 * Pull the token body out of a payload that may be bare or wrapped in a route,
 * then parse it. Returns null if it isn't a well-formed activation token.
 */
export function parseActivationToken(raw: string | null | undefined): ActivationToken | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;

  // Unwrap a route if present; tokens live in the last path segment.
  const withoutQuery = text.split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  const body = segments.length > 0 ? segments[segments.length - 1] : text;

  const parts = body.split('.');
  if (parts.length !== 4) return null;
  const [version, cardId, expiry, nonce] = parts;
  if (version !== TOKEN_VERSION) return null;
  if (!CARD_ID.test(cardId)) return null;
  if (!EXPIRY.test(expiry)) return null;
  if (!NONCE.test(nonce)) return null;

  return { raw: body, version, cardId, expiry, nonce };
}

/** What kind of payload a scan turned out to be. */
export type ScanResult =
  | { kind: 'card'; cardId: string }
  | { kind: 'token'; token: ActivationToken }
  | { kind: 'invalid' };

/**
 * Classify a raw scan payload. Card references win over token parsing only when
 * they actually match the card grammar, so the two never collide.
 */
export function parseScan(raw: string | null | undefined): ScanResult {
  const cardId = parseCardQr(raw);
  if (cardId) return { kind: 'card', cardId };
  const token = parseActivationToken(raw);
  if (token) return { kind: 'token', token };
  return { kind: 'invalid' };
}

/** Inputs the (otherwise pure) resolver needs from the outside world. */
export interface ResolveContext {
  /** Does this card exist in a released edition? */
  cardExists: (cardId: string) => boolean;
  /** Current time. Injected so expiry is deterministic in tests. */
  now?: Date;
  /** Tokens already redeemed on this device/account (by token.raw). */
  usedTokens?: ReadonlySet<string>;
}

/** The outcome the UI maps to a destination or a clear, honest message. */
export type ResolveOutcome =
  | { status: 'ok'; cardId: string; token?: string }
  | { status: 'unknown_card'; cardId: string }
  | { status: 'malformed' }
  | { status: 'expired' }
  | { status: 'used' };

function isExpired(expiry: string, now: Date): boolean {
  // Expiry is date-only and inclusive: valid through 23:59:59 UTC of that day.
  const y = Number(expiry.slice(0, 4));
  const m = Number(expiry.slice(4, 6));
  const d = Number(expiry.slice(6, 8));
  const endOfDay = Date.UTC(y, m - 1, d, 23, 59, 59, 999);
  return now.getTime() > endOfDay;
}

/**
 * Resolve a raw scan into a concrete outcome. Pure: every external fact comes
 * in through ResolveContext, so the full decision tree (valid card, unknown
 * card, malformed, expired token, already-used token) is unit-testable.
 */
export function resolveScan(raw: string | null | undefined, ctx: ResolveContext): ResolveOutcome {
  const now = ctx.now ?? new Date();
  const result = parseScan(raw);

  if (result.kind === 'invalid') return { status: 'malformed' };

  if (result.kind === 'card') {
    return ctx.cardExists(result.cardId)
      ? { status: 'ok', cardId: result.cardId }
      : { status: 'unknown_card', cardId: result.cardId };
  }

  // Activation token: order matters — report the most specific problem first.
  const { token } = result;
  if (!ctx.cardExists(token.cardId)) return { status: 'unknown_card', cardId: token.cardId };
  if (isExpired(token.expiry, now)) return { status: 'expired' };
  if (ctx.usedTokens?.has(token.raw)) return { status: 'used' };
  return { status: 'ok', cardId: token.cardId, token: token.raw };
}
