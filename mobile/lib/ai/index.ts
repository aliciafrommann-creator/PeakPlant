/**
 * Active AI implementation.
 *
 * MVP: nullAI — deterministic fallbacks, no network calls, no provider keys.
 * Supabase phase: swap to anthropicAI once the server route is implemented.
 *
 * See AI_SAFETY.md before changing this.
 */

export { nullAI as ai } from './null';
export type { IAIPersonalization } from './interface';
export type { AIContext, CardSuggestion, ReflectionPrompt } from './types';
