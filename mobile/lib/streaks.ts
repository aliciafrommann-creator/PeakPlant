/**
 * Gesammelte Wochen — rein und testbar (kein React, kein Speicher).
 *
 * ENTSCHEIDUNG (Alicia, 17.08.2026): Das war eine Serie im Strava-Sinn —
 * aufeinanderfolgende Wochen, mit einem `atRisk`-Zustand, der warnte, wenn die
 * laufende Woche noch leer war. Damit war es etwas, das man VERLIEREN kann,
 * und genau das verbietet MANIFESTO §3 („Keine Streaks als Druck").
 *
 * Jetzt zählt es, was da ist: die Anzahl verschiedener Wochen, in denen dieser
 * Space je einen Moment festgehalten hat. Die Zahl kann nur steigen. Eine
 * ausgelassene Woche kostet nichts — sie wird bloß nicht mitgezählt.
 *
 * Alicias eigene Formel dafür: freischalten ja, verlieren nein.
 *
 * Kein Feld heißt mehr `streak`. Wer es später wieder auf Serien umbaut, muss
 * diesen Kommentar bewusst löschen — und das ist der Punkt.
 */

export interface SharedWeeksResult {
  /** Wie viele verschiedene Wochen mindestens einen Moment tragen. */
  count: number;
  /** Ob überhaupt etwas gesammelt wurde. */
  active: boolean;
  /** Ob in der laufenden Woche schon ein Moment liegt — reine Tatsache, keine Warnung. */
  thisWeek: boolean;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Montag 00:00 (lokal) der Woche, die `date` enthält, als YYYY-MM-DD. */
export function weekKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sonntag … 6 = Samstag
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return localDateKey(d);
}

export function computeSharedWeeks(isoDates: string[], now: Date = new Date()): SharedWeeksResult {
  if (isoDates.length === 0) return { count: 0, active: false, thisWeek: false };

  const weeks = new Set(isoDates.map((iso) => weekKey(new Date(iso))));

  return {
    count: weeks.size,
    active: weeks.size > 0,
    thisWeek: weeks.has(weekKey(now)),
  };
}
