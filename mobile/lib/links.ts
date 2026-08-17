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
 * Wo jemand landet, der die App noch NICHT hat.
 *
 * Seit die Einladung über `inviteLink()` läuft, ist das nicht mehr der Weg in
 * der Einladungsnachricht — die Landeseite `/j/<code>` fängt diesen Fall
 * selbst ab und BEHÄLT dabei den Code. Diese Konstante bleibt als die eine
 * Stelle, an der „wo bekommt man die App" steht: Sobald die App in den Stores
 * ist, wird hier der Store-Link eingetragen, und alle Wege dorthin stimmen
 * wieder.
 */
export const GET_THE_APP_URL = `${APP_BASE_URL}/beta?invited=1`;

/**
 * Link to join a space — the one link an invited person needs.
 *
 * Vorher trug die Einladung nur den Code `PEAK-XXXXXX`. Die eingeladene Person
 * musste ihn aus einer Chat-Nachricht abtippen, korrekt, in ein Feld, das sie
 * erst finden musste — neun Bildschirme hinter der Anmeldung. Ein Code ist
 * etwas zum Vorlesen; ein Link ist etwas zum Antippen.
 *
 * ACHTUNG ZUR PRIVATSPHÄRE: Ein Einladungscode ist ein Schlüssel, kein
 * Katalog-Eintrag — anders als Karten- und Ideen-Links (siehe oben). Er gehört
 * deshalb NICHT in öffentliche Beiträge, Seitentitel oder Analytics. Er wandert
 * genau einen Weg: von der einladenden Person direkt zu dem einen Menschen,
 * den sie meint. Der Code trägt keinen Space-Namen, keine Mitglieder und
 * nichts aus dem Tagebuch; er lässt eine Person in EINEN Space, und die
 * Paar-Obergrenze von zwei plus Code-Rotation steht serverseitig
 * (Migration 0018).
 */
export function inviteLink(code: string): string {
  return `${APP_BASE_URL}/j/${encodeURIComponent(code.trim().toUpperCase())}`;
}

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
