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
  // Include planned date text in SUMMARY so it's visible in any calendar app.
  const summaryTitle = plan.dateText ? `${plan.title} (${plan.dateText})` : plan.title;
  const summary = escapeICS(summaryTitle);
  // Use parsed date for DTSTART if possible; otherwise today (user adjusts in calendar).
  const startDate = plan.dateText ? (tryParseDateText(plan.dateText) ?? now) : now;
  const endDate = new Date(startDate.getTime() + 86_400_000);
  const descParts: string[] = [];
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
    `DTSTART;VALUE=DATE:${formatICSDateOnly(startDate)}`,
    `DTEND;VALUE=DATE:${formatICSDateOnly(endDate)}`,
    `SUMMARY:${summary}`,
  ];
  if (description) lines.push(`DESCRIPTION:${description}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

/** Best-effort parse of a free-text planned date (e.g. "this Saturday, 28 June"). */
function tryParseDateText(text: string): Date | null {
  const trimmed = text.trim();
  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;

  const lower = trimmed.toLowerCase();
  const monthsEn = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const monthsDe = ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'];
  let month = -1;
  for (let i = 0; i < monthsEn.length; i++) {
    if (lower.includes(monthsEn[i]) || lower.includes(monthsDe[i])) { month = i; break; }
  }
  if (month < 0) return null;
  const dayMatch = lower.match(/\b(\d{1,2})\b/);
  if (!dayMatch) return null;
  const day = parseInt(dayMatch[1], 10);
  const year = new Date().getFullYear();
  const d = new Date(year, month, day);
  return !isNaN(d.getTime()) && d.getDate() === day ? d : null;
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
