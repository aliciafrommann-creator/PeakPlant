/**
 * Why a join failed — in the app's own words.
 *
 * Migration 0018 gave `redeem_invite` two new refusals (a couple space is
 * full; too many attempts in an hour). The screen answered all of them with
 * "that code didn't work. check it with your partner" — which sends someone
 * to re-read a code that is perfectly correct. A wrong explanation is a small
 * lie, and it costs the person their evening (MANIFESTO §1).
 *
 * Pure string matching on the server's exception messages, kept here so it is
 * unit-testable and so a new server message has one obvious place to land.
 */

export type JoinFailure =
  | 'invalid_code'
  | 'space_full'
  | 'space_solo'
  | 'too_many_attempts'
  | 'not_authenticated'
  | 'unknown';

export function classifyJoinError(err: unknown): JoinFailure {
  const message = extractMessage(err).toLowerCase();
  if (message.includes('space is full')) return 'space_full';
  // Migration 0024: In einen Solo-Space kommt niemand hinein. Ohne eigenen
  // Fall landete das unter „unbekannt" — und der Mensch mit dem Code suchte
  // den Fehler bei sich, obwohl der Code stimmt.
  if (message.includes('space is solo')) return 'space_solo';
  if (message.includes('too many attempts')) return 'too_many_attempts';
  if (message.includes('invalid invite code')) return 'invalid_code';
  if (message.includes('not authenticated')) return 'not_authenticated';
  return 'unknown';
}

function extractMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const anyErr = err as { message?: unknown; error_description?: unknown; details?: unknown };
    return [anyErr.message, anyErr.error_description, anyErr.details]
      .filter((v): v is string => typeof v === 'string')
      .join(' ');
  }
  return '';
}
