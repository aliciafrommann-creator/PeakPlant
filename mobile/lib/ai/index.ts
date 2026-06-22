/**
 * Active AI implementation.
 *
 * MVP: nullAI — deterministic fallbacks, no network calls, no provider keys.
 * Supabase phase: swap to anthropicAI once the server route is implemented.
 *
 * See AI_SAFETY.md before changing this.
 */

export { nullAI as ai } from './null';
// Date Discovery: deterministic curated recommender today; swap to
// anthropicDiscovery once supabase/functions/discover is deployed.
export { nullDiscovery as discovery } from './null';
export type { IAIPersonalization, IDateDiscovery } from './interface';
export type { AIContext, CardSuggestion, ReflectionPrompt, MomentSuggestion } from './types';
export type { DateConstraints, DateRecommendation, RecommendationFact } from '../discovery/types';
