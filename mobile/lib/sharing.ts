/**
 * Freigaben — was ein Moment mitnimmt, wenn ein Mensch ihn teilt. Rein und
 * testbar (kein React, kein Netz).
 *
 * Das Modell dahinter steht in `supabase/migrations/0022_*.sql` und `0023_*`:
 * Ein Moment wird NIE geteilt. Geteilt wird eine eigene, widerrufliche Zeile,
 * die auf ihn zeigt. Diese Datei ist die App-Seite derselben Grenze.
 *
 * DIE FALLE, um die es hier geht:
 *
 * Die bequemste Umsetzung wäre, den Titel der Freigabe aus der Notiz des
 * Moments vorzubefüllen — „ist ja schon da". Genau damit überquert die Notiz
 * die Grenze, und zwar unbemerkt, weil niemand sie eingetippt hat. Der ganze
 * Aufwand mit zwei Tabellen und einer Spaltenliste wäre umsonst.
 *
 * Deshalb: `titleFor()` nimmt NIE die Notiz. Ein Titel kommt entweder von der
 * Karte, vom Thema (der Wochen-Challenge), oder der Mensch schreibt ihn. Ein
 * Test hält das fest — er ist der eigentliche Grund, warum es diese Datei gibt.
 */

/** Höchstlänge, gleich der Prüfung in der Datenbank (Migration 0022). */
export const SHARE_TITLE_MAX = 120;

export interface ShareDraft {
  /** Der Moment, auf den die Freigabe zeigt. */
  memoryId: string;
  /** Das Publikum — ein Ort oder ein Thema, nie ein Mensch. */
  audienceId: string;
  /** Was sichtbar wird. Vom Menschen bestätigt, nie automatisch aus der Notiz. */
  title: string;
  /** Optional; der Pfad im Foto-Speicher, nicht das Foto selbst. */
  photoPath?: string;
}

/** Woher ein Titelvorschlag kommen darf. Bewusst OHNE die Notiz. */
export interface TitleSources {
  /** Der Kartentitel, wenn der Moment von einer Karte kam. */
  cardTitle?: string;
  /** Der Titel des Themas, z. B. die Wochen-Challenge. */
  themeTitle?: string;
}

/**
 * Ein Vorschlag für den Titel — oder `''`, wenn es keinen gibt.
 *
 * `''` ist Absicht: dann schreibt der Mensch selbst, statt dass wir aus seinen
 * privaten Worten einen öffentlichen Satz basteln. Ein leeres Feld ist
 * ehrlicher als ein vorbefülltes, das man übersieht.
 */
export function titleFor(sources: TitleSources): string {
  const vorschlag = sources.cardTitle?.trim() || sources.themeTitle?.trim() || '';
  return vorschlag.slice(0, SHARE_TITLE_MAX);
}

export type ShareRefusal =
  | 'empty_title'
  | 'title_too_long'
  | 'missing_memory'
  | 'missing_audience';

export type ShareCheck = { ok: true; draft: ShareDraft } | { ok: false; reason: ShareRefusal };

/**
 * Prüft einen Entwurf, bevor er die App verlässt.
 *
 * Bewusst streng und bewusst hier: Die Datenbank prüft dasselbe noch einmal
 * (CHECK auf `title`), aber ein Mensch soll die Ablehnung vor dem Absenden
 * lesen, nicht danach als Fehlermeldung.
 */
export function checkShare(draft: ShareDraft): ShareCheck {
  if (!draft.memoryId) return { ok: false, reason: 'missing_memory' };
  if (!draft.audienceId) return { ok: false, reason: 'missing_audience' };

  const title = draft.title.trim().replace(/\s+/g, ' ');
  if (title.length === 0) return { ok: false, reason: 'empty_title' };
  if (title.length > SHARE_TITLE_MAX) return { ok: false, reason: 'title_too_long' };

  // Nur die vier Felder — was hier nicht auftaucht, kann nicht mitfahren, auch
  // wenn der Aufrufer es im Entwurf mitgibt.
  return {
    ok: true,
    draft: {
      memoryId: draft.memoryId,
      audienceId: draft.audienceId,
      title,
      photoPath: draft.photoPath,
    },
  };
}

/** Der Anker eines Themen-Publikums für eine Wochen-Challenge. */
export function challengeAnchor(challengeId: string): string {
  return `challenge:${challengeId}`;
}
