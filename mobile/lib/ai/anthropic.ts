/**
 * Anthropic stub — NOT wired in the MVP.
 *
 * Future implementation notes (AI_SAFETY):
 * - All calls happen server-side (Edge Function / API route); the client NEVER
 *   holds ANTHROPIC_API_KEY.
 * - Use structured output (JSON schema) so every response is schema-validated
 *   before it reaches a screen.
 * - Untrusted data (note text, card prompts) is separated from system instructions
 *   to resist prompt injection.
 * - Raw note text is ephemeral — do not log, do not store as a profile signal.
 * - Return nullAI fallbacks whenever confidence is low, the model is unavailable,
 *   or crisis text is detected (crisis route takes priority; suppress all
 *   gamified/AI suggestions and surface local-help resources).
 *
 * TODO: Implement via a Supabase Edge Function that:
 *   1. Validates the request against AIContext schema
 *   2. Calls Anthropic claude-* with structured output (tool_use/json mode)
 *   3. Post-validates the response
 *   4. Returns CardSuggestion / ReflectionPrompt to the client
 */

import type { MomentCard } from '../types';
import type { TogetherMoment } from '../together';
import type { IAIPersonalization } from './interface';
import type { AIContext, CardSuggestion, ReflectionPrompt, MomentSuggestion } from './types';

export const anthropicAI: IAIPersonalization = {
  async suggestCard(_context: AIContext, _candidates: MomentCard[]): Promise<CardSuggestion> {
    throw new Error(
      'Anthropic AI not configured. Wire a server-side route and replace nullAI in lib/ai/index.ts.',
    );
  },

  async reflectionPrompt(_note: string, _card: MomentCard): Promise<ReflectionPrompt> {
    throw new Error('Anthropic AI not configured.');
  },

  async suggestMoment(_context: AIContext, _candidates: TogetherMoment[]): Promise<MomentSuggestion> {
    throw new Error('Anthropic AI not configured.');
  },
};
