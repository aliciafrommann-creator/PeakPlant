import type { NotificationCategory, NotificationPayload, NotificationPreferences } from './types';

/**
 * Wann PeakPlant überhaupt etwas schicken darf.
 *
 * Diese Datei ist die Bremse, nicht der Motor. Sie entscheidet über jede
 * einzelne Nachricht und kennt kein "senden wir mal" — das ist Absicht:
 * Push ist der erste serverseitig ausgelöste Fluss dieser App, und er trifft
 * Menschen in ihrer sensibelsten Phase (MANIFESTO §3: einladen, nie drängen).
 *
 * Die drei Regeln, in dieser Reihenfolge:
 *  1. Abgemeldet ist abgemeldet — pro Kategorie, ohne Rückfrage.
 *  2. Höchstens EINE Nachricht pro Tag und Space. Nicht pro Kategorie: ein
 *     Paar, das an einem Abend drei Momente bewahrt, bekommt trotzdem eine.
 *  3. Nachts nichts. Zwischen 22 und 8 Uhr wird nicht zugestellt, sondern auf
 *     den Morgen verschoben — ein Telefon, das um drei Uhr wegen einer
 *     Beziehungs-App leuchtet, ist genau das Gegenteil von Präsenz.
 *
 * Reine Logik, keine React-Native-Importe: damit sie unter Vitest läuft und
 * die Regeln überprüfbar sind statt behauptet.
 */

/** Höchstens so viele Zustellungen pro Space und Kalendertag. */
export const MAX_PER_DAY_PER_SPACE = 1;

/** Nachtruhe (lokale Stunden). Von 22:00 bis 08:00 wird verschoben. */
export const QUIET_HOURS = { from: 22, to: 8 } as const;

/** Was bereits an einen Space zugestellt wurde. */
export type SendRecord = { category: NotificationCategory; at: string };

export type Decision =
  | { deliver: true }
  | { deliver: false; reason: 'opted_out' }
  | { deliver: false; reason: 'daily_cap' }
  | { deliver: false; reason: 'quiet_hours'; deferUntil: string };

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inQuietHours(now: Date): boolean {
  const h = now.getHours();
  // Fenster über Mitternacht: 22, 23, 0 … 7
  return h >= QUIET_HOURS.from || h < QUIET_HOURS.to;
}

/** Der nächste Zeitpunkt nach der Nachtruhe (heute oder morgen um 8:00). */
function nextMorning(now: Date): Date {
  const d = new Date(now);
  if (now.getHours() >= QUIET_HOURS.from) d.setDate(d.getDate() + 1);
  d.setHours(QUIET_HOURS.to, 0, 0, 0);
  return d;
}

/**
 * Darf diese Nachricht raus? Der Aufrufer übergibt, was heute schon an diesen
 * Space ging — die Entscheidung selbst hat keinen Zustand und keine Uhr.
 */
export function decideDelivery(input: {
  payload: NotificationPayload;
  prefs: NotificationPreferences;
  /** Bereits zugestellt an DIESEN Space (beliebig lang; nur Heute zählt). */
  history: SendRecord[];
  now: Date;
}): Decision {
  const { payload, prefs, history, now } = input;

  if (!prefs[payload.category]) return { deliver: false, reason: 'opted_out' };

  const today = history.filter(r => {
    const at = new Date(r.at);
    return !Number.isNaN(at.getTime()) && sameLocalDay(at, now);
  });
  if (today.length >= MAX_PER_DAY_PER_SPACE) return { deliver: false, reason: 'daily_cap' };

  if (inQuietHours(now)) {
    return { deliver: false, reason: 'quiet_hours', deferUntil: nextMorning(now).toISOString() };
  }

  return { deliver: true };
}

/**
 * Die Texte. Bewusst hier und nicht an der Absendestelle: so ist an einem Ort
 * überprüfbar, dass NIE Inhalt eines Moments in den Sperrbildschirm gerät
 * (PP-031). Die Funktionen nehmen deshalb gar keinen Notiz- oder Kartentext
 * entgegen — was man nicht hereinreicht, kann nicht hinausrutschen.
 */
export function composePartnerMomentPush(isDE: boolean): NotificationPayload {
  return {
    category: 'partner_activity',
    title: 'PeakPlant',
    // „eurem" ist hier bewusst geblieben: Diese Nachricht geht ausschließlich
    // an die ANDEREN Mitglieder eines Space (siehe `decideDelivery`), es gibt
    // also per Definition mindestens zwei. In einem Solo-Space entsteht sie
    // nie. anrede-ok.
    body: isDE
      ? 'In eurem Space liegt ein neuer Moment.'
      : 'A new moment is waiting in your space.',
  };
}

/**
 * „Dein Mensch ist beigetreten." Der Anlass, an dem der Kern-Loop bisher
 * abriss: wer einen Space anlegt und einlädt, erfuhr vom Beitritt nur, wenn
 * er zufällig die App öffnete. Vier Spaces in der Produktionsdatenbank haben
 * nie ein zweites Mitglied bekommen — dieser Moment verdient eine Nachricht.
 */
export function composePartnerJoinedPush(isDE: boolean): NotificationPayload {
  return {
    category: 'partner_activity',
    title: 'PeakPlant',
    // anrede-ok: „Partner beigetreten" setzt zwei Menschen voraus — der Satz
    // beschreibt genau den Moment, in dem der Space keiner für eine Person
    // mehr ist.
    body: isDE
      ? 'Ihr seid jetzt zu zweit in eurem Space.'
      : 'You are two in your space now.',
  };
}
