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
  /** Free-text date string the user entered (e.g. "this Saturday, 28 June"). Description only. */
  dateText?: string;
  /** PeakPlant deep link for the idea — safe to include in a calendar description. */
  link?: string;
}

/** Build a standards-compliant ICS text block for a PeakPlant date plan. */
export function buildICS(plan: CalendarPlan, now: Date = new Date()): string {
  const uid = `peakplant-${now.getTime()}@peak-plant.com`;
  const stamp = formatICSDateTime(now);
  const summary = escapeICS(plan.title);
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
    `DTSTART;VALUE=DATE:${formatICSDateOnly(now)}`,
    `DTEND;VALUE=DATE:${formatICSDateOnly(new Date(now.getTime() + 86_400_000))}`,
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
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
