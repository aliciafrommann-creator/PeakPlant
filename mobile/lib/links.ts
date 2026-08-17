/**
 * Stable, shareable links into PeakPlant.
 *
 * These are the public, HTTPS "universal link" forms. They double as deep links
 * (the same paths the in-app router and QR scanner understand) and as graceful
 * web fallbacks for someone without the app installed. Pure (no I/O) so they're
 * unit-tested and safe to use anywhere.
 *
 * Privacy contract (PP-004 / PRIVACY): a link identifies a *catalog* item — a
 * card or a curated idea — by its stable id. It never carries space ids, member
 * ids, diary content, plan notes, tokens, or any private relationship data.
 */

/** Public web origin. Card/idea paths resolve here and open the app if present. */
export const APP_BASE_URL = 'https://peak-plant.com';

/**
 * Where a partner who does NOT have the app yet is sent.
 *
 * The invite message used to say "open the app and enter the code" — to
 * someone who has no app and no way to get one from that message. Four spaces
 * were created in production and not one of them ever got a second member;
 * this dead end is the most likely reason.
 *
 * `/beta` is the honest destination while the app is in closed beta: it is a
 * real page that explains the state and takes a request. When the app is in
 * the stores, this constant becomes the store link — one place to change.
 */
export const GET_THE_APP_URL = `${APP_BASE_URL}/beta?invited=1`;

/** Link to a physical card's prompt. Matches the QR `/c/<id>` form (qr.ts). */
export function cardLink(cardId: string): string {
  return `${APP_BASE_URL}/c/${encodeURIComponent(cardId)}`;
}

/** Link to a curated "together" idea (opens /together/<id> in-app). */
export function ideaLink(momentId: string): string {
  return `${APP_BASE_URL}/i/${encodeURIComponent(momentId)}`;
}

/** Link to a live/provider place (opens the Places surface in-app when supported). */
export function placeLink(placeId: string): string {
  return `${APP_BASE_URL}/places/${encodeURIComponent(placeId)}`;
}
