/**
 * AI safety: crisis routing + kill switches (deterministic, client-safe).
 *
 * This is the deterministic gate that runs BEFORE any AI / playful response.
 * It is intentionally pure and local — it must work offline and never depends
 * on the model being available. Mandated by AI_SAFETY.md (Crisis route +
 * Release governance kill switches) and DATE_DISCOVERY_STRATEGY §12.
 *
 * What it does NOT do (by design, per AI_SAFETY): it does not diagnose, score
 * risk, contact third parties, or store the input for personalization. It only
 * decides "suppress playful output and show help resources" vs "proceed".
 *
 * The detector is deliberately conservative about false negatives for clear
 * danger phrases, and accepts some false positives — surfacing a help resource
 * to someone who didn't need it is a safe, low-harm outcome.
 */

export type SafetyDecision =
  | { kind: 'proceed' }
  | { kind: 'crisis'; category: CrisisCategory };

export type CrisisCategory = 'self_harm' | 'abuse' | 'coercion';

/**
 * Crisis phrase patterns (EN + DE). Lowercased substring / word-boundary checks.
 * These are phrases that credibly signal immediate danger. Kept explicit and
 * auditable rather than a model call — this path must be deterministic.
 */
const CRISIS_PATTERNS: { category: CrisisCategory; patterns: RegExp[] }[] = [
  {
    category: 'self_harm',
    patterns: [
      /\bkill myself\b/, /\bend my life\b/, /\bwant to die\b/, /\bsuicid/, /\bself[-\s]?harm\b/,
      /\bhurt myself\b/, /\bno reason to live\b/,
      // German
      /\bmich umbringen\b/, /\bmein leben beenden\b/, /\bnicht mehr leben\b/, /\bselbstmord\b/,
      /\bmir etwas antun\b/, /\bsuizid/,
    ],
  },
  {
    category: 'abuse',
    patterns: [
      /\bhits me\b/, /\bhit me\b/, /\bbeats me\b/, /\bhurts me\b/, /\bafraid of (him|her|them)\b/,
      /\bscared of (him|her|them|my partner)\b/, /\babus(es|ed|ing|ive)\b/,
      // German
      /\bschlägt mich\b/, /\bschlaegt mich\b/, /\btut mir weh\b/, /\bhabe angst vor (ihm|ihr|ihnen)\b/,
      /\bmissbrauch/,
    ],
  },
  {
    category: 'coercion',
    patterns: [
      /\bforces me\b/, /\bforced me\b/, /\bmakes me (do|have)\b/, /\bagainst my will\b/,
      /\bwon'?t let me leave\b/, /\bcontrols everything\b/,
      // German
      /\bzwingt mich\b/, /\bgegen meinen willen\b/, /\blässt mich nicht gehen\b/, /\blaesst mich nicht gehen\b/,
    ],
  },
];

/**
 * Inspect free text for credible signals of immediate danger.
 * Returns a crisis decision (with category) or 'proceed'.
 *
 * The text is NOT stored, logged, or returned — only the decision is.
 */
export function assessSafety(text: string): SafetyDecision {
  const normalized = text.toLowerCase();
  for (const group of CRISIS_PATTERNS) {
    for (const pattern of group.patterns) {
      if (pattern.test(normalized)) {
        return { kind: 'crisis', category: group.category };
      }
    }
  }
  return { kind: 'proceed' };
}

/**
 * Runtime AI kill switches (AI_SAFETY release governance). Each AI surface can
 * be turned off independently without a code change at the call site. While a
 * switch is false, the surface falls back to the deterministic path or hides.
 *
 * These default to the safe state for the beta: the conversational AI is OFF
 * (the Edge Function is a 501 stub) and only the deterministic recommender runs.
 */
export interface AIKillSwitches {
  /** Conversational "Ask PeakPlant" AI responses. */
  askPeakPlant: boolean;
  /** AI-personalized live recommendations. */
  liveRecommendations: boolean;
  /** Reflection prompts while writing a memory. */
  reflectionPrompts: boolean;
}

export const AI_KILL_SWITCHES: AIKillSwitches = {
  // ON: the `discover` Edge Function is deployed. Safe to enable because the
  // gateway degrades to the curated recommender on any failure (function not
  // deployed, ANTHROPIC_API_KEY secret missing, network/auth error). The AI only
  // reorders + rewords curated candidates; it can never invent venues or facts.
  askPeakPlant: true,
  liveRecommendations: false,
  reflectionPrompts: false,
};

/** True only if the named AI surface is enabled by its kill switch. */
export function aiSurfaceEnabled(surface: keyof AIKillSwitches): boolean {
  return AI_KILL_SWITCHES[surface] === true;
}
