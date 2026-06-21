import type { Memory, MomentCard } from './types';

/**
 * Build the text a user shares when they choose to send a moment to another app.
 * Sharing is always user-initiated and opt-in (PP-004) — never required, never
 * automatic. Pure (no RN/Expo imports), so it's unit-tested in node.
 */
export function composeShareText(memory: Memory, card?: MomentCard): string {
  const parts: string[] = [];
  if (card?.prompt) parts.push(card.prompt.trim());
  if (memory.note?.trim()) parts.push(memory.note.trim());
  parts.push('— a moment, preserved with PeakPlant 🌻');
  return parts.join('\n\n');
}
