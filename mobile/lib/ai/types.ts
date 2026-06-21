/**
 * Approved signal taxonomy for AI personalization (AI_SAFETY — approved signals only).
 * Prohibited: clinical, sexual-health, compatibility/risk scoring, protected-trait inference.
 */
export interface AIContext {
  /** Goals the couple selected during onboarding (explicit choice, not inferred). */
  goals: string[];
  /** Card IDs the couple has already activated (preserved moments). */
  activatedCardIds: string[];
  /** Edition the couple is currently in. */
  edition: string;
  /** How many cards are still sealed — coarse progress signal, not a score. */
  sealedCardCount: number;
  /** Total memories preserved — coarse cadence signal. */
  totalMemories: number;
}

export interface CardSuggestion {
  cardId: string;
  /** Human-readable, factual rationale. Shown verbatim in the UI (AI_SAFETY — explainability). */
  rationale: string;
  /** Signals the AI used — displayed in the UI so the user understands why (AI_SAFETY D-102). */
  signalsUsed: string[];
  /** Signals available but not used. */
  signalsNotUsed: string[];
}

export interface ReflectionPrompt {
  /** A single gentle follow-up line shown while writing a memory note. Empty = no prompt. */
  text: string;
}
