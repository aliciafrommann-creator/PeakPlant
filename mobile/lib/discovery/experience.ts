/**
 * The PeakPlant experience layer.
 *
 * Strategy §"Experience Data Layer" asks for relationship-aware dimensions
 * (good for conversation, quiet vs lively, spontaneous, first-date, reconnecting,
 * active vs relaxing, best time...) kept SEPARATE from raw factual data.
 *
 * We derive these honestly from a moment's already-curated structured fields
 * (category, energy, setting, duration, time-of-day) using deterministic rules —
 * we do NOT invent new facts. Because each tag is an interpretation of curated
 * data, it carries the `estimated` provenance, never `verified-live`. Pure (no
 * I/O) so the rules are unit-tested and reusable by the recommender and the UI.
 *
 * Layer separation (kept distinct elsewhere in the codebase):
 *   - factual          → TogetherMoment / LocalPlace fields (curated/live)
 *   - experience       → THIS module (estimated, derived from factual)
 *   - community        → date_feedback (post-beta)
 *   - AI interpretation→ ai/ layer, always labelled 'ai-interpretation'
 *   - preferences      → store + discovery/learning.ts
 */

import type { Provenance, TogetherMoment } from '../together';

export type ExperienceKey =
  | 'conversation'
  | 'quiet'
  | 'lively'
  | 'spontaneous'
  | 'firstDate'
  | 'reconnecting'
  | 'active'
  | 'relaxing';

export interface ExperienceTag {
  key: ExperienceKey;
  /** Bilingual human label, [en, de]. */
  label: [string, string];
  /** Always 'estimated' — derived from curated facts, not independently verified. */
  provenance: Provenance;
}

const TAG_LABELS: Record<ExperienceKey, [string, string]> = {
  conversation: ['good for talking', 'gut zum Reden'],
  quiet: ['quiet', 'ruhig'],
  lively: ['lively', 'lebhaft'],
  spontaneous: ['easy to do on a whim', 'spontan machbar'],
  firstDate: ['gentle for a first date', 'sanft fur ein erstes Date'],
  reconnecting: ['good for reconnecting', 'gut zum Wiederannahern'],
  active: ['active', 'aktiv'],
  relaxing: ['relaxing', 'entspannend'],
};

function tag(key: ExperienceKey): ExperienceTag {
  return { key, label: TAG_LABELS[key], provenance: 'estimated' };
}

/** Structured boolean view of a moment's experience dimensions. */
export interface ExperienceProfile {
  conversation: boolean;
  /** 'quiet' | 'lively' | null when neither dominates. */
  pace: 'quiet' | 'lively' | null;
  spontaneous: boolean;
  firstDate: boolean;
  reconnecting: boolean;
  /** 'active' | 'relaxing' | null. */
  effort: 'active' | 'relaxing' | null;
}

/** Derive the boolean experience profile from curated fields. */
export function experienceProfile(m: TogetherMoment): ExperienceProfile {
  const conversation = m.energy === 'low' || m.category === 'calm' || m.category === 'food';
  const pace = m.energy === 'low' ? 'quiet' : m.energy === 'high' ? 'lively' : null;
  // Short, low-commitment, low-cost → easy to do spontaneously.
  const spontaneous = m.avgDurationMin <= 90 && (m.priceBand === 'free' || m.priceBand === '€');
  // Gentle, not too long, not a big spend → kind for a first date.
  const firstDate = m.energy !== 'high' && m.avgDurationMin <= 120 && m.priceBand !== '€€€';
  const reconnecting = m.category === 'calm' || m.category === 'food';
  const effort = m.energy === 'high' ? 'active' : m.energy === 'low' ? 'relaxing' : null;
  return { conversation, pace, spontaneous, firstDate, reconnecting, effort };
}

/**
 * The ordered, human experience tags for a moment — what the UI shows as "what
 * this is like". Stable order; only the dimensions that apply are included.
 */
export function experienceTags(m: TogetherMoment): ExperienceTag[] {
  const p = experienceProfile(m);
  const tags: ExperienceTag[] = [];
  if (p.conversation) tags.push(tag('conversation'));
  if (p.pace === 'quiet') tags.push(tag('quiet'));
  if (p.pace === 'lively') tags.push(tag('lively'));
  if (p.effort === 'active') tags.push(tag('active'));
  if (p.effort === 'relaxing') tags.push(tag('relaxing'));
  if (p.spontaneous) tags.push(tag('spontaneous'));
  if (p.firstDate) tags.push(tag('firstDate'));
  if (p.reconnecting) tags.push(tag('reconnecting'));
  return tags;
}
