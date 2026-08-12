/**
 * Story insights — the "memory intelligence" layer of OUR STORY.
 *
 * Pure functions over the couple's OWN data. Every line is derived from real
 * moments/dates, never invented, and phrased as an observation — never as a
 * score, never as advice (MANIFESTO §1 + §3). Nothing leaves the device here.
 */

export interface StoryMemory {
  createdAt: string;
  photoUri?: string;
  note: string;
}

export interface StoryDate {
  status: string;
  placeName?: string;
  completedAt?: string;
}

export interface StoryInsight {
  /** Short observation, already sentence-shaped. */
  en: string;
  de: string;
}

/** Days since the first kept moment (inclusive), or 0 when there are none. */
export function daysCollecting(memories: StoryMemory[], now: Date = new Date()): number {
  if (memories.length === 0) return 0;
  const first = memories
    .map((m) => new Date(m.createdAt).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b)[0];
  if (first === undefined) return 0;
  return Math.max(1, Math.floor((now.getTime() - first) / 86_400_000) + 1);
}

/** The month with the most kept moments — ties go to the most recent. */
export function busiestMonth(
  memories: StoryMemory[],
): { month: number; year: number; count: number } | null {
  const counts = new Map<string, { month: number; year: number; count: number }>();
  for (const m of memories) {
    const d = new Date(m.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = counts.get(key) ?? { month: d.getMonth(), year: d.getFullYear(), count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  if (counts.size === 0) return null;
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || b.year - a.year || b.month - a.month,
  )[0];
}

/** A place visited more than once — the one you keep returning to. */
export function mostReturnedPlace(dates: StoryDate[]): { name: string; times: number } | null {
  const counts = new Map<string, number>();
  for (const d of dates) {
    if (d.status !== 'completed' || !d.placeName) continue;
    counts.set(d.placeName, (counts.get(d.placeName) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 2) return null;
  return { name: top[0], times: top[1] };
}

const MONTHS_EN = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];
const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/**
 * Build the observations for OUR STORY. Returns only what the data actually
 * supports — an empty array is a valid, honest answer.
 */
export function buildStoryInsights(
  memories: StoryMemory[],
  dates: StoryDate[],
  now: Date = new Date(),
): StoryInsight[] {
  const out: StoryInsight[] = [];
  if (memories.length === 0) return out;

  const days = daysCollecting(memories, now);
  if (days >= 7) {
    out.push({
      en: `you have been collecting moments together for ${days} days.`,
      de: `ihr sammelt seit ${days} Tagen gemeinsame Momente.`,
    });
  }

  // Only call out a favourite month once it clearly stands out.
  const busiest = busiestMonth(memories);
  if (busiest && busiest.count >= 3) {
    out.push({
      en: `${MONTHS_EN[busiest.month]} holds the most of them — ${busiest.count}.`,
      de: `im ${MONTHS_DE[busiest.month]} waren es die meisten — ${busiest.count}.`,
    });
  }

  const withPhoto = memories.filter((m) => !!m.photoUri).length;
  if (withPhoto >= 3) {
    out.push({
      en: `${withPhoto} of them you wanted to see again — you kept a photo.`,
      de: `bei ${withPhoto} davon wolltet ihr es wiedersehen — ihr habt ein Foto behalten.`,
    });
  }

  const place = mostReturnedPlace(dates);
  if (place) {
    out.push({
      en: `you keep coming back to ${place.name} — ${place.times} times so far.`,
      de: `zu ${place.name} kommt ihr immer wieder zurück — bisher ${place.times} Mal.`,
    });
  }

  return out;
}
