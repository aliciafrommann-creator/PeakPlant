/**
 * Weekly streak computation — pure and testable (no React, no storage).
 *
 * A "real" streak (Strava-style): consecutive weeks in which the space preserved
 * at least one moment. The current week being empty does not immediately break
 * the streak — it puts it `atRisk` until the week ends (one week of grace).
 */

export interface StreakResult {
  /** Number of consecutive active weeks (including the current/last active one). */
  count: number;
  /** True when there is a live streak but the current week has no moment yet. */
  atRisk: boolean;
  active: boolean;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Monday 00:00 (local) of the week containing `date`, as a YYYY-MM-DD key. */
export function weekKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sunday … 6 = Saturday
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return localDateKey(d);
}

function addWeeks(key: string, weeks: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + weeks * 7);
  return weekKey(d);
}

export function computeWeeklyStreak(isoDates: string[], now: Date = new Date()): StreakResult {
  if (isoDates.length === 0) return { count: 0, atRisk: false, active: false };

  const weeks = new Set(isoDates.map((iso) => weekKey(new Date(iso))));
  const currentWeek = weekKey(now);

  let cursor = currentWeek;
  let atRisk = false;

  if (!weeks.has(currentWeek)) {
    const previousWeek = addWeeks(currentWeek, -1);
    if (weeks.has(previousWeek)) {
      atRisk = true;
      cursor = previousWeek;
    } else {
      return { count: 0, atRisk: false, active: false };
    }
  }

  let count = 0;
  while (weeks.has(cursor)) {
    count += 1;
    cursor = addWeeks(cursor, -1);
  }

  return { count, atRisk, active: count > 0 };
}
