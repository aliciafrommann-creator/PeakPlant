/**
 * Calendar ICS builder for PeakPlant date plans.
 *
 * Pure functions — no react-native imports. Sharing is handled in calendarShare.ts.
 *
 * Privacy contract: the ICS SUMMARY carries the idea title only. Planning notes
 * are never included — they are private logistics, not calendar metadata.
 */

export interface CalendarPlan {
  title: string;
  /** Planned date. ISO (YYYY-MM-DD) is preferred; common EN/DE shortcuts are accepted. */
  dateText?: string;
  /** PeakPlant deep link for the idea — safe to include in a calendar description. */
  link?: string;
}

/** Build a standards-compliant ICS text block for a PeakPlant date plan. */
export function buildICS(plan: CalendarPlan, now: Date = new Date()): string {
  const uid = `peakplant-${now.getTime()}@peak-plant.com`;
  const stamp = formatICSDateTime(now);
  const summary = escapeICS(plan.title);
  const parsedStart = parsePlanDate(plan.dateText, now);
  if (plan.dateText && !parsedStart) {
    throw new Error('Unrecognised plan date');
  }
  const start = parsedStart ?? now;
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const descParts: string[] = [];
  if (plan.dateText) descParts.push(plan.dateText);
  if (plan.link) descParts.push(plan.link);
  const description = escapeICS(descParts.join('\\n'));

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PeakPlant//PeakPlant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    // Full-day event so we never assume a wrong time; user adjusts in calendar.
    `DTSTART;VALUE=DATE:${formatICSDateOnly(start)}`,
    `DTEND;VALUE=DATE:${formatICSDateOnly(end)}`,
    `SUMMARY:${summary}`,
  ];
  if (description) lines.push(`DESCRIPTION:${description}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICSDateTime(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatICSDateOnly(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('');
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

export function formatPlanDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Parse the deliberately small set of formats offered by the planner.
 * Returning null lets the screen ask for a clearer date instead of exporting
 * a calendar entry for the wrong day.
 */
export function parsePlanDate(value?: string, now: Date = new Date()): Date | null {
  const raw = value?.trim();
  if (!raw) return null;
  const normalized = raw.toLocaleLowerCase('de-DE');

  const iso = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return validLocalDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const european = normalized.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (european) {
    return validLocalDate(Number(european[3]), Number(european[2]), Number(european[1]));
  }

  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (normalized === 'today' || normalized === 'heute') return base;
  if (normalized === 'tomorrow' || normalized === 'morgen') {
    base.setDate(base.getDate() + 1);
    return base;
  }

  const weekday = weekdayIndex(normalized);
  if (weekday !== null) {
    let daysAhead = (weekday - base.getDay() + 7) % 7;
    const explicitlyNext = /\b(next|nächste|nächsten|naechste|naechsten)\b/.test(normalized);
    if (explicitlyNext && daysAhead === 0) daysAhead = 7;
    base.setDate(base.getDate() + daysAhead);
    return base;
  }

  return null;
}

function validLocalDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    ? date
    : null;
}

function weekdayIndex(value: string): number | null {
  const weekdays: [number, string[]][] = [
    [0, ['sunday', 'sonntag']],
    [1, ['monday', 'montag']],
    [2, ['tuesday', 'dienstag']],
    [3, ['wednesday', 'mittwoch']],
    [4, ['thursday', 'donnerstag']],
    [5, ['friday', 'freitag']],
    [6, ['saturday', 'samstag']],
  ];
  for (const [index, names] of weekdays) {
    if (names.some((name) => value.includes(name))) return index;
  }
  return null;
}
