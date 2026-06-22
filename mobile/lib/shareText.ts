import type { Memory, MomentCard, SavedDate } from './types';

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

/**
 * Build the message a user sends to invite their partner into a space. The
 * invite code is the join secret, so it's always included verbatim. Pure (no
 * RN/Expo imports) so it's unit-tested in node. `spaceName` is optional — a
 * fresh couple space may not be named yet.
 */
export function composeInviteText(code: string, spaceName?: string): string {
  const trimmedCode = code.trim();
  const name = spaceName?.trim();
  const opener = name
    ? `Join me on PeakPlant — let's keep "${name}" together.`
    : "Join me on PeakPlant — let's start our shared diary.";
  return [
    opener,
    `Your invite code: ${trimmedCode}`,
    'Open the app, choose "join with code", and enter it. 🌻',
  ].join('\n\n');
}

/**
 * Build the text for sharing a curated date idea (e.g. "what about this?").
 * Carries only the public idea + its stable link — never space/diary data.
 * Pure (no RN/Expo) so it's unit-tested.
 */
export function composeIdeaShareText(title: string, concept: string, link: string): string {
  const parts = [`What about this? ${title.trim()}`];
  const c = concept.trim();
  if (c) parts.push(c);
  parts.push(link.trim());
  return parts.filter(Boolean).join('\n\n');
}

/**
 * Build the text for sharing a *planned* date. Includes the user's free-text
 * "when" (which they wrote and are choosing to send) but deliberately omits
 * private planning notes and any space/member identifiers.
 */
export function composeDatePlanShareText(saved: SavedDate, link: string): string {
  const parts = [`Our plan: ${saved.title.trim()}`];
  const when = saved.plannedFor?.trim();
  if (when) parts.push(`When: ${when}`);
  parts.push(link.trim());
  return parts.filter(Boolean).join('\n\n');
}
